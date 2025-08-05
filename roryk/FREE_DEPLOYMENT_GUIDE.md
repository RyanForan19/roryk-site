# Free & Secure Website Deployment Guide for RoryK

This guide covers multiple free deployment options for hosting RoryK as a public website with proper security.

## 🆓 Free Deployment Options

### 1. **Oracle Cloud Always Free Tier** (Recommended)
- **What you get**: 2 AMD VMs (1/8 OCPU, 1GB RAM each) + ARM VM (4 OCPUs, 24GB RAM)
- **Storage**: 200GB block storage
- **Bandwidth**: 10TB/month
- **Duration**: Forever free (no time limit)
- **Perfect for**: Full-stack applications with database

### 2. **Google Cloud Platform (GCP) Free Tier**
- **What you get**: e2-micro instance (1 vCPU, 1GB RAM)
- **Storage**: 30GB HDD
- **Duration**: Forever free + $300 credit for 90 days
- **Perfect for**: Small to medium applications

### 3. **AWS Free Tier**
- **What you get**: t2.micro instance (1 vCPU, 1GB RAM)
- **Duration**: 12 months free
- **Perfect for**: Testing and small applications

### 4. **Render.com** (Easiest)
- **What you get**: 750 hours/month free web service
- **Database**: Free PostgreSQL (90 days, then sleeps)
- **Perfect for**: Quick deployment without server management

## 🏆 Recommended: Oracle Cloud Always Free

### Why Oracle Cloud?
- **Truly free forever** (no credit card required after signup)
- **Generous resources** (ARM instance has 4 CPUs, 24GB RAM)
- **No time limits** (unlike AWS 12-month limit)
- **Full root access** to Ubuntu/CentOS VMs
- **Built-in security** with VCN and security lists

### Oracle Cloud Deployment Steps

**📚 For complete step-by-step Oracle Cloud setup, see: [ORACLE_CLOUD_SETUP.md](./ORACLE_CLOUD_SETUP.md)**

#### Quick Overview:
1. **Create Account**: Visit https://cloud.oracle.com/ (no credit card for Always Free)
2. **Create VCN**: Set up Virtual Cloud Network with security rules
3. **Launch Instance**: ARM shape with 4 CPUs, 24GB RAM (Always Free)
4. **Deploy RoryK**: One command deployment
5. **Configure SSL**: Free Let's Encrypt certificate

#### One-Command Deployment:
```bash
# After creating and connecting to your Oracle Cloud instance:
curl -fsSL https://raw.githubusercontent.com/yourusername/roryk/main/free-cloud-deploy.sh | bash
```

**⭐ Oracle Cloud is the BEST free option** - see the complete guide for detailed instructions.

## 🚀 Quick Deploy Scripts for Free Hosting

### Oracle Cloud / GCP / AWS Deployment Script
```bash
#!/bin/bash
# free-cloud-deploy.sh

echo "🚀 Deploying RoryK to Free Cloud Instance"

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Clone repository
git clone <your-repo-url>
cd roryk

# Make scripts executable
chmod +x *.sh

# Deploy application
./deploy.sh production deploy

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Configure Nginx
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80;
    server_name roryk.ryanforanlennon.ie;

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
}
EOF

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo "🌐 Your app is now accessible at: http://$(curl -s ifconfig.me)"
echo "🔒 To add SSL, run: sudo certbot --nginx -d yourdomain.com"
```

### Render.com Deployment (Easiest Option)

#### 1. Prepare for Render
```bash
# Create render.yaml in project root
cat > render.yaml << 'EOF'
services:
  - type: web
    name: roryk-frontend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npx serve -s build -l $PORT
    envVars:
      - key: NODE_ENV
        value: production
      - key: REACT_APP_API_URL
        value: https://roryk-backend.onrender.com/api

  - type: web
    name: roryk-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        fromDatabase:
          name: roryk-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://roryk-frontend.onrender.com

databases:
  - name: roryk-db
    databaseName: roryk
    user: roryk_app
EOF
```

