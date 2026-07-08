# Quick VPS Deployment - Immediate Steps

## On Your VPS (you're already connected as root)

### Step 1: Generate Prisma Client & Build
```bash
cd /var/www/Nisir-Bank-Portal

# Make sure you have .env.production with DATABASE_URL
# If not, create it:
nano .env.production
# Add: DATABASE_URL="postgresql://nisir_db_user:YOUR_PASSWORD@localhost:5432/nisir_bank_portal"

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build the app
NODE_ENV=production npm run build
```

### Step 2: Start with PM2
```bash
# Start the application
pm2 start npm --name nisir-bank-portal -- start

# Save PM2 config
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

### Step 3: Check if it's running
```bash
pm2 status
pm2 logs nisir-bank-portal

# Test locally
curl http://localhost:3000
```

### Step 4: Configure Nginx (if not done)
```bash
# Copy nginx config from your repo
cp /var/www/Nisir-Bank-Portal/deploy/nginx.conf /etc/nginx/sites-available/nisir-bank-portal

# Edit to add your domain/IP
nano /etc/nginx/sites-available/nisir-bank-portal
# Change "your-domain.com" to your actual domain or IP

# Enable site
ln -s /etc/nginx/sites-available/nisir-bank-portal /etc/nginx/sites-enabled/

# Remove default (optional)
rm /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
```

### Step 5: Access Your Site
Open in browser: `http://your-server-ip` or `http://your-domain.com`

## Quick Commands

```bash
# View logs
pm2 logs nisir-bank-portal

# Restart app
pm2 restart nisir-bank-portal

# Stop app
pm2 stop nisir-bank-portal

# Check status
pm2 status

# Monitor
pm2 monit
```

## If You Need to Update Later
```bash
cd /var/www/Nisir-Bank-Portal
git pull
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart nisir-bank-portal
```

## Seed Database (Optional)
```bash
cd /var/www/Nisir-Bank-Portal
npm run seed
```

That's it! Your app should be live now.
