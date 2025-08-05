#!/bin/bash

# MongoDB Setup Script for PM2 Deployment
# This script installs and configures MongoDB locally

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

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            OS="debian"
        elif [ -f /etc/redhat-release ]; then
            OS="redhat"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    log "Detected OS: $OS"
}

# Install MongoDB on Ubuntu/Debian
install_mongodb_debian() {
    log "Installing MongoDB on Debian/Ubuntu..."
    
    # Import MongoDB public GPG key
    curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
    
    # Create list file for MongoDB
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    
    # Update package database
    sudo apt-get update
    
    # Install MongoDB
    sudo apt-get install -y mongodb-org
    
    success "MongoDB installed successfully"

}

# Install MongoDB on CentOS/RHEL
install_mongodb_redhat() {
    log "Installing MongoDB on CentOS/RHEL..."
    
    # Create repository file
    sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo << EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/8/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF
    
    # Install MongoDB
    sudo yum install -y mongodb-org
    
    success "MongoDB installed successfully"
}

# Install MongoDB on macOS
install_mongodb_macos() {
    log "Installing MongoDB on macOS..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        error "Homebrew is not installed. Please install Homebrew first."
    fi
    
    # Install MongoDB
    brew tap mongodb/brew
    brew install mongodb-community@7.0
    
    success "MongoDB installed successfully"
}

# Setup MongoDB directories and configuration
setup_mongodb() {
    log "Setting up MongoDB directories and configuration..."
    
    # Create data directories
    mkdir -p ./data/db
    mkdir -p ./data/configdb
    mkdir -p ./logs
    
    # Create MongoDB configuration file
    cat > ./mongodb.conf << EOF
# MongoDB Configuration File for RoryK

# Storage
storage:
  dbPath: ./data/db
  journal:
    enabled: true

# Network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1

# Security
security:
  authorization: enabled

# Logging
systemLog:
  destination: file
  logAppend: true
  path: ./logs/mongodb.log

# Process management
processManagement:
  fork: false
  pidFilePath: ./data/mongod.pid
EOF
    
    success "MongoDB configuration created"
}

# Initialize MongoDB database
init_mongodb() {
    log "Initializing MongoDB database..."
    
    # Start MongoDB temporarily for initialization
    mongod --config ./mongodb.conf --fork
    
    # Wait for MongoDB to start
    sleep 5
    
    # Create admin user
    mongo --eval "
    db = db.getSiblingDB('admin');
    db.createUser({
      user: 'admin',
      pwd: 'roryk-admin-password-2024',
      roles: ['root']
    });
    "
    
    # Create application database and user
    mongo --eval "
    db = db.getSiblingDB('roryk');
    db.createUser({
      user: 'roryk_app',
      pwd: 'roryk-app-password-2024',
      roles: ['readWrite']
    });
    "
    
    # Stop temporary MongoDB instance
    mongod --shutdown --dbpath ./data/db
    
    success "MongoDB database initialized"
}

# Main installation function
main() {
    log "Starting MongoDB setup for PM2 deployment..."
    
    detect_os
    
    case $OS in
        "debian")
            install_mongodb_debian
            ;;
        "redhat")
            install_mongodb_redhat
            ;;
        "macos")
            install_mongodb_macos
            ;;
        "windows")
            warning "Windows detected. Please install MongoDB manually from https://www.mongodb.com/try/download/community"
            ;;
        *)
            error "Unsupported operating system: $OS"
            ;;
    esac
    
    setup_mongodb
    init_mongodb
    
    success "MongoDB setup completed successfully!"
    log "You can now start all services with: pm2 start ecosystem.config.js"
}

# Run main function
main "$@"