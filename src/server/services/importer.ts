import { gunzipSync, unzipSync } from 'fflate';
import { parseIngredientLine } from '@/lib/quantity';
import type { RecipeInput } from '@/lib/schemas';
import { AppError } from '../lib/errors';
import { safeFetch } from '../lib/safe-fetch';

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
type Obj = { [k: string]: Json };

const isObj = (v: Json | undefined): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

const clean = (s: string) =>
  decodeEntities(s.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

/** Dauer im ISO-8601-Format wie PT1H30M oder P0DT20M in Minuten. */
export function parseDuration(v: Json | undefined): number | null {
  if (typeof v !== 'string') return null;
  const m = v.match(/^P(?:(\d+)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i);
  if (!m) return null;
  const mins =
    Number(m[1] ?? 0) * 1440 +
    Number(m[2] ?? 0) * 60 +
    Number(m[3] ?? 0) +
    Math.round(Number(m[4] ?? 0) / 60);
  return mins > 0 ? Math.round(mins) : null;
}

function findRecipe(data: Json): Obj | null {
  if (Array.isArray(data)) {
    for (const d of data) {
      const r = findRecipe(d);
      if (r) return r;
    }
    return null;
  }
  if (!isObj(data)) return null;
  const type = data['@type'];
  if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) return data;
  if (data['@graph']) return findRecipe(data['@graph']);
  return null;
}

function text(v: Json | undefined): string | null {
  if (typeof v === 'string') return clean(v) || null;
  if (Array.isArray(v)) return text(v[0]);
  if (isObj(v) && typeof v.text === 'string') return clean(v.text);
  if (isObj(v) && typeof v.name === 'string') return clean(v.name);
  return null;
}

function steps(v: Json | undefined): { text: string; groupName?: string }[] {
  const out: { text: string }[] = [];
  const walk = (x: Json | undefined) => {
    if (typeof x === 'string') {
      x.split(/\n+/)
        .map(clean)
        .filter(Boolean)
        .forEach((t) => out.push({ text: t }));
    } else if (Array.isArray(x)) x.forEach(walk);
    else if (isObj(x)) {
      if (x['@type'] === 'HowToSection' || x.itemListElement) walk(x.itemListElement);
      else if (typeof x.text === 'string') out.push({ text: clean(x.text) });
      else if (typeof x.name === 'string') out.push({ text: clean(x.name) });
    }
  };
  walk(v);
  return out.filter((s) => s.text).slice(0, 100);
}

function imageUrl(v: Json | undefined): string | null {
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return imageUrl(v[0]);
  if (isObj(v))
    return typeof v.url === 'string' ? v.url : typeof v.contentUrl === 'string' ? v.contentUrl : null;
  return null;
}

function servings(v: Json | undefined): number {
  const s = Array.isArray(v) ? v.map(String).join(' ') : String(v ?? '');
  const n = parseInt(s.match(/\d+/)?.[0] ?? '', 10);
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : 4;
}

function microdataFallback(html: string): Obj | null {
  if (!/itemtype=["']https?:\/\/schema\.org\/Recipe["']/i.test(html)) return null;
  const prop = (name: string) =>
    [
      ...html.matchAll(
        new RegExp(
          `itemprop=["']${name}["'][^>]*?(?:content=["']([^"']*)["'][^>]*>|>([\\s\\S]*?)<\\/)`,
          'gi',
        ),
      ),
    ].map((m) => clean(m[1] ?? m[2] ?? ''));
  const name = prop('name')[0];
  if (!name) return null;
  return {
    name,
    description: prop('description')[0] ?? null,
    recipeIngredient: prop('recipeIngredient').length ? prop('recipeIngredient') : prop('ingredients'),
    recipeInstructions: prop('recipeInstructions'),
    prepTime: prop('prepTime')[0] ?? null,
    cookTime: prop('cookTime')[0] ?? null,
    recipeYield: prop('recipeYield')[0] ?? null,
  };
}

export interface ScrapedRecipe {
  input: RecipeInput;
  imageUrl: string | null;
}

/** Liest ein Rezept aus HTML. Erst strukturierte JSON-LD-Daten, dann Microdata. */
export function parseRecipeHtml(html: string, url: string): ScrapedRecipe {
  let data: Obj | null = null;
  for (const m of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      data = findRecipe(JSON.parse(m[1]!.trim()) as Json);
      if (data) break;
    } catch {
      /* kaputter Block, nächster */
    }
  }
  data ??= microdataFallback(html);
  if (!data) throw new AppError('bad_request', 'Auf dieser Seite wurde kein Rezept gefunden');

  const ingLines = Array.isArray(data.recipeIngredient)
    ? data.recipeIngredient.map((x) => clean(String(x))).filter(Boolean)
    : [];
  const nutrition = isObj(data.nutrition) ? data.nutrition : {};
  const kcal = parseInt(String(nutrition.calories ?? '').replace(/[^\d]/g, ''), 10);
  const cat = text(data.recipeCategory);
  const keywords =
    typeof data.keywords === 'string'
      ? data.keywords.split(',')
      : Array.isArray(data.keywords)
        ? data.keywords.map(String)
        : [];

  const input: RecipeInput = {
    title: text(data.name)?.slice(0, 200) ?? 'Importiertes Rezept',
    description: text(data.description)?.slice(0, 4000) ?? null,
    categoryId: null,
    categoryName: cat?.slice(0, 60) ?? null,
    servings: servings(data.recipeYield),
    prepMinutes: parseDuration(data.prepTime),
    cookMinutes:
      parseDuration(data.cookTime) ??
      (parseDuration(data.totalTime) && !parseDuration(data.prepTime) ? parseDuration(data.totalTime) : null),
    restMinutes: null,
    difficulty: null,
    calories: Number.isFinite(kcal) && kcal > 0 ? kcal : null,
    protein: null,
    fat: null,
    carbs: null,
    sourceUrl: url,
    notes: null,
    tags: keywords
      .map((k) => clean(k))
      .filter((k) => k && k.length <= 40)
      .slice(0, 10),
    ingredients: ingLines.slice(0, 200).map((l) => {
      const p = parseIngredientLine(l);
      return {
        groupName: null,
        amount: p.amount,
        unit: p.unit,
        name: p.name.slice(0, 160),
        note: p.note?.slice(0, 200) ?? null,
        optional: false,
      };
    }),
    steps: steps(data.recipeInstructions).map((s) => ({ text: s.text.slice(0, 4000), timerSeconds: null })),
  };
  return { input, imageUrl: imageUrl(data.image) };
}

export async function scrapeRecipe(url: string): Promise<ScrapedRecipe> {
  const { body, finalUrl } = await safeFetch(url, { maxBytes: 4 * 1024 * 1024, timeoutMs: 12_000 });
  const parsed = parseRecipeHtml(body.toString('utf8'), finalUrl);
  if (parsed.imageUrl) parsed.imageUrl = new URL(parsed.imageUrl, finalUrl).toString();
  return parsed;
}

/* ------------------------------------------------------------------ */
/* Paprika (.paprikarecipes)                                           */
/* ------------------------------------------------------------------ */

export interface PaprikaRecipe {
  input: RecipeInput;
  photo: Buffer | null;
}

/** Liest einen Paprika-Export. Das ist ein ZIP mit gzip-komprimierten JSON-Dateien. */
export function parsePaprikaArchive(buf: Buffer): PaprikaRecipe[] {
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(new Uint8Array(buf));
  } catch {
    throw new AppError('bad_request', 'Die Datei ist kein gültiger Paprika-Export');
  }
  const out: PaprikaRecipe[] = [];
  for (const [name, data] of Object.entries(files).slice(0, 2000)) {
    if (!name.endsWith('.paprikarecipe')) continue;
    try {
      const r = JSON.parse(Buffer.from(gunzipSync(data)).toString('utf8')) as Obj;
      const lines = String(r.ingredients ?? '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const dir = String(r.directions ?? '')
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);
      const mins = (v: Json | undefined) => {
        const m = String(v ?? '').match(/(\d+)\s*(h|std|hour)?/i);
        if (!m) return null;
        return m[2] ? Number(m[1]) * 60 : Number(m[1]);
      };
      const cats = Array.isArray(r.categories) ? r.categories.map(String) : [];
      out.push({
        input: {
          title: String(r.name ?? 'Rezept').slice(0, 200),
          description: r.description ? String(r.description).slice(0, 4000) : null,
          categoryId: null,
          categoryName: cats[0]?.slice(0, 60) ?? null,
          servings: servings(r.servings),
          prepMinutes: mins(r.prep_time),
          cookMinutes: mins(r.cook_time),
          restMinutes: null,
          difficulty: null,
          calories: null,
          protein: null,
          fat: null,
          carbs: null,
          sourceUrl:
            typeof r.source_url === 'string' && /^https?:\/\//.test(r.source_url) ? r.source_url : null,
          notes: r.notes ? String(r.notes).slice(0, 4000) : null,
          tags: cats.slice(1, 10),
          ingredients: lines.slice(0, 200).map((l) => {
            const p = parseIngredientLine(l);
            return {
              groupName: null,
              amount: p.amount,
              unit: p.unit,
              name: p.name.slice(0, 160),
              note: p.note,
              optional: false,
            };
          }),
          steps: dir.slice(0, 100).map((t) => ({ text: t.slice(0, 4000), timerSeconds: null })),
        },
        photo: typeof r.photo_data === 'string' && r.photo_data ? Buffer.from(r.photo_data, 'base64') : null,
      });
    } catch {
      /* einzelnes kaputtes Rezept überspringen */
    }
  }
  return out;
}
