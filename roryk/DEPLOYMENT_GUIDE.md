# RoryK Deployment Guide

This guide provides comprehensive instructions for deploying the RoryK vehicle checking application to production.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Storage**: Minimum 10GB free space
- **Network**: Public IP address and domain name

### Required Software
- **Node.js**: Version 16.x or higher
- **npm**: Version 8.x or higher
- **Docker**: Version 20.x or higher
- **Docker Compose**: Version 2.x or higher
- **Git**: Latest version

### Optional (Recommended for Production)
- **PM2**: Process manager for Node.js applications
- **Nginx**: Reverse proxy and web server
- **Certbot**: For SSL certificate management
- **Fail2ban**: Intrusion prevention system

## 🚀 Quick Deployment

### Using the Deployment Script

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd roryk
   ```

2. **Make the deployment script executable**:
   ```bash
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
```

#### Install Node.js
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install Docker
```bash
# Ubuntu
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
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
# Database
MONGODB_URI=mongodb://roryk_app:your-secure-password@localhost:27017/roryk?authSource=roryk

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

#### Start MongoDB
```bash
# Start database containers
docker-compose up -d

# Verify database is running
docker-compose ps
docker-compose logs mongodb
```

#### Initialize Database
```bash
# The database will be automatically initialized on first run
# Check the logs to ensure initialization completed successfully
docker-compose logs mongodb | grep "Database initialized"
```

### 4. Application Deployment

#### Build Frontend
```bash
npm run build
```

#### Install PM2 (Production Process Manager)
```bash
npm install -g pm2
```

#### Start Backend with PM2
```bash
cd backend
pm2 start server.js --name roryk-backend --env production
pm2 save
pm2 startup
cd ..
```

#### Serve Frontend
```bash
# Install serve globally
npm install -g serve

# Start frontend server
pm2 start "serve -s build -l 3000" --name roryk-frontend
pm2 save
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

    # Database Admin (Optional - Remove in production)
    location /db-admin {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Basic authentication for security
        auth_basic "Database Admin";
        auth_basic_user_file /etc/nginx/.htpasswd;
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

### 6. SSL Certificate Setup

#### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### Auto-renewal Setup
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Firewall Configuration

#### Configure UFW (Ubuntu)
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 8081  # MongoDB Admin (optional)
sudo ufw --force enable
```

### 8. Monitoring and Logging

#### PM2 Monitoring
```bash
# View application status
pm2 status

# View logs
pm2 logs

# Monitor in real-time
pm2 monit
```

#### System Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
pm2 logs roryk-backend
pm2 logs roryk-frontend
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=production

# Database
MONGODB_URI=mongodb://roryk_app:secure-password@localhost:27017/roryk?authSource=roryk

# Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters-long

# Stripe
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key

# Email
SMTP_HOST=smtp.youremailprovider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# CORS
FRONTEND_URL=https://yourdomain.com
```

#### Frontend (.env)
```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

### Database Configuration

#### MongoDB Security
```bash
# Connect to MongoDB
docker-compose exec mongodb mongo

# Create additional users if needed
use roryk
db.createUser({
  user: "backup_user",
  pwd: "secure-backup-password",
  roles: ["read"]
})
```

## 🔒 Security Checklist

### Pre-deployment Security
- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Use HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up fail2ban
- [ ] Enable MongoDB authentication
- [ ] Configure CORS properly
- [ ] Set secure session cookies

### Post-deployment Security
- [ ] Regular security updates
- [ ] Monitor application logs
- [ ] Set up intrusion detection
- [ ] Regular database backups
- [ ] Monitor SSL certificate expiry
- [ ] Review user access regularly

## 📊 Monitoring

### Health Checks
```bash
# Backend health
curl https://yourdomain.com/api/health

# Frontend health
curl https://yourdomain.com

# Database health
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"
```

### Performance Monitoring
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
df -h
free -h
```

## 🔄 Backup and Recovery

### Automated Backups
```bash
# Create backup script
nano /home/user/backup-roryk.sh
```

**Backup Script**:
```bash
#!/bin/bash
BACKUP_DIR="/backups/roryk"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
docker-compose exec -T mongodb mongodump --uri="mongodb://roryk_app:password@localhost:27017/roryk?authSource=roryk" --archive --gzip > "$BACKUP_DIR/mongodb_$DATE.gz"

# Application backup
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" /path/to/roryk --exclude=node_modules --exclude=build

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

#### Schedule Backups
```bash
chmod +x /home/user/backup-roryk.sh
crontab -e
# Add: 0 2 * * * /home/user/backup-roryk.sh
```

### Recovery Process
```bash
# Stop services
pm2 stop all
docker-compose down

# Restore database
docker-compose up -d mongodb
docker-compose exec -T mongodb mongorestore --uri="mongodb://roryk_app:password@localhost:27017/roryk?authSource=roryk" --archive --gzip < backup_file.gz

# Restore application
tar -xzf app_backup.tar.gz -C /

# Restart services
docker-compose up -d
pm2 start all
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check MongoDB status
docker-compose ps
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongo --eval "db.adminCommand('ismaster')"
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

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
```

### Log Locations
- **Application Logs**: `pm2 logs`
- **Nginx Logs**: `/var/log/nginx/`
- **Database Logs**: `docker-compose logs mongodb`
- **System Logs**: `/var/log/syslog`

## 📞 Support

### Getting Help
1. Check the troubleshooting section above
2. Review application logs for error messages
3. Ensure all environment variables are correctly configured
4. Verify all services are running properly

### Maintenance Tasks
- **Daily**: Monitor application logs and performance
- **Weekly**: Review security logs and update packages
- **Monthly**: Test backup and recovery procedures
- **Quarterly**: Security audit and dependency updates

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

# Update Docker images
docker-compose pull
docker-compose up -d
```

This deployment guide provides a comprehensive approach to deploying RoryK in production. Follow the steps carefully and ensure all security measures are implemented before going live.