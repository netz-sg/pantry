'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutGrid, BookOpen, Heart, Calendar, ShoppingBag, Package, LogOut, User } from 'lucide-react';
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
          ? 'bg-zinc-800 text-white shadow-lg shadow-black/20'
          : 'text-zinc-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} strokeWidth={isActive(href) ? 2.5 : 2} />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
            <Image 
              src="/logo.png" 
              alt="Pantry Logo" 
              fill
              className="object-contain"
              sizes="40px"
              priority
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Pantry
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className={`hidden lg:flex items-center p-1.5 rounded-full border shadow-sm backdrop-blur-md transition-colors bg-white/5 border-white/10`}>
          <NavLink href="/dashboard" icon={LayoutGrid} label="Dashboard" />
          <NavLink href="/recipes" icon={BookOpen} label="Rezepte" />
          <NavLink href="/favorites" icon={Heart} label="Favoriten" />
          <NavLink href="/planner" icon={Calendar} label="Plan" />
          <NavLink href="/shopping" icon={ShoppingBag} label="Einkauf" />
          <NavLink href="/pantry" icon={Package} label="Vorrat" />
        </nav>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <Link href="/settings" className="flex items-center gap-3 group mr-2">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-white">
                {session?.user?.name || 'User'}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-medium text-zinc-400">
                Chefkoch
              </span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 transition-all border-white/10 group-hover:border-white/20">
              {session?.user?.image ? (
                <img 
                   src={session.user.image} 
                   alt={session.user.name || 'User'} 
                   className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10 text-white">
                  <User size={20} />
                </div>
              )}
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
            title="Abmelden"
          >
             <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
