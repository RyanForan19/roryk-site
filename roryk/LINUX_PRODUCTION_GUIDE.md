# Linux Production Deployment Guide for RoryK

This guide provides step-by-step instructions for deploying RoryK on Linux production servers using PM2.

## 🖥️ Server Requirements

### Minimum System Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: 2GB minimum, 4GB+ recommended
- **Storage**: 10GB free space minimum
- **CPU**: 1 vCPU minimum, 2+ recommended
- **Network**: Public IP address with domain name

### Required Software
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher
- **MongoDB**: Version 7.0+ (auto-installed)
- **PM2**: Latest version (auto-installed)
- **Nginx**: For reverse proxy (recommended)
- **Certbot**: For SSL certificates (recommended)

## 🚀 One-Command Deployment

### Automated Setup
```bash
# Clone repository
git clone <your-repo-url>
cd roryk

# Make scripts executable
chmod +x setup-mongodb.sh pm2-start.sh pm2-stop.sh deploy.sh

# Run automated deployment
./deploy.sh production deploy
```

This single command will:
1. Install all prerequisites (Node.js, PM2, MongoDB)
2. Set up MongoDB with proper authentication
3. Install application dependencies
4. Build the frontend
5. Start all services with PM2
6. Configure automatic startup on boot

## 📋 Manual Step-by-Step Deployment

### 1. Server Preparation

#### Update System
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

#### Install Node.js
```bash
# Using NodeSource repository (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Application Setup

#### Clone and Install Dependencies
```bash
# Clone repository
git clone <your-repo-url>
cd roryk

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### Make Scripts Executable
```bash
chmod +x setup-mongodb.sh
chmod +x pm2-start.sh
chmod +x pm2-stop.sh
chmod +x deploy.sh
```

### 3. MongoDB Installation and Setup

#### Automated MongoDB Setup
```bash
./setup-mongodb.sh
```

#### Manual MongoDB Installation (Ubuntu)
```bash
# Import MongoDB public GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Create list file
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Create directories
mkdir -p data/db data/configdb logs

# Create MongoDB configuration
cat > mongodb.conf << 'EOF'
storage:
  dbPath: ./data/db
  journal:
    enabled: true

net:
  port: 27017
  bindIp: 127.0.0.1

security:
  authorization: enabled

systemLog:
  destination: file
  logAppend: true
  path: ./logs/mongodb.log

processManagement:
  fork: false
  pidFilePath: ./data/mongod.pid
EOF

# Initialize database
mongod --config ./mongodb.conf --fork
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

# Create application user
mongo --eval "
db = db.getSiblingDB('roryk');
db.createUser({
  user: 'roryk_app',
  pwd: 'roryk-app-password-2024',
  roles: ['readWrite']
});
"

# Stop temporary instance
mongod --shutdown --dbpath ./data/db
```

### 4. PM2 Installation and Configuration

#### Install PM2
```bash
npm install -g pm2
```

#### Configure Environment
```bash
# Copy production environment
cp backend/.env.production backend/.env

# Edit environment variables
nano backend/.env
```

**Critical Environment Variables:**
```env
# Production settings
NODE_ENV=production
PORT=3001

# Database
MONGODB_URI=mongodb://roryk_app:roryk-app-password-2024@localhost:27017/roryk?authSource=roryk

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long

# Stripe (Use LIVE keys)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key

# Domain
FRONTEND_URL=https://yourdomain.com

# Email (Configure SMTP)
SMTP_HOST=smtp.youremailprovider.com
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-email-password
EMAIL_FROM=noreply@yourdomain.com
```

### 5. Build and Start Application

#### Build Frontend
```bash
npm run build
```

#### Start Services with PM2
```bash
# Start all services
./pm2-start.sh production

# Or manually
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
# Follow the instructions provided by PM2
```

### 6. Nginx Reverse Proxy Setup

#### Install Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/roryk
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
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

### 7. SSL Certificate Setup

#### Install Certbot
```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx -y
```

#### Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### Setup Auto-renewal
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 8. Firewall Configuration

#### Configure UFW (Ubuntu)
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

#### Configure firewalld (CentOS)
```bash
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 🔧 Production Management

### PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs

# Monitor processes
pm2 monit

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# Reload with zero downtime
pm2 reload all
```

### Service Management Scripts
```bash
# Start services
./pm2-start.sh production

# Stop services
./pm2-stop.sh

# Check status
pm2 status
```

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Check application health
curl https://yourdomain.com
curl https://yourdomain.com/api/health

# Check PM2 status
pm2 status

# Check MongoDB
mongo --eval "db.adminCommand('ismaster')"
```

### Log Management
```bash
# View application logs
pm2 logs

# View specific service logs
pm2 logs roryk-backend
pm2 logs roryk-frontend
pm2 logs roryk-mongodb

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Strategy
```bash
# Create backup script
nano backup-roryk.sh
```

**Backup Script:**
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

echo "Backup completed: $DATE"
```

#### Schedule Backups
```bash
chmod +x backup-roryk.sh
crontab -e
# Add: 0 2 * * * /path/to/backup-roryk.sh
```

## 🔒 Security Hardening

### Production Security Checklist
- [ ] Change default MongoDB passwords
- [ ] Generate strong JWT secrets (32+ characters)
- [ ] Use HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up fail2ban
- [ ] Enable MongoDB authentication
- [ ] Configure CORS for production domain only
- [ ] Set up rate limiting
- [ ] Regular security updates
- [ ] Monitor application logs
- [ ] Set up intrusion detection

### Fail2ban Setup
```bash
# Install fail2ban
sudo apt install fail2ban -y

# Configure for Nginx
sudo nano /etc/fail2ban/jail.local
```

**Fail2ban Configuration:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

## 🚨 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs

# Restart specific service
pm2 restart roryk-backend
```

#### Database Connection Issues
```bash
# Check MongoDB status
pm2 status roryk-mongodb
pm2 logs roryk-mongodb

# Test connection
mongo --eval "db.adminCommand('ismaster')"

# Restart MongoDB
pm2 restart roryk-mongodb
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
```

### Performance Optimization
```bash
# Enable PM2 cluster mode for backend
pm2 start ecosystem.config.js --env production -i max

# Monitor performance
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

# Restart services with zero downtime
pm2 reload all
```

### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js if needed
# (Use NodeSource repository method above)

# Update PM2
npm update -g pm2
```

This guide provides everything needed for a production Linux deployment of RoryK using PM2. Follow the steps carefully and ensure all security measures are implemented before going live.