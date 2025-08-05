#!/bin/bash

# PM2 Stop Script for RoryK Application
# This script stops all PM2 services

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

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log "Stopping RoryK application..."

# Stop all PM2 processes
pm2 stop all 2>/dev/null || true

# Show final status
pm2 status

success "All services stopped successfully!"

log ""
log "To completely remove all processes, run:"
log "  pm2 delete all"
log ""
log "To start services again, run:"
log "  ./pm2-start.sh [production|development]"