'use client';

import { Github, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface AuthButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export function AuthButton({ className, variant = 'primary', size = 'md', iconOnly = false }: AuthButtonProps) {
  const { signInWithGitHub, isLoading: authLoading, isRedirecting } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    console.log('[AUTH] AuthButton: handleSignIn clicked');
    setIsSigningIn(true);
    try {
      await signInWithGitHub();
      console.log('[AUTH] AuthButton: signInWithGitHub returned');
    } catch (error: any) {
      console.error('[AUTH] AuthButton: Sign-in failed:', error);
      console.error('[AUTH] AuthButton: Error code:', error?.code);
      console.error('[AUTH] AuthButton: Error message:', error?.message);
      setIsSigningIn(false);
    }
    // Note: Don't set isSigningIn(false) in finally on mobile,
    // because the page will redirect and component will unmount
  };

  const isLoading = authLoading || isSigningIn || isRedirecting;

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 size={18} className={iconOnly ? 'animate-spin' : 'animate-spin mr-2'} />
      ) : (
        <Github size={18} className={iconOnly ? '' : 'mr-2'} />
      )}
      {!iconOnly && (isRedirecting ? 'Redirecting...' : 'Sign in with GitHub')}
    </Button>
  );
}
