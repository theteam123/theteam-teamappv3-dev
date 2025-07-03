#!/bin/bash

# TeamApp v3 Production Setup Script
# Run this script on your Binarylane server

set -e

echo "🚀 Starting TeamApp v3 Production Setup..."

# Pull latest changes from repository
echo "📥 Pulling latest changes from repository..."
if git pull origin main; then
    echo "✅ Repository updated successfully"
else
    echo "⚠️  Git pull failed or no changes to pull"
fi

# Make script executable (in case permissions were lost)
chmod +x setup-production.sh

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Run: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "Then: sudo apt-get install -y nodejs"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

echo "✅ PM2 version: $(pm2 --version)"

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs
chmod 755 logs

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Dependencies installed successfully"

# Start the server
echo "🔄 Starting server..."
npm run proxy:prod

# Wait a moment for PM2 to start
sleep 3

# Check if the server is running
if pm2 list | grep -q "teamapp-proxy"; then
    echo "✅ Server started successfully"
else
    echo "❌ Failed to start server"
    echo "Trying alternative approach..."
    pm2 start server.js --name teamapp-proxy --env production
    sleep 2
    if pm2 list | grep -q "teamapp-proxy"; then
        echo "✅ Server started with alternative method"
    else
        echo "❌ Failed to start server with all methods"
        exit 1
    fi
fi

# Test the health endpoint
echo "🔍 Testing health endpoint..."
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ Health endpoint is responding"
else
    echo "❌ Health endpoint is not responding"
    echo "Check logs with: npm run proxy:logs"
    exit 1
fi

# Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure your Nginx virtual host (see PRODUCTION-DEPLOYMENT.md)"
echo "2. Set up PM2 auto-start: pm2 startup"
echo "3. Test your application at your domain"
echo ""
echo "Management commands:"
echo "  - View logs: npm run proxy:logs"
echo "  - Restart server: npm run proxy:restart"
echo "  - Stop server: npm run proxy:stop"
echo "  - Check status: pm2 list"
echo ""
echo "For detailed instructions, see PRODUCTION-DEPLOYMENT.md" 