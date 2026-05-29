const config = require('../config');
const Link = require('../models/Link');
const { isSafeRedirectUrl } = require('../utils/urlValidator');
const logger = require('../utils/logger');

const SHORT_CODE_PATTERN = new RegExp(
  `^[a-z0-9]{${config.shortCodeLength}}$`
);
const RESERVED_SHORT_CODES = new Set(['api', 'create']);

const redirectToOriginalUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    if (
      !shortCode ||
      !SHORT_CODE_PATTERN.test(shortCode) ||
      RESERVED_SHORT_CODES.has(shortCode)
    ) {
      logger.redirect(`Not found | ${shortCode || '(empty)'}`);
      return res.status(404).json({
        success: false,
        message: 'Link not found',
      });
    }

    const link = await Link.findOne({ shortCode });

    if (!link) {
      logger.redirect(`Not found | ${shortCode}`);
      return res.status(404).json({
        success: false,
        message: 'Link not found',
      });
    }

    if (!isSafeRedirectUrl(link.originalUrl)) {
      logger.error(`Unsafe redirect blocked | ${shortCode}`);
      return res.status(500).json({
        success: false,
        message: 'Invalid destination URL',
      });
    }

    logger.redirect(`Success | ${shortCode} -> ${link.originalUrl}`);
    return res.redirect(link.originalUrl);
  } catch (error) {
    logger.error(`Redirect failed: ${error.message}`);
    return next(error);
  }
};

module.exports = {
  redirectToOriginalUrl,
};
