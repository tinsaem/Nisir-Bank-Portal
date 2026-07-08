#!/bin/bash

# Application Deployment Script
# Run this script as 'appuser' in the application directory

set -e

APP_DIR="/var/www/nisir-bank-portal"
APP_NAME="nisir-bank-portal"

echo "==================================="
echo "Deploying Nisir Bank Portal"
echo "==================================="

# Navigate to app directory
cd "$APP_DIR"

# Pull latest changes (if using git)
if [ -d .git ]; then
    echo "Pulling latest changes..."
    git pull origin main
fi

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "ERROR: .env.production file not found!"
    echo "Please create it with your DATABASE_URL and other environment variables"
    exit 1
fi

# Run database migrations first
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client (MUST be before build)
echo "Generating Prisma Client..."
npx prisma generate

# Verify Prisma client was generated
if [ ! -d "src/generated/prisma" ]; then
    echo "ERROR: Prisma client generation failed!"
    exit 1
fi

# Build the Next.js application
echo "Building application..."
npm run build

# Stop existing PM2 process if running
echo "Managing PM2 process..."
pm2 describe "$APP_NAME" > /dev/null 2>&1 && pm2 stop "$APP_NAME" || true

# Start the application with PM2
echo "Starting application..."
NODE_ENV=production pm2 start npm --name "$APP_NAME" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 startup script (first time only)
echo "Setting up PM2 startup..."
pm2 startup systemd -u appuser --hp /home/appuser | grep -v "PM2" | bash || true

echo ""
echo "==================================="
echo "Deployment Complete!"
echo "==================================="
echo ""
echo "Application is running on http://localhost:2022"
echo ""
echo "PM2 Commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart $APP_NAME - Restart app"
echo "  pm2 stop $APP_NAME    - Stop app"
echo ""
