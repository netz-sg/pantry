import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { registerUser } from '@/app/actions/auth';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Registrieren - Pantry',
};

export default function SignUpPage() {
  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Account erstellen</h2>
        <p className="text-zinc-400 text-sm">
          Starte jetzt und organisiere deine Küche.
        </p>
      </div>
      
      <form action={registerUser} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300 text-xs font-medium uppercase tracking-wider ml-1">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Max Mustermann"
            required
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300 text-xs font-medium uppercase tracking-wider ml-1">E-Mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="max@example.com"
            required
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-300 text-xs font-medium uppercase tracking-wider ml-1">Passwort</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
          <p className="text-[10px] text-zinc-500 ml-1">Mindestens 8 Zeichen.</p>
        </div>

        <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
          Registrieren
        </Button>

        <div className="pt-4 text-center">
          <p className="text-sm text-zinc-500">
            Bereits registriert?{' '}
            <Link href="/signin" className="text-blue-400 hover:text-blue-300 font-medium hover:underline inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Anmelden
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