#### 2. Deploy to Render
```bash
# 1. Push code to GitHub
# 2. Connect GitHub to Render.com
# 3. Deploy using render.yaml
# 4. Render will automatically build and deploy
```

## 🔒 Security Best Practices for Free Hosting

### 1. Environment Security
```bash
# Generate secure secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 24  # For SESSION_SECRET

# Use environment variables (never commit secrets)
export JWT_SECRET="your-generated-secret"
export STRIPE_SECRET_KEY="your-stripe-key"
```

### 2. Database Security
```bash
# Change default MongoDB passwords
mongo --eval "
db = db.getSiblingDB('admin');
db.changeUserPassword('admin', 'new-secure-password-here');
"

# Enable MongoDB authentication
# Edit mongodb.conf to ensure auth is enabled
```

### 3. Firewall Configuration
```bash
# Oracle Cloud: Configure Security Lists in console
# GCP: Configure firewall rules in console
# AWS: Configure Security Groups in console

# On server level:
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw deny 27017  # Block direct MongoDB access
sudo ufw --force enable
```

### 4. SSL/HTTPS Setup
```bash
# Free SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 💰 Cost Comparison

| Provider | Cost | Duration | Resources | Best For |
|----------|------|----------|-----------|----------|
| **Oracle Cloud** | **FREE** | **Forever** | **4 CPU, 24GB RAM** | **Production** |
| Google Cloud | FREE | Forever | 1 CPU, 1GB RAM | Small apps |
| AWS | FREE | 12 months | 1 CPU, 1GB RAM | Testing |
| Render.com | FREE | Forever | 512MB RAM | Simple apps |
| Railway | FREE | $5/month after | 1GB RAM | Development |

## 🎯 Recommended Free Deployment Strategy

### For Production (Recommended)
```bash
# 1. Oracle Cloud Always Free
# 2. Free domain from Freenom or use subdomain
# 3. Free SSL from Let's Encrypt
# 4. Free monitoring with UptimeRobot
# Total cost: $0/month forever
```

### For Testing/Development
```bash
# 1. Render.com (easiest setup)
# 2. Use provided .onrender.com subdomain
# 3. Automatic SSL included
# Total cost: $0/month (with limitations)
```

## 📋 Free Domain Options

### 1. Free Subdomains
- **Render.com**: `yourapp.onrender.com`
- **Railway**: `yourapp.up.railway.app`
- **Vercel**: `yourapp.vercel.app`

### 2. Free Domains
- **Freenom**: `.tk`, `.ml`, `.ga`, `.cf` domains
- **InfinityFree**: Free subdomain with hosting

### 3. Cheap Domains ($1-2/year)
- **Namecheap**: `.xyz`, `.top` domains
- **Porkbun**: Various TLDs on sale

## 🔧 Free Monitoring & Maintenance

### 1. Uptime Monitoring
```bash
# UptimeRobot (free)
# - Monitor up to 50 websites
# - 5-minute intervals
# - Email/SMS alerts
```

### 2. Log Management
```bash
# PM2 built-in logging
pm2 logs
pm2 monit

# System logs
journalctl -u nginx
tail -f /var/log/mongodb/mongod.log
```

### 3. Automated Backups
```bash
# Create backup script for free storage
#!/bin/bash
# backup-to-github.sh
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --archive=backup_$DATE.gz --gzip
git add backup_$DATE.gz
git commit -m "Backup $DATE"
git push origin backups
```

## ✅ Complete Free Deployment Checklist

- [ ] Choose hosting provider (Oracle Cloud recommended)
- [ ] Create account and VM instance
- [ ] Configure security groups/firewall
- [ ] Deploy RoryK using deployment scripts
- [ ] Configure domain (free or paid)
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure monitoring (UptimeRobot)
- [ ] Set up automated backups
- [ ] Test all functionality
- [ ] Configure Stripe webhooks for production

**Total Cost: $0-12/year** (only if you buy a custom domain)

This setup provides a professional, secure, and completely free way to host RoryK as a public website!