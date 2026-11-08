/**
 * Setzt das Passwort des Pantry-Kontos neu, etwa wenn es vergessen wurde.
 *
 * Aufruf
 *   npm run reset-password
 *   npm run reset-password -- <benutzername>
 *
 * Das neue Passwort wird verdeckt abgefragt und zweimal eingegeben.
 * Alle offenen Sitzungen werden danach beendet.
 */
import { hashPassword } from 'better-auth/crypto';
import readline from 'node:readline';
import { openDatabase } from '../src/server/db';

const MIN = 8;
const MAX = 128;

/** Fragt zwei Zeilen ab, im Terminal ohne sichtbare Eingabe. */
function askTwice(q1: string, q2: string): Promise<[string, string]> {
  const tty = Boolean(process.stdin.isTTY);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: tty });
  if (tty) {
    const out = rl as unknown as { _writeToOutput: (s: string) => void };
    const write = out._writeToOutput.bind(rl);
    out._writeToOutput = (s: string) => {
      if (s === q1 || s === q2) write(s);
      else if (s.includes('\n') || s.includes('\r')) write('\n');
    };
  }
  const lines: string[] = [];
  return new Promise((resolve) => {
    rl.setPrompt(q1);
    rl.prompt();
    rl.on('line', (line) => {
      lines.push(line);
      if (lines.length === 1) {
        rl.setPrompt(q2);
        rl.prompt();
      } else {
        rl.close();
        resolve([lines[0]!, lines[1]!]);
      }
    });
    rl.on('close', () => resolve([lines[0] ?? '', lines[1] ?? '']));
  });
}

async function main() {
  const file = process.env.DATABASE_PATH ?? './data/pantry.db';
  const { sqlite } = openDatabase(file);

  const users = sqlite.prepare('select id, name, username from user').all() as {
    id: string;
    name: string;
    username: string | null;
  }[];
  if (users.length === 0) {
    console.error(`In ${file} gibt es noch kein Konto. Richte es unter /setup ein.`);
    process.exit(1);
  }

  const wanted = process.argv[2];
  const target = wanted ? users.find((u) => u.username === wanted) : users[0];
  if (!target) {
    console.error(`Kein Konto mit dem Benutzernamen „${wanted}“ gefunden.`);
    process.exit(1);
  }

  const acc = sqlite
    .prepare("select id from account where user_id = ? and provider_id = 'credential'")
    .get(target.id) as { id: string } | undefined;
  if (!acc) {
    console.error('Zu diesem Konto gibt es keine Anmeldung mit Passwort.');
    process.exit(1);
  }

  console.log(`Neues Passwort für ${target.name} (${target.username ?? 'ohne Benutzername'})`);
  const [first, second] = await askTwice('Neues Passwort ', 'Noch einmal ');
  if (first.length < MIN || first.length > MAX) {
    console.error(`Das Passwort muss ${MIN} bis ${MAX} Zeichen lang sein.`);
    process.exit(1);
  }
  if (first !== second) {
    console.error('Die beiden Eingaben stimmen nicht überein. Nichts wurde geändert.');
    process.exit(1);
  }

  const hash = await hashPassword(first);
  const now = Date.now();
  sqlite.transaction(() => {
    sqlite.prepare('update account set password = ?, updated_at = ? where id = ?').run(hash, now, acc.id);
    sqlite.prepare('delete from session where user_id = ?').run(target.id);
    // Gesperrte Anmeldeversuche freigeben
    sqlite.prepare("delete from rate_limit where key like '%sign-in%'").run();
  })();
  sqlite.close();

  console.log('Passwort geändert. Alle Sitzungen wurden abgemeldet.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
