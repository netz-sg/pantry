# Pantry API

Pantry hat eine REST-API unter `/api/v1`. Web-Oberfläche und API nutzen dieselbe Geschäftslogik, alles, was in der App geht, geht auch über die API.

Die vollständige, immer aktuelle Beschreibung liefert `GET /api/v1/openapi.json` (OpenAPI 3.1). Sie lässt sich z. B. in Postman, Insomnia oder Swagger UI laden.

## Anmelden

```bash
curl -X POST https://pantry.example.com/api/auth/sign-in/username \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://pantry.example.com' \
  -d '{"username":"alex","password":"…"}'
```

Die Antwort enthält `token`. Bei allen weiteren Aufrufen mitsenden

```
Authorization: Bearer <token>
```

Ein Token gilt 30 Tage und verlängert sich bei Nutzung. Ein Passwortwechsel meldet alle Tokens ab. Nach fünf Fehlversuchen pro Minute antwortet die Anmeldung mit `429`.

## Antwortformat

Erfolg

```json
{ "data": { … } }
```

Listen mit Seitenangaben, z. B. Rezepte

```json
{ "data": [ … ], "meta": { "total": 42, "limit": 60, "offset": 0 } }
```

Fehler

```json
{
  "error": {
    "code": "validation",
    "message": "Bitte prüfe deine Eingaben",
    "fieldErrors": { "title": ["Titel fehlt"] }
  }
}
```

| Code           | HTTP |
| -------------- | ---- |
| `bad_request`  | 400  |
| `unauthorized` | 401  |
| `forbidden`    | 403  |
| `not_found`    | 404  |
| `conflict`     | 409  |
| `validation`   | 422  |
| `internal`     | 500  |

## Endpunkte im Überblick

| Methode und Pfad                                                                 | Zweck                                                             |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `GET /api/v1/today`                                                              | Alles für die Startseite                                          |
| `GET /api/v1/recipes?q=&favorites=&cookable=&maxMinutes=&tag=&categoryId=&sort=` | Rezepte suchen und filtern                                        |
| `POST /api/v1/recipes`                                                           | Rezept anlegen                                                    |
| `GET`, `PUT`, `DELETE /api/v1/recipes/{id}`                                      | Rezept lesen, ersetzen, löschen                                   |
| `POST /api/v1/recipes/{id}/favorite`                                             | Favorit setzen, `{ "value": true }`                               |
| `POST /api/v1/recipes/{id}/cooked`                                               | Als gekocht merken, `{ "servings": 4, "deduct": true }`           |
| `POST /api/v1/recipes/{id}/shopping`                                             | Zutaten auf die Liste, `{ "mode": "missing" }` oder `"all"`       |
| `POST`, `DELETE /api/v1/recipes/{id}/image`                                      | Foto hochladen (multipart, Feld `file`) oder entfernen            |
| `POST /api/v1/recipes/import`                                                    | Rezept von einer Website importieren, `{ "url": "…" }`            |
| `GET`, `POST /api/v1/categories`                                                 | Kategorien                                                        |
| `GET /api/v1/tags`                                                               | Tags mit Anzahl                                                   |
| `GET /api/v1/plan?date=` oder `?from=&to=`                                       | Wochenplan                                                        |
| `POST /api/v1/plan`                                                              | Eintrag anlegen, mit `recipeId` oder freiem `title`               |
| `PATCH`, `DELETE /api/v1/plan/{id}`                                              | Eintrag ändern, verschieben, löschen                              |
| `POST /api/v1/plan/{id}/cooked`                                                  | Als gekocht markieren, `{ "deduct": true }`                       |
| `POST /api/v1/plan/shopping`                                                     | Einkaufsliste für einen Zeitraum, `{ "from", "to" }`              |
| `POST /api/v1/plan/copy`                                                         | Woche kopieren, `{ "from", "to" }`                                |
| `GET /api/v1/plan/calendar`                                                      | Plan als iCalendar-Datei                                          |
| `GET`, `POST /api/v1/pantry`                                                     | Vorrat lesen, Eintrag anlegen                                     |
| `PUT`, `DELETE /api/v1/pantry/{id}`                                              | Eintrag ändern, löschen                                           |
| `POST /api/v1/pantry/{id}/adjust`                                                | Menge ändern, `{ "delta": -1 }`                                   |
| `GET`, `POST /api/v1/pantry/locations`                                           | Lagerorte                                                         |
| `GET /api/v1/pantry/barcode/{code}`                                              | Produkt bei Open Food Facts nachschlagen                          |
| `GET`, `POST /api/v1/shopping`                                                   | Liste lesen, Eintrag anlegen oder `{ "text": "2 kg Kartoffeln" }` |
| `PATCH`, `DELETE /api/v1/shopping/{id}`                                          | Eintrag ändern, abhaken, löschen                                  |
| `DELETE /api/v1/shopping?checked=true`                                           | Abgehakte entfernen                                               |
| `POST /api/v1/shopping/finish`                                                   | Abgehaktes in den Vorrat buchen                                   |
| `GET`, `PATCH /api/v1/me`                                                        | Eigenes Konto, Sprache, Theme                                     |
| `GET /api/v1/export`, `POST /api/v1/import`                                      | Alle Daten als JSON sichern und einspielen                        |
| `GET`, `POST`, `DELETE /api/v1/push`                                             | Push-Abos                                                         |
| `GET /api/health`                                                                | Zustand, ohne Anmeldung                                           |

## Beispiel

Fehlende Zutaten für ein Rezept auf die Einkaufsliste setzen

```bash
curl -X POST https://pantry.example.com/api/v1/recipes/<id>/shopping \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"servings": 2, "mode": "missing"}'
```

Einkaufsliste in Home Assistant anzeigen, als REST-Sensor

```yaml
sensor:
  - platform: rest
    name: Pantry Einkauf
    resource: https://pantry.example.com/api/v1/shopping
    headers:
      Authorization: Bearer !secret pantry_token
    value_template: "{{ value_json.data | selectattr('checked', 'false') | list | count }}"
    json_attributes: [data]
```
