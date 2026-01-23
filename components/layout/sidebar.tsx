'use client';

import { ChefHat, LayoutGrid, BookOpen, Heart, Calendar, ShoppingBag, Package, Hash, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface NavButtonProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active: boolean;
  count?: number;
}

function NavButton({ icon: Icon, label, href, active, count }: NavButtonProps) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl w-full text-sm font-medium transition-all duration-300 group ${active
          ? 'bg-white/10 text-white shadow-lg shadow-black/5 backdrop-blur-sm ring-1 ring-white/10'
          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
      )}
      <Icon
        size={20}
        strokeWidth={active ? 2.5 : 2}
        className={`transition-colors duration-300 ${active ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}
      />
      <span className="relative z-10">{label}</span>
      {count !== undefined && (
        <span
          className={`ml-auto text-[10px] font-bold py-0.5 px-2 rounded-full ${active ? 'bg-blue-500/20 text-blue-300' : 'bg-black/20 text-zinc-500 group-hover:text-zinc-400'
            }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

interface SectionHeaderProps {
  label: string;
}

function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <div className="px-4 mt-8 mb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
      {label}
    </div>
  );
}

export default function Sidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations('nav');

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isActive = (path: string) => pathname.includes(path);

  return (
    <aside className="hidden md:flex flex-col w-[280px] h-screen sticky top-0 bg-[#09090b] border-r border-white/5 z-50 text-white shadow-2xl">
      {/* Logo */}
      <div className="flex items-center gap-4 px-8 py-8 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
          <ChefHat size={20} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-xl tracking-tight block leading-none">Pantry</span>
          <span className="text-[10px] text-zinc-500 font-medium tracking-widest uppercase">App</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <SectionHeader label="Cooking" />
          <NavButton
            icon={LayoutGrid}
            label={t('dashboard')}
            href="/dashboard"
            active={isActive('/dashboard')}
          />
          <NavButton
            icon={BookOpen}
            label={t('recipes')}
            href="/recipes"
            active={isActive('/recipes')}
          />
          <NavButton
            icon={Heart}
            label={t('favorites')}
            href="/favorites"
            active={isActive('/favorites')}
          />
          <NavButton
            icon={Calendar}
            label={t('plan')}
            href="/planner"
            active={isActive('/planner')}
          />
        </nav>

        {/* Household Navigation */}
        <nav className="space-y-1">
          <SectionHeader label="Household" />
          <NavButton
            icon={ShoppingBag}
            label={t('shopping')}
            href="/shopping"
            active={isActive('/shopping')}
          />
          <NavButton
            icon={Package}
            label={t('pantry')}
            href="/pantry"
            active={isActive('/pantry')}
          />
        </nav>

        {/* Collections (Mock) */}
        <nav className="space-y-1">
          <SectionHeader label="Collections" />
          <NavButton
            icon={Hash}
            label="Vegetarian"
            href="/collections/vegetarian"
            active={false}
          />
          <NavButton
            icon={Hash}
            label="Quick & Easy"
            href="/collections/quick"
            active={false}
          />
        </nav>
      </div>

      {/* User / Settings Footer */}
      <div className="p-4 mx-4 mb-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
        <Link href="/settings" className="flex items-center gap-3 p-1 mb-3 group cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20 ring-2 ring-[#09090b] overflow-hidden">
            {session?.user?.image ? (
              <div className="relative w-full h-full">
                {/* Using standard img tag if Next Image causes issues inside this specific component structure or just use Next Image */}
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              initials
            )}
          </div>
          <div className="text-left flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">{userName}</p>
            <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
          </div>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/signin' })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
        >
          <LogOut size={14} className="group-hover:translate-x-0.5 transition-transform" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}

