// This module is executed only from trusted main by preview-dev.yml.
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const LOGIN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const SHA = /^[a-f\d]{40}$/;
const normalize = (login) => typeof login === 'string' && LOGIN.test(login) ? login.toLowerCase() : null;
const positiveInteger = (value) => Number.isSafeInteger(value) && value > 0;

export function parseAllowlist(text) {
  const entries = JSON.parse(text);
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('Preview allowlist must be a nonempty JSON array');
  }
  const logins = entries.map(normalize);
  if (logins.some((login) => !login) || new Set(logins).size !== logins.length) {
    throw new Error('Preview allowlist contains invalid or duplicate GitHub logins');
  }
  return new Set(logins);
}

export function evaluatePreview({ allowlist, eventName, eventRun, run, pr, workflow, repository, repositoryId, actor, triggeringActor }) {
  const deny = (reason) => ({ allowed: false, reason });
  if (eventName !== 'workflow_run') return deny('Expected a workflow_run event');
  if (!positiveInteger(repositoryId) || !repository) return deny('Missing repository identity');
  if (!positiveInteger(run?.id) || run.id !== eventRun?.id ||
      !positiveInteger(run.run_attempt) || run.run_attempt !== eventRun.run_attempt ||
      run.head_sha !== eventRun.head_sha) return deny('CI run or attempt changed');
  if (run.event !== 'pull_request' || run.status !== 'completed' || run.conclusion !== 'success') {
    return deny('CI must have completed successfully for a pull request');
  }
  if (!positiveInteger(workflow?.id) || run.workflow_id !== workflow.id ||
      workflow.path !== '.github/workflows/ci.yml' || run.path !== workflow.path) {
    return deny('Unexpected source workflow');
  }
  const sameRepository = (repo) => repo?.id === repositoryId &&
    typeof repo.full_name === 'string' && repo.full_name.toLowerCase() === repository.toLowerCase();
  if (!sameRepository(run.repository) || !sameRepository(run.head_repository) ||
      run.head_repository.fork !== false || !sameRepository(pr?.base?.repo) ||
      !sameRepository(pr?.head?.repo) || pr.head.repo.fork !== false) {
    return deny('Only branches in this repository can deploy previews');
  }
  if (!Array.isArray(run.pull_requests) || run.pull_requests.length !== 1 ||
      !positiveInteger(pr.number) || run.pull_requests[0].number !== pr.number ||
      pr.state !== 'open' || pr.base.ref !== 'main' ||
      !SHA.test(run.head_sha) || pr.head.sha !== run.head_sha || pr.head.ref !== run.head_branch) {
    return deny('PR is closed, retargeted, ambiguous, or has a newer head');
  }
  // Check both original actors and rerun initiators. Author approval alone must
  // not permit a later unlisted user's push or workflow rerun to publish.
  for (const [role, login] of [
    ['PR author', pr.user?.login],
    ['CI actor', run.actor?.login],
    ['CI rerun initiator', run.triggering_actor?.login],
    ['preview actor', actor],
    ['preview rerun initiator', triggeringActor],
  ]) {
    const normalized = normalize(login);
    if (!normalized || !allowlist.has(normalized)) return deny(`${role} is not allowlisted`);
  }
  return {
    allowed: true,
    reason: 'Author and all triggering users are allowlisted',
    headSha: run.head_sha,
    artifactName: `dev-preview-${run.head_sha}-${run.run_attempt}`,
    prNumber: pr.number,
  };
}

export async function checkPreview(env = process.env, fetchImpl = fetch) {
  const repository = env.GITHUB_REPOSITORY;
  if (!/^[a-z\d_.-]+\/[a-z\d_.-]+$/i.test(repository ?? '')) throw new Error('Invalid repository');
  if (!env.GH_TOKEN) throw new Error('Missing read-only GitHub token');
  const event = JSON.parse(readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
  if (env.GITHUB_EVENT_NAME !== 'workflow_run' || !positiveInteger(event.workflow_run?.id)) {
    throw new Error('Missing workflow_run identity');
  }
  const get = async (path) => {
    const response = await fetchImpl(`https://api.github.com/repos/${repository}/${path}`, {
      headers: { Authorization: `Bearer ${env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
    });
    if (!response.ok) throw new Error(`GitHub read failed (${response.status})`);
    return response.json();
  };
  // Resolve current main on every check, including failed-job-only reruns.
  // Never fall back to the PR's copy of this file or its proposed additions.
  const [policy, run, workflow] = await Promise.all([
    get('contents/.github/preview-allowlist.json?ref=main'),
    get(`actions/runs/${event.workflow_run.id}`),
    get('actions/workflows/ci.yml'),
  ]);
  if (policy.type !== 'file' || policy.encoding !== 'base64' || typeof policy.content !== 'string') {
    throw new Error('Missing trusted-main preview allowlist');
  }
  const allowlist = parseAllowlist(Buffer.from(policy.content, 'base64').toString('utf8'));
  const number = run.pull_requests?.length === 1 ? run.pull_requests[0].number : null;
  const pr = positiveInteger(number) ? await get(`pulls/${number}`) : null;
  return evaluatePreview({
    allowlist, eventName: env.GITHUB_EVENT_NAME, eventRun: event.workflow_run,
    run, workflow, pr, repository, repositoryId: Number(env.GITHUB_REPOSITORY_ID),
    actor: env.GITHUB_ACTOR, triggeringActor: env.GITHUB_TRIGGERING_ACTOR,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await checkPreview();
    console.log(`Preview ${result.allowed ? 'allowed' : 'denied'}: ${result.reason}`);
    appendFileSync(process.env.GITHUB_OUTPUT, `allowed=${result.allowed}\n` +
      (result.allowed ? `head_sha=${result.headSha}\nartifact_name=${result.artifactName}\npr_number=${result.prNumber}\n` : ''));
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Preview ${result.allowed ? 'allowed' : 'denied'}: ${result.reason}\n`);
    }
  } catch (error) {
    console.error(`Preview denied: ${error.message}`);
    process.exitCode = 1;
  }
}
