#!/bin/bash

# One-time script to fix git conflicts and set up permissions
echo "🔧 Fixing git conflicts and setting up repository..."

# Add all current changes to git
echo "📦 Adding current changes to git..."
git add .

# Commit the local changes
echo "💾 Committing local production changes..."
git commit -m "Production deployment configuration

- Updated ecosystem.config.cjs for production paths
- Added deployment scripts and configuration
- Updated package.json with deployment scripts
- Added production documentation" || echo "Nothing to commit"

# Set execute permissions on shell scripts
echo "🔐 Setting execute permissions..."
chmod +x setup-production.sh
chmod +x deploy-update.sh
chmod +x deploy-api-only.sh
chmod +x fix-git-conflicts.sh

# Update git to track execute permissions
echo "📝 Updating git file permissions..."
git update-index --chmod=+x setup-production.sh
git update-index --chmod=+x deploy-update.sh
git update-index --chmod=+x deploy-api-only.sh
git update-index --chmod=+x fix-git-conflicts.sh

# Commit permission changes if any
git add setup-production.sh deploy-update.sh deploy-api-only.sh fix-git-conflicts.sh .gitattributes
git commit -m "Fix file permissions for shell scripts" || echo "No permission changes to commit"

echo ""
echo "✅ Git conflicts and permissions fixed!"
echo ""
echo "🚀 Next steps:"
echo "1. Run: git push origin main (to save your production config)"
echo "2. Use: ./deploy-update.sh (for future updates)"
echo "3. Use: npm run deploy (alternative way to update)"
echo ""
echo "🔄 For future deployments, just run:"
echo "   ./deploy-update.sh"
echo "   or"
echo "   npm run deploy" 