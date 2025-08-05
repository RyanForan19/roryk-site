# SFTP Setup Guide for Oracle Cloud Server

## 🔧 Enable SFTP Access to Your Server

SFTP (SSH File Transfer Protocol) allows you to edit files directly on your server using graphical tools like FileZilla, WinSCP, or VS Code.

## 📋 Prerequisites

- Your Oracle Cloud server is running
- You have SSH access working
- You have your private key file (.pem)

## 🚀 Method 1: SFTP is Already Enabled (Most Common)

**Good news**: SFTP is usually enabled by default on Ubuntu servers!

### Test SFTP Connection:
```bash
# From your local computer, test SFTP connection
sftp -i your-private-key.pem ubuntu@your-server-ip
```

If this works, you can skip to the **SFTP Client Setup** section below.

## 🔧 Method 2: Enable SFTP (If Not Working)

### Step 1: Connect via SSH
```bash
ssh -i your-private-key.pem ubuntu@your-server-ip
```

### Step 2: Check SSH Configuration
```bash
# Check if SFTP is enabled
sudo grep -i sftp /etc/ssh/sshd_config
```

### Step 3: Enable SFTP (if needed)
```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Add or uncomment this line:
Subsystem sftp /usr/lib/openssh/sftp-server

# Save and exit (Ctrl+X, Y, Enter)
```

### Step 4: Restart SSH Service
```bash
sudo systemctl restart ssh
```

### Step 5: Test SFTP
```bash
# Exit SSH session
exit

# Test SFTP from your local computer
sftp -i your-private-key.pem ubuntu@your-server-ip
```

## 💻 SFTP Client Setup

### Option 1: FileZilla (Windows/Mac/Linux)

#### Download and Install:
- Download from: https://filezilla-project.org/
- Install FileZilla Client (not Server)

#### Setup Connection:
1. **Open FileZilla**
2. **Go to**: File > Site Manager
3. **Click**: New Site
4. **Configure**:
   ```
   Protocol: SFTP - SSH File Transfer Protocol
   Host: your-server-ip
   Port: 22
   Logon Type: Key file
   User: ubuntu
   Key file: Browse to your .pem file
   ```
5. **Click**: Connect

#### Convert Key (if needed):
If FileZilla can't read your .pem file:
1. **Go to**: Edit > Settings > SFTP
2. **Click**: Add key file
3. **Select**: your .pem file
4. **FileZilla will convert it automatically**

### Option 2: WinSCP (Windows Only)

#### Download and Install:
- Download from: https://winscp.net/
- Install WinSCP

#### Setup Connection:
1. **Open WinSCP**
2. **Configure**:
   ```
   File protocol: SFTP
   Host name: your-server-ip
   Port number: 22
   User name: ubuntu
   ```
3. **Click**: Advanced > SSH > Authentication
4. **Browse**: Select your .pem file
5. **Click**: Login

### Option 3: VS Code with SFTP Extension

#### Install Extension:
1. **Open VS Code**
2. **Go to**: Extensions (Ctrl+Shift+X)
3. **Search**: "SFTP"
4. **Install**: "SFTP" by Natizyskunk

#### Setup Connection:
1. **Open Command Palette**: Ctrl+Shift+P
2. **Type**: "SFTP: Config"
3. **Create config file**:
   ```json
   {
       "name": "Oracle Cloud Server",
       "host": "your-server-ip",
       "protocol": "sftp",
       "port": 22,
       "username": "ubuntu",
       "privateKeyPath": "C:\\path\\to\\your\\private-key.pem",
       "remotePath": "/home/ubuntu",
       "uploadOnSave": true,
       "ignore": [
           ".vscode",
           ".git",
           ".DS_Store",
           "node_modules"
       ]
   }
   ```
4. **Save**: Ctrl+S
5. **Connect**: Ctrl+Shift+P > "SFTP: Open SSH in Terminal"

### Option 4: Command Line SFTP

#### Basic SFTP Commands:
```bash
# Connect to server
sftp -i your-private-key.pem ubuntu@your-server-ip

# Navigate directories
ls                  # List remote files
lls                 # List local files
cd /path/to/dir     # Change remote directory
lcd /local/path     # Change local directory
pwd                 # Show remote directory
lpwd                # Show local directory

# Transfer files
get remote-file.txt         # Download file
put local-file.txt          # Upload file
get -r remote-folder        # Download folder
put -r local-folder         # Upload folder

# Exit
quit
```

