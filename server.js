/**
 * ELVA Links Service - entry point
 *
 * Deployment (EC2 / VPS / Render):
 * 1. Copy .env.example -> .env and set MONGO_URI, BASE_URL, CORS_ORIGIN
 * 2. npm install --production
 * 3. pm2 start ecosystem.config.js --env production
 * 4. Configure NGINX reverse proxy + SSL (see docs/DEPLOYMENT.md)
 */
const config = require('./config');
const connectDB = require('./config/db');
const createApp = require('./config/app');
const logger = require('./utils/logger');

let server;

const startServer = async () => {
  await connectDB();

  const app = createApp();

  server = app.listen(config.port, () => {
    console.log('========================================');
    console.log('ELVA Links Service');
    console.log(`Environment : ${config.nodeEnv}`);
    console.log(`Port        : ${config.port}`);
    console.log(`Base URL    : ${config.baseUrl}`);
    console.log(`Short codes : ${config.shortCodeLength} chars (SMS/DLT)`);
    console.log(`CORS        : ${config.corsOrigins.join(', ')}`);
    console.log(`Health      : ${config.baseUrl}/`);
    console.log(`API         : ${config.baseUrl}/api/links`);
    console.log('========================================');
  });
};

const shutdown = (signal) => {
  logger.request(`${signal} received - shutting down`);

  if (!server) {
    process.exit(0);
  }

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

startServer().catch((error) => {
  logger.error(`Server startup failed: ${error.message}`);
  process.exit(1);
});
