# Architektur von Pantry 2.0

Pantry ist eine selbst gehostete Web-App für einen Haushalt. Next.js 16 mit App Router, React 19, SQLite über Drizzle, Better-Auth für Anmeldung, Tailwind 4 für das Design.

## Ordner

```
src/
  app/                  Seiten und Routen
    (auth)/             Anmeldung und Ersteinrichtung
    (app)/              alles hinter dem Login, mit App-Rahmen
    api/v1/             REST-API, nutzt dieselben Services
    api/auth/           Better-Auth
    media/              Auslieferung hochgeladener Bilder
  components/
    ui/                 Bausteine im Kino-Stil
    app/                App-Rahmen, Glas-Navigation, Tableiste, Befehlspalette
    <bereich>/          Bausteine eines Bereichs, z. B. recipes, plan
  server/
    db/                 Schema, Relationen, Verbindung, Migrationen
    services/           Geschäftslogik, eine Datei pro Bereich
    actions/            Server Actions, dünne Hülle um die Services
    lib/                Fehler, Logger, Session, sicherer Abruf, API-Hülle
  lib/                  Code für Server und Browser (Einheiten, Parser, Schemas, Datum)
  i18n/                 next-intl ohne Sprachpräfix in der URL
messages/<sprache>/<bereich>.json   Texte, ein Namensraum pro Datei
drizzle/                Migrationen, mit `npm run db:generate` erzeugt
tests/unit, tests/e2e   Vitest und Playwright
```

## Regeln

- **Logik gehört in `src/server/services`.** Services nehmen `userId` als ersten Parameter und filtern jede Abfrage danach. Eingaben werden dort mit den Zod-Schemas aus `src/lib/schemas.ts` geprüft.
- **Server Actions** liegen in `src/server/actions/<bereich>.ts`, beginnen mit `'use server'` und rufen `run()` aus `src/server/actions/run.ts` auf. Das liefert `{ ok, data }` oder `{ ok: false, error }` und lädt die App danach neu. Im Browser nutzt man `callAction()` aus `src/lib/action-client.ts`, das Fehler als Meldung zeigt und optional einen Rückgängig-Knopf anbietet.
- **Seiten** sind Server Components, die Daten direkt über Services laden. Interaktive Teile sind kleine Client Components. Kein Laden per `useEffect`.
- **Optimistische Updates** mit `useOptimistic` für Abhaken, Favoriten und Mengen.
- **Texte** nie fest im Code, immer über `useTranslations('<bereich>')` bzw. `getTranslations`. Deutsch und Englisch pflegen, Chinesisch wird am Ende übersetzt. Gemeinsame Texte in `common`.
- **Schreibstil der Oberfläche.** Deutsch, kurz, aktiv. Keine Gedankenstriche (— oder –), keine Semikolons und keine Doppelpunkte im Fließtext. Ausnahmen sind Uhrzeiten und Code.
- **Bilder** gehen immer durch `saveImage()` in `src/server/services/media.ts` (prüft, verkleinert, speichert als WebP). Ausgeliefert über `/media/<pfad>`, angezeigt mit `<Photo path=…>`.
- **Fremde Adressen** nur über `safeFetch()` abrufen, das private Netze blockt.

## Design

Stil „Kino“. Dunkel zuerst, hell nur auf ausdrücklichen Wunsch. Große Fotos über die ganze Breite, Reihen aus Fotokarten, eine schwebende Glas-Navigation und Korallrot als Akzent. Schrift ist Onest über `next/font`.

- Tokens stehen in `src/app/globals.css`. `:root` ist dunkel, `:root[data-theme='light']` ist hell.
- Hilfsklassen
  - `.headline` für große, eng gesetzte Überschriften
  - `.bleed` und `.row-bleed` für Bildreihen bis zum Fensterrand
  - `.hero-media` blendet das Hero-Foto per Maske weich in den Hintergrund aus. Keine Verläufe darüberlegen, das wirkt milchig
  - `.glass-pill` für die Navigation, `.glass-dark` für Knöpfe auf Fotos
- Hervorhebungsrahmen innen als `inset`-Schatten zeichnen. `ring-offset` wird in Scrollbereichen abgeschnitten.
- Rezepte ohne Foto bekommen eine dunkle Fläche mit Besteck-Symbol, keine Buchstaben-Cover.
- Farben nur über Tokens wie `bg-bg`, `bg-surface`, `text-label`, `text-label-2`, `text-label-3`, `bg-fill`, `text-tint`, `bg-tint`, `bg-tint-soft`, `text-green`, `text-orange`, `text-red` und die `-soft`-Varianten. Keine festen Farbklassen wie `zinc-500`.
- Schriftgrößen sind `text-large-title`, `text-title`, `text-title-2`, `text-body`, `text-callout`, `text-subhead`, `text-footnote`, `text-caption`.
- Radien sind `rounded-card` (14px) für Gruppen, `rounded-hero` (18px) für große Fotokarten, `rounded-full` für Knöpfe und Chips.
- Glas nur für schwebende Elemente.
- Tippflächen mindestens 44 Pixel. Jeder Symbol-Knopf hat ein `aria-label`.
- Beim Laden nur das dezente `.page-in`. Sonst Bewegung nur als Antwort auf eine Aktion. `.page-in` nutzt `animation-fill-mode: backwards`, sonst bleibt eine Transformation stehen und fixierte Kinder wie der Kochmodus werden falsch skaliert.

Bausteine in `src/components/ui`:

| Datei | Inhalt |
|---|---|
| `button.tsx` | `Button`, `buttonVariants` (tint, secondary, tinted, plain, glass, photo, white, destructive) |
| `page-header.tsx` | `PageHeader` (großer Titel), `SectionTitle` |
| `list.tsx` | `Group`, `GroupLabel`, `Row`, `RowLink`, `RowButton`, `RowIcon` |
| `segmented.tsx` | `Segmented`, `SegmentedLinks` |
| `stepper.tsx` | `Stepper` |
| `field.tsx` | `Field`, `Input`, `Textarea`, `Select` |
| `chip.tsx` | `ChipLink`, `ChipButton`, `ChipRow` |
| `status.tsx` | `Pill`, `Dot` |
| `ring.tsx` | `Ring` (Fortschritt) |
| `photo.tsx` | `Photo` (Bild oder Platzhalter) |
| `sheet.tsx` | `Sheet` (unten am Handy, Dialog am Desktop) |
| `confirm.tsx` | `Confirm` (Rückfrage vor dem Löschen) |
| `empty-state.tsx`, `skeleton.tsx` | Leer- und Ladezustände |

Die Startseite `src/app/(app)/page.tsx` ist das Referenzbeispiel für Aufbau und Stil.
