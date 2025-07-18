#!/bin/bash

# TeamApp v3 Deployment Update Script
# Handles git conflicts and file permissions

set -e

echo "🔄 Starting TeamApp v3 Update Process..."

# Save current working directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from your project directory."
    exit 1
fi

# Backup any local changes that might conflict
echo "💾 Backing up local changes..."
if [ -f "package-lock.json" ]; then
    cp package-lock.json package-lock.json.backup
fi

# Stash any local changes temporarily
echo "📦 Stashing local changes..."
git add .
git stash push -m "Auto-stash before update $(date)"

# Pull latest changes
echo "📥 Pulling latest changes from repository..."
if git pull origin main; then
    echo "✅ Repository updated successfully"
else
    echo "❌ Git pull failed"
    echo "Restoring stashed changes..."
    git stash pop
    exit 1
fi

# Check if there are stashed changes and restore them carefully
if git stash list | grep -q "Auto-stash before update"; then
    echo "🔄 Attempting to restore local changes..."
    if git stash pop; then
        echo "✅ Local changes restored successfully"
    else
        echo "⚠️  Merge conflict detected. Manual intervention required."
        echo "Use 'git status' to see conflicts and resolve them."
        echo "After resolving conflicts, run 'git stash drop' to clean up."
    fi
fi

# Ensure script permissions are correct
echo "🔐 Setting correct file permissions..."
chmod +x setup-production.sh
chmod +x deploy-update.sh

# Always install/update dependencies to be safe
echo "📦 Installing/updating dependencies..."
npm install || {
    echo "❌ npm install failed!"
    exit 1
}

# Build VueJS project
echo "Building VueJS project..."
npm run build || {
  echo "Build failed!"
  exit 1
}

# Deploy built files to Nginx directory
echo "🚀 Deploying to /var/www/teamsite..."
sudo rsync -av --delete dist/ /var/www/teamsite/ || {
    echo "❌ Deployment to Nginx directory failed!"
    exit 1
}

# Set correct permissions for web files
echo "🔐 Setting web directory permissions..."
sudo chown -R www-data:www-data /var/www/teamsite || {
    echo "⚠️  Failed to set web directory permissions (continuing anyway)"
}

# Restart the API server if it's running
if pm2 list | grep -q "teamapp-proxy"; then
    echo "🔄 Restarting API server..."
    npm run proxy:restart
    
    # Wait and check if restart was successful
    sleep 3
    if pm2 list | grep -q "teamapp-proxy.*online"; then
        echo "✅ API server restarted successfully"
    else
        echo "❌ API server restart failed"
        echo "Check logs with: npm run proxy:logs"
        exit 1
    fi
else
    echo "ℹ️  API server not running. Starting it..."
    npm run proxy:prod
fi

# Test both frontend and API
echo "🔍 Testing deployment..."

# Test API server
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ API server is responding"
else
    echo "❌ API server is not responding"
    echo "Check logs with: npm run proxy:logs"
    exit 1
fi

# Test frontend deployment
if [ -f "/var/www/teamsite/index.html" ]; then
    echo "✅ Frontend files deployed successfully"
else
    echo "❌ Frontend deployment failed - index.html not found"
    exit 1
fi

# Test Nginx is serving files
if curl -s http://localhost/ > /dev/null; then
    echo "✅ Nginx is serving frontend files"
else
    echo "⚠️  Nginx might not be running or configured properly"
fi

echo ""
echo "🎉 Full deployment completed successfully!"
echo ""
echo "📊 Current status:"
pm2 list
echo ""
echo "🌐 Your application is available at:"
echo "  - Frontend: https://teamsite.theteam.net.au"
echo "  - API Health: https://teamsite.theteam.net.au/health"
echo "  - Claude API: https://teamsite.theteam.net.au/api/claude"
echo ""
echo "📝 Useful commands:"
echo "  - View API logs: npm run proxy:logs"
echo "  - Check PM2 status: pm2 list"
echo "  - Test API directly: curl http://localhost:3002/health"
echo "  - Check frontend files: ls -la /var/www/teamsite/" 