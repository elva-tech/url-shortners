const config = require('../config');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  if (err.message && err.message.startsWith('CORS blocked')) {
    logger.error(err.message);
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed',
    });
  }

  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);

  if (config.nodeEnv !== 'production') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message:
      config.isProduction && statusCode === 500
        ? 'Internal server error'
        : err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
