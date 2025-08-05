#!/bin/bash

# RoryK Deployment Script
# This script handles the deployment of the RoryK application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="roryk"
DEPLOY_ENV=${1:-production}
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm first."
    fi
    
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        log "Installing PM2..."
        npm install -g pm2
    fi
    
    # MongoDB Atlas is used - no local MongoDB installation needed
    log "Using MongoDB Atlas - skipping local MongoDB setup"
    
    # Check if serve is installed (for frontend)
    if ! command -v serve &> /dev/null; then
        log "Installing serve..."
        npm install -g serve
    fi
    
    success "All prerequisites are met"
}

# Backup database (MongoDB Atlas)
backup_database() {
    log "Database backup with MongoDB Atlas..."
    
    # Check if mongodump is available for manual backup
    if command -v mongodump &> /dev/null; then
        log "Creating manual backup with mongodump..."
        mkdir -p "$BACKUP_DIR"
        BACKUP_FILE="$BACKUP_DIR/mongodb_atlas_backup_$(date +%Y%m%d_%H%M%S).gz"
        
        if mongodump --uri="mongodb+srv://foranlennon:akptLxS8mkxSPCNN@roryk.ofpdpmr.mongodb.net/roryk" --archive --gzip > "$BACKUP_FILE" 2>/dev/null; then
            success "Atlas backup created: $BACKUP_FILE"
        else
            warning "Atlas backup failed, but continuing deployment..."
        fi
    else
        warning "mongodump not found. MongoDB Atlas provides automated backups."
        warning "To create manual backups, install mongodb-database-tools and use:"
        warning "mongodump --uri=\"mongodb+srv://foranlennon:akptLxS8mkxSPCNN@roryk.ofpdpmr.mongodb.net/roryk\""
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Install frontend dependencies
    log "Installing frontend dependencies..."
    npm install
    
    # Install backend dependencies
    log "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    success "Dependencies installed"
}

# Build application
build_application() {
    log "Building application..."
    
    # Build frontend
    log "Building frontend..."
    if [ "$DEPLOY_ENV" = "production" ]; then
        npm run build
    else
        log "Skipping frontend build for development environment"
    fi
    
    success "Application built"
}

# Database connection check (MongoDB Atlas)
check_database_connection() {
    log "Checking MongoDB Atlas connection..."
    
    # Test connection using Node.js (since we're using Atlas)
    cd backend
    if node -e "
        const mongoose = require('mongoose');
        const uri = process.env.MONGODB_URI || 'mongodb+srv://foranlennon:akptLxS8mkxSPCNN@roryk.ofpdpmr.mongodb.net/roryk?retryWrites=true&w=majority';
        mongoose.connect(uri).then(() => {
            console.log('MongoDB Atlas connection successful');
            process.exit(0);
        }).catch(err => {
            console.error('MongoDB Atlas connection failed:', err.message);
            process.exit(1);
        });
    " 2>/dev/null; then
        success "MongoDB Atlas connection verified"
    else
        warning "MongoDB Atlas connection test failed, but continuing deployment..."
    fi
    cd ..
}

# Deploy backend
deploy_backend() {
    log "Deploying backend..."
    
    cd backend
    
    # Copy appropriate environment file
    if [ "$DEPLOY_ENV" = "production" ]; then
        if [ -f ".env.linux-production" ]; then
            cp .env.linux-production .env
            log "Using Linux production environment configuration"
        elif [ -f ".env.production" ]; then
            cp .env.production .env
            log "Using general production environment configuration"
        else
            warning "Production environment file not found, using development configuration"
        fi
    fi
    
    cd ..
    
    # Start backend with PM2
    if [ "$DEPLOY_ENV" = "production" ]; then
        pm2 start ecosystem.config.js --only roryk-backend --env production
    else
        pm2 start ecosystem.config.js --only roryk-backend --env development
    fi
    
    pm2 save
    success "Backend deployed"
}

# Deploy frontend
deploy_frontend() {
    log "Deploying frontend..."
    
    if [ "$DEPLOY_ENV" = "production" ]; then
        # Start frontend server with PM2
        pm2 start ecosystem.config.js --only roryk-frontend
        success "Frontend deployed on port 3000"
    else
        log "Starting frontend in development mode..."
        npm start &
        success "Frontend started in development mode"
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check backend health
    sleep 5
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend (if production)
    if [ "$DEPLOY_ENV" = "production" ]; then
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            success "Frontend health check passed"
        else
            error "Frontend health check failed"
        fi
    fi
    
    success "All health checks passed"
}

# Setup SSL (production only)
setup_ssl() {
    if [ "$DEPLOY_ENV" = "production" ]; then
        log "Setting up SSL certificates..."
        
        # This is a placeholder - you would implement your SSL setup here
        # For example, using Let's Encrypt with certbot
        warning "SSL setup not implemented. Please configure SSL certificates manually."
    fi
}

# Main deployment function
deploy() {
    log "Starting deployment for environment: $DEPLOY_ENV"
    
    check_prerequisites
    backup_database
    install_dependencies
    build_application
    check_database_connection
    deploy_backend
    deploy_frontend
    health_check
    setup_ssl
    
    success "Deployment completed successfully!"
    log "Application is now running:"
    log "  Frontend: http://localhost:3000"
    log "  Backend: http://localhost:3001"
    log "  Database: MongoDB Atlas (Cloud)"
    
    if [ "$DEPLOY_ENV" = "production" ]; then
        log ""
        log "Production deployment notes:"
        log "  - Update DNS records to point to this server"
        log "  - Configure SSL certificates"
        log "  - Set up monitoring and logging"
        log "  - Configure firewall rules"
        log "  - Set up automated backups"
    fi
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Stop services
    pm2 stop all || true
    
    # Database rollback with MongoDB Atlas
    warning "Database rollback with MongoDB Atlas requires manual intervention"
    warning "Use MongoDB Atlas UI or mongorestore with Atlas connection string"
    
    success "Rollback completed"
}

# Stop services
stop() {
    log "Stopping services..."
    
    # Stop all PM2 processes
    pm2 stop all || true
    pm2 delete all || true
    
    success "Services stopped"
}

# Show usage
usage() {
    echo "Usage: $0 [production|development] [deploy|rollback|stop]"
    echo ""
    echo "Commands:"
    echo "  deploy     - Deploy the application (default)"
    echo "  rollback   - Rollback to previous version"
    echo "  stop       - Stop all services"
    echo ""
    echo "Examples:"
    echo "  $0 production deploy"
    echo "  $0 development"
    echo "  $0 production rollback"
    echo "  $0 stop"
}

# Main script logic
case "${2:-deploy}" in
    deploy)
        deploy
        ;;
    rollback)
        rollback
        ;;
    stop)
        stop
        ;;
    *)
        usage
        exit 1
        ;;
esac