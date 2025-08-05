# Complete Oracle Cloud Always Free Setup Guide for RoryK

This guide provides detailed step-by-step instructions for setting up RoryK on Oracle Cloud's Always Free tier.

## 🎯 Why Oracle Cloud Always Free?

- **Truly FREE forever** (no time limits like AWS)
- **Generous resources**: ARM instance with 4 OCPUs, 24GB RAM
- **200GB block storage** included
- **10TB monthly bandwidth**
- **No credit card required** for Always Free resources
- **Professional infrastructure** with enterprise-grade security

## 📋 What You'll Get FREE

### Always Free Resources
- **2x AMD VM instances**: 1/8 OCPU, 1GB RAM each
- **1x ARM VM instance**: 4 OCPUs, 24GB RAM (recommended for RoryK)
- **Block Storage**: 200GB total
- **Object Storage**: 20GB
- **Archive Storage**: 10GB
- **Load Balancer**: 1 instance, 10Mbps
- **Monitoring**: Metrics and alarms
- **Notifications**: Email and SMS

### Network & Security
- **Virtual Cloud Network (VCN)**: Fully configurable
- **Security Lists**: Firewall rules
- **Internet Gateway**: Public internet access
- **DDoS Protection**: Built-in
- **SSL Certificates**: Free Let's Encrypt integration

## 🚀 Step-by-Step Setup

### Step 1: Create Oracle Cloud Account

#### 1.1 Visit Oracle Cloud
- Go to: https://cloud.oracle.com/
- Click **"Start for free"** or **"Try Oracle Cloud Free Tier"**

#### 1.2 Account Registration
```
Required Information:
- Email address (will be your username)
- Password (strong password required)
- Country/Territory
- First and Last Name
- Company Name (can be personal/individual)
- Phone Number (for verification)
```

#### 1.3 Verification Process
- **Email verification**: Check your email and click verification link
- **Phone verification**: Enter SMS code sent to your phone
- **Identity verification**: May require government ID (varies by region)

#### 1.4 Account Type Selection
- Choose **"Personal Use"** or **"Business Use"**
- For personal projects, select **"Personal Use"**

#### 1.5 Payment Information
- **Credit card required** for account verification
- **No charges for Always Free resources**
- Card is only charged if you upgrade to paid services
- You can set spending limits to prevent accidental charges

### Step 2: Navigate Oracle Cloud Console

#### 2.1 First Login
- Go to: https://cloud.oracle.com/
- Click **"Sign In"**
- Enter your email and password
- You'll be taken to the Oracle Cloud Console

#### 2.2 Console Overview
```
Main Navigation Areas:
- Dashboard: Overview of your resources
- Compute: Virtual machines and containers
- Networking: VCNs, load balancers, etc.
- Storage: Block, object, and file storage
- Database: Various database services
- Developer Services: APIs, functions, etc.
```

### Step 3: Create Virtual Cloud Network (VCN)

#### 3.1 Navigate to Networking
- In the main menu (hamburger icon ☰), click **"Networking"**
- Select **"Virtual Cloud Networks"**

#### 3.2 Create VCN
- Click **"Create VCN"**
- Fill in the details:
  ```
  Name: roryk-vcn
  Compartment: (root) - keep default
  IPv4 CIDR Block: 10.0.0.0/16
  IPv6 CIDR Block: Leave unchecked
  DNS Resolution: Checked
  DNS Label: rorykvcn
  ```
- Click **"Create VCN"**

#### 3.3 Create DRG (Dynamic Routing Gateway) - If Required
**Note**: Some Oracle Cloud regions now require DRG for Internet Gateway creation.

- In your VCN, click **"Dynamic Routing Gateways"** on the left
- Click **"Create Dynamic Routing Gateway"**
- Fill in the details:
  ```
  Name: roryk-drg
  Compartment: (root) - keep default
  ```
- Click **"Create Dynamic Routing Gateway"**
- Wait for it to be created (status: Available)

#### 3.4 Configure Internet Gateway
- In your VCN, click **"Internet Gateways"** on the left
- Click **"Create Internet Gateway"**
- Fill in the details:
  ```
  Name: roryk-internet-gateway
  Compartment: (root) - keep default
  ```
- **If DRG field appears**: Select **"roryk-drg"** from the dropdown
- Click **"Create Internet Gateway"**

