import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { checkPreview, evaluatePreview, parseAllowlist } from './preview-policy.mjs';

const policyText = '["trentdavies", "revivestudiosut-web"]';
function fixture() {
  const repo = { id: 123, full_name: 'revivestudiosut/revive-web', fork: false };
  const sha = 'a'.repeat(40);
  return {
    allowlist: parseAllowlist(policyText), eventName: 'workflow_run', repository: repo.full_name,
    repositoryId: repo.id, actor: 'trentdavies', triggeringActor: 'revivestudiosut-web',
    eventRun: { id: 456, run_attempt: 1, head_sha: sha },
    workflow: { id: 789, path: '.github/workflows/ci.yml' },
    run: {
      id: 456, run_attempt: 1, head_sha: sha, workflow_id: 789, path: '.github/workflows/ci.yml',
      event: 'pull_request', status: 'completed', conclusion: 'success', head_branch: 'feature',
      repository: { ...repo }, head_repository: { ...repo }, pull_requests: [{ number: 7 }],
      actor: { login: 'trentdavies' }, triggering_actor: { login: 'revivestudiosut-web' },
    },
    pr: { number: 7, state: 'open', draft: true, user: { login: 'trentdavies' },
      base: { ref: 'main', repo: { ...repo } }, head: { ref: 'feature', sha, repo: { ...repo } } },
  };
}

test('both approved users and draft PRs can deploy', () => {
  for (const author of ['trentdavies', 'revivestudiosut-web']) {
    const input = fixture();
    input.pr.user.login = author;
    const result = evaluatePreview(input);
    assert.equal(result.allowed, true);
    assert.equal(result.artifactName, `dev-preview-${input.run.head_sha}-1`);
    assert.equal(result.headSha, input.pr.head.sha);
  }
});

test('GitHub usernames and repository names are case-insensitive', () => {
  const input = fixture();
  input.allowlist = parseAllowlist('["TrentDavies","ReviveStudiosUT-Web"]');
  input.actor = 'TRENTDAVIES';
  input.repository = 'REVIVESTUDIOSUT/REVIVE-WEB';
  input.pr.user.login = 'ReviveStudiosUT-Web';
  assert.equal(evaluatePreview(input).allowed, true);
});

for (const text of ['', '{}', 'null', '[]', '["*"]', '["trentdavies", null]', '["trentdavies", "TRENTDAVIES"]', '[" trentdavies"]', '["trentdavies "]', '["-trent"]', '["trent-"]', '["trent--davies"]', '["trent_davies"]', '["trentdavies\\nallowed=true"]', '["github-actions[bot]"]', '["' + 'x'.repeat(40) + '"]']) {
  test(`malformed allowlist fails closed: ${JSON.stringify(text)}`, () => assert.throws(() => parseAllowlist(text)));
}

const roles = {
  'PR author': (x, login) => { x.pr.user.login = login; },
  'CI actor': (x, login) => { x.run.actor.login = login; },
  'CI rerun initiator': (x, login) => { x.run.triggering_actor.login = login; },
  'preview actor': (x, login) => { x.actor = login; },
  'preview rerun initiator': (x, login) => { x.triggeringActor = login; },
};
for (const [role, mutate] of Object.entries(roles)) {
  for (const login of ['unlisted-writer', undefined, '', 'trentdavies\nallowed=true']) {
    test(`denies ${role} when missing, unlisted, or malformed: ${JSON.stringify(login)}`, () => {
      const input = fixture();
      mutate(input, login);
      assert.equal(evaluatePreview(input).allowed, false);
    });
  }
}

const deniedCases = {
  'a fork, even for an approved author': x => { x.pr.head.repo.fork = true; },
  'a different repository without a fork flag': x => { x.pr.head.repo.id++; },
  'a different source run repository': x => { x.run.head_repository.full_name = 'someone/revive-web'; },
  'a fork source workflow run': x => { x.run.head_repository.fork = true; },
  'a missing repository identity': x => { x.repositoryId = NaN; },
  'missing fork metadata': x => { delete x.pr.head.repo.fork; },
  'a different base repository': x => { x.pr.base.repo.id++; },
  'a closed PR': x => { x.pr.state = 'closed'; },
  'a retargeted PR': x => { x.pr.base.ref = 'production'; },
  'a new PR head after CI': x => { x.pr.head.sha = 'b'.repeat(40); },
  'a different head branch': x => { x.pr.head.ref = 'other'; },
  'a missing PR association': x => { x.run.pull_requests = []; },
  'ambiguous PR associations': x => { x.run.pull_requests.push({ number: 8 }); },
  'a mismatched PR association': x => { x.run.pull_requests[0].number = 8; },
  'an unexpected workflow event': x => { x.eventName = 'pull_request'; },
  'a push CI run': x => { x.run.event = 'push'; },
  'a failed CI run': x => { x.run.conclusion = 'failure'; },
  'an incomplete CI run': x => { x.run.status = 'in_progress'; },
  'a workflow with a spoofed CI name': x => { x.run.workflow_id++; },
  'an unexpected workflow path': x => { x.run.path = '.github/workflows/other.yml'; },
  'a different source run': x => { x.run.id++; },
  'a newer rerun attempt': x => { x.run.run_attempt++; },
  'a missing rerun attempt': x => { delete x.run.run_attempt; },
  'a changed source run SHA': x => { x.eventRun.head_sha = 'c'.repeat(40); },
  'a malformed output SHA': x => { x.run.head_sha = x.eventRun.head_sha = x.pr.head.sha = 'a\nallowed=true'; },
  'revoked author even on a rerun': x => { x.allowlist = parseAllowlist('["revivestudiosut-web"]'); },
};
for (const [name, mutate] of Object.entries(deniedCases)) {
  test(`denies ${name}`, () => {
    const input = fixture();
    mutate(input);
    assert.equal(evaluatePreview(input).allowed, false);
  });
}

