const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('/app/data/pantry.db', { readonly: true });

console.log('\n=== Testing Auth ===');
const username = 'Gerhard';
console.log(`Testing login for username: ${username}`);

const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

if (!user) {
  console.log('❌ User not found!');
} else {
  console.log('✅ User found:', user.username);
  console.log('Password hash:', user.password_hash);
  
  // Test mit verschiedenen Passwörtern
  const testPasswords = ['12345678', 'password', 'Gerhard123', 'test1234'];
  
  console.log('\n=== Testing passwords ===');
  for (const pwd of testPasswords) {
    try {
      const isValid = bcrypt.compareSync(pwd, user.password_hash);
      console.log(`Password "${pwd}": ${isValid ? '✅ VALID' : '❌ invalid'}`);
    } catch (error) {
      console.log(`Password "${pwd}": ❌ Error -`, error.message);
    }
  }
}

db.close();
