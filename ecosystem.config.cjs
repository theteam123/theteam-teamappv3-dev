module.exports = {
  apps: [
    {
      name: 'teamapp-proxy',
      script: 'server.js',
      cwd: '/opt/vueapp/theteam-teamappv3-dev',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        FRONTEND_URL: 'https://teamsite.theteam.net.au'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        FRONTEND_URL: 'https://teamsite.theteam.net.au'
      },
      // Logging
      log_file: '/opt/vueapp/theteam-teamappv3-dev/logs/proxy-server.log',
      error_file: '/opt/vueapp/theteam-teamappv3-dev/logs/proxy-server-error.log',
      out_file: '/opt/vueapp/theteam-teamappv3-dev/logs/proxy-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart configuration
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      
      // Process management
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 3000,
    }
  ]
}; 