test('current main is the only policy source; current API state controls authorization', async (t) => {
  const input = fixture();
  const dir = mkdtempSync(join(tmpdir(), 'preview-policy-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const eventPath = join(dir, 'event.json');
  writeFileSync(eventPath, JSON.stringify({ workflow_run: input.eventRun }));
  const env = {
    GITHUB_REPOSITORY: input.repository, GITHUB_REPOSITORY_ID: String(input.repositoryId),
    GITHUB_EVENT_NAME: input.eventName, GITHUB_EVENT_PATH: eventPath,
    GITHUB_ACTOR: input.actor, GITHUB_TRIGGERING_ACTOR: input.triggeringActor, GH_TOKEN: 'test-only',
  };
  let trustedPolicy = policyText;
  const requests = [];
  const api = async (url) => {
    requests.push(url);
    const data = url.endsWith('contents/.github/preview-allowlist.json?ref=main')
      ? { type: 'file', encoding: 'base64', content: Buffer.from(trustedPolicy).toString('base64') }
      : url.endsWith('actions/runs/456') ? input.run
      : url.endsWith('actions/workflows/ci.yml') ? input.workflow
      : url.endsWith('pulls/7') ? input.pr : null;
    assert.ok(data, `unexpected API URL ${url}`);
    return { ok: true, json: async () => data };
  };
  assert.equal((await checkPreview(env, api)).allowed, true);
  input.pr.user.login = 'unlisted-writer';
  // Editing the PR checkout's list does not affect the trusted-main API read.
  writeFileSync(join(dir, 'preview-allowlist.json'), '["unlisted-writer"]');
  assert.equal((await checkPreview(env, api)).allowed, false);
  input.pr.user.login = 'trentdavies';
  trustedPolicy = '["revivestudiosut-web"]';
  assert.equal((await checkPreview(env, api)).allowed, false);
  trustedPolicy = '[]';
  await assert.rejects(checkPreview(env, api), /nonempty/);
  await assert.rejects(checkPreview(env, async () => ({ ok: false, status: 404 })), /GitHub read failed/);
  await assert.rejects(checkPreview(env, async () => { throw new Error('network failure'); }), /network failure/);
  assert.ok(requests.every(url => url.startsWith(`https://api.github.com/repos/${input.repository}/`)));
  assert.ok(requests.filter(url => url.includes('preview-allowlist')).every(url => url.endsWith('?ref=main')));
});

test('committed allowlist contains exactly the requested users', () => {
  assert.deepEqual([...parseAllowlist(readFileSync(new URL('../preview-allowlist.json', import.meta.url), 'utf8'))].sort(),
    ['revivestudiosut-web', 'trentdavies']);
});


test('trusted deploy recipe uses an empty cwd, fixed dev target, and treats the artifact only as data', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'preview-deploy-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const trusted = join(dir, 'trusted');
  const artifact = join(dir, 'artifact');
  mkdirSync(join(trusted, 'node_modules/wrangler/bin'), { recursive: true });
  mkdirSync(join(artifact, '_worker.js'), { recursive: true });
  writeFileSync(join(trusted, 'justfile'), readFileSync(new URL('../../justfile', import.meta.url)));
  writeFileSync(join(artifact, 'index.html'), 'test');
  writeFileSync(join(artifact, '_worker.js/index.js'), 'throw new Error("must not execute artifact")');
  writeFileSync(join(artifact, '_routes.json'), '{}');
  writeFileSync(join(artifact, 'wrangler.toml'), 'name = "must-not-read"');
  writeFileSync(join(trusted, 'node_modules/wrangler/bin/wrangler.js'), `
    const assert = require('node:assert/strict');
    const fs = require('node:fs');
    assert.deepEqual(fs.readdirSync(process.cwd()), []);
    assert.notEqual(process.cwd(), ${JSON.stringify(artifact)});
    assert.notEqual(process.cwd(), ${JSON.stringify(trusted)});
    assert.deepEqual(process.argv.slice(2), ['pages', 'deploy', ${JSON.stringify(artifact)},
      '--project-name', 'revive-web', '--branch', 'dev', '--commit-hash', '${'a'.repeat(40)}', '--no-bundle']);
    console.log('isolated trusted deployment invocation verified');
  `);
  const args = ['--justfile', join(trusted, 'justfile'), 'deploy-preview-artifact', artifact, 'a'.repeat(40)];
  const env = { ...process.env, XDG_RUNTIME_DIR: dir };
  assert.match(execFileSync('just', args, { encoding: 'utf8', env }), /isolated trusted deployment invocation verified/);
  symlinkSync(join(trusted, 'justfile'), join(artifact, 'untrusted-link'));
  assert.throws(() => execFileSync('just', args, { stdio: 'pipe', env }));
  rmSync(join(artifact, 'untrusted-link'));
  assert.throws(() => execFileSync('just', [...args.slice(0, -1), 'invalid-sha'], { stdio: 'pipe', env }));
});
