module.exports = {
  apps: [
    {
      name: 'talentai-backend',
      cwd: '/opt/talentai/Backend',
      script: 'app.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/opt/talentai/logs/backend-error.log',
      out_file: '/opt/talentai/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'talentai-frontend',
      cwd: '/opt/talentai',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/opt/talentai/logs/frontend-error.log',
      out_file: '/opt/talentai/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
