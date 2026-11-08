/**
 * Läuft einmal beim Serverstart. Plant zwei tägliche Aufgaben
 * - um 8 Uhr Push-Erinnerungen für bald ablaufende Lebensmittel
 * - um 3 Uhr eine Sicherung der Datenbank (die letzten 14 bleiben erhalten)
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  const g = globalThis as unknown as { __pantryJobs?: boolean };
  if (g.__pantryJobs) return;
  g.__pantryJobs = true;

  // Umgebung prüfen und Migrationen sofort einspielen, damit Fehler beim Start auffallen
  await import('./env');
  const { getDb } = await import('./server/db');
  getDb();
  const { logger } = await import('./server/lib/logger');
  logger.info('Pantry gestartet, Datenbank bereit');
  const lastRun: Record<string, string> = {};

  const tick = async () => {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    try {
      if (now.getHours() >= 8 && lastRun.push !== day) {
        lastRun.push = day;
        const { sendExpiryNotifications } = await import('./server/services/push');
        const sent = await sendExpiryNotifications();
        if (sent) logger.info({ sent }, 'Ablauf-Erinnerungen verschickt');
      }
      if (now.getHours() >= 3 && lastRun.backup !== day && process.env.BACKUP_DISABLED !== '1') {
        lastRun.backup = day;
        const { backupDatabase } = await import('./server/services/backup');
        const file = await backupDatabase();
        logger.info({ file }, 'Datenbank gesichert');
      }
    } catch (err) {
      logger.error({ err }, 'Tägliche Aufgabe fehlgeschlagen');
    }
  };

  setTimeout(tick, 60_000);
  setInterval(tick, 15 * 60_000).unref();
}
