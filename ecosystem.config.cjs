module.exports = {
  apps: [
    {
      name: 'fassia-frontend',
      cwd: './',
      script: 'node',
      args: '.next/standalone/server.js',
      instances: 4,
      exec_mode: 'cluster',
      max_memory_restart: '2000M',
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
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
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
