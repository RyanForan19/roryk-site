# Self-Hosted MongoDB Setup for RoryK

This guide explains how to set up and run a self-hosted MongoDB database for the RoryK application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- Port 27017 (MongoDB) and 8081 (Mongo Express) available

## Quick Start

1. **Start the MongoDB database:**
   ```bash
   cd roryk
   docker-compose up -d
   ```

2. **Verify the database is running:**
   ```bash
   docker-compose ps
   ```

3. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

## Database Access

### MongoDB Connection Details
- **Host:** localhost:27017
- **Database:** roryk
- **App User:** roryk_app
- **App Password:** roryk-app-password-2024
- **Admin User:** admin
- **Admin Password:** roryk-admin-password-2024

### Web Interface (Mongo Express)
- **URL:** http://localhost:8081
- **Username:** admin
- **Password:** roryk-web-admin

## Database Structure

### Collections Created:
- **users** - User accounts with authentication and profile data
- **transactions** - All financial transactions and service usage

### Indexes Created:
- Users: username (unique), email (unique), role, status
- Transactions: userId+createdAt, stripePaymentIntentId, serviceType, type

## Management Commands

### Start Database
```bash
docker-compose up -d
```

### Stop Database
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs mongodb
```

### Backup Database
```bash
docker exec roryk-mongodb mongodump --db roryk --out /data/backup
docker cp roryk-mongodb:/data/backup ./backup
```

### Restore Database
```bash
docker cp ./backup roryk-mongodb:/data/backup
docker exec roryk-mongodb mongorestore --db roryk /data/backup/roryk
```

### Reset Database (Delete All Data)
```bash
docker-compose down -v
docker-compose up -d
```

## Production Deployment

For production deployment:

1. **Change all passwords** in docker-compose.yml and .env files
2. **Enable authentication** by updating MONGODB_URI in .env
3. **Set up SSL/TLS** for secure connections
4. **Configure firewall** to restrict database access
5. **Set up regular backups** using cron jobs
6. **Monitor database** performance and logs

## Security Notes

- Default passwords are included for development only
- Change all passwords before production deployment
- The database is configured with authentication enabled
- Mongo Express web interface should be disabled in production
- Consider using Docker secrets for password management

## Troubleshooting

### Database Connection Issues
1. Check if MongoDB container is running: `docker-compose ps`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify connection string in backend/.env
4. Ensure port 27017 is not blocked by firewall

### Permission Issues
1. Check if roryk_app user has proper permissions
2. Verify authentication source in connection string
3. Check MongoDB logs for authentication errors

### Data Persistence
- Database data is stored in Docker volumes
- Data persists between container restarts
- Use `docker-compose down -v` to delete all data

## Default Admin Account

After first startup, a default admin account is created:
- **Username:** admin
- **Password:** admin123
- **Role:** superadmin
- **Balance:** €100.00

**Important:** Change this password immediately in production!