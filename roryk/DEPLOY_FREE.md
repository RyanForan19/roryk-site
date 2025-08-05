# 🆓 Deploy RoryK for FREE in 1 Command

## Oracle Cloud Always Free (Recommended)

### 📚 Complete Setup Guide
**For detailed step-by-step instructions, see: [ORACLE_CLOUD_SETUP.md](./ORACLE_CLOUD_SETUP.md)**

### Quick Steps:
1. **Create Account**: https://cloud.oracle.com/ (truly free forever)
2. **Launch VM**: ARM instance (4 CPU, 24GB RAM - Always Free)
3. **Deploy**: One command deployment
4. **Go Live**: Your website is ready!

### One-Command Deployment:
```bash
curl -fsSL https://raw.githubusercontent.com/yourusername/roryk/main/free-cloud-deploy.sh | bash
```

**Why Oracle Cloud?**
- ✅ **Forever free** (no time limits)
- ✅ **4 CPU cores, 24GB RAM** (most generous free tier)
- ✅ **200GB storage** included
- ✅ **Enterprise-grade infrastructure**

## Other Free Options

### Render.com (Easiest)
1. Fork this repository on GitHub
2. Connect GitHub to Render.com
3. Deploy using the included `render.yaml`

### Google Cloud Free Tier
```bash
# Create e2-micro instance, then:
curl -fsSL https://raw.githubusercontent.com/yourusername/roryk/main/free-cloud-deploy.sh | bash
```

### AWS Free Tier
```bash
# Create t2.micro instance, then:
curl -fsSL https://raw.githubusercontent.com/yourusername/roryk/main/free-cloud-deploy.sh | bash
```

## What You Get FREE

- ✅ Full RoryK application
- ✅ MongoDB database
- ✅ PM2 process management
- ✅ Nginx reverse proxy
- ✅ Automatic SSL setup ready
- ✅ Automated backups
- ✅ Health monitoring
- ✅ Zero ongoing costs

## After Deployment

1. **Get SSL Certificate** (free):
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Configure Stripe** (for payments):
   - Edit `~/roryk/backend/.env`
   - Add your Stripe keys

3. **Set up Domain** (optional):
   - Point your domain to the server IP
   - Or use the free subdomain provided

## Total Cost: $0/month forever! 🎉

See [FREE_DEPLOYMENT_GUIDE.md](./FREE_DEPLOYMENT_GUIDE.md) for detailed instructions.