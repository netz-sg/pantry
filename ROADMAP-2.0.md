# Pantry 2.0 Aufgabenliste

**Stand nach dem Umbau.** Alles mit Haken ist umgesetzt und getestet (38 Unit-Tests, 19 End-to-End-Tests). Offene Punkte sind ohne Haken markiert.

Stand 8. November 2026, Basis ist Version 0.2.8 (Commit b2e9fd9).
Designvorschlag liegt als Artefakt vor und lokal unter `docs/redesign-2.0.html`.

Die Reihenfolge der Phasen ist bewusst gewählt. Phase 0 sollte vor allem anderen passieren, Phase 1 bis 3 bilden das Fundament, auf dem das neue Design aufsetzt.

## Entscheidungen

- [x] Auth-Bibliothek festlegen. Gewählt Better-Auth. Empfehlung Better-Auth, weil es Sessions, Bearer-Tokens für die App und Rate-Limiting in einem Paket mitbringt und NextAuth 5 seit Jahren Beta ist
- [x] Ein Nutzer. Das Datenmodell trennt alles nach Konto, ein Haushalt ist später möglich
- [x] Sprachen der Oberfläche festlegen (heute Deutsch, Englisch, Chinesisch)
- [x] Rezeptinhalte nur in einer Sprache pro Rezept speichern statt Doppelspalten `_de` und `_en`
- [x] REST-API für eine mobile App behalten, und wenn ja als versionierte `/api/v1` mit OpenAPI
- [x] Frischer Start mit Import-Skript `npm run import:legacy` für 0.x-Daten

## Phase 0 Sicherheit sofort

- [x] Öffentlich bekannten `AUTH_SECRET` aus `.env`, `docker-compose.yml` und `docker-entrypoint.sh` entfernen. Mit diesem Wert kann jeder auf einer Standardinstallation Sessions fälschen
- [x] App beim Start ohne gültigen `AUTH_SECRET` hart abbrechen lassen, Fallback in `lib/api-helpers.ts:5` streichen
- [x] `.env` nicht mehr einchecken, stattdessen `.env.example`
- [x] `data/pantry.db` samt `-shm` und `-wal` aus Git nehmen und `/data` ignorieren. Sonst landen Nutzerdaten und Passwort-Hash beim nächsten Commit im Repo
- [x] Rezept-Import `scrapeRecipe` (`app/actions/recipes.ts:295`) absichern. Heute ohne Login aufrufbar und kann beliebige Adressen im lokalen Netz abrufen. Login-Pflicht, nur http und https, private Adressen sperren, Timeout und Größenlimit
- [x] Debug-Skripte im Hauptordner löschen (`debug-user.js`, `reset-password.js`, `test-*.js`). Sie geben Passwort-Hashes aus und setzen fest kodierte Passwörter
- [x] Selbst-Update per `git pull` aus der Web-App entfernen (`app/actions/system.ts`, `update-monitor.*`, Update-Testkarte in den Einstellungen). Das System ist außerdem kaputt, es nutzt `main` statt `master` und erkennt Docker nie
- [x] Rechteprüfung für fremde Rezept-IDs in Planer- und Einkaufs-Endpunkten (`app/api/planner/*`, `app/api/shopping/*`, `toggleFavorite`)
- [x] Login und Passwortwechsel gegen Durchprobieren schützen (Rate-Limit pro IP und Nutzername)
- [x] Passwortwechsel beendet alle anderen Sessions und App-Tokens
- [x] Seiten im Bereich `(app)` nur mit Login rendern. Heute ist `middleware.ts` wirkungslos
- [x] Sicherheitsheader setzen (CSP, HSTS, X-Frame-Options, Referrer-Policy, nosniff)
- [x] Bild-Proxy `images.remotePatterns` mit `hostname: '**'` schließen
- [x] Ersteinrichtung absichern. Heute wird Besitzer, wer zuerst `/signup` aufruft. Optional Setup-Token oder Anlage per Kommandozeile

## Phase 1 Fundament und Werkzeuge

