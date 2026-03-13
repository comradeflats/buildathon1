'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isRootDashboard = pathname === '/dashboard';

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-white hover:text-accent transition-colors"
              >
                <Home size={18} />
                <span className="font-semibold">Buildathon.LIVE</span>
              </Link>
              <div className="h-6 w-px bg-zinc-800" />
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 text-sm transition-colors ${
                  isRootDashboard ? 'text-accent' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Building2 size={16} />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
