#!/bin/bash

# VPS Initial Setup Script for Nisir Bank Portal
# Run this script on your fresh VPS as root or with sudo

set -e

echo "==================================="
echo "VPS Setup for Nisir Bank Portal"
echo "==================================="

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 20.x
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
echo "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Nginx
echo "Installing Nginx..."
apt install -y nginx

# Install PM2 globally
echo "Installing PM2..."
npm install -g pm2

# Install Git
echo "Installing Git..."
apt install -y git

# Create application user
echo "Creating app user..."
if ! id -u appuser > /dev/null 2>&1; then
    useradd -m -s /bin/bash appuser
    echo "User 'appuser' created"
else
    echo "User 'appuser' already exists"
fi

# Create app directory
echo "Creating application directory..."
mkdir -p /var/www/nisir-bank-portal
chown appuser:appuser /var/www/nisir-bank-portal

# Setup PostgreSQL
echo "Setting up PostgreSQL..."
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = 'nisir_bank_portal'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE nisir_bank_portal;"

# Prompt for database password
read -sp "Enter password for database user 'nisir_db_user': " DB_PASSWORD
echo

sudo -u postgres psql -c "SELECT 1 FROM pg_user WHERE usename = 'nisir_db_user'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER nisir_db_user WITH PASSWORD '$DB_PASSWORD';"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nisir_bank_portal TO nisir_db_user;"
sudo -u postgres psql -d nisir_bank_portal -c "GRANT ALL ON SCHEMA public TO nisir_db_user;"

# Configure PostgreSQL to allow password authentication
echo "Configuring PostgreSQL authentication..."
PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

if [ -f "$PG_HBA" ]; then
    # Backup original
    cp "$PG_HBA" "$PG_HBA.backup"
    # Add local connection with md5 auth
    sed -i '/^local.*all.*all.*peer/s/peer/md5/' "$PG_HBA"
    systemctl restart postgresql
fi

# Setup firewall
echo "Configuring firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'

echo ""
echo "==================================="
echo "VPS Setup Complete!"
echo "==================================="
echo ""
echo "Database created: nisir_bank_portal"
echo "Database user: nisir_db_user"
echo "Database password: [the one you entered]"
echo ""
echo "Connection string format:"
echo "DATABASE_URL=postgresql://nisir_db_user:YOUR_PASSWORD@localhost:5432/nisir_bank_portal"
echo ""
echo "Next steps:"
echo "1. Clone your repository to /var/www/nisir-bank-portal"
echo "2. Run the deploy.sh script as appuser"
echo "3. Configure Nginx with the provided config"
echo ""
