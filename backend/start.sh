#!/bin/sh
set -e

echo "🚀 Starting Dexmate Backend..."

# Ensure data directory exists and has correct permissions
echo "📁 Setting up data directory..."
mkdir -p /app/data
chmod 777 /app/data

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete"

# Start the application
echo "🎯 Starting Node.js server..."
exec npm start
