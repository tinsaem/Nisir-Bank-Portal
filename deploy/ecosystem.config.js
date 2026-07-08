// PM2 Ecosystem Configuration File
// Alternative to using "pm2 start npm -- start"
// Usage: pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      name: 'nisir-bank-portal',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/nisir-bank-portal',
      instances: 1, // or 'max' for cluster mode
      exec_mode: 'fork', // or 'cluster' for multiple instances
      env: {
        NODE_ENV: 'production',
        PORT: 2022
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 2022
      },
      error_file: '/var/www/nisir-bank-portal/logs/pm2-error.log',
      out_file: '/var/www/nisir-bank-portal/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