#### 3.5 Configure Route Table
- Click **"Route Tables"** on the left
- Click on **"Default Route Table for roryk-vcn"**
- Click **"Add Route Rules"**
  ```
  Target Type: Internet Gateway
  Destination CIDR Block: 0.0.0.0/0
  Target Internet Gateway: roryk-internet-gateway
  ```
- Click **"Add Route Rules"**

#### 3.6 Configure Security List
- Click **"Security Lists"** on the left
- Click on **"Default Security List for roryk-vcn"**
- Click **"Add Ingress Rules"** and add these rules:

**Rule 1 - SSH Access:**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0 (or your IP for better security)
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 22
Description: SSH access
```

**Rule 2 - HTTP Access:**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 80
Description: HTTP access
```

**Rule 3 - HTTPS Access:**
```
Source Type: CIDR
Source CIDR: 0.0.0.0/0
IP Protocol: TCP
Source Port Range: All
Destination Port Range: 443
Description: HTTPS access
```

### Step 4: Create Subnet

#### 4.1 Create Public Subnet
- In your VCN, click **"Subnets"** on the left
- Click **"Create Subnet"**
  ```
  Name: roryk-public-subnet
  Compartment: (root)
  Subnet Type: Regional
  IPv4 CIDR Block: 10.0.1.0/24
  Route Table: Default Route Table for roryk-vcn
  Subnet Access: Public Subnet
  DNS Resolution: Checked
  DNS Label: rorykpublic
  DHCP Options: Default DHCP Options for roryk-vcn
  Security Lists: Default Security List for roryk-vcn
  ```
- Click **"Create Subnet"**

### Step 5: Create Compute Instance

#### 5.1 Navigate to Compute
- In the main menu, click **"Compute"**
- Select **"Instances"**

#### 5.2 Create Instance
- Click **"Create Instance"**

#### 5.3 Instance Configuration
```
Name: roryk-server
Compartment: (root)

Placement:
- Availability Domain: Try AD-1, AD-2, AD-3 until one works
- Fault Domain: (leave default)

Image and Shape:
- Image: Canonical Ubuntu 22.04
```

**Shape Selection (Try in order of preference):**

**Option 1 - ARM Shape (Best Performance, Often Out of Capacity):**
```
Shape: VM.Standard.A1.Flex (ARM-based - Always Free)
- OCPUs: 4 (maximum for free tier)
- Memory (GB): 24 (maximum for free tier)
```

**Option 2 - AMD Shape (Reliable Availability):**
```
Shape: VM.Standard.E2.1.Micro (AMD-based - Always Free)
- OCPUs: 1 (fixed)
- Memory (GB): 1 (fixed)
- Note: Less powerful but still runs RoryK well
```

**💡 Capacity Tips:**
- If you get "Out of capacity" error, try different Availability Domains
- Try different regions (US East, US West, UK South work well)
- ARM shapes are in high demand - try during off-peak hours
- AMD shapes are more readily available

#### 5.4 Networking Configuration
```
Primary Network:
- Virtual Cloud Network: roryk-vcn
- Subnet: roryk-public-subnet
- Use network security groups: Unchecked
- Assign a public IPv4 address: Checked
- IPv4 address: (leave default)
```

#### 5.5 SSH Key Configuration
**Option A - Generate New Key Pair (Recommended):**
- Select **"Generate a key pair for me"**
- Click **"Save Private Key"** - Download and save securely
- Click **"Save Public Key"** - Download for backup

**Option B - Upload Your Own Key:**
- Select **"Upload public key files"**
- Upload your existing public key file

#### 5.6 Boot Volume Configuration
```
Boot Volume:
- Use in-transit encryption: Checked
- Boot volume size (GB): 50 (or more if needed)
- Boot volume backup policy: Disabled (to stay free)
```

#### 5.7 Create Instance
- Review all settings
- Click **"Create"**
- Wait for instance to provision (usually 2-3 minutes)

### Step 6: Connect to Your Instance

#### 6.1 Get Instance Details
- Once instance is **"Running"**, click on the instance name
- Note the **"Public IP Address"**
- Note the **"Username"** (usually `ubuntu` for Ubuntu images)

#### 6.2 Connect via SSH

**On Windows (using PuTTY):**
1. Download PuTTY from https://putty.org/
2. Convert the private key:
   - Open PuTTYgen
   - Load your private key file
   - Save as PuTTY private key (.ppk)
