import test from 'node:test';
import assert from 'node:assert/strict';
import { readDesignPackages } from '../src/lib/design-packages.mjs';

// Test-only sample; never imported by the website or published as a real offer.
const sample = () => ({ id: 'sample-package', published: true, name: 'Sample', description: 'Test description', image: '/images/test.jpg', imageAlt: 'Test image', includes: ['Test detail'], projectIds: ['existing'] });
test('empty and unpublished catalogs publish no invented packages', () => {
  assert.deepEqual(readDesignPackages([]), []);
  assert.deepEqual(readDesignPackages([{ ...sample(), published: false }], ['existing']), []);
});
test('approved published content preserves optional pricing and known project references', () => {
  const item = { ...sample(), priceLabel: 'Studio-approved pricing' };
  assert.deepEqual(readDesignPackages([item], ['existing']), [item]);
});
test('rejects duplicate IDs, unknown projects, missing details and remote images', () => {
  for (const items of [
    [sample(), sample()],
    [{ ...sample(), projectIds: ['unknown'] }],
    [{ ...sample(), description: '' }],
    [{ ...sample(), includes: [] }],
    [{ ...sample(), image: 'https://example.com/photo.jpg' }],
    [{ ...sample(), image: '/images/../../secret.jpg' }],
    [{ ...sample(), published: 'true' }],
    [{ ...sample(), id: '<script>' }],
  ]) assert.throws(() => readDesignPackages(items, ['existing']));
});

test('package booking override is optional and must be a public Google schedule', () => {
  const item = { ...sample(), bookingUrl: 'https://calendar.app.google/TestSchedule123' };
  assert.deepEqual(readDesignPackages([item], ['existing']), [item]);
  assert.throws(() => readDesignPackages([{ ...sample(), bookingUrl: 'javascript:alert(1)' }], ['existing']));
});
