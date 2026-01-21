#!/bin/bash

# Pantry Auto-Update Script
# This script checks for the update trigger file and rebuilds the container

TRIGGER_FILE="/tmp/trigger-update"

echo "🔍 Pantry Update Monitor gestartet..."

while true; do
  if [ -f "$TRIGGER_FILE" ]; then
    echo "🚀 Update-Trigger erkannt! Starte Update-Prozess..."
    
    # Remove trigger file
    rm "$TRIGGER_FILE"
    
    # Pull latest changes
    echo "📥 Pulling latest changes from git..."
    git pull origin main
    
    # Rebuild and restart container
    echo "🔨 Rebuilding Docker container..."
    docker-compose up -d --build
    
    echo "✅ Update abgeschlossen!"
  fi
  
  # Check every 10 seconds
  sleep 10
done
