import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

// Ensure data directory exists
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './data/pantry.db';
try {
  mkdirSync(dirname(dbPath), { recursive: true });
} catch (error) {
  // Directory already exists
}

// Initialize SQLite connection with WAL mode for better performance
const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });
