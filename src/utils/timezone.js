// Timezone configuration for the application
export const APP_TIMEZONE = 'Australia/Sydney';

/**
 * Get current date and time in the app's timezone
 * @returns {Date} Current date in Australia/Sydney timezone
 */
export function getCurrentDateTime() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: APP_TIMEZONE }));
}

/**
 * Format current date for date input (YYYY-MM-DD)
 * @returns {string} Formatted date string
 */
export function getCurrentDateFormatted() {
  const now = getCurrentDateTime();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format current time for time input (HH:mm)
 * @returns {string} Formatted time string
 */
export function getCurrentTimeFormatted() {
  const now = getCurrentDateTime();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format current datetime for datetime-local input (YYYY-MM-DDTHH:mm)
 * @returns {string} Formatted datetime string
 */
export function getCurrentDateTimeFormatted() {
  const now = getCurrentDateTime();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convert a date to the app's timezone and return as ISO string
 * @param {Date} date - Date to convert
 * @returns {string} ISO string in app timezone
 */
export function toAppTimezoneISO(date = new Date()) {
  return new Date(date.toLocaleString("en-US", { timeZone: APP_TIMEZONE })).toISOString();
}

/**
 * Format any date in the app's timezone
 * @param {Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatInAppTimezone(date = new Date(), options = {}) {
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: APP_TIMEZONE,
    ...options
  }).format(date);
}

/**
 * Get timezone display name
 * @returns {string} Timezone display name
 */
export function getTimezoneDisplayName() {
  return APP_TIMEZONE;
} 