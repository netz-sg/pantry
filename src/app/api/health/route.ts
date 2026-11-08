import { NextResponse } from 'next/server';
import pkg from '../../../../package.json';
import { getSqlite } from '@/server/db';

export const dynamic = 'force-dynamic';

export function GET() {
  try {
    getSqlite().prepare('SELECT 1').get();
    return NextResponse.json({ status: 'ok', version: pkg.version, database: 'ok' });
  } catch {
    return NextResponse.json({ status: 'error', version: pkg.version, database: 'error' }, { status: 503 });
  }
}
