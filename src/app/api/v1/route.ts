import { NextResponse } from 'next/server';
import pkg from '../../../../package.json';

export function GET() {
  return NextResponse.json({
    name: 'Pantry API',
    version: pkg.version,
    docs: '/api/v1/openapi.json',
    auth: 'POST /api/auth/sign-in/username liefert ein Token. Danach Header „Authorization: Bearer <token>“ senden.',
    resources: [
      '/api/v1/today',
      '/api/v1/recipes',
      '/api/v1/categories',
      '/api/v1/tags',
      '/api/v1/plan',
      '/api/v1/pantry',
      '/api/v1/shopping',
      '/api/v1/me',
      '/api/v1/export',
    ],
  });
}
