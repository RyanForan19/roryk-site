# RoryK Vehicle Checking Application

A comprehensive vehicle checking application with Stripe payment integration, self-hosted MongoDB database, and complete password management system. Ready for production deployment.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v7.0 or higher)
- PM2 (Process Manager)
- Git

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd roryk
npm install
cd backend
npm install
cd ..
```

### 2. Environment Setup
```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Edit .env files with your Stripe keys and other settings
```

### 3. Install PM2 and MongoDB
```bash
# Install PM2 globally
npm install -g pm2

# Install MongoDB (automated setup)
# Linux/Mac
chmod +x setup-mongodb.sh
./setup-mongodb.sh

# Windows - Install MongoDB manually from:
# https://www.mongodb.com/try/download/community
```

### 4. Start Application
```bash
# Windows
pm2-start.bat production

# Linux/Mac
chmod +x pm2-start.sh
./pm2-start.sh production

# Or manually with PM2
pm2 start ecosystem.config.js --env production
```

## 🚀 Production Deployment

For production deployment, see:
- **Free Hosting**: [Free Deployment Guide](./FREE_DEPLOYMENT_GUIDE.md) 🆓
- **Linux Production**: [Quick Start Guide](./LINUX_QUICK_START.md) | [Complete Guide](./LINUX_PRODUCTION_GUIDE.md)
- **General PM2**: [PM2 Deployment Guide](./PM2_DEPLOYMENT_GUIDE.md)

### Quick Production Setup

#### Linux Production (Recommended)
```bash
# Make scripts executable
chmod +x setup-mongodb.sh pm2-start.sh pm2-stop.sh deploy.sh

# Automated production deployment
./deploy.sh production deploy

# Or manual step-by-step
./setup-mongodb.sh          # Install and configure MongoDB
npm install -g pm2          # Install PM2 globally
npm install && cd backend && npm install && cd ..  # Install dependencies
npm run build               # Build frontend
./pm2-start.sh production   # Start all services
```

#### Windows Development
```batch
pm2-start.bat production
```

### Free Website Deployment 🆓
```bash
# Deploy to Oracle Cloud Always Free (recommended)
# 1. Create free Oracle Cloud account
# 2. Launch Ubuntu VM instance
# 3. Run one command:
curl -fsSL https://raw.githubusercontent.com/yourusername/roryk/main/free-cloud-deploy.sh | bash
```

**Free hosting options:**
- **Oracle Cloud**: Forever free (4 CPU, 24GB RAM)
- **Google Cloud**: Forever free (1 CPU, 1GB RAM)
- **Render.com**: 750 hours/month free
- **Railway**: Free tier available

See [Free Deployment Guide](./FREE_DEPLOYMENT_GUIDE.md) for complete instructions.

### Linux Production Requirements
- **Ubuntu 20.04+** or **CentOS 8+**
- **Node.js 16+** and **npm 8+**
- **MongoDB 7.0+** (auto-installed by setup script)
- **PM2** (auto-installed by deployment script)
- **Nginx** (for reverse proxy - optional but recommended)
- **SSL Certificate** (Let's Encrypt recommended)

## 🔧 Configuration

### Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Update `.env` and `backend/.env` with your keys:
   ```
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

### Database Configuration
The application uses a locally installed MongoDB instance managed by PM2. The setup script will automatically install and configure MongoDB with proper authentication.

## 📁 Project Structure

```
roryk/
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── Auth/                 # Authentication components
│   │   ├── Dashboard/            # User dashboard components
│   │   ├── Payment/              # Stripe payment components
│   │   └── Services/             # Vehicle checking services
│   ├── services/                 # API service layers
│   └── utils/                    # Utility functions
├── backend/                      # Node.js/Express backend
│   ├── models/                   # MongoDB/Mongoose models
│   ├── routes/                   # API route handlers
│   ├── middleware/               # Express middleware
│   └── utils/                    # Backend utilities
├── mongo-init/                   # Database initialization scripts
├── ecosystem.config.js           # PM2 configuration
├── setup-mongodb.sh              # MongoDB setup script
├── pm2-start.sh/.bat             # PM2 startup scripts
└── pm2-stop.sh/.bat              # PM2 stop scripts
```

