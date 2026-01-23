import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

// Skip database initialization during build phase
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' ||
  process.env.npm_lifecycle_event === 'build';

let _db: BetterSQLite3Database<typeof schema> | null = null;

function initializeDatabase(): BetterSQLite3Database<typeof schema> {
  if (_db) return _db;

  if (isBuildPhase) {
    // Return a mock/empty DB during build to prevent SQLite errors
    // This works because force-dynamic pages won't actually execute at build time
    throw new Error('Database not available during build phase');
  }

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
  sqlite.pragma('busy_timeout = 5000');
  sqlite.pragma('synchronous = NORMAL');

  // Create Drizzle instance
  _db = drizzle(sqlite, { schema });
  return _db;
}

// Export a getter that lazily initializes the database
export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(target, prop) {
    const database = initializeDatabase();
    return (database as unknown as Record<string | symbol, unknown>)[prop];
  }
});

