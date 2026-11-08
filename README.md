<p align="right"><a href="https://buymeacoffee.com/sgnetz"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="44" alt="Buy Me A Coffee"></a></p>

<p align="center">
  <img src="public/icons/icon-192.png" width="88" alt="Pantry">
</p>

<h1 align="center">Pantry</h1>

<p align="center">
  <b>Rezepte, Wochenplan, Einkaufsliste und Vorrat an einem Ort.</b><br>
  Selbst gehostet, für deinen Haushalt. Deine Daten bleiben bei dir.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0-ff8a6b?style=flat-square" alt="Version 2.0">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs" alt="Next.js 16">
  <img src="https://img.shields.io/badge/SQLite-Drizzle-003b57?style=flat-square&logo=sqlite" alt="SQLite mit Drizzle">
  <img src="https://img.shields.io/badge/Docker-bereit-2496ed?style=flat-square&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Lizenz-MIT-555555?style=flat-square" alt="Lizenz MIT">
</p>

<p align="center">
  <img src="docs/screenshots/hero.jpg" alt="Pantry mit der Heute-Seite am Computer und einem Rezept am Handy">
</p>

<p align="center">
  <a href="#was-pantry-kann">Funktionen</a> ·
  <a href="#so-sieht-es-aus">Screenshots</a> ·
  <a href="#schnellstart-mit-docker">Schnellstart</a> ·
  <a href="#entwicklung">Entwicklung</a> ·
  <a href="API.md">API</a>
</p>

---

## Was Pantry kann

- **Heute** zeigt dein nächstes Gericht groß im Bild, dazu deinen Tag, die ganze Woche, was du mit deinem Vorrat jetzt kochen kannst und was bald weg muss.
- **Rezepte** mit Fotos, Zutatengruppen, Timern pro Schritt, Bewertungen und Notizen. Import von fast jeder Rezeptseite per Link und aus Paprika.
- **Vorratsabgleich** bei jeder Zutat. Pantry zeigt, ob sie da ist und ob die Menge reicht, und setzt Fehlendes mit einem Tipp auf die Liste.
- **Kochmodus** mit großer Schrift, Timern und einem Bildschirm, der anbleibt. Danach werden die Zutaten auf Wunsch vom Vorrat abgezogen.
- **Wochenplan** mit Ziehen und Ablegen, freien Einträgen wie „Essen gehen“, Woche kopieren und Kalender-Export.
- **Einkaufsliste** nach Gängen im Laden sortiert, mit Schnelleingabe wie „2 kg Kartoffeln“. Gleiche Zutaten werden zusammengefasst und Einheiten umgerechnet. Nach dem Einkauf landet alles im Vorrat.
- **Vorrat** nach Lagerort, mit Füllstand, Ablaufdaten, Mindestmengen und Barcode-Suche über Open Food Facts. Auf Wunsch Erinnerungen per Push.
- **Suche überall** mit ⌘K über Rezepte, Zutaten, Tags und Notizen.
- **App fürs Handy** zum Installieren auf dem Homescreen. Einkaufsliste und Vorrat sind auch ohne Empfang lesbar.
- **REST-API** mit Token für eigene Apps und Integrationen, beschrieben als OpenAPI.
- **Dunkel und hell**, Deutsch, Englisch und Chinesisch.

