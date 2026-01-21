import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { registerUser } from '@/app/actions/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registrieren - Pantry',
};

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Jetzt starten</CardTitle>
        <CardDescription>
          Erstelle dein kostenloses Pantry-Konto.
        </CardDescription>
      </CardHeader>
      <form action={registerUser}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Max Mustermann"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="max@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-zinc-500">
              Mindestens 8 Zeichen.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full">
            Account erstellen
          </Button>

          <p className="text-sm text-zinc-500 text-center">
            Bereits registriert?{' '}
            <Link href="/signin" className="text-zinc-900 font-medium hover:underline">
              Anmelden
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
