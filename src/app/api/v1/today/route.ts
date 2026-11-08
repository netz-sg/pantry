import { apiRoute } from '@/server/lib/api';
import { getToday } from '@/server/services/today';

export const GET = apiRoute(({ user }) => getToday(user.id));
