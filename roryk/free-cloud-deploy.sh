#!/bin/bash

# Free Cloud Deployment Script for RoryK
# Compatible with Oracle Cloud, Google Cloud, AWS Free Tier
# This script sets up RoryK on a fresh Ubuntu instance

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Please run this script as a regular user, not root"
fi

log "🚀 Starting RoryK deployment on free cloud instance"

# Update system
log "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
log "🔧 Installing required packages..."
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw htop

# Install Node.js
log "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
log "✅ Node.js $node_version and npm $npm_version installed"

# Install PM2
log "📦 Installing PM2..."
sudo npm install -g pm2

# Clone repository (if not already present)
if [ ! -d "roryk" ]; then
    log "📥 Cloning RoryK repository..."
    # Replace with actual repository URL
    git clone https://github.com/yourusername/roryk.git
    cd roryk
else
    log "📁 Using existing RoryK directory..."
    cd roryk
fi

# Make scripts executable
log "🔧 Making scripts executable..."
chmod +x *.sh

# Deploy application
log "🚀 Deploying RoryK application..."
./deploy.sh production deploy

# Configure firewall
log "🔒 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
# MongoDB Atlas is used - no local MongoDB port to block
sudo ufw --force enable

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || echo "Unable to detect")

# Configure Nginx
log "🌐 Configuring Nginx reverse proxy..."
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

sudo tee /etc/nginx/sites-available/default > /dev/null << EOF
server {
    listen 80;
    server_name roryk.ryanforanlennon.ie;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/api/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
EOF

# Test and reload Nginx
log "🔧 Testing Nginx configuration..."
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx

# Setup PM2 startup
log "🔧 Configuring PM2 startup..."
pm2 startup | grep -E '^sudo' | bash || true
pm2 save

# Create maintenance script
log "🔧 Creating maintenance scripts..."
cat > ~/roryk-status.sh << 'EOF'
#!/bin/bash
echo "=== RoryK Application Status ==="
echo "PM2 Processes:"
pm2 status
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l
echo ""
echo "Disk Usage:"
df -h
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "System Load:"
uptime
EOF

chmod +x ~/roryk-status.sh

# Create update script
cat > ~/roryk-update.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating RoryK application..."
cd ~/roryk
git pull origin main
npm install
cd backend && npm install && cd ..
npm run build
pm2 reload all
echo "✅ Update complete!"
EOF

chmod +x ~/roryk-update.sh

# Create backup script (MongoDB Atlas)
cat > ~/roryk-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "📦 Creating MongoDB Atlas backup..."
echo "⚠️  Note: MongoDB Atlas provides automated backups."
echo "⚠️  For manual backup, use: mongodump --uri=\"mongodb+srv://foranlennon:akptLxS8mkxSPCNN@roryk.ofpdpmr.mongodb.net/roryk\" --archive --gzip > \"$BACKUP_DIR/mongodb_atlas_$DATE.gz\""
echo "⚠️  Make sure mongodump is installed: sudo apt install mongodb-database-tools"

# Optional: Create application data backup if mongodump is available
if command -v mongodump &> /dev/null; then
    echo "📦 Creating manual backup with mongodump..."
    mongodump --uri="mongodb+srv://foranlennon:akptLxS8mkxSPCNN@roryk.ofpdpmr.mongodb.net/roryk" --archive --gzip > "$BACKUP_DIR/mongodb_atlas_$DATE.gz"
    
    # Keep only last 7 backups
    ls -t $BACKUP_DIR/mongodb_atlas_*.gz | tail -n +8 | xargs -r rm
    
    echo "✅ Backup created: mongodb_atlas_$DATE.gz"
    echo "📁 Backup location: $BACKUP_DIR"
else
    echo "⚠️  mongodump not found. Install with: sudo apt install mongodb-database-tools"
fi
EOF

chmod +x ~/roryk-backup.sh

# Setup automated backups
log "🔧 Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * $HOME/roryk-backup.sh") | crontab -

# Wait for services to start
log "⏳ Waiting for services to start..."
sleep 10

# Health check
log "🏥 Performing health check..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    success "Frontend is responding"
else
    warning "Frontend may not be ready yet"
fi

if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    success "Backend API is responding"
else
    warning "Backend API may not be ready yet"
fi

# Final status
log "📊 Final deployment status:"
pm2 status

success "🎉 RoryK deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "  🌐 Your website is accessible at: http://$PUBLIC_IP"
echo "  🔧 Application status: ~/roryk-status.sh"
echo "  🔄 Update application: ~/roryk-update.sh"
echo "  📦 Create backup: ~/roryk-backup.sh"
echo ""
echo "🔒 Security Setup:"
echo "  1. Configure your domain DNS to point to: $PUBLIC_IP"
echo "  2. Set up SSL certificate: sudo certbot --nginx -d yourdomain.com"
echo "  3. Update environment variables in: ~/roryk/backend/.env"
echo ""
echo "📚 Documentation:"
echo "  • Free Deployment Guide: ~/roryk/FREE_DEPLOYMENT_GUIDE.md"
echo "  • Linux Production Guide: ~/roryk/LINUX_PRODUCTION_GUIDE.md"
echo "  • Quick Start Guide: ~/roryk/LINUX_QUICK_START.md"
echo ""
echo "🆘 Troubleshooting:"
echo "  • Check logs: pm2 logs"
echo "  • Check status: pm2 status"
echo "  • Restart services: pm2 restart all"
echo "  • Check Nginx: sudo systemctl status nginx"

log "✅ Deployment script completed!"