## So sieht es aus

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/f-rezepte.jpg" alt="Rezeptübersicht mit Fotokarten und Filtern"></td>
    <td width="50%"><img src="docs/screenshots/f-plan.jpg" alt="Wochenplan mit Frühstück, Mittag und Abend"></td>
  </tr>
  <tr>
    <td><b>Rezepte</b><br>Fotokarten, Filter nach Kategorie und Tag, „Jetzt kochbar“ und unter 30 Minuten.</td>
    <td><b>Wochenplan</b><br>Sieben Tage auf einen Blick. Einkaufsliste für die ganze Woche mit einem Klick.</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/f-einkauf.jpg" alt="Einkaufsliste nach Gängen sortiert"></td>
    <td><img src="docs/screenshots/f-rezept.jpg" alt="Rezept mit Zutaten, Vorratsabgleich und Schritten mit Timern"></td>
  </tr>
  <tr>
    <td><b>Einkauf</b><br>Sortiert wie dein Laden. Abgehaktes wandert auf Wunsch direkt in den Vorrat.</td>
    <td><b>Rezept</b><br>Jede Zutat mit Vorratsabgleich, Portionen umrechnen, Timer direkt im Schritt.</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/f-kochen.jpg" alt="Kochmodus und Rezept am Handy"></td>
    <td><img src="docs/screenshots/f-vorrat.jpg" alt="Vorrat mit Ablaufdaten und Füllstand"></td>
  </tr>
  <tr>
    <td><b>Kochmodus</b><br>Ein Schritt pro Bildschirm, große Schrift, Timer und die Zutaten für genau diesen Schritt.</td>
    <td><b>Vorrat</b><br>Was bald abläuft, steht oben. Fast Leeres kommt mit einem Tipp auf die Liste.</td>
  </tr>
</table>

### Gemacht fürs Handy

<p align="center">
  <img src="docs/screenshots/mobile.jpg" alt="Pantry am Handy mit Einkauf, Heute, Rezept, Kochmodus und Vorrat">
</p>

Pantry lässt sich wie eine App auf dem Homescreen installieren. Unten sitzt eine schwebende Leiste, die beim Scrollen kleiner wird.

### Dunkel oder hell

<p align="center">
  <img src="docs/screenshots/themes.jpg" alt="Die Heute-Seite halb im dunklen und halb im hellen Modus">
</p>

Pantry startet dunkel, damit die Fotos wirken. Hell lässt sich in den Einstellungen einschalten.

## Schnellstart mit Docker

```bash
mkdir pantry && cd pantry
curl -O https://raw.githubusercontent.com/netz-sg/pantry/master/docker-compose.yml
curl -o .env https://raw.githubusercontent.com/netz-sg/pantry/master/.env.example
```

In `.env` mindestens `AUTH_SECRET` und `APP_URL` setzen. Einen passenden Schlüssel erzeugt

```bash
openssl rand -base64 32
```

Dann starten.

```bash
docker compose up -d
```

Pantry läuft danach auf http://localhost:3000. Beim ersten Aufruf legst du dein Konto an, danach ist die Registrierung geschlossen. Wer die Einrichtung absichern will, setzt zusätzlich `SETUP_TOKEN`.

Mehr zu Updates, Sicherungen und Reverse Proxy steht in [DOCKER.md](DOCKER.md).

## Entwicklung

Voraussetzung ist Node.js 22 oder neuer, empfohlen ist Node 24.

```bash
npm install
cp .env.example .env    # AUTH_SECRET eintragen
npm run dev
```

| Befehl                               | Zweck                                                          |
| ------------------------------------ | -------------------------------------------------------------- |
| `npm run dev`                        | Entwicklungsserver auf Port 3000                               |
| `npm run check`                      | Lint, Typprüfung und Unit-Tests                                |
| `npm run test:e2e`                   | Playwright-Tests gegen einen frischen Produktions-Build        |
| `npm run db:generate`                | Migration aus Änderungen an `src/server/db/schema.ts` erzeugen |
| `npm run reset-password`             | Passwort eines Kontos neu setzen                               |
| `npm run import:legacy -- <alte.db>` | Daten aus Pantry 0.x übernehmen                                |

Wie der Code aufgebaut ist, steht in [docs/architecture.md](docs/architecture.md). Die API ist in [API.md](API.md) beschrieben, alle Änderungen in [CHANGELOG.md](CHANGELOG.md).

## Technik

Next.js 16, React 19, TypeScript, Tailwind CSS 4, SQLite mit Drizzle ORM, Better-Auth, next-intl, Zod, Vitest und Playwright.

## Bildnachweis

Die Screenshots zeigen eine Demo mit erfundenen Beispieldaten. Die Rezeptfotos sind gemeinfrei und stammen von Wikimedia Commons, die Quellen stehen in [docs/screenshots/CREDITS.md](docs/screenshots/CREDITS.md).

## Lizenz

MIT
