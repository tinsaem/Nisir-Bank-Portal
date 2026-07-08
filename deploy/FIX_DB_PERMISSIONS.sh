#!/bin/bash

# Fix PostgreSQL Database Permissions
# Run this as root on your VPS

set -e

DB_NAME="nisir_bank_portal"
DB_USER="nisir_db_user"

echo "==================================="
echo "Fixing Database Permissions"
echo "==================================="

# Grant all privileges on database
echo "Granting database privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Grant schema privileges
echo "Granting schema privileges..."
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

# Grant future objects privileges
echo "Granting privileges on future objects..."
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"

# Make the user owner of the database (this fixes most permission issues)
echo "Setting database owner..."
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"

echo ""
echo "==================================="
echo "Database Permissions Fixed!"
echo "==================================="
echo ""
echo "Now you can run:"
echo "  npx prisma migrate deploy"
echo ""
