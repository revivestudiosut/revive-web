import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

// All data below is test-only. Builds use a disposable copy, never the live catalog.
const root = resolve(import.meta.dirname, '..');
const fixture = await mkdtemp(join(tmpdir(), 'revive-booking-build-'));
const generalUrl = 'https://calendar.app.google/GeneralTestOnly123';
const packageUrl = 'https://calendar.app.google/PackageTestOnly456';
const sample = {
  id: 'test-package', published: true, name: 'Test <script>alert(1)</script> Package',
  description: 'Test-only content & escaping check', image: '/images/holiday-decor.jpg',
  imageAlt: 'Test-only photo', includes: ['Test-only detail'], projectIds: ['ponderosa-house'],
};
const readPage = (path) => readFile(join(fixture, 'dist', path, 'index.html'), 'utf8');
async function build(catalog, enabled, bookingUrl) {
  await writeFile(join(fixture, 'src/data/design-packages.json'), JSON.stringify(catalog));
  const result = spawnSync('just', ['build'], {
    cwd: fixture, encoding: 'utf8',
    env: { ...process.env, PUBLIC_BOOKING_ENABLED: enabled, PUBLIC_GOOGLE_BOOKING_URL: bookingUrl, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
}
try {
  for (const path of ['src', 'public', 'astro.config.mjs', 'postcss.config.mjs', 'tailwind.config.mjs', 'tsconfig.json', 'package.json', 'justfile']) {
    await cp(join(root, path), join(fixture, path), { recursive: true });
  }
  await symlink(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
  await mkdir(join(fixture, '.config'), { recursive: true });
  await build([], 'false', generalUrl);
  let page = await readPage('book');
  assert.match(page, /Online scheduling isn/);
  assert.doesNotMatch(page, /href="https:\/\/calendar/);
  assert.doesNotMatch(page, /<iframe|appointment-scheduling-button/);
  assert.doesNotMatch(await readPage('holiday'), /Test-only/);
  console.log('PASS disabled configuration and empty catalog');

  await build([{ ...sample, bookingUrl: packageUrl }, { ...sample, id: 'general-test' }, { ...sample, id: 'unpublished', published: false }], 'true', generalUrl);
  page = await readPage('book/test-package');
  assert.ok(page.includes(`href="${packageUrl}"`));
  assert.ok(!page.includes(`href="${generalUrl}"`));
  assert.doesNotMatch(page.slice(page.indexOf('<body>')), /<script>alert\(1\)<\/script>/);
  assert.match(page, /&lt;script&gt;/);
  assert.doesNotMatch(page, /target="_blank"|<iframe/);
  const general = await readPage('book/general-test');
  assert.ok(general.includes(`href="${generalUrl}"`));
  assert.match(general, /is not sent automatically/);
  await assert.rejects(readPage('book/unpublished'), { code: 'ENOENT' });
  assert.match(await readPage('holiday'), /href="\/book\/test-package"/);
  console.log('PASS per-package override, general fallback, draft exclusion and HTML escaping');

  for (const url of ['', 'https://untrusted.example/booking']) {
    await build([], 'true', url);
    page = await readPage('book');
    assert.match(page, /Online scheduling isn/);
    assert.doesNotMatch(page, /href="https:\/\/(calendar|untrusted)/);
  }
  console.log('PASS missing and invalid URLs fail closed');
} finally {
  await rm(fixture, { recursive: true, force: true });
}
