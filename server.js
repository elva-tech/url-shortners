/**
 * ELVA Links Service - entry point
 *
 * Render: set env vars in Dashboard → Environment (see render.yaml / docs/DEPLOYMENT.md)
 */
const config = require('./config');
const connectDB = require('./config/db');
const createApp = require('./config/app');
const logger = require('./utils/logger');

let server;

const logStartupCheck = () => {
  console.log('Startup environment check:');
  console.log(`  NODE_ENV  : ${config.nodeEnv}`);
  console.log(`  PORT      : ${config.port}`);
  console.log(`  MONGO_URI : ${config.mongoUri ? 'set' : 'MISSING'}`);
  console.log(`  BASE_URL  : ${config.baseUrl}`);
};

const startServer = async () => {
  logStartupCheck();
  await connectDB();

  const app = createApp();

  server = app.listen(config.port, '0.0.0.0', () => {
    console.log('========================================');
    console.log('ELVA Links Service');
    console.log(`Environment : ${config.nodeEnv}`);
    console.log(`Port        : ${config.port}`);
    console.log(`Base URL    : ${config.baseUrl}`);
    console.log(`Short codes : ${config.shortCodeLength} chars (SMS/DLT)`);
    console.log(`CORS        : ${config.corsOrigins.join(', ')}`);
    console.log(`Health      : ${config.baseUrl}/`);
    console.log(`API         : ${config.baseUrl}/api/create`);
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
  process.exit(1);
});
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
