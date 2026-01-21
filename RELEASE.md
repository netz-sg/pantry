# 🚀 Pantry Release Script

Dieses Script hilft dir beim Erstellen von strukturierten Git Commits und GitHub Releases mit Release Notes.

## 📦 Features

- ✨ Interaktive Commit-Typ Auswahl (feat, fix, docs, style, refactor, perf, test, chore)
- 📝 Strukturierte Commit Messages
- 🏷️  Optional: Automatische Release Tags mit Versionierung
- 📋 Release Notes für Tags
- 🚀 Automatisches Pushen zu GitHub
- 🎨 Emoji-Support für bessere Commit-Übersicht

## 🛠️ Verwendung

### Windows (PowerShell)
```powershell
.\release.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x release.sh
./release.sh
```

## 📖 Workflow

1. **Änderungen prüfen**: Das Script zeigt alle geänderten Dateien an
2. **Commit-Typ wählen**: Wähle aus 8 verschiedenen Commit-Typen
3. **Message eingeben**: Kurze Beschreibung der Änderungen
4. **Optional: Details**: Längere Beschreibung hinzufügen
5. **Optional: Release Tag**: Version erhöhen und Release Notes hinzufügen
6. **Push**: Zu GitHub pushen oder lokal behalten

## 🏷️ Commit-Typen

| Typ | Emoji | Verwendung |
|-----|-------|-----------|
| `feat` | ✨ | Neues Feature |
| `fix` | 🐛 | Bug Fix |
| `docs` | 📝 | Dokumentation |
| `style` | 💄 | UI/Style Änderungen |
| `refactor` | ♻️ | Code Refactoring |
| `perf` | ⚡ | Performance Verbesserung |
| `test` | ✅ | Tests |
| `chore` | 🔧 | Build/Config |

## 📝 Beispiel

```bash
$ .\release.ps1

🚀 Pantry Release Tool
======================

📝 Folgende Änderungen wurden gefunden:
M components/settings/settings-form.tsx
M app/(app)/settings/page.tsx

Wähle den Commit-Typ:
  1. ✨ feat     - Neues Feature
  2. 🐛 fix      - Bug Fix
  ...

Auswahl (1-8): 1

📄 Commit Message eingeben:
Message: Add update test card to settings

📋 Detaillierte Beschreibung (optional):
Beschreibung: Added interactive test card for update system

💾 Erstelle Commit...
✓ Commit erstellt: ✨ Add update test card to settings

🏷️  Release Tag erstellen? (j/N): j
   Aktuelle Version: v0.1.0

Neue Version eingeben (z.B. 0.2.0): 0.2.0

📝 Release Notes (optional):
Release Notes: - Added update test functionality
- Improved settings UI
- Fixed design issues

✓ Release Tag v0.2.0 erstellt

🚀 Zu GitHub pushen? (J/n): j

📤 Pushe zu GitHub...
✓ Commits erfolgreich gepusht
✓ Tags erfolgreich gepusht

🎉 Fertig! Änderungen sind auf GitHub.
```

## 🔍 Was passiert?

1. **Staging**: Alle Änderungen werden automatisch gestaged (`git add .`)
2. **Commit**: Strukturierter Commit mit gewähltem Typ wird erstellt
3. **Tag** (optional): 
   - `package.json` wird mit neuer Version aktualisiert
   - Git Tag mit Release Notes wird erstellt
4. **Push**: Commits und Tags werden zu GitHub gepusht

## 💡 Tipps

- Verwende `feat` für neue Features
- Verwende `fix` für Bug-Fixes
- Erstelle Release Tags für wichtige Versionen
- Schreibe aussagekräftige Release Notes für User

## 🔗 Links

- Repository: https://github.com/netz-sg/pantry
- Conventional Commits: https://www.conventionalcommits.org/
