require('./env');

const parsedPort = parseInt(process.env.PORT, 10);
const parsedShortCodeLength = parseInt(process.env.SHORT_CODE_LENGTH, 10);
const nodeEnv = process.env.NODE_ENV || 'development';

/**
 * Production-safe CORS allowlist.
 * Override with CORS_ORIGIN comma-separated env var if needed.
 */
const DEFAULT_CORS_ORIGINS = [
  'https://links.elvatech.in',
  'https://notify.elvatech.in',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

const parseCorsOrigins = (value) => {
  if (value && value !== '*') {
    return value.split(',').map((origin) => origin.trim()).filter(Boolean);
  }

  return DEFAULT_CORS_ORIGINS;
};

const config = {
  port: Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3000,
  nodeEnv,
  mongoUri: process.env.MONGO_URI,
  baseUrl: process.env.BASE_URL || 'https://links.elvatech.in',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  isProduction: nodeEnv === 'production',
  shortCodeLength:
    Number.isFinite(parsedShortCodeLength) && parsedShortCodeLength >= 4
      ? parsedShortCodeLength
      : 6,
};

module.exports = config;
