#!/bin/bash

# Server Build Script - Optimized for Production Server
echo "🔧 TeamApp Server Build (Memory Optimized)"
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in /opt/vueapp/theteam-teamappv3-dev"
    exit 1
fi

# Show system resources
echo ""
echo "📊 Server Resources:"
echo "Memory: $(free -h | awk 'NR==2{printf "%.1fGB total, %.1fGB available", $2/1024/1024/1024, $7/1024/1024/1024}')"
echo "CPU Cores: $(nproc)"
echo "Disk Space: $(df -h /opt | awk 'NR==2{print $4" available"}')"

# Kill any existing build processes
echo ""
echo "🧹 Cleaning up any hanging processes..."
pkill -f "vite build" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true
sleep 2

# Clean previous build
echo "🗑️  Cleaning previous build..."
rm -rf dist/

# Check available memory and choose appropriate build
AVAILABLE_MEM=$(free -m | awk 'NR==2{print $7}')
echo "Available memory: ${AVAILABLE_MEM}MB"

if [ "$AVAILABLE_MEM" -lt 1024 ]; then
    echo "⚠️  Low memory detected (<1GB). Using minimal build..."
    BUILD_CMD="NODE_OPTIONS='--max-old-space-size=512' npm run build:low-mem"
elif [ "$AVAILABLE_MEM" -lt 2048 ]; then
    echo "📊 Medium memory detected (<2GB). Using development build..."
    BUILD_CMD="NODE_OPTIONS='--max-old-space-size=1024' npm run build:dev"
else
    echo "✅ Sufficient memory detected (>2GB). Using standard build..."
    BUILD_CMD="npm run build"
fi

echo ""
echo "🚀 Starting build with command: $BUILD_CMD"
echo "⏱️  This may take 2-5 minutes on the server..."

# Set timeout for build (5 minutes)
timeout 300 bash -c "$BUILD_CMD"
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo "📁 Build size:"
    du -sh dist/
    echo ""
    echo "🚀 Ready for deployment!"
elif [ $BUILD_EXIT_CODE -eq 124 ]; then
    echo ""
    echo "❌ Build timed out after 5 minutes"
    echo "💡 Try running with even lower memory settings:"
    echo "   NODE_OPTIONS='--max-old-space-size=256' npx vite build --no-minify"
else
    echo ""
    echo "❌ Build failed with exit code: $BUILD_EXIT_CODE"
    echo ""
    echo "💡 Troubleshooting options:"
    echo "1. Check if other processes are using memory:"
    echo "   ps aux --sort=-%mem | head -10"
    echo ""
    echo "2. Try building with minimal resources:"
    echo "   NODE_OPTIONS='--max-old-space-size=256' npx vite build --no-minify --mode development"
    echo ""
    echo "3. Check disk space:"
    echo "   df -h"
    echo ""
    echo "4. Monitor system during build:"
    echo "   watch -n 1 'free -h && echo && ps aux | grep vite'"
fi 