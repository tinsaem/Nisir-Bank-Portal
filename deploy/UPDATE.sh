#!/bin/bash

# Quick Update Script
# Run this when you push new code changes

set -e

APP_DIR="/var/www/nisir-bank-portal"
APP_NAME="nisir-bank-portal"

echo "==================================="
echo "Quick Update"
echo "==================================="

cd "$APP_DIR"

# Pull latest changes
echo "Pulling latest code..."
git pull origin main

# Install any new dependencies
echo "Updating dependencies..."
npm ci --production=false

# Run migrations (if any)
echo "Running migrations..."
npx prisma migrate deploy

# Rebuild
echo "Building application..."
npm run build

# Restart PM2
echo "Restarting application..."
pm2 restart "$APP_NAME"

echo ""
echo "Update complete! Application restarted."
echo ""
