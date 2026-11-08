import { BookOpen, CalendarDays, House, Package, ShoppingCart, type LucideIcon } from 'lucide-react';

export type NavKey = 'today' | 'recipes' | 'plan' | 'shopping' | 'pantry';

export const NAV: { key: NavKey; href: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { key: 'today', href: '/', icon: House, match: (p) => p === '/' },
  { key: 'recipes', href: '/recipes', icon: BookOpen, match: (p) => p.startsWith('/recipes') },
  { key: 'plan', href: '/plan', icon: CalendarDays, match: (p) => p.startsWith('/plan') },
  { key: 'shopping', href: '/shopping', icon: ShoppingCart, match: (p) => p.startsWith('/shopping') },
  { key: 'pantry', href: '/pantry', icon: Package, match: (p) => p.startsWith('/pantry') },
];
