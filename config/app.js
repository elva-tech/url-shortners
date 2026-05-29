/**
 * Express application setup
 *
 * Deployment targets: EC2, VPS, Render (with reverse proxy)
 * - Set trust proxy when behind NGINX / load balancer
 * - Terminate SSL at NGINX and proxy to Node PORT
 * - See docs/DEPLOYMENT.md and docs/nginx.example.conf
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./index');
const routes = require('../routes');
const requestLogger = require('../middleware/requestLogger');
const notFound = require('../middleware/notFound');
const errorHandler = require('../middleware/errorHandler');

const createCorsOptions = () => ({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (config.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
});

const createApp = () => {
  const app = express();

  app.disable('x-powered-by');

  if (config.isProduction) {
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(requestLogger);

  app.use(routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
