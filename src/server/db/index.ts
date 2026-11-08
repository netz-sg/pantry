import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import fs from 'node:fs';
import path from 'node:path';
import * as schema from './schema';
import * as relations from './relations';

const fullSchema = { ...schema, ...relations };
export type DB = BetterSQLite3Database<typeof fullSchema>;

type Holder = { db?: DB; sqlite?: Database.Database };
const holder = globalThis as unknown as { __pantryDb?: Holder };
holder.__pantryDb ??= {};

const MIGRATIONS_DIR = path.join(process.cwd(), 'drizzle');

/** Öffnet eine SQLite-Datei, setzt sinnvolle Pragmas und spielt alle Migrationen ein. */
export function openDatabase(file: string): { db: DB; sqlite: Database.Database } {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  sqlite.pragma('busy_timeout = 5000');
  sqlite.pragma('synchronous = NORMAL');
  const db = drizzle(sqlite, { schema: fullSchema });
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  return { db, sqlite };
}

function databasePath() {
  return process.env.DATABASE_PATH ?? './data/pantry.db';
}

/** Gemeinsame Datenbankverbindung des Servers. Wird beim ersten Zugriff geöffnet. */
export function getDb(): DB {
  const h = holder.__pantryDb!;
  if (!h.db) {
    const { db, sqlite } = openDatabase(databasePath());
    h.db = db;
    h.sqlite = sqlite;
  }
  return h.db;
}

export function getSqlite(): Database.Database {
  getDb();
  return holder.__pantryDb!.sqlite!;
}

/** Nur für Tests. Ersetzt die gemeinsame Verbindung. */
export function setDbForTests(db: DB, sqlite: Database.Database) {
  holder.__pantryDb = { db, sqlite };
}

export { schema };
