'use client';

import Link from 'next/link';
import { UserMenu } from '@/components/auth/UserMenu';

export function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
        <Link href="/" className="text-xl font-black flex items-center gap-1">
          <span className="text-white">buildathon</span>
          <span className="text-emerald-400">.live</span>
        </Link>

        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
