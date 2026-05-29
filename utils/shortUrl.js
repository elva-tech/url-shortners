const config = require('../config');

/**
 * Normal:  https://links.elvatech.in/abc123
 * DLT:    https://links.elvatech.in/ELVATK/abc123
 */
const buildShortUrl = (shortCode, dltHeader = null) => {
  const base = config.baseUrl.replace(/\/$/, '');

  if (dltHeader) {
    return `${base}/${dltHeader}/${shortCode}`;
  }

  return `${base}/${shortCode}`;
};

module.exports = {
  buildShortUrl,
};
