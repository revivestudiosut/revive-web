import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getBookingConfig,
  validateGoogleBookingUrl,
} from '../src/lib/booking.mjs';

// Synthetic tokens test URL syntax only. No schedule is fetched or booked.
const shortUrl = 'https://calendar.app.google/AbCdEf123456789';
const scheduleUrl =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ_Test-123';
const accountScheduleUrl =
  'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ_Test-123';

test('accepts supported, canonical public Google booking URL forms', async (t) => {
  for (const value of [
    shortUrl,
    scheduleUrl,
    accountScheduleUrl,
    accountScheduleUrl.replace('/u/0/', '/u/12/'),
  ]) {
    await t.test(value, () => {
      assert.equal(validateGoogleBookingUrl(value), value);
    });
  }
});

test('rejects unsafe, malformed, and unsupported URL forms', async (t) => {
  const cases = [
    ['missing input', undefined],
    ['null input', null],
    ['empty input', ''],
    ['boolean input', true],
    ['number input', 123],
    ['object input', { href: shortUrl }],
    ['URL object input', new URL(shortUrl)],
    ['relative URL', '/calendar/appointments/schedules/AcZssZ_Test-123'],
    ['protocol-relative URL', '//calendar.app.google/AbCdEf123456789'],
    ['HTTP protocol', shortUrl.replace('https:', 'http:')],
    ['JavaScript protocol', 'javascript:alert(1)'],
    ['data protocol', 'data:text/html,<script>alert(1)</script>'],
    ['untrusted host', 'https://example.com/AbCdEf123456789'],
    ['host suffix attack', 'https://calendar.app.google.example.com/AbCdEf123456789'],
    ['schedule host suffix attack', scheduleUrl.replace('.com/', '.com.example.com/')],
    ['subdomain attack', 'https://evil.calendar.app.google/AbCdEf123456789'],
    ['similar domain', 'https://calendar-app.google/AbCdEf123456789'],
    ['Google redirect endpoint', 'https://www.google.com/url?q=' + shortUrl],
    ['credentials on trusted host', 'https://user:password@calendar.app.google/AbCdEf123456789'],
    ['username on trusted host', 'https://user@calendar.app.google/AbCdEf123456789'],
    ['empty userinfo', 'https://@calendar.app.google/AbCdEf123456789'],
    ['trusted host as username', 'https://calendar.app.google@evil.example/AbCdEf123456789'],
    ['nondefault port', 'https://calendar.app.google:8443/AbCdEf123456789'],
    ['explicit default port', 'https://calendar.app.google:443/AbCdEf123456789'],
    ['empty port', 'https://calendar.app.google:/AbCdEf123456789'],
    ['fragment', shortUrl + '#booking'],
    ['empty fragment', shortUrl + '#'],
    ['query redirect', shortUrl + '?redirect=https://evil.example'],
    ['embed query', scheduleUrl + '?gv=true'],
    ['empty query', shortUrl + '?'],
    ['leading whitespace', ' ' + shortUrl],
    ['trailing whitespace', shortUrl + ' '],
    ['trailing newline', shortUrl + '\n'],
    ['embedded newline', shortUrl.replace('app.google', 'app.\ngoogle')],
    ['embedded tab', shortUrl.replace('https:', 'ht\ttps:')],
    ['null character', shortUrl + '\u0000'],
    ['backslash authority', 'https://calendar.app.google\\@evil.example/AbCdEf123456789'],
    ['backslash path', 'https://calendar.app.google\\AbCdEf123456789'],
    ['encoded host', 'https://%63alendar.app.google/AbCdEf123456789'],
    ['encoded slash', shortUrl + '%2Fextra'],
    ['encoded traversal', 'https://calendar.app.google/%2e%2e/AbCdEf123456789'],
    ['dot traversal', 'https://calendar.app.google/other/../AbCdEf123456789'],
    ['dot path segment', 'https://calendar.app.google/./AbCdEf123456789'],
    ['Unicode host lookalike', 'https://calendаr.app.google/AbCdEf123456789'],
    ['trailing hostname dot', 'https://calendar.app.google./AbCdEf123456789'],
    ['missing short token', 'https://calendar.app.google/'],
    ['extra short path', shortUrl + '/extra'],
    ['short link trailing slash', shortUrl + '/'],
    ['wrong host for schedule path', scheduleUrl.replace('calendar.google.com', 'calendar.app.google')],
    ['wrong host for short path', shortUrl.replace('calendar.app.google', 'calendar.google.com')],
    ['missing schedule token', 'https://calendar.google.com/calendar/appointments/schedules/'],
    ['legacy appointment slots', 'https://calendar.google.com/calendar/selfsched?sstoken=123'],
    ['event creation URL', 'https://calendar.google.com/calendar/render?action=TEMPLATE'],
    ['private calendar URL', 'https://calendar.google.com/calendar/u/0/r'],
    ['calendar ICS URL', 'https://calendar.google.com/calendar/ical/private/basic.ics'],
    ['extra schedule path', scheduleUrl + '/extra'],
    ['nonnumeric account', accountScheduleUrl.replace('/u/0/', '/u/name/')],
    ['encoded schedule token', scheduleUrl + '%20'],
    ['schedule token punctuation', scheduleUrl + '.'],
    ['wrong path case', scheduleUrl.replace('/appointments/', '/Appointments/')],
    ['malformed URL', 'https://'],
  ];

  for (const [label, value] of cases) {
    await t.test(label, () => {
      assert.equal(validateGoogleBookingUrl(value), null);
    });
  }
});

