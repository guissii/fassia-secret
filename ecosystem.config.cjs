module.exports = {
  apps: [
    {
      name: 'fassia-frontend',
      cwd: './',
      script: './node_modules/.bin/next',
      args: 'start',
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      merge_logs: true,
      restart_delay: 3000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      wait_ready: true,
      autorestart: true,
      max_restarts: 5,
    },
    {
      name: 'fassia-backend',
      cwd: './backend',
      script: 'dist/index.js',
      instances: 6,
      exec_mode: 'cluster',
      max_memory_restart: '1.5G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        NODE_WORKERS: 1
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,
      restart_delay: 3000,
      kill_timeout: 5000,
      listen_timeout: 10000,
      wait_ready: true,
      autorestart: true,
      max_restarts: 5,
    }
  ]
};
