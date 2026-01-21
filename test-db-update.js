const Database = require('better-sqlite3');

const db = new Database('/app/data/pantry.db');

console.log('\n=== Testing Database Updates ===');

// Get current user
const user = db.prepare('SELECT * FROM users WHERE username = ?').get('Gerhard');
console.log('\nCurrent user data:');
console.log('  Name:', user.name);
console.log('  Image:', user.image);
console.log('  Updated at:', user.updated_at);

// Try to update the name
console.log('\n📝 Updating user name...');
const updateResult = db.prepare('UPDATE users SET name = ?, updated_at = ? WHERE username = ?')
  .run('Sebastian TEST', Math.floor(Date.now() / 1000), 'Gerhard');

console.log('Update result:', updateResult);

// Verify update
const updatedUser = db.prepare('SELECT * FROM users WHERE username = ?').get('Gerhard');
console.log('\nUpdated user data:');
console.log('  Name:', updatedUser.name);
console.log('  Updated at:', updatedUser.updated_at);

if (updatedUser.name === 'Sebastian TEST') {
  console.log('\n✅ Database IS writable!');
} else {
  console.log('\n❌ Database update FAILED!');
}

// Restore original name
db.prepare('UPDATE users SET name = ? WHERE username = ?').run('Sebastian', 'Gerhard');
console.log('\n✅ Restored original name');

db.close();
