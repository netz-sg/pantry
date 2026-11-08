# Pantry mit Docker betreiben

## Einrichtung

1. `docker-compose.yml` und `.env.example` herunterladen, `.env.example` in `.env` umbenennen.
2. In `.env` setzen
   - `AUTH_SECRET`, mindestens 32 Zeichen, z. B. `openssl rand -base64 32`
   - `APP_URL`, die Adresse, unter der du Pantry aufrufst, z. B. `https://pantry.example.com`
   - optional `SETUP_TOKEN`, dann muss beim Anlegen des Kontos dieser Code eingegeben werden
3. `docker compose up -d`

Ohne `AUTH_SECRET` startet der Container nicht. Das ist Absicht, es gibt keinen Standardwert mehr.

## Daten

Alles liegt im Volume `pantry-data` unter `/app/data`

- `pantry.db` ist die Datenbank
- `uploads/` enthält Fotos und Profilbilder
- `backups/` enthält die nächtlichen Sicherungen, die letzten 14 bleiben erhalten

### Sicherung von Hand

```bash
docker compose exec pantry node -e "require('better-sqlite3')('/app/data/pantry.db').prepare('VACUUM INTO ?').run('/app/data/backups/manuell.db')"
docker compose cp pantry:/app/data ./pantry-sicherung
```

Alternativ in Pantry unter Einstellungen, Daten. Dort gibt es auch einen Export aller Inhalte als JSON.

### Wiederherstellen

```bash
docker compose down
docker run --rm -v pantry_pantry-data:/data -v "$PWD/pantry-sicherung:/backup" alpine sh -c "cp -a /backup/. /data/"
docker compose up -d
```

## Updates

```bash
docker compose pull
docker compose up -d
```

Datenbank-Migrationen laufen beim Start automatisch. Pantry zeigt unter Einstellungen an, wenn eine neue Version erschienen ist, aktualisiert sich aber nicht selbst. Wer automatische Updates möchte, kann [Watchtower](https://containrrr.dev/watchtower/) nutzen.

## Hinter einem Reverse Proxy

`APP_URL` muss die öffentliche Adresse mit `https://` sein. Beispiel für Caddy

```
pantry.example.com {
  reverse_proxy localhost:3000
}
```

Mit `https://` in `APP_URL` setzt Pantry sichere Cookies.

## Push-Benachrichtigungen

Für Erinnerungen an ablaufende Lebensmittel braucht der Server ein Schlüsselpaar

```bash
npx web-push generate-vapid-keys
```

Die beiden Werte als `VAPID_PUBLIC_KEY` und `VAPID_PRIVATE_KEY` in `.env` eintragen, dazu `VAPID_SUBJECT=mailto:du@example.com`. Push funktioniert nur über `https://`.

## Von Pantry 0.x umsteigen

1. Die alte Datenbank aus dem alten Container holen

   ```bash
   docker cp <alter-container>:/app/data/pantry.db ./pantry-0x.db
   ```

2. Pantry 2.0 starten und das Konto anlegen.
3. Die neue Datenbank kurz herauskopieren, den Import lokal mit einer Kopie dieses Repositorys ausführen und zurückspielen

   ```bash
   docker compose stop pantry
   docker compose cp pantry:/app/data/pantry.db ./pantry.db
   npm install
   DATABASE_PATH=./pantry.db npm run import:legacy -- ./pantry-0x.db
   docker compose cp ./pantry.db pantry:/app/data/pantry.db
   docker compose start pantry
   ```

Übernommen werden Rezepte, Favoriten, Vorrat, offene Einkaufseinträge und der Wochenplan.

## Gesundheitscheck

`GET /api/health` antwortet mit Version und Datenbankzustand. Der Container nutzt das für seinen eigenen Healthcheck.
