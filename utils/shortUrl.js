const config = require('../config');

/**
 * Builds SMS/DLT-friendly short URLs:
 * https://links.elvatech.in/abc123
 */
const buildShortUrl = (shortCode) => {
  const base = config.baseUrl.replace(/\/$/, '');
  return `${base}/${shortCode}`;
};

module.exports = {
  buildShortUrl,
};
