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
      className={`flex flex-col items-center gap-1 ${
        active ? 'text-zinc-900' : 'text-zinc-400'
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 px-6 py-3 flex justify-between z-40 pb-safe">
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
