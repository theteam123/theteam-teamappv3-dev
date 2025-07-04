# Production Deployment Guide - Binarylane Server (Nginx)

## Overview

This guide covers deploying the TeamApp v3 with:
- **Vue.js Frontend**: Built and deployed to `/var/www/teamsite` (served by Nginx)
- **Node.js API Server**: Handles Claude AI API requests on port 3002
- **PM2**: Process management for the Node.js API server
- **Smart Deployment**: Automated scripts with git conflict handling

## Prerequisites

### 1. System Requirements
- Node.js 18+ installed
- Nginx web server running
- PM2 process manager

### 2. Install Dependencies on Server

```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Verify installations
node --version
npm --version
pm2 --version
```

## Deployment Steps

### Step 1: Set Up the API Server

```bash
# Navigate to your project directory
cd /opt/vueapp/theteam-teamappv3-dev

# Install dependencies
npm install

# Note: No build step needed - this is a pure API server
```

### Step 2: Set Up Nginx Virtual Host

Update your Nginx configuration to proxy API requests to the Node.js server:

```nginx
server {
    listen 80;
    server_name teamsite.theteam.net.au;
    
    # Root directory for your Vue.js app
    root /path/to/your/vue-app/dist;
    index index.html;
    
    # Handle Vue.js client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to Node.js API server
    location /api/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Optional: Add gzip compression for better performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Optional: Set cache headers for static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logs
    access_log /var/log/nginx/teamapp_access.log;
    error_log /var/log/nginx/teamapp_error.log;
}
```

### Step 3: Create Required Directories

```bash
# Create logs directory
mkdir -p logs

# Set proper permissions
chmod 755 logs
```

### Step 4: Configure Environment Variables

Your `ecosystem.config.cjs` file is already configured with the correct domain:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3002,
  FRONTEND_URL: 'https://teamsite.theteam.net.au'
},
```

The API server is located at: `/opt/vueapp/theteam-teamappv3-dev`

### Step 5: Start the Node.js Server

```bash
# Start the server with PM2 (uses your existing server.js)
npm run proxy:prod

# Verify it's running
pm2 list

# Check logs
npm run proxy:logs
```

### Step 6: Configure PM2 for Auto-Start

```bash
# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup

# Follow the instructions shown by PM2 startup command
# Usually something like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u yourusername --hp /home/yourusername
```

### Step 7: Test the Setup

1. **Test the proxy server directly:**
   ```bash
   curl http://localhost:3002/health
   ```

2. **Test through Nginx:**
   ```bash
   curl http://your-domain.com/api/health
   ```

3. **Test Vue.js app:**
   Visit `http://your-domain.com` in your browser

## Management Commands

### Node.js Server Management

```bash
# Start the server
npm run proxy:prod

# Stop the server
npm run proxy:stop

# Restart the server
npm run proxy:restart

# View logs
npm run proxy:logs

# Check status
pm2 status teamapp-proxy
```

### Deployment Options

#### Full Deployment (Frontend + API):
```bash
# Recommended: Full deployment with build
./deploy-update.sh

# Or using npm script
npm run deploy
```

**What it does:**
- Pulls latest changes with conflict handling
- Installs dependencies
- Builds Vue.js frontend (`npm run build`)
- Deploys built files to `/var/www/teamsite`
- Sets proper file permissions
- Restarts API server
- Tests both frontend and API

#### API-Only Deployment:
```bash
# When you only changed API server code (no frontend changes)
./deploy-api-only.sh

# Or using npm script
npm run deploy:api
```

**What it does:**
- Pulls latest changes with conflict handling
- Installs dependencies (only if package.json changed)
- Restarts API server
- Tests API server
- Skips frontend build and deployment

#### Manual Deployment (if needed):
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Build frontend (if changed)
npm run build

# 4. Deploy frontend (if changed)
sudo rsync -av --delete dist/ /var/www/teamsite/
sudo chown -R www-data:www-data /var/www/teamsite

# 5. Restart API server
npm run proxy:restart
```

## Monitoring

### Check Application Status

```bash
# Check PM2 processes
pm2 list

# Monitor resource usage
pm2 monit

# View detailed logs
pm2 logs teamapp-proxy --lines 100
```

### Check Nginx Status

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/teamapp_error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/teamapp_access.log
```

## Troubleshooting

### Common Issues

1. **Port 3002 already in use:**
   ```bash
   sudo lsof -i :3002
   # Kill the process if needed
   sudo kill -9 [PID]
   ```

2. **Nginx proxy not working:**
   ```bash
   # Check Nginx configuration
   sudo nginx -t
   
   # Restart Nginx if config is valid
   sudo systemctl restart nginx
   
   # Check if Nginx is running
   sudo systemctl status nginx
   ```

3. **PM2 process not staying alive:**
   ```bash
   # Check PM2 logs
   pm2 logs teamapp-proxy
   
   # Check if Node.js has all required dependencies
   cd /opt/vueapp/theteam-teamappv3-dev
   npm install
   ```

4. **CORS issues:**
   - Ensure `FRONTEND_URL` in `ecosystem.config.js` matches your domain
   - Check that Nginx is properly proxying requests

### Log Locations

- **PM2 Logs**: `/opt/vueapp/theteam-teamappv3-dev/logs/` directory
- **Nginx Error Log**: `/var/log/nginx/teamapp_error.log`
- **Nginx Access Log**: `/var/log/nginx/teamapp_access.log`

## Security Considerations

1. **Firewall Configuration:**
   ```bash
   # Only allow necessary ports
   sudo ufw allow 80
   sudo ufw allow 443
   # Don't expose 3002 directly to the internet
   ```

2. **SSL Certificate:**
   - Set up SSL/TLS with Let's Encrypt or your preferred certificate provider
   - Update Apache configuration to redirect HTTP to HTTPS

3. **Environment Variables:**
   - Keep sensitive data in environment variables
   - Never commit API keys or secrets to version control

## Performance Optimization

1. **PM2 Cluster Mode:**
   - For high traffic, consider increasing `instances` in `ecosystem.config.js`

2. **Nginx Optimization:**
   - Enable gzip compression (included in config above)
   - Configure proper caching headers for static assets (included in config above)

3. **Monitoring:**
   - Set up monitoring with PM2 Plus or similar tools
   - Configure alerts for downtime or high resource usage 