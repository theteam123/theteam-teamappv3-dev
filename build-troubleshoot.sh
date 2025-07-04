#!/bin/bash

# Build Troubleshooting Script
echo "🔧 TeamApp Build Troubleshooting"
echo "=================================="

# Check available memory
echo ""
echo "📊 System Memory Information:"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Total Memory: $(free -h | awk 'NR==2{printf "%.1fGB", $2/1024/1024/1024}')"
    echo "Available Memory: $(free -h | awk 'NR==2{printf "%.1fGB", $7/1024/1024/1024}')"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Total Memory: $(sysctl -n hw.memsize | awk '{printf "%.1fGB", $1/1024/1024/1024}')"
else
    echo "Memory info not available for this system"
fi

echo ""
echo "📝 Available Build Options:"
echo "1. Standard build (4GB memory limit)"
echo "2. Development build (2GB memory limit)"
echo "3. Low memory build (1GB memory limit, no minification)"
echo "4. Progressive build (build in stages)"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo "🚀 Running standard build..."
        npm run build
        ;;
    2)
        echo "🚀 Running development build..."
        npm run build:dev
        ;;
    3)
        echo "🚀 Running low memory build..."
        npm run build:low-mem
        ;;
    4)
        echo "🚀 Running progressive build..."
        echo "Step 1: Cleaning previous build..."
        rm -rf dist
        
        echo "Step 2: Building with minimal processing..."
        NODE_OPTIONS='--max-old-space-size=1024' npx vite build --no-minify --mode development
        
        if [ $? -eq 0 ]; then
            echo "✅ Progressive build completed successfully!"
        else
            echo "❌ Progressive build failed"
            echo ""
            echo "💡 Troubleshooting tips:"
            echo "- Close other applications to free memory"
            echo "- Try building on a machine with more RAM"
            echo "- Consider reducing the size of your application"
            echo "- Check for memory leaks in your components"
        fi
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo "📁 Built files are in the 'dist' directory"
    echo "📊 Build size:"
    if [ -d "dist" ]; then
        du -sh dist/
    fi
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "💡 Next steps to try:"
    echo "1. Free up system memory by closing other applications"
    echo "2. Try option 3 (low memory build)"
    echo "3. Try option 4 (progressive build)"
    echo "4. Check for circular dependencies in your code"
    echo "5. Consider running the build on a machine with more RAM"
fi 