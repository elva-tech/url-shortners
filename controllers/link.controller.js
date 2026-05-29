/**
 * Short link creation API
 *
 * DLT/SMS flow: notify.elvatech.in -> POST /api/create -> Fast2SMS -> user click -> redirect
 * See utils/dltIntegration.js for full integration notes.
 */
const { customAlphabet } = require('nanoid');
const config = require('../config');
const Link = require('../models/Link');
const { validateAndNormalizeUrl } = require('../utils/urlValidator');
const { buildShortUrl } = require('../utils/shortUrl');
const logger = require('../utils/logger');

const generateShortCode = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyz',
  config.shortCodeLength
);

const createShortLink = async (req, res, next) => {
  try {
    const { originalUrl } = req.body;

    if (originalUrl === undefined || originalUrl === null) {
      return res.status(400).json({
        success: false,
        message: 'originalUrl is required',
      });
    }

    if (typeof originalUrl !== 'string' || !originalUrl.trim()) {
      return res.status(400).json({
        success: false,
        message: 'originalUrl cannot be empty',
      });
    }

    const validation = validateAndNormalizeUrl(originalUrl);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const existingLink = await Link.findOne({
      originalUrl: validation.normalizedUrl,
    });

    if (existingLink) {
      logger.duplicate(
        `Existing URL matched | ${validation.normalizedUrl} -> ${existingLink.shortCode}`
      );

      return res.status(200).json({
        success: true,
        existing: true,
        shortUrl: buildShortUrl(existingLink.shortCode),
      });
    }

    let shortCode;
    let created = false;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      shortCode = generateShortCode();
      const collision = await Link.findOne({ shortCode });

      if (!collision) {
        created = true;
        break;
      }
    }

    if (!created) {
      return res.status(500).json({
        success: false,
        message: 'Unable to generate a unique short code',
      });
    }

    const link = await Link.create({
      shortCode,
      originalUrl: validation.normalizedUrl,
    });

    logger.create(`New short URL | ${link.shortCode} -> ${link.originalUrl}`);

    return res.status(201).json({
      success: true,
      existing: false,
      shortUrl: buildShortUrl(link.shortCode),
    });
  } catch (error) {
    if (error.code === 11000) {
      const retryValidation = validateAndNormalizeUrl(req.body?.originalUrl || '');

      if (retryValidation.valid) {
        const existingLink = await Link.findOne({
          originalUrl: retryValidation.normalizedUrl,
        });

        if (existingLink) {
          logger.duplicate(
            `Race duplicate resolved | ${retryValidation.normalizedUrl} -> ${existingLink.shortCode}`
          );

          return res.status(200).json({
            success: true,
            existing: true,
            shortUrl: buildShortUrl(existingLink.shortCode),
          });
        }
      }
    }

    logger.error(`Create link failed: ${error.message}`);
    return next(error);
  }
};

module.exports = {
  createShortLink,
};
