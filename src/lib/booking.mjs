/**
 * Public Google Appointment Schedules links only. This module does not read or
 * modify calendars, load an embed, fetch availability, or confirm a booking.
 * A syntactically valid URL does not prove that its schedule exists or has slots.
 *
 * Copy the public booking-page link from Google Calendar's sharing options:
 * https://support.google.com/calendar/answer/10733297?hl=en
 * Schedule availability and confirmation are managed by Google Calendar:
 * https://support.google.com/calendar/answer/10729749?hl=en
 *
 * Never put credentials, API keys, private calendar URLs, or attendee information
 * in PUBLIC_ configuration. Render an enabled href as a user-initiated link.
 */

/**
 * @typedef {Object} BookingOptions
 * @property {unknown} [enabled] The exact PUBLIC_BOOKING_ENABLED string.
 * @property {unknown} [bookingUrl] A public, service-specific booking-page URL.
 */

/**
 * @typedef {Object} EnabledBookingConfig
 * @property {'google-appointment-schedule'} mode
 * @property {true} enabled
 * @property {string} href A validated public Google booking-page URL.
 */

/**
 * @typedef {Object} DisabledBookingConfig
 * @property {'disabled'} mode
 * @property {false} enabled
 * @property {null} href No link should be rendered.
 * @property {'disabled' | 'missing-url' | 'invalid-url'} reason
 */

/** @typedef {EnabledBookingConfig | DisabledBookingConfig} BookingConfig */

const SHORT_BOOKING_PATH = /^\/[A-Za-z0-9]+$/;
const SCHEDULE_BOOKING_PATH =
  /^\/calendar\/(?:u\/[0-9]+\/)?appointments\/schedules\/[A-Za-z0-9_-]+$/;

/**
 * Validate a copied Google Appointment Schedules URL without following it.
 *
 * Accepted forms:
 * - https://calendar.app.google/<token>
 * - https://calendar.google.com/calendar/appointments/schedules/<token>
 * - https://calendar.google.com/calendar/u/<number>/appointments/schedules/<token>
 *
 * Only canonical HTTPS links are accepted. Query parameters (including embed
 * options), fragments, explicit ports (including :443), credentials, encoded
 * characters, whitespace, and URL-parser normalization tricks are rejected.
 * Unsupported forms fail closed rather than guessing a destination.
 *
 * @param {unknown} value
 * @returns {string | null} The safe URL, or null when it is not supported.
 */
export function validateGoogleBookingUrl(value) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('https://') ||
    /[\s\\%?#]/u.test(value)
  ) {
    return null;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    url.href !== value
  ) {
    return null;
  }

  const isShortBookingUrl =
    url.hostname === 'calendar.app.google' &&
    SHORT_BOOKING_PATH.test(url.pathname);
  const isScheduleBookingUrl =
    url.hostname === 'calendar.google.com' &&
    SCHEDULE_BOOKING_PATH.test(url.pathname);

  return isShortBookingUrl || isScheduleBookingUrl ? url.href : null;
}

/**
 * Resolve the site's booking mode. Booking stays disabled unless explicitly
 * enabled with the string 'true' and given a valid public booking-page URL.
 * This result means the link is configured, not that availability is verified.
 *
 * @example
 * const booking = getBookingConfig({
 *   enabled: import.meta.env.PUBLIC_BOOKING_ENABLED,
 *   bookingUrl: import.meta.env.PUBLIC_GOOGLE_BOOKING_URL,
 * });
 *
 * @example
 * // Validate each package's public link independently with the same global gate.
 * const packageBooking = getBookingConfig({
 *   enabled: import.meta.env.PUBLIC_BOOKING_ENABLED,
 *   bookingUrl: selectedPackage.bookingUrl,
 * });
 *
 * @param {BookingOptions | null} [options={}]
 * @returns {BookingConfig}
 */
export function getBookingConfig(options = {}) {
  if (options?.enabled !== 'true') {
    return { mode: 'disabled', enabled: false, href: null, reason: 'disabled' };
  }

  const bookingUrl = options.bookingUrl;
  if (
    bookingUrl === undefined ||
    bookingUrl === null ||
    (typeof bookingUrl === 'string' && bookingUrl.trim() === '')
  ) {
    return { mode: 'disabled', enabled: false, href: null, reason: 'missing-url' };
  }

  const href = validateGoogleBookingUrl(bookingUrl);
  if (href === null) {
    return { mode: 'disabled', enabled: false, href: null, reason: 'invalid-url' };
  }

  return { mode: 'google-appointment-schedule', enabled: true, href };
}
