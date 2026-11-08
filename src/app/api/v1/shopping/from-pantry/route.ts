import { apiRoute } from '@/server/lib/api';
import { addRunningLowFromPantry } from '@/server/services/shopping';

/** Setzt fast Leeres und Abgelaufenes aus dem Vorrat auf die Liste. */
export const POST = apiRoute(({ user }) => ({ added: addRunningLowFromPantry(user.id) }));
