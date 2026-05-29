const config = require('../config');
const Link = require('../models/Link');
const { isSafeRedirectUrl } = require('../utils/urlValidator');
const { DLT_HEADER_PATTERN } = require('../utils/dltHeader');
const logger = require('../utils/logger');

const SHORT_CODE_PATTERN = new RegExp(
  `^[a-z0-9]{${config.shortCodeLength}}$`
);
const RESERVED_SHORT_CODES = new Set(['api', 'create']);

const sendRedirect = (res, link, logLabel) => {
  if (!isSafeRedirectUrl(link.originalUrl)) {
    logger.error(`Unsafe redirect blocked | ${logLabel}`);
    return res.status(500).json({
      success: false,
      message: 'Invalid destination URL',
    });
  }

  logger.redirect(`Success | ${logLabel} -> ${link.originalUrl}`);
  return res.redirect(link.originalUrl);
};

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

    if (link.dltHeader) {
      logger.redirect(`Not found | ${shortCode} (DLT link requires /${link.dltHeader}/${shortCode})`);
      return res.status(404).json({
        success: false,
        message: 'Link not found',
      });
    }

    return sendRedirect(res, link, shortCode);
  } catch (error) {
    logger.error(`Redirect failed: ${error.message}`);
    return next(error);
  }
};

const redirectDltUrl = async (req, res, next) => {
  try {
    const dltHeader = req.params.dltHeader?.toUpperCase();
    const { shortCode } = req.params;

    if (
      !dltHeader ||
      !DLT_HEADER_PATTERN.test(dltHeader) ||
      !shortCode ||
      !SHORT_CODE_PATTERN.test(shortCode)
    ) {
      logger.redirect(`Not found | ${dltHeader || '?'}/${shortCode || '?'}`);
      return res.status(404).json({
        success: false,
        message: 'Link not found',
      });
    }

    const link = await Link.findOne({ shortCode, dltHeader });

    if (!link) {
      logger.redirect(`Not found | ${dltHeader}/${shortCode}`);
      return res.status(404).json({
        success: false,
        message: 'Link not found',
      });
    }

    return sendRedirect(res, link, `${dltHeader}/${shortCode}`);
  } catch (error) {
    logger.error(`Redirect failed: ${error.message}`);
    return next(error);
  }
};

module.exports = {
  redirectToOriginalUrl,
  redirectDltUrl,
};
