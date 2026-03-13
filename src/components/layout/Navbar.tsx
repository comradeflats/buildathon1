'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from '@/components/auth/UserMenu';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { Globe, LayoutGrid } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navLinks = [
    ...(user ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutGrid }] : []),
    { href: '/events', label: 'Explore', icon: Globe },
  ];

  return (
    <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-black shrink-0 tracking-tight">
            <span className="text-white">buildathon.</span>
            <span className="text-emerald-400">live</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href === '/events' && pathname.startsWith('/events'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <UserMenu />
          <WorkspaceSwitcher />
        </div>
      </div>
    </nav>
  );
}
