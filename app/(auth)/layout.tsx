import { ReactNode } from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09090b] relative flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="relative w-20 h-20 transition-transform hover:scale-105 duration-500">
            <Image
              src="/logo.png"
              alt="Pantry Logo"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <div className="text-center">
            <span className="font-bold text-3xl tracking-tight text-white block">Pantry</span>
            <p className="text-zinc-500 text-sm font-medium tracking-wide">Your Digital Cookbook</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="w-full">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-zinc-600">
          <p>© 2026 Pantry App. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