- [x] Alle Pakete auf aktuellen Stand bringen. Bekannte kritische Lücken in `next` und `@auth/core`, dazu 22 weitere Meldungen von `npm audit`
- [x] Next.js 16.4, React 19.3, Tailwind 4.3, Zod 4.6, lucide-react 1.x. TypeScript bleibt bei 6.0, weil 7 die API für den Next-Typcheck noch nicht anbietet
- [x] Node 24 LTS statt Node 20 (seit April 2026 ohne Support), in `Dockerfile` und `@types/node`
- [x] Ungenutzte Pakete entfernen (`postgres`, `react-hook-form`, `@hookform/resolvers`, `date-fns` falls weiter ungenutzt, `jsonwebtoken` nach Auth-Umbau)
- [x] `middleware.ts` durch `proxy.ts` ersetzen (Next 16 Konvention)
- [x] Umgebungsvariablen mit `@t3-oss/env-nextjs` prüfen, ist installiert aber ungenutzt
- [x] `tsconfig` auf aktuelles Ziel, `strict` behalten, alle `any` entfernen
- [x] Prettier oder Biome, Lint, Typecheck als Skripte
- [x] Pre-Commit-Hook für Lint und Format
- [x] GitHub Actions für Lint, Typecheck, Tests, Build und Docker-Image auf GHCR
- [x] Renovate oder Dependabot für Abhängigkeiten
- [x] Strukturiertes Logging mit pino statt verstreutem `console.log`
- [x] Ordnerstruktur neu ordnen, z. B. `src/app`, `src/server`, `src/components`, `src/lib`
- [x] Altlasten löschen (`SETUP.md`, Release-Skripte in `package.json`, Next-Beispielgrafiken in `public/`, unbenutzte `sidebar.tsx`, Screenshots aus `public/` in `docs/` verschieben)
- [x] Eine einzige Versionsnummer, heute 0.2.8 in `package.json` und 1.0.0 in `app/api/route.ts`

## Phase 2 Datenmodell neu

- [x] Nur noch eine Schemaquelle. `db/init.ts` und `drizzle/seed.js` löschen, sie weichen von `db/schema.ts` ab
- [x] Echte Migrationen mit `drizzle-kit generate`, beim Start automatisch ausführen
- [x] Drizzle auf aktuelle Relations-API heben
- [x] Fremdschlüssel mit `onDelete` (heute schlägt Löschen eines Rezepts fehl, sobald es im Plan oder auf der Liste steht)
- [x] Indizes auf alle Fremdschlüssel und Abfragepfade, eindeutiger Index auf Favoriten
- [x] Schreibvorgänge mit mehreren Tabellen in Transaktionen (Rezept mit Zutaten und Schritten)
- [x] `createdAt` und `updatedAt` überall pflegen, Datumsfelder mit Prüfung
- [x] Zweisprachige Spalten ablösen (siehe offene Entscheidung)
- [x] Lebensmittelkatalog `foods` mit Synonymen, Kategorie und Gang im Laden. Grundlage für Kochbar-Abgleich und Einkaufsliste
- [x] Einheiten als Tabelle mit Dimension und Umrechnung (g, kg, ml, l, TL, EL, Stück, Prise)
- [x] Kategorien als echte Fremdschlüssel statt Freitext, Tags als eigene Tabelle
- [x] Rezept erweitern um Quelle, Ruhezeit, Schwierigkeit, Zutatengruppen, Notiz je Zutat, Nährwerte pro Portion
- [x] Planer-Einträge ohne Rezept erlauben (z. B. „Essen gehen“), Notizen anzeigen
- [x] Vorrat erweitern um Kaufdatum, Lagerort als Tabelle, optional Barcode
- [x] Einkaufsliste mit gespeicherter Kategorie, Menge, Einheit und Herkunft
- [x] Volltextsuche mit SQLite FTS5
- [x] Datenmigration von 0.x nach 2.0 schreiben und testen

## Phase 3 Backend-Architektur und API