## 🔐 Authentication & Authorization

The application supports three user roles:
- **User**: Standard users who can purchase services
- **Admin**: Can manage users and view all transactions
- **Superadmin**: Full system access

### Password Management Features
- **Change Password**: Users can change their password from their profile
- **Forgot Password**: Email-based password reset with secure tokens
- **Password Strength**: Real-time password strength validation
- **Email Notifications**: Confirmation emails for password changes

### Default Admin Account
After database initialization, a default admin account is created:
- **Email**: admin@roryk.com
- **Password**: admin123
- **Role**: superadmin

⚠️ **Important**: Change the default admin password immediately in production!

## 💳 Payment System

### Stripe Integration
- Secure payment processing with Stripe Elements
- Payment Intent creation with automatic confirmation
- Transaction history and receipt generation
- Retry logic for failed payments

### Supported Services
- Irish History Check (€5.00)
- Vehicle Valuation (€10.00)
- Full Vehicle Report (€15.00)

## 🗄️ Database

### Local MongoDB Installation
- Native MongoDB installation managed by PM2
- Automatic database initialization with proper indexing
- User authentication and role-based access control
- Configuration file-based setup

### Database Access
- **MongoDB**: `mongodb://localhost:27017/roryk`
- **Connection String**: `mongodb://roryk_app:roryk-app-password-2024@localhost:27017/roryk?authSource=roryk`
- **Admin Access**: `mongodb://admin:roryk-admin-password-2024@localhost:27017/roryk?authSource=admin`

### Email Configuration
The application includes a complete email service for password resets:
- **SMTP Support**: Compatible with Gmail, Outlook, SendGrid, Mailgun, etc.
- **Email Templates**: Professional HTML email templates
- **Security**: Secure token-based password reset system
- **Development Mode**: Console logging when SMTP is not configured

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Password Management
- `POST /api/password/forgot` - Request password reset
- `POST /api/password/reset` - Reset password with token
- `POST /api/password/change` - Change password (authenticated)
- `GET /api/password/validate-token/:token` - Validate reset token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/add-balance` - Add balance to account

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction

### Admin (Admin/Superadmin only)
- `GET /api/users` - List all users
- `PUT /api/users/:id/approve` - Approve user account
- `PUT /api/users/:id/reject` - Reject user account
- `GET /api/transactions/all` - View all transactions
- `DELETE /api/password/cleanup` - Cleanup expired reset tokens

## 🚀 Deployment

### Development
```bash
# Windows
pm2-start.bat development

# Linux/Mac
./pm2-start.sh development
```

### Free Website Deployment 🆓
```bash
# One-command deployment to free cloud hosting
curl -fsSL https://raw.githubusercontent.com/yourusername/roryk/main/free-cloud-deploy.sh | bash
```

### Production
For detailed production deployment instructions, see:
- **Free Hosting**: [Free Deployment Guide](./FREE_DEPLOYMENT_GUIDE.md) 🆓
- **Linux**: [Linux Production Guide](./LINUX_PRODUCTION_GUIDE.md)
- **General**: [PM2 Deployment Guide](./PM2_DEPLOYMENT_GUIDE.md)

**Quick Production Deployment:**
```bash
# Automated deployment
./deploy.sh production deploy

