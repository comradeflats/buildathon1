'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, FileText, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AuthButton } from './AuthButton';
import { GuestButton } from './GuestButton';

export function UserMenu() {
  const { user, isAnonymous, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <AuthButton variant="ghost" size="sm" className="justify-start sm:justify-center" />
        <div className="hidden sm:block w-px h-4 bg-zinc-800 mx-1" />
        <GuestButton variant="ghost" size="sm" className="justify-start sm:justify-center" />
      </div>
    );
  }

  const displayName = isAnonymous
    ? 'Guest'
    : user.displayName || user.email || 'User';

  const avatarUrl = user.photoURL;

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-zinc-600 flex items-center justify-center">
            <User size={14} className="text-zinc-300" />
          </div>
        )}
        <span className="text-sm text-zinc-200 max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50">
          <Link
            href="/my-submissions"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            <FileText size={16} />
            My Submissions
          </Link>
          <hr className="my-1 border-zinc-700" />
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
