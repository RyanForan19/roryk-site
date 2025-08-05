# MongoDB Atlas Migration Guide

## Overview

This document outlines the migration from self-hosted MongoDB to MongoDB Atlas cloud service for the RoryK application.

## Migration Summary

**Date:** 2025-08-05  
**From:** Self-hosted MongoDB (Docker)  
**To:** MongoDB Atlas (Cloud)  
**Cluster:** roryk.ofpdpmr.mongodb.net  
**Database:** roryk  

## Changes Made

### 1. Environment Configuration Updates

#### Backend Environment Files Updated:
- `backend/.env` - Development environment
- `backend/.env.production` - Production environment  
- `backend/.env.linux-production` - Linux production environment

**Old Connection String:**
```
MONGODB_URI=mongodb://roryk_app:roryk-app-password-2024@localhost:27017/roryk?authSource=roryk
```

**New Connection String:**
```
MONGODB_URI=mongodb+srv://foranlennon:akptLxS8mkxSPCNN@roryk.ofpdpmr.mongodb.net/roryk?retryWrites=true&w=majority
```

### 2. Database Configuration Updates

#### File: `backend/config/database.js`
- Removed deprecated MongoDB driver options (`useNewUrlParser`, `useUnifiedTopology`)
- Simplified connection configuration for modern MongoDB driver

**Before:**
```javascript
const conn = await mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

**After:**
```javascript
const conn = await mongoose.connect(mongoURI);
```

### 3. Deployment Script Updates

#### File: `deploy.sh`
- Removed MongoDB installation checks
- Updated backup functions to work with Atlas
- Replaced local MongoDB startup with Atlas connection verification
- Updated rollback procedures for cloud database

#### File: `free-cloud-deploy.sh`
- Removed local MongoDB port blocking from firewall
- Updated backup scripts to use Atlas connection string
- Added instructions for installing `mongodb-database-tools` for manual backups

#### File: `ecosystem.config.js`
- Removed `roryk-mongodb` PM2 process configuration
- Application now only manages frontend and backend processes

### 4. Docker Configuration

#### File: `docker-compose.self-hosted-backup.yml`
- Created backup of original Docker Compose configuration
- Original `docker-compose.yml` can now be removed or updated to exclude MongoDB services

## Atlas Connection Details

**Connection Command for Manual Access:**
```bash
mongosh "mongodb+srv://roryk.ofpdpmr.mongodb.net/" --apiVersion 1 --username foranlennon --password akptLxS8mkxSPCNN
```

**Manual Backup Command:**
```bash
mongodump --uri="mongodb+srv://foranlennon:akptLxS8mkxSPCNN@roryk.ofpdpmr.mongodb.net/roryk" --archive --gzip > backup_$(date +%Y%m%d_%H%M%S).gz
```

**Manual Restore Command:**
```bash
mongorestore --uri="mongodb+srv://foranlennon:akptLxS8mkxSPCNN@roryk.ofpdpmr.mongodb.net/roryk" --archive --gzip < backup_file.gz
```

## Benefits of MongoDB Atlas

### 1. **Automated Management**
- Automatic updates and patches
- Built-in monitoring and alerting
- Automated backups with point-in-time recovery

### 2. **Scalability**
- Easy horizontal and vertical scaling
- Global clusters for multi-region deployment
- Auto-scaling capabilities

### 3. **Security**
- Built-in security features
- Network isolation
- Encryption at rest and in transit
- Role-based access control

### 4. **Reliability**
- 99.995% uptime SLA
- Multi-region replication
- Automatic failover

### 5. **Cost Efficiency**
- No infrastructure management overhead
- Pay-as-you-scale pricing
- Free tier available for development

## Testing Verification

The migration has been tested and verified:

✅ **Connection Test:** Backend successfully connects to Atlas  
✅ **Health Check:** API health endpoint responds correctly  
✅ **Database Operations:** CRUD operations working properly  
✅ **Default Admin Creation:** Admin user creation process functional  

## Backup Strategy

### Automated Backups (Atlas)
- MongoDB Atlas provides automated continuous backups
- Point-in-time recovery available
- Configurable retention periods
- No manual intervention required

### Manual Backups (Optional)
- Use `mongodump` with Atlas connection string
- Recommended for critical deployments
- Can be automated via cron jobs

## Rollback Plan

If rollback to self-hosted MongoDB is needed:

1. **Restore Docker Configuration:**
   ```bash
   cp docker-compose.self-hosted-backup.yml docker-compose.yml
   ```

2. **Update Environment Variables:**
   - Revert connection strings in all `.env` files
   - Use local MongoDB connection string

3. **Start Local MongoDB:**
   ```bash
   docker-compose up -d mongodb
   ```

4. **Restore Data:**
   ```bash
   mongorestore --uri="mongodb://roryk_app:roryk-app-password-2024@localhost:27017/roryk?authSource=roryk" --archive --gzip < latest_backup.gz
   ```

## Security Considerations

### Connection String Security
- Connection string contains credentials - keep secure
- Use environment variables, never hardcode
- Consider using MongoDB Atlas API keys for enhanced security
- Rotate credentials regularly

### Network Security
- Atlas provides network isolation by default
- Configure IP whitelisting as needed
- Use VPC peering for enhanced security in production

### Access Control
- Use principle of least privilege
- Create specific database users for different environments
- Enable audit logging for compliance requirements

## Monitoring and Maintenance

### Atlas Dashboard
- Monitor performance metrics
- Set up custom alerts
- Review slow query logs
- Track connection patterns

### Application Monitoring
- Monitor connection pool usage
- Track query performance
- Set up error alerting
- Monitor memory usage patterns

## Next Steps

1. **Remove Local MongoDB Dependencies:**
   - Clean up Docker volumes: `docker volume prune`
   - Remove MongoDB configuration files
   - Update documentation references

2. **Optimize Atlas Configuration:**
   - Configure appropriate cluster tier for production
   - Set up monitoring alerts
   - Configure backup retention policies
   - Set up network access rules

3. **Security Hardening:**
   - Rotate database credentials
   - Configure IP whitelisting
   - Enable audit logging
   - Set up VPC peering if needed

## Troubleshooting

### PM2 Process Issues
If you encounter errors like "Process 0 not found" or "roryk-mongodb" process errors:

1. **Clean up PM2 processes:**
   ```bash
   chmod +x cleanup-pm2.sh
   ./cleanup-pm2.sh
   ```

2. **Or manually clean up:**
   ```bash
   pm2 stop all
   pm2 delete all
   pm2 kill
   pm2 flush
   ```

3. **Restart the application:**
   ```bash
   ./pm2-start.sh production
   ```

### Connection Issues
If you see connection timeout errors:
- Verify internet connectivity
- Check MongoDB Atlas cluster status
- Ensure IP whitelist is configured (if enabled)
- Verify connection string credentials

### Deployment Script Issues
If deployment fails with database errors:
- Ensure you're using the updated deployment scripts
- Check that no old MongoDB processes are cached in PM2
- Run the cleanup script before deploying

## Support and Resources

- **MongoDB Atlas Documentation:** https://docs.atlas.mongodb.com/
- **MongoDB University:** https://university.mongodb.com/
- **Atlas Support:** Available through MongoDB Atlas console
- **Community Forums:** https://community.mongodb.com/

---

**Migration completed successfully on 2025-08-05**
**Status:** ✅ Production Ready