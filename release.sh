#!/bin/bash
# Pantry Release Script for Linux/Mac
# Dieses Script hilft beim Erstellen von strukturierten Commits und Releases

echo "🚀 Pantry Release Tool"
echo "======================"
echo ""

# Git Status prüfen
status=$(git status --porcelain)
if [ -z "$status" ]; then
    echo "✓ Keine Änderungen zum Committen gefunden."
    exit 0
fi

echo "📝 Folgende Änderungen wurden gefunden:"
git status --short
echo ""

# Alle Änderungen stagen
echo "📦 Stage alle Änderungen..."
git add .

# Commit-Typ auswählen
echo ""
echo "Wähle den Commit-Typ:"
echo "  1. ✨ feat     - Neues Feature"
echo "  2. 🐛 fix      - Bug Fix"
echo "  3. 📝 docs     - Dokumentation"
echo "  4. 💄 style    - UI/Style Änderungen"
echo "  5. ♻️  refactor - Code Refactoring"
echo "  6. ⚡ perf     - Performance Verbesserung"
echo "  7. ✅ test     - Tests hinzufügen/ändern"
echo "  8. 🔧 chore    - Build/Config Änderungen"
echo ""

while true; do
    read -p "Auswahl (1-8): " typeChoice
    if [[ "$typeChoice" =~ ^[1-8]$ ]]; then
        break
    fi
done

case $typeChoice in
    1) type="feat"; emoji="✨" ;;
    2) type="fix"; emoji="🐛" ;;
    3) type="docs"; emoji="📝" ;;
    4) type="style"; emoji="💄" ;;
    5) type="refactor"; emoji="♻️" ;;
    6) type="perf"; emoji="⚡" ;;
    7) type="test"; emoji="✅" ;;
    8) type="chore"; emoji="🔧" ;;
esac

# Commit Message erfassen
echo ""
echo "📄 Commit Message eingeben:"
echo "   (kurze Beschreibung der Änderungen)"
read -p "Message: " message

while [ -z "$message" ]; do
    echo "⚠️  Message darf nicht leer sein!"
    read -p "Message: " message
done

# Optional: Detaillierte Beschreibung
echo ""
echo "📋 Detaillierte Beschreibung (optional, Enter zum Überspringen):"
read -p "Beschreibung: " description

# Commit erstellen
commitMessage="$type: $message"
if [ -n "$description" ]; then
    commitMessage="$commitMessage

$description"
fi

echo ""
echo "💾 Erstelle Commit..."
git commit -m "$commitMessage"

if [ $? -ne 0 ]; then
    echo "❌ Commit fehlgeschlagen!"
    exit 1
fi

echo "✓ Commit erstellt: $emoji $message"

# Release Tag erstellen?
echo ""
read -p "🏷️  Release Tag erstellen? (j/N): " createTag

if [ "$createTag" = "j" ] || [ "$createTag" = "J" ]; then
    # Aktuelle Version aus package.json lesen
    currentVersion=$(node -p "require('./package.json').version")
    
    echo "   Aktuelle Version: v$currentVersion"
    echo ""
    echo "Neue Version eingeben (z.B. 0.2.0):"
    read -p "Version: " newVersion
    
    if [ -n "$newVersion" ]; then
        # Version in package.json aktualisieren
        node -e "const pkg=require('./package.json');pkg.version='$newVersion';require('fs').writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\n')"
        
        echo ""
        echo "📝 Release Notes (optional, Enter zum Überspringen):"
        echo "   (Beschreibung der Änderungen in dieser Version)"
        read -p "Release Notes: " releaseNotes
        
        # Commit für Version-Update
        git add package.json
        git commit -m "chore: bump version to v$newVersion"
        
        # Tag erstellen
        if [ -n "$releaseNotes" ]; then
            git tag -a "v$newVersion" -m "Release v$newVersion

$releaseNotes"
        else
            git tag -a "v$newVersion" -m "Release v$newVersion"
        fi
        
        echo "✓ Release Tag v$newVersion erstellt"
    fi
fi

# Zu GitHub pushen
echo ""
read -p "🚀 Zu GitHub pushen? (J/n): " pushNow

if [ "$pushNow" != "n" ] && [ "$pushNow" != "N" ]; then
    echo ""
    echo "📤 Pushe zu GitHub..."
    
    # Branch ermitteln
    branch=$(git branch --show-current)
    
    # Push commits
    git push origin $branch
    
    if [ $? -eq 0 ]; then
        echo "✓ Commits erfolgreich gepusht"
        
        # Push tags wenn vorhanden
        if git tag --points-at HEAD >/dev/null 2>&1; then
            git push origin --tags
            if [ $? -eq 0 ]; then
                echo "✓ Tags erfolgreich gepusht"
            fi
        fi
    else
        echo "❌ Push fehlgeschlagen!"
        exit 1
    fi
    
    echo ""
    echo "🎉 Fertig! Änderungen sind auf GitHub."
    echo "   Repository: https://github.com/netz-sg/pantry"
else
    echo ""
    echo "✓ Änderungen wurden committed, aber nicht gepusht."
    echo "   Push später mit: git push origin $(git branch --show-current)"
fi

echo ""
