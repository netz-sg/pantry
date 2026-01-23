import { ReactNode } from 'react';
import Header from '@/components/layout/header';
import MobileNav from '@/components/layout/mobile-nav';
import { UpdateBanner } from '@/components/layout/update-banner';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = 'en' as 'de' | 'en';

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-purple-600/10 rounded-full blur-[100px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[100px] opacity-30 mix-blend-screen" />
      </div>

      {/* Top Navigation Header */}
      <Header />
      
      {/* Update Banner */}
      <UpdateBanner />

      {/* Main Content */}
      <main className="min-w-0 bg-transparent pt-24 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-12 pb-24 md:pb-12">
          {children}
        </div>
      </main>

      {/* Mobile Nav - Bottom */}
      <MobileNav locale={locale} />
    </div>
  );
}
