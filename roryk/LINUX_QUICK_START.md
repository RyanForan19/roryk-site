# Linux Production Quick Start Guide

## 🚀 One-Command Deployment

```bash
# Clone and deploy in one go
git clone <your-repo-url> && cd roryk && chmod +x *.sh && ./deploy.sh production deploy
```

## 📋 Step-by-Step (5 minutes)

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd roryk
```

### 2. Make Scripts Executable
```bash
chmod +x setup-mongodb.sh pm2-start.sh pm2-stop.sh deploy.sh
```

### 3. Deploy
```bash
./deploy.sh production deploy
```

### 4. Configure Domain (Optional)
```bash
# Install Nginx
sudo apt install nginx -y

# Configure SSL
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## 🔧 Management Commands

```bash
# Start services
./pm2-start.sh production

# Stop services  
./pm2-stop.sh

# Check status
pm2 status

# View logs
pm2 logs

# Monitor
pm2 monit
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📚 Full Documentation

- [Complete Linux Production Guide](./LINUX_PRODUCTION_GUIDE.md)
- [PM2 Deployment Guide](./PM2_DEPLOYMENT_GUIDE.md)
- [Main README](./README.md)

## ⚠️ Important Notes

1. **Change default passwords** in `backend/.env`
2. **Configure SMTP** for email functionality
3. **Set up SSL** for production domains
4. **Configure firewall** rules
5. **Set up backups** for production data

## 🆘 Quick Troubleshooting

```bash
# Service not starting?
pm2 logs

# Database issues?
pm2 logs roryk-mongodb

# Permission issues?
sudo chown -R $USER:$USER /path/to/roryk

# Port conflicts?
sudo netstat -tlnp | grep :3001
```

For detailed troubleshooting, see the [Linux Production Guide](./LINUX_PRODUCTION_GUIDE.md).