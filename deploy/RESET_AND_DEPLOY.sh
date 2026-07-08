#!/bin/bash

# Complete Database Reset and Deployment
# Run this on your VPS to fix all database issues

set -e

APP_DIR="/var/www/Nisir-Bank-Portal"
DB_NAME="nisir_bank_portal"
DB_USER="nisir_db_user"

echo "==================================="
echo "Complete Database Reset & Deploy"
echo "==================================="

cd "$APP_DIR"

# 1. Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "ERROR: .env.production not found!"
    echo "Create it with: DATABASE_URL=postgresql://nisir_db_user:PASSWORD@localhost:5432/nisir_bank_portal"
    exit 1
fi

echo "Step 1: Dropping existing database..."
sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "Step 2: Creating fresh database..."
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo "Step 3: Granting privileges..."
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"

echo "Step 4: Cleaning old Prisma artifacts..."
rm -rf src/generated/prisma
rm -rf node_modules/.prisma

echo "Step 5: Generating Prisma Client..."
npx prisma generate

echo "Step 6: Running migrations (this creates all tables)..."
npx prisma migrate deploy

echo "Step 7: Verifying database schema..."
echo "Checking if tables were created..."
sudo -u postgres psql -d $DB_NAME -c "\dt" | grep HrEmployee || {
    echo "ERROR: Tables were not created!"
    echo "Trying alternative migration method..."
    npx prisma db push --accept-data-loss
}

echo "Step 8: Seeding database..."
npm run seed

echo "Step 9: Building application..."
NODE_ENV=production npm run build

echo ""
echo "==================================="
echo "Database Reset Complete!"
echo "==================================="
echo ""
echo "Now start the app with:"
echo "  pm2 stop nisir-bank-portal || true"
echo "  pm2 delete nisir-bank-portal || true"
echo "  pm2 start npm --name nisir-bank-portal -- start"
echo "  pm2 save"
echo ""