3. Open PuTTY:
   ```
   Host Name: ubuntu@YOUR_PUBLIC_IP
   Port: 22
   Connection Type: SSH
   ```
4. In SSH > Auth, browse and select your .ppk file
5. Click **"Open"**

**On Linux/Mac:**
```bash
# Make private key secure
chmod 600 /path/to/your/private-key.pem

# Connect to instance
ssh -i /path/to/your/private-key.pem ubuntu@YOUR_PUBLIC_IP
```

**On Windows (using WSL or Git Bash):**
```bash
ssh -i /path/to/your/private-key.pem ubuntu@YOUR_PUBLIC_IP
```

### Step 7: Deploy RoryK Application

#### 7.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### 7.2 Deploy RoryK (One Command)
```bash
curl -fsSL https://raw.githubusercontent.com/yourusername/roryk/main/free-cloud-deploy.sh | bash
```

**Or Manual Deployment:**
```bash
# Clone repository
git clone https://github.com/yourusername/roryk.git
cd roryk

# Make scripts executable
chmod +x *.sh

# Deploy
./deploy.sh production deploy
```

#### 7.3 Verify Deployment
```bash
# Check PM2 status
pm2 status

# Check if services are running
curl http://localhost:3000  # Frontend
curl http://localhost:3001/api/health  # Backend API
```

### Step 8: Configure Domain and SSL (Optional)

#### 8.1 Point Domain to Instance
- Get your instance's public IP from Oracle Cloud Console
- In your domain registrar's DNS settings:
  ```
  Type: A
  Name: @ (or www)
  Value: YOUR_INSTANCE_PUBLIC_IP
  TTL: 300
  ```

#### 8.2 Set Up SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 9: Configure Firewall (Instance Level)

#### 9.1 Configure UFW
```bash
# Enable UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw deny 27017  # Block MongoDB direct access
sudo ufw --force enable

# Check status
sudo ufw status
```

### Step 10: Monitoring and Maintenance

#### 10.1 Set Up Monitoring
```bash
# Check application status
~/roryk-status.sh

# Monitor with PM2
pm2 monit

# Check system resources
htop
df -h
free -h
```

#### 10.2 Automated Backups
```bash
# Manual backup
~/roryk-backup.sh

# Backups are automatically scheduled daily at 2 AM
crontab -l
```

#### 10.3 Update Application
```bash
# Update RoryK
~/roryk-update.sh
```

## 🔒 Security Best Practices

### 1. Secure SSH Access
```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Recommended changes:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # Change from default 22

# Restart SSH
sudo systemctl restart ssh
```

### 2. Configure Fail2ban
```bash
# Install fail2ban
sudo apt install fail2ban -y

# Configure
sudo nano /etc/fail2ban/jail.local
```

Add:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

### 3. Regular Updates
```bash
# Set up automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 💰 Cost Management

### Always Free Limits
- **Compute**: 3,000 OCPU hours/month (ARM), 3,000 OCPU hours/month (AMD)
- **Block Storage**: 200GB total
- **Bandwidth**: 10TB/month outbound
- **Load Balancer**: 1 instance, 10Mbps

### Monitoring Usage
- Go to **"Governance & Administration"** > **"Account Management"** > **"Usage"**
- Monitor your Always Free usage
- Set up billing alerts

### Prevent Accidental Charges
```bash
# In Oracle Cloud Console:
# 1. Go to Account Management > Payment Methods
# 2. Set spending limits
# 3. Enable billing alerts
# 4. Review usage regularly
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Oracle Cloud Interface Variations
```bash
# If you see "Choose a DRG" when creating Internet Gateway:
# - DRG (Dynamic Routing Gateway) is now REQUIRED in some regions
# - Create DRG first: Networking > Dynamic Routing Gateways > Create
# - Then select the DRG when creating Internet Gateway
# - This is a recent Oracle Cloud change for enhanced security

# If VCN creation shows different options:
# - Use "VCN with Internet Connectivity" wizard if available
# - This automatically creates Internet Gateway, DRG, and Route Tables
# - Skip manual gateway/route configuration if using wizard

# If you see "Availability Domain" errors:
# - Try different availability domains
# - Some regions have capacity limits
# - ARM shapes are more likely to be available

# If DRG creation fails:
# - Ensure you're in the correct compartment (root)
# - Some regions may have different DRG requirements
# - Try refreshing the page and creating again
```

#### 2. ARM Instance Capacity Issues (Very Common)
**Error**: "Out of capacity for shape VM.Standard.A1.Flex in availability domain AD-1"

