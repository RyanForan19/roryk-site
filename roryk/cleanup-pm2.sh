#!/bin/bash

# PM2 Cleanup Script for MongoDB Atlas Migration
# This script cleans up any remaining PM2 processes and configurations

echo "🧹 Cleaning up PM2 processes and configurations..."

# Stop all PM2 processes
echo "Stopping all PM2 processes..."
pm2 stop all || true

# Delete all PM2 processes
echo "Deleting all PM2 processes..."
pm2 delete all || true

# Kill PM2 daemon
echo "Killing PM2 daemon..."
pm2 kill || true

# Clear PM2 logs
echo "Clearing PM2 logs..."
pm2 flush || true

# Remove PM2 startup configuration
echo "Removing PM2 startup configuration..."
pm2 unstartup || true

echo "✅ PM2 cleanup completed!"
echo ""
echo "🚀 Next steps:"
echo "1. Start the application with: ./pm2-start.sh production"
echo "2. Or use the deploy script: ./deploy.sh production deploy"
echo ""
echo "📝 Note: The application now uses MongoDB Atlas - no local MongoDB needed!"