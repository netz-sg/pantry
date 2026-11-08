import { openDatabase, setDbForTests } from '@/server/db';
import { user } from '@/server/db/schema';
import { seedUserDefaults } from '@/server/services/defaults';

/** Frische In-Memory-Datenbank mit allen Migrationen und einem Testkonto. */
export async function setupTestDb() {
  const { db, sqlite } = openDatabase(':memory:');
  setDbForTests(db, sqlite);
  const userId = 'test-user';
  db.insert(user).values({ id: userId, name: 'Test', email: 'test@pantry.local', username: 'test' }).run();
  await seedUserDefaults(userId, db);
  return { db, sqlite, userId };
}