**📋 Quick Reference**: See [oracle-capacity-checker.md](./oracle-capacity-checker.md) for detailed solutions.

**Solutions (Try in order):**

**Method 1 - Try Different Availability Domains:**
```bash
# When creating instance, try each availability domain:
# - AD-1 (Availability Domain 1)
# - AD-2 (Availability Domain 2)
# - AD-3 (Availability Domain 3)
# Keep trying different ADs until one works
```

**Method 2 - Try Different Regions:**
```bash
# Popular regions with better ARM availability:
# - US East (Ashburn) - us-ashburn-1
# - US West (Phoenix) - us-phoenix-1
# - UK South (London) - uk-london-1
# - Germany Central (Frankfurt) - eu-frankfurt-1
# - Japan East (Tokyo) - ap-tokyo-1

# To change region:
# 1. Click region dropdown in top-right corner
# 2. Select different region
# 3. Try creating instance again
```

**Method 3 - Use AMD Shape (Alternative):**
```bash
# If ARM not available, use AMD Always Free:
# Shape: VM.Standard.E2.1.Micro
# Resources: 1 OCPU, 1GB RAM (still free forever)
# Less powerful but still runs RoryK fine
```

**Method 4 - Automated Retry Script:**
```bash
# Create a script to keep trying:
#!/bin/bash
echo "Trying to create ARM instance..."
for i in {1..50}; do
    echo "Attempt $i..."
    # Try creating instance via CLI or keep refreshing web console
    sleep 30
done
```

**Method 5 - Best Times to Try:**
```bash
# ARM instances are more available during:
# - Late night/early morning in your region
# - Weekends
# - Off-peak hours (avoid 9-5 business hours)
# - Try every few hours throughout the day
```

#### 3. Alternative Free Shapes if ARM Unavailable:
```bash
# Always Free AMD options:
# VM.Standard.E2.1.Micro: 1 OCPU, 1GB RAM
# VM.Standard.E2.1.Micro: 2 instances allowed

# These work fine for RoryK, just with less resources
# Still completely free forever
```

#### 2. Can't Connect via SSH
```bash
# Check security list rules in Oracle Cloud Console
# Ensure port 22 is open from 0.0.0.0/0 (or your IP)
# Verify instance is in "Running" state
# Check if you're using correct private key
```

#### 2. Website Not Accessible
```bash
# Check if services are running
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Verify security list rules for ports 80/443
```

#### 3. Out of Memory
```bash
# Check memory usage
free -h

# Restart services if needed
pm2 restart all

# Consider using swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Check Nginx configuration
sudo nginx -t
```

## 📊 Performance Optimization

### 1. Enable Compression
```bash
# Already configured in deployment script
# Nginx gzip compression is enabled
```

### 2. PM2 Cluster Mode
```bash
# For better performance, use cluster mode
pm2 start ecosystem.config.js --env production -i max
```

### 3. Database Optimization
```bash
# MongoDB is configured with optimal settings
# Indexes are automatically created
```

## 🎯 Next Steps After Deployment

1. **Configure Stripe**: Add your Stripe keys to `~/roryk/backend/.env`
2. **Set up domain**: Point your domain to the instance IP
3. **Get SSL certificate**: Run `sudo certbot --nginx -d yourdomain.com`
4. **Configure email**: Add SMTP settings for password reset emails
5. **Set up monitoring**: Use UptimeRobot or similar service
6. **Regular backups**: Backups are automated, but test restore process
7. **Security audit**: Review and harden security settings

## ✅ Deployment Checklist

- [ ] Oracle Cloud account created
- [ ] VCN and subnet configured
- [ ] Security lists configured (ports 22, 80, 443)
- [ ] Compute instance created (ARM shape recommended)
- [ ] SSH connection established
- [ ] RoryK deployed successfully
- [ ] Services running (PM2 status shows all green)
- [ ] Website accessible via public IP
- [ ] Firewall configured (UFW)
- [ ] SSL certificate obtained (if using domain)
- [ ] Stripe keys configured
- [ ] Email service configured
- [ ] Backups tested
- [ ] Monitoring set up

**Total Setup Time**: 30-45 minutes  
**Total Cost**: $0/month forever  
**Resources**: 4 CPU cores, 24GB RAM, 200GB storage  

Your RoryK application is now running on enterprise-grade infrastructure completely free!