- [x] Eine Service-Schicht (`server/recipes.ts` usw.), Server Actions und API-Routen rufen nur noch diese auf. Heute ist alles doppelt und weicht voneinander ab
- [x] Zod-Schemas für jede Eingabe, gemeinsam für Actions und API
- [x] Einheitliches Fehlerformat mit Feldfehlern statt `throw`, `alert()` und deutschen Fehlertexten
- [ ] Fehlermeldungen aus der Service-Schicht übersetzen (kommen derzeit immer auf Deutsch, auch bei englischer Oberfläche)
- [x] Auth auf eine Lösung umbauen (Sessions im Web, Tokens für die App, kurze Laufzeit mit Refresh)
- [x] REST-API versionieren, OpenAPI erzeugen, Pagination, Suche und Filter
- [x] API-Schlüssel für Integrationen wie Home Assistant
- [x] Bild-Upload neu. Server prüft Dateityp, rechnet mit sharp auf WebP um, eigener Upload-Ordner außerhalb von `public`, alte Bilder aufräumen
- [x] Rezeptbilder lokal speichern statt Fremd-Links
- [x] Rezept-Import robuster (JSON-LD und Microdata, Bruchzahlen wie ½, Quelle speichern, Bild übernehmen)
- [x] Wochen-Einkaufsliste mit Abzug des Vorrats, Zusammenfassen gleicher Zutaten und Einheitenumrechnung
- [x] Zeitzonenfehler im Wochenplan beheben (`actions/planner.ts:17`)
- [x] Health-Endpunkt `/api/health` mit Datenbankprüfung und Version
- [x] Backup per `VACUUM INTO` und Export und Import als JSON
- [x] Update-Hinweis über GitHub Releases statt `git fetch`

## Phase 4 Designsystem

Grundlage ist der Vorschlag „Emaille und Vorratsglas“.

- [x] Design-Tokens in `globals.css` für hell und dunkel, nur noch Tokens statt rund 600 fest kodierter Farbklassen
- [x] Schriften Young Serif für Titel und Schibsted Grotesk für die Oberfläche über `next/font`
- [x] Feste Skala für Abstände, Radien und Schriftgrößen
- [x] Theme-Umschalter hell, dunkel und System
- [x] Fehlende Bausteine aus shadcn ergänzen (Select, Textarea, Tabs, Badge, Avatar, Skeleton, AlertDialog, DropdownMenu, Sheet, Tooltip, Popover, Kalender, Command, Progress)
- [x] Eigene Bausteine Teller-Platzhalter, Vorratsglas mit Füllstand, Ablauf-Stempel, Status-Chip, Mengen-Stepper
- [x] Emoji als Symbole durch Lucide-Symbole ersetzen
- [x] Neues Logo als quadratisches SVG, App-Icons in allen Größen
- [x] Barrierefreiheit als Pflicht. Tippflächen ab 44 Pixel, sichtbarer Fokus, Beschriftungen für alle Symbol-Knöpfe, ausreichender Kontrast, `prefers-reduced-motion`
- [x] Keine Einblend-Animationen beim Laden mehr, Bewegung nur als Antwort auf eine Aktion

## Phase 5 Alle Screens neu

Jeder Screen bekommt Ladezustand, Leerzustand und Fehlerzustand.

