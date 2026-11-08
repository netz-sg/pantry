'use server';

import path from 'node:path';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { LOCALE_COOKIE } from '@/i18n/config';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { backupDatabase, importData } from '../services/backup';
import { parsePaprikaArchive } from '../services/importer';
import { deleteImage, saveImage } from '../services/media';
import { createLocation, deleteLocation } from '../services/pantry';
import { createCategory, createRecipe, deleteCategory } from '../services/recipes';
import {
  revokeCalendarToken,
  rotateCalendarToken,
  setAvatar,
  updatePreferences,
  updateProfile,
} from '../services/user';
import { run } from './run';

const MAX_UPLOAD = 12 * 1024 * 1024;
const idInput = z.string().min(1).max(64);
const locationKind = z.enum(['fridge', 'freezer', 'pantry', 'other']);

/** Holt eine hochgeladene Datei aus dem Formular und prüft die Größe. */
async function fileFrom(form: FormData, field = 'file'): Promise<Buffer> {
  const f = form.get(field);
  if (!(f instanceof File) || f.size === 0) throw new AppError('bad_request', 'Bitte wähle eine Datei');
  if (f.size > MAX_UPLOAD) throw new AppError('bad_request', 'Die Datei ist größer als 12 MB');
  return Buffer.from(await f.arrayBuffer());
}

/* Profil */

export async function updateProfileAction(input: { name: string; username: string }) {
  return run((u) => updateProfile(u.id, input));
}

export async function uploadAvatarAction(form: FormData) {
  return run(async (u) => {
    const rel = await setAvatar(u.id, await fileFrom(form));
    return rel ? `/media/${rel}` : null;
  });
}

export async function removeAvatarAction() {
  return run(async (u) => {
    await setAvatar(u.id, null);
  });
}

/* Darstellung und Sprache */

export async function setThemeAction(theme: 'system' | 'light' | 'dark') {
  return run((u) => updatePreferences(u.id, { theme }));
}

export async function setLocaleAction(locale: 'de' | 'en' | 'zh') {
  return run(async (u) => {
    updatePreferences(u.id, { locale });
    (await cookies()).set(LOCALE_COOKIE, locale, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/' });
  });
}

/* Küche */

export async function createLocationAction(name: string, kind: 'fridge' | 'freezer' | 'pantry' | 'other') {
  return run((u) => {
    const loc = createLocation(u.id, name, locationKind.parse(kind));
    return { id: loc.id, name: loc.name };
  });
}

export async function deleteLocationAction(id: string) {
  return run((u) => deleteLocation(u.id, idInput.parse(id)));
}

export async function createCategoryAction(name: string) {
  return run((u) => {
    const c = createCategory(u.id, name);
    return { id: c.id, name: c.name };
  });
}

export async function deleteCategoryAction(id: string) {
  return run((u) => deleteCategory(u.id, idInput.parse(id)));
}

/* Daten */

export async function importPantryAction(form: FormData) {
  return run(async (u) => {
    const buf = await fileFrom(form);
    let raw: unknown;
    try {
      raw = JSON.parse(buf.toString('utf8'));
    } catch {
      throw new AppError('bad_request', 'Die Datei ist kein gültiger Pantry-Export');
    }
    return importData(u.id, raw);
  });
}

export async function importPaprikaAction(form: FormData) {
  return run(async (u) => {
    const recipes = parsePaprikaArchive(await fileFrom(form));
    let imported = 0;
    let skipped = 0;
    for (const r of recipes) {
      let imagePath: string | null = null;
      if (r.photo) {
        try {
          imagePath = await saveImage(u.id, r.photo, 'recipe');
        } catch {
          // Rezept ohne Foto übernehmen
        }
      }
      try {
        createRecipe(u.id, r.input, { imagePath });
        imported++;
      } catch (e) {
        logger.debug({ err: e, title: r.input.title }, 'Paprika-Rezept übersprungen');
        await deleteImage(imagePath);
        skipped++;
      }
    }
    return { imported, skipped };
  });
}

export async function backupAction() {
  return run(async () => path.basename(await backupDatabase()), { revalidate: false });
}

/** Neuer geheimer Kalender-Link. Der alte hört sofort auf zu funktionieren. */
export async function createCalendarLink() {
  return run((u) => {
    const token = rotateCalendarToken(u.id);
    return new URL(`/api/calendar/${token}`, process.env.APP_URL ?? 'http://localhost:3000').toString();
  });
}

export async function removeCalendarLink() {
  return run((u) => revokeCalendarToken(u.id));
}
