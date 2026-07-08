#!/bin/bash

# Database Backup Script
# Add to crontab for automatic backups
# Example: 0 2 * * * /var/www/nisir-bank-portal/deploy/backup.sh

set -e

BACKUP_DIR="/var/backups/nisir-bank-portal"
DB_NAME="nisir_bank_portal"
DB_USER="nisir_db_user"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"
KEEP_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."

# Dump database
PGPASSWORD="$DB_PASSWORD" pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

echo "Backup created: ${BACKUP_FILE}.gz"

# Remove backups older than KEEP_DAYS
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$KEEP_DAYS -delete

echo "Old backups cleaned up (kept last $KEEP_DAYS days)"
echo "Backup complete!"
