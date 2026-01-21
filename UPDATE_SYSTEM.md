# 🔄 Auto-Update System

Pantry verfügt über ein integriertes Update-System, das automatisch nach neuen Versionen sucht und diese direkt aus dem Dashboard heraus installieren kann.

## ✨ Features

- **Automatische Update-Erkennung**: Die App prüft alle 5 Minuten auf neue Versionen
- **Update-Banner**: Zeigt eine Benachrichtigung im Dashboard wenn Updates verfügbar sind
- **Ein-Klick-Update**: Updates können direkt aus der App heraus installiert werden
- **Toast-Notifications**: Erfolgs- und Fehlermeldungen werden elegant angezeigt

## 🚀 Verwendung

### In Docker (Empfohlen)

1. **Starte den Update-Monitor** in einem separaten Terminal:
   ```powershell
   # Windows PowerShell
   .\update-monitor.ps1
   ```
   
   ```bash
   # Linux/Mac
   ./update-monitor.sh
   ```

2. **Öffne das Dashboard**: Wenn ein Update verfügbar ist, erscheint automatisch ein blaues Banner oben

3. **Klicke auf "Jetzt aktualisieren"**: Das Update wird automatisch heruntergeladen und installiert

4. **Fertig!**: Die Anwendung wird automatisch neu geladen

### Lokale Entwicklung

Ohne Docker:
- Klicke einfach auf "Jetzt aktualisieren" im Update-Banner
- Das Update wird heruntergeladen
- Starte die Anwendung manuell neu mit `npm run dev`

## 🛠️ Manuelle Updates

Du kannst Updates auch manuell durchführen:

```bash
# 1. Neueste Version herunterladen
git pull origin main

# 2. Container neu bauen und starten
docker-compose down
docker-compose up -d --build
```

## ⚙️ Konfiguration

Das Update-System prüft:
- Die aktuelle Version aus `package.json`
- Neue Commits im Git-Repository
- Die Version auf dem `main` Branch

## 📋 Voraussetzungen

- Git-Repository muss korrekt konfiguriert sein
- Bei Docker: Update-Monitor muss laufen
- Internet-Verbindung zum Git-Remote

## 🔐 Sicherheit

- Nur authentifizierte Benutzer können Updates auslösen
- Updates werden nur vom offiziellen Repository gezogen
- Automatische Benachrichtigung bei Fehlern

## 💡 Tipps

- **Wichtig**: Bei Docker den Update-Monitor im Hintergrund laufen lassen
- Updates werden nur angezeigt wenn tatsächlich neue Commits verfügbar sind
- Das Update-Banner kann temporär ausgeblendet werden (erscheint beim nächsten Reload wieder)

## 🐛 Troubleshooting

**Update-Banner erscheint nicht:**
- Stelle sicher dass du mit dem Internet verbunden bist
- Prüfe ob `git fetch` funktioniert
- Überprüfe die Browser-Console auf Fehler

**Update schlägt fehl:**
- Bei Docker: Ist der Update-Monitor aktiv?
- Prüfe die Git-Konfiguration
- Stelle sicher dass keine lokalen Änderungen vorhanden sind

**Update-Monitor funktioniert nicht:**
- Überprüfe die Berechtigungen der Script-Datei
- Bei Linux: `chmod +x update-monitor.sh`
- Bei Windows: Führe PowerShell als Administrator aus
