#!/bin/bash

# AI Career Coach - Database Restore Script

set -e

echo "♻️  AI Career Coach - Database Restore"
echo "====================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Parse DATABASE_URL
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

# List available backups
BACKUP_DIR="backups"
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: No backups directory found"
    exit 1
fi

echo "📋 Available backups:"
echo ""
ls -lth $BACKUP_DIR/backup_*.sql.gz | nl
echo ""

read -p "Enter backup number to restore (or 'q' to quit): " backup_num

if [ "$backup_num" = "q" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

# Get the selected backup file
BACKUP_FILE=$(ls -t $BACKUP_DIR/backup_*.sql.gz | sed -n "${backup_num}p")

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Error: Invalid backup number"
    exit 1
fi

echo ""
echo "📁 Selected backup: $BACKUP_FILE"
echo "📊 Database: $DB_NAME"
echo ""
echo "⚠️  WARNING: This will REPLACE all data in the database!"
read -p "Type 'RESTORE' to confirm: " confirm

if [ "$confirm" != "RESTORE" ]; then
    echo "❌ Restore cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting restore..."

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "🗜️  Decompressing backup..."
    gunzip -c $BACKUP_FILE > ${BACKUP_FILE%.gz}
    RESTORE_FILE=${BACKUP_FILE%.gz}
else
    RESTORE_FILE=$BACKUP_FILE
fi

# Restore database
echo "♻️  Restoring database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $RESTORE_FILE

if [ $? -eq 0 ]; then
    echo "✅ Restore completed successfully!"

    # Remove decompressed file if it was created
    if [[ $BACKUP_FILE == *.gz ]]; then
        rm $RESTORE_FILE
    fi
else
    echo "❌ Restore failed!"
    exit 1
fi

echo ""
echo "✨ Restore process completed!"
