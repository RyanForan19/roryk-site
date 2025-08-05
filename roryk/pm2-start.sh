#!/bin/bash

# PM2 Start Script for RoryK Application
# This script starts all services using PM2

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
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Environment (default to production)
ENV=${1:-production}

log "Starting RoryK application in $ENV mode..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    error "PM2 is not installed. Please install PM2 first: npm install -g pm2"
fi

# Create logs directory
mkdir -p logs

# Start services based on environment
if [ "$ENV" = "production" ]; then
    log "Starting all services for production..."
    
    # Build frontend first
    log "Building frontend..."
    npm run build
    
    # Start all services
    pm2 start ecosystem.config.js --env production
    
elif [ "$ENV" = "development" ]; then
    log "Starting services for development..."
    
    # Start only backend for development (MongoDB Atlas is used)
    pm2 start ecosystem.config.js --only roryk-backend --env development
    
    # Start frontend in development mode separately
    log "Starting frontend in development mode..."
    npm start &
    
else
    error "Invalid environment: $ENV. Use 'production' or 'development'"
fi

# Save PM2 configuration
pm2 save

# Show status
sleep 3
pm2 status

success "RoryK application started successfully!"

if [ "$ENV" = "production" ]; then
    log "Application URLs:"
    log "  Frontend: http://localhost:3000"
    log "  Backend: http://localhost:3001"
    log "  Database: MongoDB Atlas (Cloud)"
else
    log "Development URLs:"
    log "  Frontend: http://localhost:3000 (React dev server)"
    log "  Backend: http://localhost:3001"
    log "  Database: MongoDB Atlas (Cloud)"
fi

log ""
log "Useful PM2 commands:"
log "  pm2 status          - Show process status"
log "  pm2 logs            - Show logs"
log "  pm2 monit           - Monitor processes"
log "  pm2 restart all     - Restart all processes"
log "  pm2 stop all        - Stop all processes"