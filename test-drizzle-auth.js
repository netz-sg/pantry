const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { users } = require('./db/schema.js');
const { eq } = require('drizzle-orm');

const sqlite = new Database('/app/data/pantry.db');
const db = drizzle(sqlite);

async function testAuth() {
  console.log('\n=== Testing Drizzle Auth ===');
  const username = 'Gerhard';
  
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    
    if (!user) {
      console.log('❌ User not found via Drizzle query');
      return;
    }
    
    console.log('✅ User found via Drizzle:');
    console.log('  Username:', user.username);
    console.log('  Password Hash:', user.passwordHash);
    console.log('  Name:', user.name);
    
    // Try different passwords
    const passwords = ['12345678', 'password', 'test1234', 'Gerhard123'];
    console.log('\n=== Testing passwords ===');
    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, user.passwordHash);
      console.log(`  "${pwd}": ${isValid ? '✅ VALID' : '❌ invalid'}`);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log(error);
  }
  
  sqlite.close();
}

testAuth();
