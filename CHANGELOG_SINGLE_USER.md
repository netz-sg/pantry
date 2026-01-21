# Änderungen für Single-User Docker Deployment

## Zusammenfassung

Die Pantry-Anwendung wurde für den Single-User-Betrieb mit Docker Compose umgebaut:

## 1. ✅ Datenbank bereinigt
- **Schema geändert**: `email` ist jetzt optional, neues Feld `username` (unique, required)
- **Seed-Datei geleert**: Keine Demo-Daten mehr, Datenbank startet leer

## 2. ✅ Docker Compose Setup
Neue Dateien:
- `Dockerfile` - Multi-stage Build für optimale Image-Größe
- `docker-compose.yml` - Container-Orchestrierung mit Volumes
- `.dockerignore` - Optimierung für Build-Performance
- `DOCKER.md` - Komplette Dokumentation für Deployment

Features:
- SQLite Datenbank mit persistentem Volume
- Upload-Ordner mit persistentem Volume
- Healthcheck für Container-Monitoring
- Standalone Next.js Build

## 3. ✅ Auth-System umgestellt: Username statt Email
Geänderte Dateien:
- `db/schema.ts` - Username-Feld hinzugefügt
- `lib/auth.ts` - NextAuth auf Username umgestellt
- `lib/validations.ts` - Validation Schemas angepasst
- `app/actions/auth.ts` - Login/Register auf Username
- `app/(auth)/signin/page.tsx` - UI auf Username
- `app/(auth)/signup/page.tsx` - UI auf Username

## 4. ✅ Single-User Registrierung
- Neue Datei: `app/actions/registration.ts` - Check ob Registrierung erlaubt
- `app/actions/auth.ts` - Registrierung blockiert wenn User existiert
- `app/(auth)/signup/page.tsx` - Redirect zu Signin wenn User existiert
- `app/(auth)/signin/page.tsx` - Registrierungs-Link nur wenn erlaubt

## 5. ✅ Settings-Page bereinigt
Geänderte Dateien:
- `components/settings/settings-form.tsx` - Email-Feld entfernt
- `app/(app)/settings/page.tsx` - Email aus UserData entfernt

## Wichtige Änderungen

### Datenbank-Migration
Die Datenbank wurde komplett geleert. Beim ersten Start:
1. Datenbank ist leer
2. Erster Benutzer muss sich registrieren
3. Nach erster Registrierung: Keine weiteren Registrierungen möglich

### Login-Credentials
- **Früher**: Email + Passwort
- **Jetzt**: Benutzername + Passwort

### Registrierung
- **Ein User pro Installation**
- Registrierungs-Seite automatisch blockiert nach erstem User
- Registrierungs-Link verschwindet vom Login

## Deployment

### Lokale Entwicklung
```bash
npm run dev
```

### Docker Deployment
```bash
docker-compose up -d
```

### Erste Schritte
1. Container starten
2. http://localhost:3000 öffnen
3. Ersten Account registrieren (Name, Benutzername, Passwort)
4. Fertig! Keine weiteren Registrierungen möglich

## Technische Details

### Docker Volumes
- `pantry-data`: SQLite Datenbank
- `pantry-uploads`: Hochgeladene Bilder

### Environment Variables
- `AUTH_SECRET`: NextAuth Secret (default vorhanden)
- `NEXTAUTH_URL`: URL der Anwendung (default: localhost:3000)
- `DATABASE_URL`: SQLite Pfad (default: file:/app/data/pantry.db)

### Ports
- Standard: 3000
- Anpassbar in docker-compose.yml

## Backup & Recovery

Siehe `DOCKER.md` für:
- Backup-Befehle
- Wiederherstellung
- Troubleshooting
