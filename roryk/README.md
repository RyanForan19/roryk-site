# RoryK Vehicle Checking Application

A comprehensive vehicle checking application with Stripe payment integration, self-hosted MongoDB database, and complete password management system. Ready for production deployment.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Docker Desktop
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

### 3. Start Database
```bash
# Windows
start-database.bat

# Linux/Mac
docker-compose up -d
```

### 4. Start Application
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npm start
```

## 🚀 Production Deployment

For production deployment, see the comprehensive [Deployment Guide](./DEPLOYMENT_GUIDE.md).

### Quick Production Setup
```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh production deploy
```

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
The application uses a self-hosted MongoDB instance via Docker. See [`DATABASE_SETUP.md`](./DATABASE_SETUP.md) for detailed setup instructions.

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
└── docker-compose.yml            # Docker configuration
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

### Self-Hosted MongoDB
- Dockerized MongoDB instance
- Mongo Express web interface for administration
- Automatic database initialization with proper indexing
- User authentication and role-based access control

### Database Access
- **MongoDB**: `mongodb://localhost:27017/roryk`
- **Web Interface**: http://localhost:8081
  - Username: `admin`
  - Password: `roryk-web-admin`

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
1. Start database: `docker-compose up -d`
2. Start backend: `cd backend && npm start`
3. Start frontend: `npm start`

### Production
For detailed production deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

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
- Automated deployment script
- SSL/HTTPS configuration
- Process management with PM2
- Database backups and recovery
- Email service integration
- Security hardening
- Performance optimization

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
  1. Ensure Docker is running: `docker --version`
  2. Check containers: `docker-compose ps`
  3. View logs: `docker-compose logs mongodb`
  4. Restart containers: `docker-compose restart`

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
- **Backend**: Terminal output where `npm start` was run
- **Database**: `docker-compose logs mongodb`
- **Web Interface**: `docker-compose logs mongo-express`

## 📊 Monitoring

### Health Checks
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/health (if implemented)
- Database: http://localhost:8081 (Mongo Express)

### Performance Monitoring
- Monitor database query performance via Mongo Express
- Use browser DevTools for frontend performance
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
2. Review the database setup guide: [`DATABASE_SETUP.md`](./DATABASE_SETUP.md)
3. Check application logs for detailed error messages
4. Ensure all environment variables are properly configured

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks
- Update dependencies: `npm audit fix`
- Database backups: `mongodump --uri="mongodb://localhost:27017/roryk"`
- Monitor disk space for Docker volumes
- Review and rotate JWT secrets periodically
- Update Stripe webhook endpoints if needed
- Clean up expired password reset tokens
- Monitor email service delivery rates
- Review security logs and access patterns

### Automated Maintenance
- Database backups (daily at 2 AM)
- SSL certificate renewal (automatic with certbot)
- Security updates (weekly)
- Log rotation and cleanup
- Performance monitoring and alerts

### Version History
- **v1.0.0**: Initial release with localStorage
- **v2.0.0**: MongoDB integration and improved payment system
- **v2.1.0**: Self-hosted database solution with Docker
- **v2.2.0**: Complete password management system and production deployment
