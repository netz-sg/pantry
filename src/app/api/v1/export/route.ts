import { apiRoute } from '@/server/lib/api';
import { exportData } from '@/server/services/backup';

export const GET = apiRoute(({ user }) => {
  const body = JSON.stringify(exportData(user.id), null, 2);
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="pantry-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
});
