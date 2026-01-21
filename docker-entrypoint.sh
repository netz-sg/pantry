#!/bin/sh
set -e

echo "🚀 Starting Pantry..."

# Initialize database if it doesn't exist
if [ ! -f /app/data/pantry.db ]; then
    echo "📦 Initializing database..."
    cd /app
    node drizzle/seed.js
    echo "✅ Database initialized"
else
    echo "✅ Database already exists"
fi

echo "🌐 Starting Next.js server..."
exec node server.js
