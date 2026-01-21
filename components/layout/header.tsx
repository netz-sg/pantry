'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ChefHat, LayoutGrid, BookOpen, Heart, Calendar, ShoppingBag, Package, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname.includes(path);

  // Check if we are on the recipe detail page (dark hero background)
  // Logic: starts with /recipes/, has 3 segments (e.g. /recipes/123), and is not /recipes/new
  const isRecipeDetail = pathname.startsWith('/recipes/') && 
                         pathname.split('/').length === 3 && 
                         !pathname.split('/').includes('new');

  // Determine text color based on scroll state and page type
  // If we are on recipe detail AND not scrolled (transparent header over dark image): use white text
  // Otherwise default to zinc-500/900
  const isDarkHeroState = isRecipeDetail && !scrolled;

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
        isActive(href)
          ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/10'
          : isDarkHeroState 
            ? 'text-zinc-300 hover:text-white hover:bg-white/10' 
            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
      }`}
    >
      <Icon size={18} strokeWidth={isActive(href) ? 2.5 : 2} />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-105 ${
            isDarkHeroState ? 'bg-white text-zinc-900 shadow-white/10' : 'bg-zinc-900 text-white shadow-zinc-900/20'
          }`}>
            <ChefHat size={20} />
          </div>
          <span className={`font-bold text-xl tracking-tight ${isDarkHeroState ? 'text-white' : 'text-zinc-900'}`}>
            Pantry
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={`hidden lg:flex items-center p-1.5 rounded-full border shadow-sm backdrop-blur-md transition-colors ${
          isDarkHeroState ? 'bg-black/20 border-white/10' : 'bg-white/50 border-zinc-200/50'
        }`}>
          <NavLink href="/dashboard" icon={LayoutGrid} label="Dashboard" />
          <NavLink href="/recipes" icon={BookOpen} label="Rezepte" />
          <NavLink href="/favorites" icon={Heart} label="Favoriten" />
          <NavLink href="/planner" icon={Calendar} label="Plan" />
          <NavLink href="/shopping" icon={ShoppingBag} label="Einkauf" />
          <NavLink href="/pantry" icon={Package} label="Vorrat" />
        </nav>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className={`text-sm font-bold ${isDarkHeroState ? 'text-white' : 'text-zinc-900'}`}>
              {session?.user?.name || 'User'}
            </span>
            <span className={`text-[10px] uppercase tracking-wider font-medium ${isDarkHeroState ? 'text-zinc-300' : 'text-zinc-500'}`}>
              Chefkoch
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isDarkHeroState 
                ? 'bg-white/10 text-white hover:bg-white hover:text-zinc-900' 
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'
            }`}
            title="Abmelden"
          >
             <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
