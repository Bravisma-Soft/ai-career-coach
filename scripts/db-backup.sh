#!/bin/bash

# AI Career Coach - Database Backup Script

set -e

echo "💾 AI Career Coach - Database Backup"
echo "===================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Parse DATABASE_URL to extract connection details
# Format: postgresql://user:password@host:port/database
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    echo "❌ Error: Could not parse DATABASE_URL"
    exit 1
fi

# Create backups directory if it doesn't exist
BACKUP_DIR="backups"
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

echo "📊 Database: $DB_NAME"
echo "🏠 Host: $DB_HOST:$DB_PORT"
echo "📁 Backup file: $BACKUP_FILE"
echo ""

# Perform backup
echo "🚀 Starting backup..."
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "📦 File size: $(du -h $BACKUP_FILE | cut -f1)"

    # Compress backup
    echo "🗜️  Compressing backup..."
    gzip $BACKUP_FILE
    echo "✅ Compressed to: ${BACKUP_FILE}.gz"
    echo "📦 Compressed size: $(du -h ${BACKUP_FILE}.gz | cut -f1)"

    # Keep only last 7 backups
    echo "🧹 Cleaning old backups (keeping last 7)..."
    ls -t $BACKUP_DIR/backup_*.sql.gz | tail -n +8 | xargs -r rm
    echo "✅ Cleanup completed"
else
    echo "❌ Backup failed!"
    exit 1
fi

echo ""
echo "✨ Backup process completed!"
