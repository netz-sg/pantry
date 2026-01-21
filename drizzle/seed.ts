import { initializeDatabase } from '../db/init';

async function seed() {
  console.log('🌱 Seeding database...');
  
  // Initialize database schema first
  initializeDatabase();
  
  console.log('✅ Database is ready (empty by design)');
  console.log('✅ First user will be created during registration');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
