import { ChefHat } from 'lucide-react';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 ring-1 ring-white/20">
            <ChefHat size={32} className="text-white" />
          </div>
          <div className="text-center">
             <span className="font-bold text-3xl tracking-tight text-white block">Pantry</span>
             <p className="text-zinc-500 text-sm">Dein digitales Kochbuch</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="w-full">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zinc-600">
          <p>© 2026 Pantry App. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
}
