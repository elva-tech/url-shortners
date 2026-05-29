/**
 * Short link creation API
 *
 * Normal: POST /api/create { originalUrl }
 * DLT:    POST /api/create { originalUrl, useDlt: true, dltHeader: "ELVATK" }
 */
const { customAlphabet } = require('nanoid');
const config = require('../config');
const Link = require('../models/Link');
const { validateAndNormalizeUrl } = require('../utils/urlValidator');
const { buildShortUrl } = require('../utils/shortUrl');
const { validateDltHeader, DEFAULT_DLT_HEADER } = require('../utils/dltHeader');
const logger = require('../utils/logger');

const generateShortCode = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyz',
  config.shortCodeLength
);

const resolveDltHeader = (body) => {
  const useDlt = Boolean(body.useDlt);

  if (!useDlt) {
    return { dltHeader: null };
  }

  const validation = validateDltHeader(body.dltHeader || DEFAULT_DLT_HEADER);

  if (!validation.valid) {
    return { error: validation.error };
  }

  return { dltHeader: validation.normalized };
};

const createShortLink = async (req, res, next) => {
  try {
    const { originalUrl } = req.body;
    const dltResult = resolveDltHeader(req.body);

    if (dltResult.error) {
      return res.status(400).json({
        success: false,
        message: dltResult.error,
      });
    }

    const { dltHeader } = dltResult;

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
      dltHeader,
    });

    if (existingLink) {
      logger.duplicate(
        `Existing URL matched | ${validation.normalizedUrl} | dlt=${dltHeader || 'none'} -> ${existingLink.shortCode}`
      );

      return res.status(200).json({
        success: true,
        existing: true,
        dlt: Boolean(dltHeader),
        dltHeader: dltHeader || undefined,
        shortUrl: buildShortUrl(existingLink.shortCode, existingLink.dltHeader),
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
      dltHeader,
    });

    logger.create(
      `New short URL | ${dltHeader ? `${dltHeader}/` : ''}${link.shortCode} -> ${link.originalUrl}`
    );

    return res.status(201).json({
      success: true,
      existing: false,
      dlt: Boolean(dltHeader),
      dltHeader: dltHeader || undefined,
      shortUrl: buildShortUrl(link.shortCode, link.dltHeader),
    });
  } catch (error) {
    if (error.code === 11000) {
      const retryValidation = validateAndNormalizeUrl(req.body?.originalUrl || '');
      const retryDlt = resolveDltHeader(req.body);

      if (retryValidation.valid && !retryDlt.error) {
        const existingLink = await Link.findOne({
          originalUrl: retryValidation.normalizedUrl,
          dltHeader: retryDlt.dltHeader,
        });

        if (existingLink) {
          return res.status(200).json({
            success: true,
            existing: true,
            dlt: Boolean(existingLink.dltHeader),
            dltHeader: existingLink.dltHeader || undefined,
            shortUrl: buildShortUrl(existingLink.shortCode, existingLink.dltHeader),
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
