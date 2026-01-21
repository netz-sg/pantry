#!/bin/sh
set -e

echo "🚀 Starting Pantry..."

# Check if AUTH_SECRET is set
if [ -z "$AUTH_SECRET" ]; then
    echo "⚠️  WARNING: AUTH_SECRET is not set!"
    echo "Setting default AUTH_SECRET..."
    export AUTH_SECRET="H61bRLTkh50J7f2NlD2W6eEIEausK+2Gxj2q5PaiFEI="
fi

echo "✅ AUTH_SECRET is configured"

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
