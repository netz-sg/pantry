import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { registerUser } from '@/app/actions/auth';
import { checkRegistrationAllowed } from '@/app/actions/registration';
import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sign Up - Pantry',
};

export const dynamic = 'force-dynamic';

export default async function SignUpPage() {
  const canRegister = await checkRegistrationAllowed();

  if (!canRegister) {
    redirect('/signin');
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-zinc-400 text-sm">
          Get started and organize your kitchen.
        </p>
      </div>

      <form action={registerUser} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-300 text-xs font-medium uppercase tracking-wider ml-1">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-zinc-300 text-xs font-medium uppercase tracking-wider ml-1">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="username"
            required
            minLength={3}
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
          <p className="text-[10px] text-zinc-500 ml-1">Minimum 3 characters.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-300 text-xs font-medium uppercase tracking-wider ml-1">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl h-12 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
          <p className="text-[10px] text-zinc-500 ml-1">Minimum 8 characters.</p>
        </div>

        <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
          Sign Up
        </Button>

        <div className="pt-4 text-center">
          <p className="text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/signin" className="text-blue-400 hover:text-blue-300 font-medium hover:underline inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
