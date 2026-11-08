import { apiRoute } from '@/server/lib/api';
import { listTags } from '@/server/services/recipes';

export const GET = apiRoute(({ user }) => listTags(user.id));
