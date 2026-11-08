import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/app-shell';
import { requirePageUser } from '@/server/lib/session';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requirePageUser();
  return <AppShell user={{ name: user.name, image: user.image }}>{children}</AppShell>;
}
