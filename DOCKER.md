# Pantry - Docker Deployment

## Schnellstart

### 1. Repository klonen
```bash
git clone <your-repo-url>
cd pantry
```

### 2. Environment Variables (optional)
Erstellen Sie eine `.env` Datei im Root-Verzeichnis:

```env
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

Oder nutzen Sie die Standardwerte aus `docker-compose.yml`.

### 3. Docker Container starten

```bash
docker-compose up -d
```

Die Anwendung ist dann unter http://localhost:3000 erreichbar.

### 4. Ersten Benutzer registrieren

Nach dem ersten Start:
1. Öffnen Sie http://localhost:3000
2. Sie werden automatisch zur Anmeldeseite weitergeleitet
3. Klicken Sie auf "Jetzt registrieren"
4. Erstellen Sie Ihren Account mit:
   - Name
   - Benutzername (mindestens 3 Zeichen)
   - Passwort (mindestens 8 Zeichen)

**WICHTIG:** Nach der Registrierung des ersten Benutzers ist keine weitere Registrierung möglich. Dies ist eine Single-User-Anwendung.

## Docker Befehle

### Container stoppen
```bash
docker-compose down
```

### Container neu starten
```bash
docker-compose restart
```

### Logs anzeigen
```bash
docker-compose logs -f
```

### Volumes löschen (Datenbank zurücksetzen)
```bash
docker-compose down -v
```

⚠️ **Warnung:** Dies löscht alle Daten!

## Datenbank

Die Anwendung verwendet SQLite. Die Daten werden in einem Docker Volume gespeichert:
- `pantry-data`: Datenbank-Dateien
- `pantry-uploads`: Hochgeladene Bilder (Profilbilder etc.)

**Hinweis**: Hochgeladene Bilder werden über die API-Route `/api/uploads/[filename]` serviert, nicht direkt aus dem `public` Ordner. Dies ist notwendig für Next.js Standalone Builds in Docker.

## Ports

Die Anwendung läuft standardmäßig auf Port 3000. Um einen anderen Port zu verwenden, ändern Sie in `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Ändert den externen Port auf 8080
```

## Produktion

Für einen Produktionseinsatz empfehlen wir:

1. Setzen Sie einen sicheren `AUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

2. Verwenden Sie einen Reverse Proxy (nginx, traefik) mit SSL
3. Regelmäßige Backups der Docker Volumes erstellen

### Backup erstellen
```bash
docker run --rm -v pantry-data:/data -v $(pwd):/backup alpine tar czf /backup/pantry-backup.tar.gz /data
```

### Backup wiederherstellen
```bash
docker run --rm -v pantry-data:/data -v $(pwd):/backup alpine tar xzf /backup/pantry-backup.tar.gz -C /
```

## Troubleshooting

### Container startet nicht
```bash
docker-compose logs pantry
```

### Datenbank zurücksetzen
```bash
docker-compose down -v
docker-compose up -d
```

### Port bereits belegt
Ändern Sie den Port in `docker-compose.yml` oder stoppen Sie den Dienst, der Port 3000 verwendet.
