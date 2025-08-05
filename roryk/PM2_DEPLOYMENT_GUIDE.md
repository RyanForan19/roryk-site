# RoryK PM2 Deployment Guide

This guide provides comprehensive instructions for deploying the RoryK vehicle checking application using PM2 instead of Docker.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+ / Windows 10+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 10GB free space
- **Network**: Public IP address and domain name (for production)

### Required Software
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher
- **MongoDB**: Version 7.0 or higher
- **PM2**: Latest version (installed globally)
- **Git**: Latest version

### Optional (Recommended for Production)
- **Nginx**: Reverse proxy and web server
- **Certbot**: For SSL certificate management
- **Fail2ban**: Intrusion prevention system

## 🚀 Quick Deployment

### Using the PM2 Setup Scripts

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd roryk
   ```

2. **Make scripts executable**:
   ```bash
   chmod +x setup-mongodb.sh
   chmod +x pm2-start.sh
   chmod +x pm2-stop.sh
   chmod +x deploy.sh
   ```

3. **Run the deployment**:
   ```bash
   # For production
   ./deploy.sh production deploy
   
   # For development
   ./deploy.sh development deploy
   ```

## 📝 Manual Deployment Steps

### 1. Server Setup

#### Update System Packages
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y

# macOS (using Homebrew)
brew update && brew upgrade
```

#### Install Node.js and npm
```bash
# Using NodeSource repository (Linux)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Verify installation
node --version
npm --version
```

#### Install PM2
```bash
npm install -g pm2
```

#### Install MongoDB
```bash
# Run the automated setup script
./setup-mongodb.sh

# Or install manually:
# Ubuntu/Debian
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# macOS
brew tap mongodb/brew
brew install mongodb-community@7.0
```

### 2. Application Setup

#### Clone and Configure
```bash
# Clone repository
git clone <your-repo-url>
cd roryk

# Install dependencies
npm install
cd backend && npm install && cd ..
```

#### Environment Configuration
```bash
# Copy and configure backend environment
cp backend/.env.production backend/.env

# Edit the production environment file
nano backend/.env
```

**Important Environment Variables to Update**:
```env
# Database (already configured for local MongoDB)
MONGODB_URI=mongodb://roryk_app:roryk-app-password-2024@localhost:27017/roryk?authSource=roryk

# JWT Secret (Generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Stripe (Use LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key

# Domain
FRONTEND_URL=https://yourdomain.com

# Email (Configure with your SMTP provider)
SMTP_HOST=smtp.youremailprovider.com
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-email-password
EMAIL_FROM=noreply@yourdomain.com
```

### 3. Database Setup

#### Initialize MongoDB
```bash
# Run the MongoDB setup script
./setup-mongodb.sh

# Or manually create directories and start MongoDB
mkdir -p data/db data/configdb logs
mongod --config mongodb.conf --fork

# Create users (if not done by setup script)
mongo --eval "
db = db.getSiblingDB('admin');
db.createUser({
  user: 'admin',
  pwd: 'roryk-admin-password-2024',
  roles: ['root']
});
"

mongo --eval "
db = db.getSiblingDB('roryk');
db.createUser({
  user: 'roryk_app',
  pwd: 'roryk-app-password-2024',
  roles: ['readWrite']
});
"
```

### 4. Application Deployment

#### Build Frontend
```bash
npm run build
```

#### Start Services with PM2
```bash
# Start all services for production
./pm2-start.sh production

# Or start individual services
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 5. Reverse Proxy Setup (Nginx)

#### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/roryk
```

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by Certbot)
    # ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/roryk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 PM2 Management

### Basic Commands
```bash
# Start all services
pm2 start ecosystem.config.js --env production

# Start specific service
pm2 start ecosystem.config.js --only roryk-backend

# Stop all services
pm2 stop all

# Restart all services
pm2 restart all

# Delete all services
pm2 delete all

# View status
pm2 status

# View logs
pm2 logs

# Monitor processes
pm2 monit

# Save current configuration
pm2 save

# Setup startup script
pm2 startup
```

### Using the Helper Scripts
```bash
# Start services
./pm2-start.sh production    # For production
./pm2-start.sh development   # For development

# Stop services
./pm2-stop.sh
```

## 📊 Monitoring and Logging

### PM2 Monitoring
```bash
# View application status
pm2 status

# View logs in real-time
pm2 logs

# View logs for specific service
pm2 logs roryk-backend

# Monitor system resources
pm2 monit
```

### Log Files
- **Backend**: `./logs/backend-*.log`
- **Frontend**: `./logs/frontend-*.log`
- **MongoDB**: `./logs/mongodb-*.log`

## 🔄 Backup and Recovery

### Automated Backups
```bash
# Create backup script
nano backup-roryk.sh
```

**Backup Script**:
```bash
#!/bin/bash
BACKUP_DIR="/backups/roryk"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
mongodump --uri="mongodb://roryk_app:roryk-app-password-2024@localhost:27017/roryk?authSource=roryk" --archive --gzip > "$BACKUP_DIR/mongodb_$DATE.gz"

# Application backup
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" /path/to/roryk --exclude=node_modules --exclude=build --exclude=data

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

#### Schedule Backups
```bash
chmod +x backup-roryk.sh
crontab -e
# Add: 0 2 * * * /path/to/backup-roryk.sh
```

### Recovery Process
```bash
# Stop services
pm2 stop all

# Restore database
mongorestore --uri="mongodb://roryk_app:roryk-app-password-2024@localhost:27017/roryk?authSource=roryk" --archive --gzip < backup_file.gz

# Restore application
tar -xzf app_backup.tar.gz -C /

# Restart services
pm2 start ecosystem.config.js --env production
```

## 🚨 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# Check MongoDB status
pm2 status roryk-mongodb
pm2 logs roryk-mongodb

# Test connection
mongo --eval "db.adminCommand('ismaster')"
```

#### Application Not Starting
```bash
# Check PM2 status
pm2 status
pm2 logs

# Check ports
netstat -tlnp | grep :3001
netstat -tlnp | grep :3000
```

#### Performance Issues
```bash
# Monitor resources
pm2 monit

# Check system resources
htop
df -h
free -h
```

## 🔄 Updates and Maintenance

### Application Updates
```bash
# Pull latest code
git pull origin main

# Update dependencies
npm install
cd backend && npm install && cd ..

# Rebuild frontend
npm run build

# Restart services
pm2 restart all
```

### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
npm update -g
```

## 📞 Support

### Getting Help
1. Check the troubleshooting section above
2. Review PM2 logs: `pm2 logs`
3. Check MongoDB logs: `pm2 logs roryk-mongodb`
4. Verify all environment variables are correctly configured
5. Ensure all services are running: `pm2 status`

### Maintenance Tasks
- **Daily**: Monitor application logs and performance (`pm2 monit`)
- **Weekly**: Review security logs and update packages
- **Monthly**: Test backup and recovery procedures
- **Quarterly**: Security audit and dependency updates

## 🎯 Advantages of PM2 over Docker

1. **Simpler Setup**: No need for Docker installation and configuration
2. **Better Resource Usage**: Direct process management without containerization overhead
3. **Easier Debugging**: Direct access to logs and processes
4. **Native Performance**: No virtualization layer
5. **Simpler Monitoring**: Built-in PM2 monitoring tools
6. **Automatic Restarts**: Built-in process management and auto-restart
7. **Cluster Mode**: Easy horizontal scaling with PM2 cluster mode
8. **Log Management**: Built-in log rotation and management

This PM2 deployment guide provides a comprehensive approach to deploying RoryK without Docker dependencies. Follow the steps carefully and ensure all security measures are implemented before going live.