# Pantry Auto-Update Script for Windows
# This script checks for the update trigger file and rebuilds the container

$TriggerFile = "trigger-update.txt"

Write-Host "🔍 Pantry Update Monitor gestartet..." -ForegroundColor Cyan

while ($true) {
    if (Test-Path $TriggerFile) {
        Write-Host "🚀 Update-Trigger erkannt! Starte Update-Prozess..." -ForegroundColor Green
        
        # Remove trigger file
        Remove-Item $TriggerFile
        
        # Pull latest changes
        Write-Host "📥 Pulling latest changes from git..." -ForegroundColor Yellow
        git pull origin main
        
        # Rebuild and restart container
        Write-Host "🔨 Rebuilding Docker container..." -ForegroundColor Yellow
        docker-compose down
        docker-compose up -d --build
        
        Write-Host "✅ Update abgeschlossen!" -ForegroundColor Green
    }
    
    # Check every 10 seconds
    Start-Sleep -Seconds 10
}
