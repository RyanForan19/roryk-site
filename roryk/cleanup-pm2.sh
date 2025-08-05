#!/bin/bash

# PM2 Cleanup Script for RoryK
# This script cleans up PM2 processes and prepares for a fresh deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Main cleanup function
cleanup_pm2() {
    log "Starting PM2 cleanup..."
    
    # Show current PM2 status
    log "Current PM2 processes:"
    pm2 list || true
    
    # Stop all processes gracefully
    log "Stopping all PM2 processes..."
    pm2 stop all 2>/dev/null || true
    
    # Delete all processes
    log "Deleting all PM2 processes..."
    pm2 delete all 2>/dev/null || true
    
    # Kill any remaining PM2 processes
    log "Killing any remaining PM2 processes..."
    pm2 kill 2>/dev/null || true
    
    # Clear PM2 logs
    log "Clearing PM2 logs..."
    pm2 flush 2>/dev/null || true
    
    # Reset PM2 configuration
    log "Resetting PM2 configuration..."
    pm2 save --force 2>/dev/null || true
    
    # Create logs directory if it doesn't exist
    mkdir -p ./logs
    
    success "PM2 cleanup completed successfully!"
    log "You can now run the deployment script: ./deploy.sh"
}

# Show usage
usage() {
    echo "Usage: $0"
    echo ""
    echo "This script cleans up all PM2 processes and prepares for a fresh deployment."
    echo "It will:"
    echo "  - Stop all PM2 processes"
    echo "  - Delete all PM2 processes"
    echo "  - Kill PM2 daemon"
    echo "  - Clear PM2 logs"
    echo "  - Reset PM2 configuration"
}

# Check if help is requested
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    usage
    exit 0
fi

# Run cleanup
cleanup_pm2