test('booking is disabled by default even when a valid URL is provided', () => {
  const expected = {
    mode: 'disabled', enabled: false, href: null, reason: 'disabled',
  };
  assert.deepEqual(getBookingConfig(), expected);
  assert.deepEqual(getBookingConfig(undefined), expected);
  assert.deepEqual(getBookingConfig(null), expected);
  assert.deepEqual(getBookingConfig({ bookingUrl: shortUrl }), expected);
});

test('only the exact enabled string true enables booking', () => {
  for (const enabled of [undefined, null, false, true, 0, 1, '', 'false', 'TRUE', '1', ' true ', 'yes']) {
    assert.deepEqual(getBookingConfig({ enabled, bookingUrl: shortUrl }), {
      mode: 'disabled', enabled: false, href: null, reason: 'disabled',
    });
  }

  assert.deepEqual(getBookingConfig({ enabled: 'true', bookingUrl: shortUrl }), {
    mode: 'google-appointment-schedule', enabled: true, href: shortUrl,
  });
});

test('missing or blank URLs remain disabled when booking is enabled', () => {
  for (const bookingUrl of [undefined, null, '', ' ', '\n\t']) {
    assert.deepEqual(getBookingConfig({ enabled: 'true', bookingUrl }), {
      mode: 'disabled', enabled: false, href: null, reason: 'missing-url',
    });
  }
});

test('invalid URLs fail closed without exposing an unsafe href', () => {
  for (const bookingUrl of [false, 123, {}, 'javascript:alert(1)', 'https://evil.example/booking', shortUrl + '#']) {
    assert.deepEqual(getBookingConfig({ enabled: 'true', bookingUrl }), {
      mode: 'disabled', enabled: false, href: null, reason: 'invalid-url',
    });
  }
});

test('each package URL is validated independently under the same feature gate', () => {
  const globalConfig = getBookingConfig({ enabled: 'true', bookingUrl: shortUrl });
  const packageConfig = getBookingConfig({ enabled: 'true', bookingUrl: scheduleUrl });
  const missingPackageConfig = getBookingConfig({ enabled: 'true' });
  const disabledPackageConfig = getBookingConfig({ enabled: 'false', bookingUrl: scheduleUrl });

  assert.equal(globalConfig.href, shortUrl);
  assert.equal(packageConfig.href, scheduleUrl);
  assert.equal(missingPackageConfig.href, null);
  assert.equal(disabledPackageConfig.href, null);
});

test('enabled configuration describes a link, with no invented booking state', () => {
  const options = Object.freeze({ enabled: 'true', bookingUrl: accountScheduleUrl });
  assert.deepEqual(getBookingConfig(options), {
    mode: 'google-appointment-schedule', enabled: true, href: accountScheduleUrl,
  });
  assert.equal('availability' in getBookingConfig(options), false);
  assert.equal('confirmation' in getBookingConfig(options), false);
});
