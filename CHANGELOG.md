# Änderungen

## 2.0.0

Pantry wurde von Grund auf neu gebaut.

### Neu

- Komplett neues Design „Kino“ mit großen Fotos, Bildreihen und schwebender Glas-Navigation, dunkel und hell
- Startseite „Heute“ mit dem nächsten Gericht, Tagesplan, kochbaren Rezepten und bald ablaufenden Lebensmitteln
- Vorratsabgleich für jede Zutat, inklusive Mengen und Einheitenumrechnung
- Kochmodus mit Timern pro Schritt und Bildschirm, der anbleibt
- Nach dem Kochen werden Zutaten auf Wunsch vom Vorrat abgezogen, mit Kochverlauf und Bewertung
- Einkaufsliste nach Gängen, Schnelleingabe mit Mengenerkennung, Zusammenfassen gleicher Zutaten, Abgehaktes wandert in den Vorrat
- Wochenplan mit Ziehen und Ablegen, freien Einträgen, Woche kopieren und Kalender-Export
- Vorrat mit Lagerorten, Füllstand, Mindestmengen und Barcode-Suche über Open Food Facts
- Rezeptfotos werden hochgeladen und lokal gespeichert, Import übernimmt das Bild mit
- Import von Rezepten per Link (JSON-LD und Microdata) und aus Paprika
- Volltextsuche über Titel, Zutaten, Tags und Notizen
- Befehlspalette mit ⌘K
- Installierbar als App, Einkaufsliste und Vorrat auch offline lesbar, Push-Erinnerungen für Ablaufdaten
- Export und Import aller Daten als JSON, nächtliche Datenbank-Sicherung
- REST-API unter `/api/v1` mit Bearer-Token und OpenAPI-Beschreibung
- Health-Endpunkt `/api/health`

### Sicherheit

- Kein öffentlich bekannter Standardschlüssel mehr, ohne `AUTH_SECRET` startet Pantry nicht
- Anmeldung über Better-Auth mit Begrenzung der Fehlversuche, ein Passwortwechsel meldet alle Geräte ab
- Registrierung nur bei der Ersteinrichtung, optional mit `SETUP_TOKEN`
- Rezept-Import kann nicht mehr ins lokale Netz greifen
- Hochgeladene Bilder werden geprüft und neu kodiert
- Sicherheitsheader (CSP, HSTS, Frame-Schutz)
- Selbst-Update per `git pull` aus der App entfernt

### Technik

- Next.js 16, React 19, Tailwind 4, Node 24 im Container
- Eine Schemaquelle mit echten Migrationen, Fremdschlüssel mit Löschregeln, Indizes und Transaktionen
- Gemeinsame Service-Schicht für Web und API, Eingaben überall mit Zod geprüft
- Unit-Tests mit Vitest, End-to-End-Tests mit Playwright, CI und Release-Workflow
- Fertiges Image auf GHCR für amd64 und arm64

### Umstieg von 0.x

Alte Daten lassen sich mit `npm run import:legacy` übernehmen, siehe [DOCKER.md](DOCKER.md).
