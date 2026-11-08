import { apiRoute } from '@/server/lib/api';
import { finishShopping } from '@/server/services/shopping';

export const POST = apiRoute(({ user }) => ({ movedToPantry: finishShopping(user.id) }));
