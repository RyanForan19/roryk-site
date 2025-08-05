# Oracle Cloud Server Diagnostics Guide

## 🔍 "Can't See Any Files" - Complete Diagnostics

If you can't see files or the server seems unresponsive, follow these diagnostic steps:

## 📋 Step 1: Basic Server Health Check

### Check if you're actually connected:
```bash
# Check your current user and location
whoami
pwd
hostname

# Check if server is responsive
date
uptime
```

**Expected output:**
```
ubuntu
/home/ubuntu
your-server-name
[current date/time]
[uptime info]
```

## 📋 Step 2: File System Diagnostics

### Check basic file operations:
```bash
# List all files (including hidden)
ls -la

# Check current directory
pwd

# Check disk space
df -h

# Check if you can create files
touch test.txt
ls -la test.txt
rm test.txt
```

### If ls shows nothing or errors:
```bash
# Check if filesystem is mounted properly
mount | grep "/"

# Check if directory exists
ls -la /home/ubuntu

# Try different directories
cd /
ls -la
cd /home
ls -la
cd ~
ls -la
```

## 📋 Step 3: Network Connectivity Check

### Test internet connectivity:
```bash
# Test DNS resolution
nslookup google.com

# Test internet connectivity
ping -c 3 google.com

# Test HTTPS connectivity
curl -I https://google.com
```

### If network fails:
```bash
# Check network interface
ip addr show

# Check default route
ip route show

# Check DNS settings
cat /etc/resolv.conf
```

## 📋 Step 4: System Resource Check

### Check system resources:
```bash
# Check memory usage
free -h

# Check CPU usage
top -n 1

# Check disk usage
df -h

# Check if system is out of space
du -sh /home/ubuntu
```

## 📋 Step 5: SSH Connection Diagnostics

### If connection seems unstable:
```bash
# Check SSH service
sudo systemctl status ssh

# Check who's logged in
who
w

# Check system logs for issues
sudo tail -20 /var/log/syslog
```

## 🔧 Common Issues & Solutions

### Issue 1: Empty Home Directory
**Symptoms**: `ls` shows nothing, even with `-la`

**Solutions:**
```bash
# Check if you're in the right place
pwd
# Should show: /home/ubuntu

# Check if home directory exists
ls -la /home/

# If home directory is missing, create it
sudo mkdir -p /home/ubuntu
sudo chown ubuntu:ubuntu /home/ubuntu
cd /home/ubuntu
```

### Issue 2: Permission Issues
**Symptoms**: Can't create files, permission denied errors

**Solutions:**
```bash
# Check current permissions
ls -la /home/ubuntu

# Fix ownership if needed
sudo chown -R ubuntu:ubuntu /home/ubuntu

# Check if you can write
touch test.txt
ls -la test.txt
rm test.txt
```

### Issue 3: Disk Full
**Symptoms**: Can't create files, "No space left on device"

**Solutions:**
```bash
# Check disk usage
df -h

# If disk is full, clean up
sudo apt clean
sudo apt autoremove
sudo rm -rf /tmp/*

# Check again
df -h
```

### Issue 4: Network Issues
**Symptoms**: Can't download files, connection timeouts

**Solutions:**
```bash
# Test basic connectivity
ping -c 3 8.8.8.8

# If ping fails, check Oracle Cloud security lists
# Ensure outbound internet access is allowed

# Try different DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

### Issue 5: SSH Session Issues
**Symptoms**: Commands hang, session freezes

**Solutions:**
```bash
# Press Ctrl+C to cancel current command
# Press Ctrl+D to logout and reconnect
# Or close terminal and start new SSH session
```

## 🚀 Fresh Start Procedure

If nothing works, try this complete reset:

### Step 1: Reconnect
```bash
# Exit current session
exit

# Reconnect via SSH
ssh -i your-key.pem ubuntu@your-server-ip
```

### Step 2: Basic System Check
```bash
# Update system first
sudo apt update

# Check if update works
echo "System update successful"
```

### Step 3: Test File Operations
```bash
# Go to home directory
cd ~
pwd

# Create test file
echo "test" > test.txt
ls -la test.txt
cat test.txt
rm test.txt
```

### Step 4: Test Network
```bash
# Test internet
curl -I https://github.com

# If this works, proceed with git clone
git clone https://github.com/RyanForan19/roryk-site.git
```

## 🆘 Emergency Troubleshooting

### If Server is Completely Unresponsive:

1. **Check Oracle Cloud Console:**
   - Go to Compute > Instances
   - Check if instance status is "Running"
   - If stopped, start it
   - If running but unresponsive, reboot it

2. **Reboot Instance:**
   - In Oracle Cloud Console
   - Click on your instance
   - Click "Reboot"
   - Wait 2-3 minutes
   - Try SSH again

3. **Check Security Lists:**
   - Go to Networking > Virtual Cloud Networks
   - Check your VCN > Security Lists
   - Ensure SSH (port 22) is allowed from your IP

4. **Try Different SSH Client:**
   - If using PuTTY, try command line SSH
   - If using command line, try PuTTY
   - Try from different computer/network

## ✅ Success Indicators

You know the server is working when:
- `whoami` returns `ubuntu`
- `pwd` returns `/home/ubuntu`
- `ls -la` shows at least `.` and `..` directories
- `touch test.txt && ls test.txt` creates and shows file
- `ping google.com` works
- `curl -I https://github.com` returns HTTP headers

## 📞 Next Steps

Once basic diagnostics pass:
1. **Update system**: `sudo apt update && sudo apt upgrade -y`
2. **Clone repository**: `git clone https://github.com/RyanForan19/roryk-site.git`
3. **Navigate to project**: `cd roryk-site/roryk`
4. **List files**: `ls -la` (should show project files)
5. **Deploy**: `chmod +x *.sh && ./deploy.sh production deploy`

If any of these diagnostic steps fail, the issue is with the server setup, not the deployment process.