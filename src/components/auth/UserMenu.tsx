'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, FileText, UserCircle, X, LogIn, LayoutGrid, Settings } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { SignInModal } from './SignInModal';
import { usePathname } from 'next/navigation';

export function UserMenu() {
  const { user, isAnonymous, signOut, authError, clearAuthError } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debug error toast (temporary - for mobile debugging)
  const errorToast = authError && (
    <div className="fixed top-4 left-4 right-4 bg-red-900/95 backdrop-blur-md text-white p-3 rounded-xl text-xs z-[1000] flex items-start gap-3 border border-red-500/30 shadow-2xl animate-in slide-in-from-top-4">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <strong className="uppercase tracking-wider opacity-70">Auth Debugger</strong>
        </div>
        <p className="font-medium text-[11px]">
          {authError.includes('unauthorized-domain') 
            ? '🚨 Action Required: Add "buildathon.live" to Firebase Authorized Domains' 
            : authError}
        </p>
      </div>
      <button 
        onClick={clearAuthError} 
        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              if (pathname === '/signup') return;
              setIsSignInModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        </div>
        <SignInModal 
          isOpen={isSignInModalOpen} 
          onClose={() => setIsSignInModalOpen(false)}
          title="Welcome Back"
          description="Sign in to your account to manage events and view submissions."
          hideGuest={true}
        />
        {errorToast}
      </>
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
    <>
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
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              <LayoutGrid size={16} />
              Dashboard
            </Link>
            <Link
              href="/my-submissions"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              <FileText size={16} />
              My Submissions
            </Link>
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              <Settings size={16} />
              Settings
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
      {errorToast}
    </>
  );
}
