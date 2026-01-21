import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signInUser } from '@/app/actions/auth';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Anmelden - Pantry',
};

export default function SignInPage() {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Willkommen zurück</h2>
        <p className="text-zinc-400 text-sm">
          Melde dich an, um auf deine Rezepte zuzugreifen.
        </p>
      </div>
      
      <form action={signInUser} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300 text-xs font-medium uppercase tracking-wider ml-1">E-Mail Adresse</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
             <Label htmlFor="password" className="text-zinc-300 text-xs font-medium uppercase tracking-wider ml-1">Passwort</Label>
             <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Vergessen?</Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
          Anmelden
        </Button>

        <div className="pt-4 text-center">
          <p className="text-sm text-zinc-500">
            Noch kein Account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium hover:underline inline-flex items-center gap-1">
              Jetzt registrieren <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
