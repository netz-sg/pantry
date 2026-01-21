const Database = require('better-sqlite3');

const db = new Database('/app/data/pantry.db', { readonly: true });

console.log('\n=== Checking Users ===');
const users = db.prepare('SELECT id, username, name, email FROM users').all();
console.log('Users found:', users.length);
users.forEach(user => {
  console.log(`- ID: ${user.id}, Username: ${user.username}, Name: ${user.name}`);
});

console.log('\n=== Full user data (with password hash) ===');
const fullUsers = db.prepare('SELECT * FROM users').all();
fullUsers.forEach(user => {
  console.log(user);
});

db.close();
