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
    
    # Check if MongoDB is installed
    if ! command -v mongod &> /dev/null; then
        warning "MongoDB is not installed. Running MongoDB setup script..."
        chmod +x ./setup-mongodb.sh
        ./setup-mongodb.sh
    fi
    
    # Check if serve is installed (for frontend)
    if ! command -v serve &> /dev/null; then
        log "Installing serve..."
        npm install -g serve
    fi
    
    success "All prerequisites are met"
}

# Backup database
backup_database() {
    log "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Create MongoDB backup
    BACKUP_FILE="$BACKUP_DIR/mongodb_backup_$(date +%Y%m%d_%H%M%S).gz"
    
    if mongodump --uri="mongodb://roryk_app:roryk-app-password-2024@localhost:27017/roryk?authSource=roryk" --archive --gzip > "$BACKUP_FILE"; then
        success "Database backup created: $BACKUP_FILE"
    else
        warning "Database backup failed, but continuing deployment..."
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

# Start database
start_database() {
    log "Starting database..."
    
    # Start MongoDB with PM2
    pm2 start ecosystem.config.js --only roryk-mongodb
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    sleep 10
    
    # Check if database is accessible
    if mongo --eval "db.adminCommand('ismaster')" > /dev/null 2>&1; then
        success "Database is ready"
    else
        error "Database failed to start properly"
    fi
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
    start_database
    deploy_backend
    deploy_frontend
    health_check
    setup_ssl
    
    success "Deployment completed successfully!"
    log "Application is now running:"
    log "  Frontend: http://localhost:3000"
    log "  Backend: http://localhost:3001"
    log "  Database Admin: http://localhost:8081"
    
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
    
    # Restore database from latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/mongodb_backup_*.gz 2>/dev/null | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        log "Restoring database from: $LATEST_BACKUP"
        mongorestore --uri="mongodb://roryk_app:roryk-app-password-2024@localhost:27017/roryk?authSource=roryk" --archive --gzip < "$LATEST_BACKUP"
    fi
    
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