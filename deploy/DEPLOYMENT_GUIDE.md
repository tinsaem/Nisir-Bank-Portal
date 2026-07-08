# VPS Deployment Guide for Nisir Bank Portal

Complete step-by-step guide to deploy your Next.js application on a VPS.

## Prerequisites

- A VPS (Ubuntu 20.04/22.04 recommended)
- Root or sudo access
- Domain name (optional, can use IP address)
- Git repository with your code

## Step 1: Prepare Your VPS

### 1.1 Connect to Your VPS

```bash
ssh root@your-server-ip
```

### 1.2 Run Initial Setup

```bash
# Upload the vps-setup.sh script to your server
# Then run it:
chmod +x vps-setup.sh
./vps-setup.sh
```

This script will:
- Update system packages
- Install Node.js, PostgreSQL, Nginx, PM2, Git
- Create database and user
- Set up firewall

**Important:** Save the database password you set during setup!

## Step 2: Deploy Your Application

### 2.1 Switch to App User

```bash
su - appuser
```

### 2.2 Clone Your Repository

```bash
cd /var/www
git clone https://github.com/your-username/your-repo.git nisir-bank-portal
cd nisir-bank-portal
```

### 2.3 Create Environment File

```bash
cp deploy/.env.production.example .env.production
nano .env.production
```

Update with your actual values:
- Database password
- Session secrets
- Email credentials (if needed)
- Domain/URL

### 2.4 Create Logs Directory

```bash
mkdir -p logs
```

### 2.5 Run Deployment Script

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

This will:
- Install dependencies
- Generate Prisma client
- Run database migrations
- Build the Next.js app
- Start it with PM2

## Step 3: Configure Nginx

### 3.1 Exit from appuser

```bash
exit  # Back to root/sudo user
```

### 3.2 Copy Nginx Configuration

```bash
cp /var/www/nisir-bank-portal/deploy/nginx.conf /etc/nginx/sites-available/nisir-bank-portal
```

### 3.3 Edit the Configuration

```bash
nano /etc/nginx/sites-available/nisir-bank-portal
```

Change `your-domain.com` to your actual domain or server IP.

### 3.4 Enable the Site

```bash
# Create symlink
ln -s /etc/nginx/sites-available/nisir-bank-portal /etc/nginx/sites-enabled/

# Remove default site (optional)
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

## Step 4: Set Up SSL (Optional but Recommended)

If you have a domain name:

```bash
chmod +x /var/www/nisir-bank-portal/deploy/ssl-setup.sh
/var/www/nisir-bank-portal/deploy/ssl-setup.sh
```

Follow the prompts to get a free SSL certificate from Let's Encrypt.

## Step 5: Seed the Database (If Needed)

```bash
su - appuser
cd /var/www/nisir-bank-portal

# Make sure .env.production is set
npm run seed
```

## Step 6: Verify Deployment

### 6.1 Check PM2 Status

```bash
pm2 status
pm2 logs nisir-bank-portal
```

### 6.2 Check Nginx Status

```bash
systemctl status nginx
```

### 6.3 Access Your Application

Open in browser:
- With domain: `http://your-domain.com` or `https://your-domain.com`
- With IP: `http://your-server-ip`

## Common PM2 Commands

```bash
pm2 status                    # Check status
pm2 logs nisir-bank-portal    # View logs
pm2 restart nisir-bank-portal # Restart app
pm2 stop nisir-bank-portal    # Stop app
pm2 start nisir-bank-portal   # Start app
pm2 monit                     # Monitor resources
```

## Updating Your Application

When you push new code:

```bash
su - appuser
cd /var/www/nisir-bank-portal
./deploy/UPDATE.sh
```

## Setting Up Automatic Backups

### 6.1 Set Database Password Environment Variable

```bash
# As appuser, add to ~/.bashrc or ~/.profile
echo 'export DB_PASSWORD="your-db-password"' >> ~/.bashrc
source ~/.bashrc
```

### 6.2 Set Up Cron Job

```bash
crontab -e
```

Add this line to backup daily at 2 AM:
```
0 2 * * * /var/www/nisir-bank-portal/deploy/backup.sh
```

## Monitoring and Logs

### Application Logs
```bash
pm2 logs nisir-bank-portal
# Or
tail -f /var/www/nisir-bank-portal/logs/pm2-out.log
tail -f /var/www/nisir-bank-portal/logs/pm2-error.log
```

### Nginx Logs
```bash
tail -f /var/log/nginx/nisir-bank-portal-access.log
tail -f /var/log/nginx/nisir-bank-portal-error.log
```

### System Resources
```bash
pm2 monit
htop
```

## Troubleshooting

### App Won't Start
```bash
# Check logs
pm2 logs nisir-bank-portal --lines 100

# Verify environment variables
cat .env.production

# Test database connection
npx prisma db pull
```

### 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check if port 3000 is in use
lsof -i :3000

# Restart everything
pm2 restart nisir-bank-portal
systemctl restart nginx
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U nisir_db_user -d nisir_bank_portal -h localhost

# Check PostgreSQL is running
systemctl status postgresql
```

### Port Already in Use
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process if needed
kill -9 <PID>
```

## Security Checklist

- [ ] Firewall configured (UFW)
- [ ] PostgreSQL not accessible from outside (localhost only)
- [ ] Strong database password set
- [ ] Environment variables secured (.env.production not in git)
- [ ] SSL certificate installed (if using domain)
- [ ] Regular backups configured
- [ ] PM2 startup script configured
- [ ] Nginx configured with security headers
- [ ] Server packages regularly updated

## Server Maintenance

### Update System Packages
```bash
apt update && apt upgrade -y
```

### Update Node.js (if needed)
```bash
npm cache clean -f
npm install -g n
n stable
```

### Restart Services
```bash
systemctl restart postgresql
systemctl restart nginx
pm2 restart all
```

## Getting Help

If you encounter issues:

1. Check application logs: `pm2 logs nisir-bank-portal`
2. Check Nginx logs: `tail -f /var/log/nginx/nisir-bank-portal-error.log`
3. Verify all services are running
4. Check firewall rules: `ufw status`
5. Test database connection

## Cost Optimization Tips

- Use PM2 cluster mode for better performance (update ecosystem.config.js)
- Enable Nginx caching for static assets
- Set up log rotation to save disk space
- Monitor resource usage with `pm2 monit`
- Consider using a CDN for static assets

---

**Congratulations! Your application should now be deployed and running.**
