import { openDatabase } from './index';

const file = process.env.DATABASE_PATH ?? './data/pantry.db';
const { sqlite } = openDatabase(file);
sqlite.close();
console.log(`Migrationen eingespielt in ${file}`);
