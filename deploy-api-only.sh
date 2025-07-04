#!/bin/bash

# TeamApp v3 API-Only Deployment Script
# Use this when you only need to update the API server, not the frontend

set -e

echo "🔄 Starting API-Only Deployment..."

# Save current working directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from your project directory."
    exit 1
fi

# Stash any local changes temporarily
echo "📦 Stashing local changes..."
git add .
git stash push -m "Auto-stash before API update $(date)"

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
if git stash list | grep -q "Auto-stash before API update"; then
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
chmod +x deploy-api-only.sh

# Install dependencies only if package files changed
if git diff --name-only HEAD@{1} HEAD | grep -q "package.json\|package-lock.json"; then
    echo "📦 Package files changed, updating dependencies..."
    npm install || {
        echo "❌ npm install failed!"
        exit 1
    }
else
    echo "📦 No package changes detected, skipping npm install"
fi

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

# Test the API server
echo "🔍 Testing API server..."
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ API server is responding"
else
    echo "❌ API server is not responding"
    echo "Check logs with: npm run proxy:logs"
    exit 1
fi

echo ""
echo "🎉 API-Only deployment completed successfully!"
echo ""
echo "📊 Current status:"
pm2 list
echo ""
echo "📝 Note: Frontend was NOT rebuilt. If you need to update the frontend too, run:"
echo "  ./deploy-update.sh (full deployment)"
echo ""
echo "📝 Useful commands:"
echo "  - View API logs: npm run proxy:logs"
echo "  - Check PM2 status: pm2 list"
echo "  - Test API: curl http://localhost:3002/health" 