## 🔒 Security Configuration

### Step 1: Secure SFTP Access
```bash
# Connect via SSH
ssh -i your-private-key.pem ubuntu@your-server-ip

# Edit SSH config for better security
sudo nano /etc/ssh/sshd_config
```

### Step 2: Recommended Security Settings:
```bash
# Add/modify these lines in /etc/ssh/sshd_config:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers ubuntu
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2

# SFTP-specific settings
Subsystem sftp /usr/lib/openssh/sftp-server
Match User ubuntu
    ChrootDirectory none
    ForceCommand internal-sftp
    AllowTcpForwarding no
    X11Forwarding no
```

### Step 3: Restart SSH:
```bash
sudo systemctl restart ssh
```

## 📁 Useful Directory Locations

### Key Directories on Your Server:
```bash
/home/ubuntu/                           # Your home directory
/home/ubuntu/roryk-site/roryk/          # RoryK application
/home/ubuntu/roryk-site/roryk/backend/  # Backend code
/home/ubuntu/roryk-site/roryk/src/      # Frontend code
/etc/nginx/sites-available/             # Nginx configuration
/var/log/                               # Log files
```

### Common Files to Edit:
```bash
# Environment configuration
/home/ubuntu/roryk-site/roryk/backend/.env

# PM2 configuration
/home/ubuntu/roryk-site/roryk/ecosystem.config.js

# Nginx configuration
/etc/nginx/sites-available/roryk

# Application files
/home/ubuntu/roryk-site/roryk/src/components/
/home/ubuntu/roryk-site/roryk/backend/routes/
```

## 🔧 Oracle Cloud Security List Configuration

### Allow SFTP in Oracle Cloud:
1. **Go to**: Oracle Cloud Console
2. **Navigate**: Networking > Virtual Cloud Networks
3. **Select**: Your VCN
4. **Click**: Security Lists > Default Security List
5. **Add Ingress Rule**:
   ```
   Source Type: CIDR
   Source CIDR: 0.0.0.0/0 (or your IP for better security)
   IP Protocol: TCP
   Source Port Range: All
   Destination Port Range: 22
   Description: SSH/SFTP access
   ```

**Note**: This rule is usually already there for SSH access.

## 🎯 Quick Setup Summary

### For FileZilla Users:
1. **Download**: FileZilla Client
2. **Connect**: SFTP, your-server-ip, port 22, user ubuntu, key file
3. **Navigate**: to /home/ubuntu/roryk-site/roryk/
4. **Edit**: files directly in FileZilla's built-in editor

### For VS Code Users:
1. **Install**: SFTP extension
2. **Configure**: SFTP config with your server details
3. **Connect**: and edit files directly in VS Code
4. **Auto-upload**: files save automatically to server

### For WinSCP Users:
1. **Download**: WinSCP
2. **Connect**: SFTP, your-server-ip, user ubuntu, private key
3. **Edit**: files with built-in editor or external editor

## 🚨 Troubleshooting

### Connection Refused:
```bash
# Check if SSH service is running
sudo systemctl status ssh

# Restart SSH service
sudo systemctl restart ssh

# Check firewall
sudo ufw status
```

### Permission Denied:
```bash
# Check file permissions
ls -la your-private-key.pem

# Fix key permissions (on your local computer)
chmod 600 your-private-key.pem
```

### Can't Edit Files:
```bash
# Check file ownership on server
ls -la /home/ubuntu/roryk-site/

# Fix ownership if needed
sudo chown -R ubuntu:ubuntu /home/ubuntu/roryk-site/
```

## ✅ Success Test

### Test Your SFTP Setup:
1. **Connect** via your chosen SFTP client
2. **Navigate** to `/home/ubuntu/roryk-site/roryk/`
3. **Create** a test file: `test-sftp.txt`
4. **Edit** the file and add some text
5. **Save** the file
6. **Verify** via SSH: `ssh -i key.pem ubuntu@server-ip` then `ls -la`

If you can see and edit the test file, SFTP is working perfectly!

## 🎯 Benefits of SFTP Access

- **Direct editing**: Edit server files without downloading/uploading
- **Real-time changes**: See changes immediately on your website
- **Better workflow**: Use your favorite editor (VS Code, etc.)
- **File management**: Easy file browsing and organization
- **Backup**: Easy to download/backup server files

Now you can edit your RoryK application files directly on the server!