- [x] App-Rahmen mit Seitenleiste am Desktop und Tableiste unten am Handy. Heute fehlt zwischen 768 und 1023 Pixel jede Navigation
- [x] `loading.tsx`, `error.tsx`, `not-found.tsx` und `global-error.tsx`
- [x] Anmelden und Ersteinrichtung mit Fehlermeldungen, Ladezustand, Passwort anzeigen und `autocomplete`
- [x] Startseite „Heute“ mit Abendessen, Tagesplan, kochbaren Rezepten, bald Ablaufendem und Einkaufsstand
- [x] Rezeptliste mit Suche, Filtern (Kategorie, Zeit, Favoriten, Kochbar) und Sortierung. Favoriten werden ein Filter statt eigener Seite
- [x] Rezeptansicht mit Portionsrechner, Vorratsabgleich je Zutat, „Fehlendes auf die Liste“, Löschen, Teilen und Drucken
- [x] Kochmodus mit großer Schrift, Bildschirm bleibt an (Wake Lock), Timer je Schritt
- [x] Rezeptformular mit `useActionState`, Feldfehlern, Bild-Upload, Tags, Zutatengruppen und Sortieren per Ziehen
- [x] Wochenplan als Raster am Desktop und Tagesansicht am Handy, Ziehen zum Verschieben, Woche kopieren
- [x] Einkaufsliste nach Gängen, Mengen sichtbar, Herkunft je Eintrag, Schnelleingabe mit Mengenerkennung, Abhaken ohne Neuladen, Erledigtes in den Vorrat übernehmen
- [x] Vorrat als Regal mit Füllstand und Ablauf-Stempel, Filter nach Lagerort, Mengenänderung sofort sichtbar (heute erst nach Neuladen)
- [x] Einstellungen mit Profil, Passwort, Sprache, Theme, Einheiten, Datenexport und Info zur Version
- [x] Befehlspalette mit ⌘K für Suche und Aktionen
- [x] Bestätigungen mit AlertDialog und Rückgängig statt `confirm()`
- [x] Optimistische Updates mit `useOptimistic` für Haken, Favoriten und Mengen
- [x] Daten in Server Components laden statt `useEffect` mit Server Actions
- [x] `next/image` für alle Bilder, `generateMetadata` für Rezepte, Viewport und Themenfarbe
- [x] i18n vollständig. Alle fest kodierten deutschen und englischen Texte in die Sprachdateien, Datums- und Zahlenformat nach Sprache, fehlender Schlüssel `settings.clickToChange`, Sprache im Profil speichern

## Phase 6 Neue Funktionen

- [x] Kochbar-Abgleich zwischen Vorrat und Rezepten („Alles da“, „1 Zutat fehlt“)
- [x] Beim Kochen Zutaten vom Vorrat abziehen
- [x] Nachkaufen automatisch vorschlagen, wenn der Mindestbestand unterschritten ist
- [x] Ablauf-Hinweise als Push-Benachrichtigung
- [x] PWA mit Manifest und Offline-Modus, vor allem für die Einkaufsliste im Laden
- [x] Koch-Historie mit „zuletzt gekocht“ und Bewertung
- [x] Sammlungen oder Kochbücher
- [ ] Import aus Mealie und Tandoor (Paprika und eigenes JSON sind fertig)
- [x] Barcode-Suche mit Open Food Facts (Eingabe der Ziffern, Scannen mit der Kamera fehlt noch)
- [x] Optional Kalender-Export für den Wochenplan

## Phase 7 Betrieb und Docker

- [x] Dockerfile mit Node 24, eigener Abhängigkeits-Stufe, ohne `git`, ohne Debug-Dateien und ohne `.env`
- [ ] Docker-Image einmal lokal bauen und starten (Docker Desktop lief beim Umbau nicht)
- [x] Entrypoint führt Migrationen aus statt Seed
- [x] Compose ohne Standard-Secret, mit Healthcheck auf `/api/health`, `read_only` und `cap_drop`
- [ ] Fertiges Image auf GHCR veröffentlichen (Workflow steht, läuft beim ersten Tag `v2.0.0`)
- [x] Update-Weg dokumentieren (`docker compose pull` oder Watchtower)
- [x] Backup und Wiederherstellung dokumentieren und testen

## Phase 8 Tests, Doku und Veröffentlichung

- [x] Vitest für Service-Schicht, Einheitenumrechnung, Zutaten-Parser und Kochbar-Abgleich
- [x] Playwright für die Hauptabläufe (Einrichtung, Rezept anlegen, planen, Einkaufsliste, Vorrat)
- [x] Barrierefreiheit automatisch prüfen (axe in Playwright)
- [x] README, `DOCKER.md` und `API.md` neu schreiben
- [ ] Neue Screenshots für die README
- [x] Changelog und Hinweise zum Umstieg von 0.x
- [ ] Release 2.0.0 mit Tag und Image (wartet auf Commit und Freigabe)
