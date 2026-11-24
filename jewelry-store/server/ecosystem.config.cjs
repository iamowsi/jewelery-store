module.exports = {
  apps: [
    {
      name: 'jewelry-api',
      script: './dist/server.js',
      instances: 'max', // اجرا روی تمام هسته‌های CPU
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DB_POOL_MAX: 10,
      },
    },
  ],
};