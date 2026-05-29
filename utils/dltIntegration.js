/**
 * ELVA DLT + SMS integration flow (notify.elvatech.in + Fast2SMS + Jio DLT)
 *
 * 1. notify.elvatech.in
 *    Delivery/notification service prepares a long tracking or Google Maps URL.
 *
 * 2. Generate short URL (this links-service API)
 *    POST https://links.elvatech.in/api/create
 *    Body: { "originalUrl": "https://maps.google.com/..." }
 *    Response: { "success": true, "shortUrl": "https://links.elvatech.in/abc123" }
 *
 * 3. Send via Fast2SMS (Jio DLT-approved template)
 *    SMS body uses the short URL only (SMS-friendly, 6-char code path).
 *    Example: "Track your delivery: https://links.elvatech.in/abc123"
 *
 * 4. User clicks the short link on mobile
 *    GET https://links.elvatech.in/abc123
 *
 * 5. Redirect to original URL
 *    HTTP 302 -> Google Maps / tracking / delivery page
 *
 * Supported destination types:
 * - Google Maps links (long query strings preserved after normalization)
 * - Delivery tracking URLs
 * - HTTPS notification landing pages
 */

const DLT_FLOW = {
  notifyService: 'notify.elvatech.in',
  shortLinkDomain: 'links.elvatech.in',
  smsProvider: 'Fast2SMS',
  dltOperator: 'Jio DLT',
};

module.exports = {
  DLT_FLOW,
};
