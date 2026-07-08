#!/bin/bash

# Complete Database Setup Script
# Run this as root on your VPS

set -e

DB_NAME="nisir_bank_portal"
DB_USER="nisir_db_user"

echo "==================================="
echo "Setting Up PostgreSQL Database"
echo "==================================="

# Prompt for password
read -sp "Enter password for database user '$DB_USER': " DB_PASSWORD
echo ""

# Create database user
echo "Creating database user..."
sudo -u postgres psql -c "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# Create database
echo "Creating database..."
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

# Grant all privileges
echo "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"

echo ""
echo "==================================="
echo "Database Setup Complete!"
echo "==================================="
echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Password: [the one you entered]"
echo ""
echo "Your DATABASE_URL should be:"
echo "DATABASE_URL=\"postgresql://$DB_USER:YOUR_PASSWORD@localhost:5432/$DB_NAME\""
echo ""
echo "Make sure to add this to your .env.production file!"
echo ""
