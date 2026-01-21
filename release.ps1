#!/usr/bin/env pwsh
# Pantry Release Script
# Dieses Script hilft beim Erstellen von strukturierten Commits und Releases

Write-Host "Pantry Release Tool" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Git Status pruefen
$status = git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "Keine Aenderungen zum Committen gefunden." -ForegroundColor Green
    exit 0
}

Write-Host "Folgende Aenderungen wurden gefunden:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Alle Aenderungen stagen
Write-Host "Stage alle Aenderungen..." -ForegroundColor Cyan
git add .

# Commit-Typ auswaehlen
Write-Host ""
Write-Host "Waehle den Commit-Typ:" -ForegroundColor Cyan
Write-Host "  1. feat     - Neues Feature" -ForegroundColor Green
Write-Host "  2. fix      - Bug Fix" -ForegroundColor Red
Write-Host "  3. docs     - Dokumentation" -ForegroundColor Blue
Write-Host "  4. style    - UI/Style Aenderungen" -ForegroundColor Magenta
Write-Host "  5. refactor - Code Refactoring" -ForegroundColor Yellow
Write-Host "  6. perf     - Performance Verbesserung" -ForegroundColor Cyan
Write-Host "  7. test     - Tests hinzufuegen/aendern" -ForegroundColor White
Write-Host "  8. chore    - Build/Config Aenderungen" -ForegroundColor DarkGray
Write-Host ""

do {
    $typeChoice = Read-Host "Auswahl (1-8)"
} while ($typeChoice -notmatch '^[1-8]$')

$types = @{
    "1" = @{ type = "feat"; description = "Feature" }
    "2" = @{ type = "fix"; description = "Bug Fix" }
    "3" = @{ type = "docs"; description = "Dokumentation" }
    "4" = @{ type = "style"; description = "Style" }
    "5" = @{ type = "refactor"; description = "Refactoring" }
    "6" = @{ type = "perf"; description = "Performance" }
    "7" = @{ type = "test"; description = "Tests" }
    "8" = @{ type = "chore"; description = "Chore" }
}

$selectedType = $types[$typeChoice]

# Commit Message erfassen
Write-Host ""
Write-Host "Commit Message eingeben:" -ForegroundColor Cyan
Write-Host "   (kurze Beschreibung der Aenderungen)" -ForegroundColor DarkGray
$message = Read-Host "Message"

while ([string]::IsNullOrWhiteSpace($message)) {
    Write-Host "Message darf nicht leer sein!" -ForegroundColor Red
    $message = Read-Host "Message"
}

# Optional: Detaillierte Beschreibung
Write-Host ""
Write-Host "Detaillierte Beschreibung (optional, Enter zum Ueberspringen):" -ForegroundColor Cyan
$description = Read-Host "Beschreibung"

# Commit erstellen
$commitMessage = "$($selectedType.type): $message"
if (![string]::IsNullOrWhiteSpace($description)) {
    $commitMessage += "`n`n$description"
}

Write-Host ""
Write-Host "Erstelle Commit..." -ForegroundColor Cyan
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

Write-Host "Commit erstellt: $message" -ForegroundColor Green

# Release Tag erstellen?
Write-Host ""
$createTag = Read-Host "Release Tag erstellen? (j/N)"

if ($createTag -eq "j" -or $createTag -eq "J") {
    # Aktuelle Version aus package.json lesen
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    $currentVersion = $packageJson.version
    
    Write-Host "   Aktuelle Version: v$currentVersion" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Neue Version eingeben (z.B. 0.2.0):" -ForegroundColor Cyan
    $newVersion = Read-Host "Version"
    
    if (![string]::IsNullOrWhiteSpace($newVersion)) {
        # Version in package.json aktualisieren
        $packageJson.version = $newVersion
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
        
        Write-Host ""
        Write-Host "Release Notes (optional, Enter zum Ueberspringen):" -ForegroundColor Cyan
        Write-Host "   (Beschreibung der Aenderungen in dieser Version)" -ForegroundColor DarkGray
        $releaseNotes = Read-Host "Release Notes"
        
        # Commit fuer Version-Update
        git add package.json
        git commit -m "chore: bump version to v$newVersion"
        
        # Tag erstellen
        if (![string]::IsNullOrWhiteSpace($releaseNotes)) {
            git tag -a "v$newVersion" -m "Release v$newVersion`n`n$releaseNotes"
        } else {
            git tag -a "v$newVersion" -m "Release v$newVersion"
        }
        
        Write-Host "Release Tag v$newVersion erstellt" -ForegroundColor Green
    }
}

# Zu GitHub pushen
Write-Host ""
$pushNow = Read-Host "Zu GitHub pushen? (J/n)"

if ($pushNow -ne "n" -and $pushNow -ne "N") {
    Write-Host ""
    Write-Host "Pushe zu GitHub..." -ForegroundColor Cyan
    
    # Branch ermitteln
    $branch = git branch --show-current
    
    # Push commits
    git push origin $branch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Commits erfolgreich gepusht" -ForegroundColor Green
        
        # Push tags wenn vorhanden
        $hasTags = git tag --points-at HEAD
        if (![string]::IsNullOrEmpty($hasTags)) {
            git push origin --tags
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Tags erfolgreich gepusht" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "Push fehlgeschlagen!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Fertig! Aenderungen sind auf GitHub." -ForegroundColor Green
    Write-Host "   Repository: https://github.com/netz-sg/pantry" -ForegroundColor DarkGray
} else {
    Write-Host ""
    Write-Host "Aenderungen wurden committed, aber nicht gepusht." -ForegroundColor Yellow
    Write-Host "   Push spaeter mit: git push origin $(git branch --show-current)" -ForegroundColor DarkGray
}

Write-Host ""