/**
 * PM2 process manager configuration
 *
 * Start production:
 *   pm2 start ecosystem.config.js --env production
 *
 * Useful commands:
 *   pm2 logs links-service
 *   pm2 restart links-service
 *   pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'links-service',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
