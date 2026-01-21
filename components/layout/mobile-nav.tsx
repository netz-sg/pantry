'use client';

import { LayoutGrid, Heart, Package, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavButtonProps {
  icon: React.ElementType;
  href: string;
  active: boolean;
}

function MobileNavButton({ icon: Icon, href, active }: MobileNavButtonProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 transition-colors ${
        active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    </Link>
  );
}

export default function MobileNav({ locale }: { locale: string }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  return (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-between px-6 py-4 z-40 shadow-2xl">
      <MobileNavButton
        icon={LayoutGrid}
        href="/dashboard"
        active={isActive('/dashboard')}
      />
      <MobileNavButton
        icon={Heart}
        href="/favorites"
        active={isActive('/favorites')}
      />
      <MobileNavButton
        icon={Package}
        href="/pantry"
        active={isActive('/pantry')}
      />
      <MobileNavButton
        icon={ShoppingBag}
        href="/shopping"
        active={isActive('/shopping')}
      />
    </nav>
  );
}