# Manual deployment steps
1. Configure production environment variables
2. Set up SSL certificates
3. Configure reverse proxy (Nginx)
4. Set up monitoring and backups
5. Configure email service (SMTP)
6. Set up automated database backups
```

**Production Features:**
- Automated deployment script with PM2
- SSL/HTTPS configuration
- Native process management with PM2
- Database backups and recovery
- Email service integration
- Security hardening
- Performance optimization
- No Docker dependencies

## 🔍 Troubleshooting

### Common Issues

#### Payment Form Overlay Problems
- **Issue**: Stripe elements not visible or overlapping
- **Solution**: The payment form container uses dynamic height calculation with proper overflow settings

#### Cross-Device Synchronization
- **Issue**: Different balances/data on different devices
- **Solution**: Replaced localStorage with centralized MongoDB database

#### Password Reset Email Issues
- **Issue**: Password reset emails not being sent
- **Solutions**:
  1. Configure SMTP settings in backend/.env
  2. Check email service logs: `pm2 logs roryk-backend`
  3. Verify SMTP credentials and server settings
  4. Check spam/junk folders

#### Database Connection Issues
- **Issue**: Cannot connect to MongoDB
- **Solutions**:
  1. Check MongoDB status: `pm2 status roryk-mongodb`
  2. View MongoDB logs: `pm2 logs roryk-mongodb`
  3. Restart MongoDB: `pm2 restart roryk-mongodb`
  4. Check MongoDB configuration: `./mongodb.conf`

#### Payment Processing Failures
- **Issue**: Payments failing or timing out
- **Solutions**:
  1. Check Stripe API keys in environment files
  2. Verify webhook endpoints (if using webhooks)
  3. Check network connectivity
  4. Review backend logs for detailed error messages

#### Production Deployment Issues
- **Issue**: Application not accessible after deployment
- **Solutions**:
  1. Check firewall settings and open required ports
  2. Verify SSL certificate configuration
  3. Check Nginx/reverse proxy configuration
  4. Review PM2 process status: `pm2 status`

### Logs and Debugging
- **Frontend**: Browser Developer Tools Console
- **Backend**: `pm2 logs roryk-backend`
- **Database**: `pm2 logs roryk-mongodb`
- **All Services**: `pm2 logs`

## 📊 Monitoring

### Health Checks
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/health (if implemented)
- Database: `mongo --eval "db.adminCommand('ismaster')"`
- PM2 Status: `pm2 status`

### Performance Monitoring
- Monitor all processes: `pm2 monit`
- Use browser DevTools for frontend performance
- Check MongoDB performance with native tools
- Implement logging for payment processing times

## 🔒 Security

### Best Practices Implemented
- Password hashing with bcrypt (12 rounds)
- JWT token authentication with secure secrets
- Environment variable configuration
- Input validation and sanitization
- Role-based access control
- Secure database connections
- Rate limiting for password reset attempts
- Secure password reset tokens with expiration
- Email confirmation for password changes
- HTTPS/SSL enforcement in production

### Production Security Checklist
- [ ] Change default admin password
- [ ] Generate strong JWT secrets (minimum 32 characters)
- [ ] Configure SMTP with secure credentials
- [ ] Enable HTTPS/SSL with valid certificates
- [ ] Configure CORS for production domain only
- [ ] Set up rate limiting for all endpoints
- [ ] Configure firewall rules (UFW/iptables)
- [ ] Set up fail2ban for intrusion prevention
- [ ] Regular security updates and patches
- [ ] Automated database backup strategy
- [ ] Monitor application and security logs
- [ ] Set up SSL certificate auto-renewal
- [ ] Configure secure session cookies
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and alerting

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
1. Check the troubleshooting section above
2. **Linux Production**: See [Linux Production Guide](./LINUX_PRODUCTION_GUIDE.md)
3. **Quick Start**: See [Linux Quick Start](./LINUX_QUICK_START.md)
4. Check application logs: `pm2 logs`
5. Ensure all environment variables are properly configured

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
- Update dependencies: `npm audit fix`
- Database backups: `mongodump --uri="mongodb://roryk_app:roryk-app-password-2024@localhost:27017/roryk?authSource=roryk"`
- Monitor disk space for MongoDB data directory
- Review and rotate JWT secrets periodically
- Update Stripe webhook endpoints if needed
- Clean up expired password reset tokens
- Monitor email service delivery rates
- Review security logs and access patterns
- Monitor PM2 processes: `pm2 status`

### Automated Maintenance
- Database backups (daily at 2 AM via cron)
- SSL certificate renewal (automatic with certbot)
- Security updates (weekly)
- PM2 log rotation and cleanup
- Performance monitoring with PM2 monit

### Version History
- **v1.0.0**: Initial release with localStorage
- **v2.0.0**: MongoDB integration and improved payment system
- **v2.1.0**: Self-hosted database solution with Docker
- **v2.2.0**: Complete password management system and production deployment
- **v3.0.0**: PM2 process management replacing Docker dependencies
