import { validateGoogleBookingUrl } from './booking.mjs';

/**
 * Validate editorial package content before publishing. The catalog intentionally
 * starts empty: add only studio-approved descriptions, prices and photography.
 * @param {unknown} value
 * @param {string[]} projectIds Existing portfolio collection IDs.
 */
export function readDesignPackages(value, projectIds = []) {
  if (!Array.isArray(value)) throw new Error('Design packages must be an array.');
  const ids = new Set();
  const text = (value) => typeof value === 'string' && value.trim().length > 0;
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error('Each design package must be an object.');
    }
    if (!text(item.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id)) {
      throw new Error('Design package IDs must be unique lowercase slugs.');
    }
    ids.add(item.id);
    if (typeof item.published !== 'boolean') throw new Error(`${item.id}: published must be true or false.`);
    for (const field of ['name', 'description', 'image', 'imageAlt']) {
      if (!text(item[field])) throw new Error(`${item.id}: ${field} is required.`);
    }
    if (!/^\/images\/[a-zA-Z0-9_/-]+\.(jpg|jpeg|png|webp|avif)$/.test(item.image) || item.image.includes('..')) {
      throw new Error(`${item.id}: image must be a local image in public/images.`);
    }
    if (!Array.isArray(item.includes) || item.includes.length === 0 || !item.includes.every(text)) {
      throw new Error(`${item.id}: includes must contain approved package details.`);
    }
    if (item.bookingUrl !== undefined && !validateGoogleBookingUrl(item.bookingUrl)) {
      throw new Error(`${item.id}: bookingUrl must be a supported public Google Appointment Schedule link.`);
    }
    if (item.priceLabel !== undefined && !text(item.priceLabel)) throw new Error(`${item.id}: priceLabel must be nonempty when supplied.`);
    if (!Array.isArray(item.projectIds) || !item.projectIds.every((id) => projectIds.includes(id))) {
      throw new Error(`${item.id}: projectIds must reference existing portfolio projects.`);
    }
  }
  return value.filter((item) => item.published);
}
