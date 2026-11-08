import { NextResponse } from 'next/server';
import { z } from 'zod';
import pkg from '../../../../../package.json';
import {
  pantryItemInput,
  planEntryInput,
  planEntryPatch,
  recipeInput,
  shoppingItemInput,
  shoppingItemPatch,
} from '@/lib/schemas';

const schema = (s: z.ZodType) => z.toJSONSchema(s, { io: 'input', unrepresentable: 'any' });

const json = (ref: string) => ({
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${ref}` } } },
});
const ok = (description = 'Erfolg') => ({
  200: { description },
  401: { $ref: '#/components/responses/Unauthorized' },
  422: { $ref: '#/components/responses/Validation' },
});
const idParam = [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }];

export function GET() {
  const doc = {
    openapi: '3.1.0',
    info: {
      title: 'Pantry API',
      version: pkg.version,
      description:
        'REST-API für Pantry. Anmeldung über POST /api/auth/sign-in/username mit { username, password }. Die Antwort enthält ein Token, das als „Authorization: Bearer <token>“ mitgeschickt wird. Erfolgreiche Antworten haben die Form { data }, Fehler { error: { code, message, fieldErrors } }.',
    },
    servers: [{ url: '/' }],
    security: [{ bearer: [] }, { cookie: [] }],
    components: {
      securitySchemes: {
        bearer: { type: 'http', scheme: 'bearer' },
        cookie: { type: 'apiKey', in: 'cookie', name: 'pantry.session_token' },
      },
      responses: {
        Unauthorized: { description: 'Nicht angemeldet' },
        Validation: { description: 'Eingaben ungültig, Details in error.fieldErrors' },
        NotFound: { description: 'Nicht gefunden' },
      },
      schemas: {
        RecipeInput: schema(recipeInput),
        PlanEntryInput: schema(planEntryInput),
        PlanEntryPatch: schema(planEntryPatch),
        PantryItemInput: schema(pantryItemInput),
        ShoppingItemInput: schema(shoppingItemInput),
        ShoppingItemPatch: schema(shoppingItemPatch),
      },
    },
    paths: {
      '/api/auth/sign-in/username': {
        post: {
          tags: ['Auth'],
          security: [],
          summary: 'Anmelden und Token erhalten',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'password'],
                  properties: { username: { type: 'string' }, password: { type: 'string' } },
                },
              },
            },
          },
          responses: {
            200: { description: 'Angemeldet, Token in „token“ und im Header „set-auth-token“' },
            401: { description: 'Falsche Zugangsdaten' },
            429: { description: 'Zu viele Versuche' },
          },
        },
      },
      '/api/health': {
        get: {
          tags: ['System'],
          security: [],
          summary: 'Zustand und Version',
          responses: { 200: { description: 'Läuft' }, 503: { description: 'Datenbank nicht erreichbar' } },
        },
      },
      '/api/v1/today': { get: { tags: ['Heute'], summary: 'Alles für die Startseite', responses: ok() } },
      '/api/v1/recipes': {
        get: {
          tags: ['Rezepte'],
          summary: 'Rezepte suchen und filtern',
          parameters: [
            'q',
            'categoryId',
            'tag',
            'favorites',
            'maxMinutes',
            'cookable',
            'sort',
            'limit',
            'offset',
          ].map((n) => ({ name: n, in: 'query', schema: { type: 'string' } })),
          responses: ok('{ data, meta: { total, limit, offset } }'),
        },
        post: {
          tags: ['Rezepte'],
          summary: 'Rezept anlegen',
          requestBody: json('RecipeInput'),
          responses: ok(),
        },
      },
      '/api/v1/recipes/{id}': {
        parameters: idParam,
        get: { tags: ['Rezepte'], summary: 'Rezept mit Zutaten und Schritten', responses: ok() },
        put: {
          tags: ['Rezepte'],
          summary: 'Rezept ersetzen',
          requestBody: json('RecipeInput'),
          responses: ok(),
        },
        delete: {
          tags: ['Rezepte'],
          summary: 'Rezept löschen',
          responses: { 204: { description: 'Gelöscht' } },
        },
      },
      '/api/v1/recipes/{id}/favorite': {
        parameters: idParam,
        post: { tags: ['Rezepte'], summary: 'Favorit setzen, Body { value }', responses: ok() },
      },
      '/api/v1/recipes/{id}/cooked': {
        parameters: idParam,
        post: {
          tags: ['Rezepte'],
          summary: 'Als gekocht merken, Body { servings, deduct }',
          responses: ok(),
        },
      },
      '/api/v1/recipes/{id}/shopping': {
        parameters: idParam,
        post: {
          tags: ['Rezepte'],
          summary: 'Zutaten auf die Liste, Body { servings, mode: missing|all }',
          responses: ok(),
        },
      },
      '/api/v1/recipes/{id}/image': {
        parameters: idParam,
        post: { tags: ['Rezepte'], summary: 'Foto hochladen (multipart, Feld „file“)', responses: ok() },
        delete: {
          tags: ['Rezepte'],
          summary: 'Foto entfernen',
          responses: { 204: { description: 'Entfernt' } },
        },
      },
      '/api/v1/recipes/import': {
        post: { tags: ['Rezepte'], summary: 'Rezept von Website importieren, Body { url }', responses: ok() },
      },
      '/api/v1/categories': {
        get: { tags: ['Rezepte'], summary: 'Kategorien', responses: ok() },
        post: { tags: ['Rezepte'], summary: 'Kategorie anlegen, Body { name }', responses: ok() },
      },
      '/api/v1/tags': { get: { tags: ['Rezepte'], summary: 'Tags mit Anzahl', responses: ok() } },
      '/api/v1/plan': {
        get: { tags: ['Wochenplan'], summary: 'Woche um ?date= oder Zeitraum ?from=&to=', responses: ok() },
        post: {
          tags: ['Wochenplan'],
          summary: 'Eintrag anlegen',
          requestBody: json('PlanEntryInput'),
          responses: ok(),
        },
      },
      '/api/v1/plan/{id}': {
        parameters: idParam,
        patch: {
          tags: ['Wochenplan'],
          summary: 'Eintrag ändern oder verschieben',
          requestBody: json('PlanEntryPatch'),
          responses: ok(),
        },
        delete: {
          tags: ['Wochenplan'],
          summary: 'Eintrag löschen',
          responses: { 204: { description: 'Gelöscht' } },
        },
      },
      '/api/v1/plan/{id}/cooked': {
        parameters: idParam,
        post: { tags: ['Wochenplan'], summary: 'Als gekocht markieren, Body { deduct }', responses: ok() },
      },
      '/api/v1/plan/shopping': {
        post: {
          tags: ['Wochenplan'],
          summary: 'Einkaufsliste für Zeitraum, Body { from, to }',
          responses: ok(),
        },
      },
      '/api/v1/plan/copy': {
        post: { tags: ['Wochenplan'], summary: 'Woche kopieren, Body { from, to }', responses: ok() },
      },
      '/api/v1/plan/calendar': {
        get: {
          tags: ['Wochenplan'],
          summary: 'iCalendar-Datei',
          responses: { 200: { description: 'text/calendar' } },
        },
      },
      '/api/v1/pantry': {
        get: { tags: ['Vorrat'], summary: 'Vorrat, optional ?locationId=', responses: ok() },
        post: {
          tags: ['Vorrat'],
          summary: 'Eintrag anlegen',
          requestBody: json('PantryItemInput'),
          responses: ok(),
        },
      },
      '/api/v1/pantry/{id}': {
        parameters: idParam,
        put: {
          tags: ['Vorrat'],
          summary: 'Eintrag ändern',
          requestBody: json('PantryItemInput'),
          responses: ok(),
        },
        delete: {
          tags: ['Vorrat'],
          summary: 'Eintrag löschen',
          responses: { 204: { description: 'Gelöscht' } },
        },
      },
      '/api/v1/pantry/{id}/adjust': {
        parameters: idParam,
        post: { tags: ['Vorrat'], summary: 'Menge ändern, Body { delta }', responses: ok() },
      },
      '/api/v1/pantry/locations': {
        get: { tags: ['Vorrat'], summary: 'Lagerorte', responses: ok() },
        post: { tags: ['Vorrat'], summary: 'Lagerort anlegen', responses: ok() },
      },
      '/api/v1/pantry/barcode/{code}': {
        parameters: [{ name: 'code', in: 'path', required: true, schema: { type: 'string' } }],
        get: { tags: ['Vorrat'], summary: 'Produkt per Barcode bei Open Food Facts suchen', responses: ok() },
      },
      '/api/v1/shopping': {
        get: { tags: ['Einkauf'], summary: 'Einkaufsliste nach Gängen', responses: ok() },
        post: {
          tags: ['Einkauf'],
          summary: 'Eintrag anlegen oder { text } als Schnelleingabe',
          requestBody: json('ShoppingItemInput'),
          responses: ok(),
        },
        delete: {
          tags: ['Einkauf'],
          summary: 'Mit ?checked=true alle abgehakten entfernen',
          responses: ok(),
        },
      },
      '/api/v1/shopping/{id}': {
        parameters: idParam,
        patch: {
          tags: ['Einkauf'],
          summary: 'Eintrag ändern oder abhaken',
          requestBody: json('ShoppingItemPatch'),
          responses: ok(),
        },
        delete: {
          tags: ['Einkauf'],
          summary: 'Eintrag löschen',
          responses: { 204: { description: 'Gelöscht' } },
        },
      },
      '/api/v1/shopping/finish': {
        post: { tags: ['Einkauf'], summary: 'Abgehaktes in den Vorrat buchen', responses: ok() },
      },
      '/api/v1/me': {
        get: { tags: ['Konto'], summary: 'Eigenes Konto', responses: ok() },
        patch: { tags: ['Konto'], summary: 'Name, Benutzername, Sprache, Theme ändern', responses: ok() },
      },
      '/api/v1/export': { get: { tags: ['Daten'], summary: 'Alle Daten als JSON', responses: ok() } },
      '/api/v1/import': { post: { tags: ['Daten'], summary: 'JSON-Export einspielen', responses: ok() } },
      '/api/v1/push': {
        get: {
          tags: ['Push'],
          summary: 'Ob Push eingerichtet ist, mit öffentlichem Schlüssel',
          responses: ok(),
        },
        post: { tags: ['Push'], summary: 'Push-Abo speichern', responses: ok() },
        delete: {
          tags: ['Push'],
          summary: 'Push-Abo entfernen',
          responses: { 204: { description: 'Entfernt' } },
        },
      },
    },
  };
  return NextResponse.json(doc);
}
