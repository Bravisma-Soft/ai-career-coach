#!/bin/bash

# AI Career Coach - Database Migration Script
# This script helps with database migrations

set -e

echo "🔧 AI Career Coach - Database Migration Helper"
echo "=============================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with DATABASE_URL configured"
    exit 1
fi

# Function to display menu
show_menu() {
    echo "Select an option:"
    echo "1) Create a new migration"
    echo "2) Apply pending migrations (development)"
    echo "3) Apply pending migrations (production)"
    echo "4) Reset database (WARNING: deletes all data)"
    echo "5) Generate Prisma Client"
    echo "6) View migration status"
    echo "7) Seed database with test data"
    echo "8) Open Prisma Studio"
    echo "9) Exit"
    echo ""
}

# Function to create migration
create_migration() {
    echo "📝 Creating new migration..."
    read -p "Enter migration name: " migration_name

    if [ -z "$migration_name" ]; then
        echo "❌ Migration name cannot be empty"
        return
    fi

    npx prisma migrate dev --name "$migration_name"
    echo "✅ Migration created successfully"
}

# Function to apply migrations (development)
apply_migrations_dev() {
    echo "🚀 Applying pending migrations (development)..."
    npx prisma migrate dev
    echo "✅ Migrations applied successfully"
}

# Function to apply migrations (production)
apply_migrations_prod() {
    echo "⚠️  WARNING: This will apply migrations to production database"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        echo "❌ Migration cancelled"
        return
    fi

    echo "🚀 Applying pending migrations (production)..."
    npx prisma migrate deploy
    echo "✅ Migrations applied successfully"
}

# Function to reset database
reset_database() {
    echo "⚠️  WARNING: This will DELETE ALL DATA in the database"
    read -p "Are you absolutely sure? Type 'DELETE' to confirm: " confirm

    if [ "$confirm" != "DELETE" ]; then
        echo "❌ Reset cancelled"
        return
    fi

    echo "🗑️  Resetting database..."
    npx prisma migrate reset --force
    echo "✅ Database reset successfully"
}

# Function to generate Prisma Client
generate_client() {
    echo "⚙️  Generating Prisma Client..."
    npx prisma generate
    echo "✅ Prisma Client generated successfully"
}

# Function to view migration status
view_status() {
    echo "📊 Migration Status:"
    npx prisma migrate status
}

# Function to seed database
seed_database() {
    echo "🌱 Seeding database with test data..."
    npx ts-node prisma/seed.ts
    echo "✅ Database seeded successfully"
}

# Function to open Prisma Studio
open_studio() {
    echo "🎨 Opening Prisma Studio..."
    npx prisma studio
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice [1-9]: " choice
    echo ""

    case $choice in
        1) create_migration ;;
        2) apply_migrations_dev ;;
        3) apply_migrations_prod ;;
        4) reset_database ;;
        5) generate_client ;;
        6) view_status ;;
        7) seed_database ;;
        8) open_studio ;;
        9)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac

    echo ""
    echo "Press Enter to continue..."
    read
    clear
done
