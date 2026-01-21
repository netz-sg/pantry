const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('/app/data/pantry.db');

const username = 'Gerhard';
const newPassword = 'test12345'; // Temporäres Passwort

console.log(`\n🔐 Resetting password for user: ${username}`);
console.log(`New password will be: ${newPassword}`);

// Hash the new password
const passwordHash = bcrypt.hashSync(newPassword, 10);

// Update the user
const result = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?')
  .run(passwordHash, username);

if (result.changes > 0) {
  console.log('\n✅ Password reset successful!');
  console.log(`You can now login with:`);
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${newPassword}`);
} else {
  console.log('\n❌ Failed to reset password. User not found?');
}

db.close();
