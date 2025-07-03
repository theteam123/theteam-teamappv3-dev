# Production Deployment Guide - Binarylane Server

## Overview

This guide covers deploying the TeamApp v3 with:
- **Vue.js Frontend**: Served by Apache (separate deployment)
- **Node.js API Server**: Handles Claude AI API requests only (no static files)
- **PM2**: Process management for the Node.js API server

## Prerequisites

### 1. System Requirements
- Node.js 18+ installed
- Apache web server running
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
cd /path/to/your/project

# Install dependencies
npm install

# Note: No build step needed - this is a pure API server
```

### Step 2: Set Up Apache Virtual Host

Update your Apache configuration to proxy API requests to the Node.js server:

```apache
<VirtualHost *:80>
    ServerName teamsite.theteam.net.au
    DocumentRoot /path/to/your/vue-app/dist
    
    # Serve static Vue.js files (from your separate Vue.js deployment)
    <Directory "/path/to/your/vue-app/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle Vue.js client-side routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Proxy API requests to Node.js API server
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3002/api/
    ProxyPassReverse /api/ http://localhost:3002/api/
    
    # Enable mod_rewrite and mod_proxy
    # Make sure these modules are enabled:
    # sudo a2enmod rewrite
    # sudo a2enmod proxy
    # sudo a2enmod proxy_http
    
    ErrorLog ${APACHE_LOG_DIR}/teamapp_error.log
    CustomLog ${APACHE_LOG_DIR}/teamapp_access.log combined
</VirtualHost>
```

### Step 3: Create Required Directories

```bash
# Create logs directory
mkdir -p logs

# Set proper permissions
chmod 755 logs
```

### Step 4: Configure Environment Variables

Create or update the `ecosystem.config.js` file with your domain:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3002,
  FRONTEND_URL: 'https://teamsite.theteam.net.au' // Update this to your domain
},
```

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

2. **Test through Apache:**
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

### Update/Redeploy API Server

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Restart API server
npm run proxy:restart

# Note: For Vue.js app updates, deploy separately to your Vue.js directory
# and restart Apache if needed:
# sudo systemctl restart apache2
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

### Check Apache Status

```bash
# Check Apache status
sudo systemctl status apache2

# Check Apache error logs
sudo tail -f /var/log/apache2/teamapp_error.log

# Check Apache access logs
sudo tail -f /var/log/apache2/teamapp_access.log
```

## Troubleshooting

### Common Issues

1. **Port 3002 already in use:**
   ```bash
   sudo lsof -i :3002
   # Kill the process if needed
   sudo kill -9 [PID]
   ```

2. **Apache proxy not working:**
   ```bash
   # Enable required modules
   sudo a2enmod proxy
   sudo a2enmod proxy_http
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

3. **PM2 process not staying alive:**
   ```bash
   # Check PM2 logs
   pm2 logs teamapp-proxy
   
   # Check if Node.js has all required dependencies
   cd /path/to/your/project
   npm install
   ```

4. **CORS issues:**
   - Ensure `FRONTEND_URL` in `ecosystem.config.js` matches your domain
   - Check that Apache is properly proxying requests

### Log Locations

- **PM2 Logs**: `./logs/` directory in your project
- **Apache Error Log**: `/var/log/apache2/teamapp_error.log`
- **Apache Access Log**: `/var/log/apache2/teamapp_access.log`

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

2. **Apache Optimization:**
   - Enable gzip compression
   - Configure proper caching headers for static assets

3. **Monitoring:**
   - Set up monitoring with PM2 Plus or similar tools
   - Configure alerts for downtime or high resource usage 