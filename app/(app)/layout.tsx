import { ReactNode } from 'react';
import Header from '@/components/layout/header';
import MobileNav from '@/components/layout/mobile-nav';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = 'de';

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Top Navigation Header */}
      <Header />

      {/* Main Content */}
      <main className="min-w-0 bg-transparent pt-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-12 pb-24 md:pb-12">
          {children}
        </div>
      </main>

      {/* Mobile Nav - Bottom */}
      <MobileNav locale={locale} />
    </div>
  );
}
