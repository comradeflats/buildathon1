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
  const { signInWithGitHub, isLoading: authLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('Sign-in failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const isLoading = authLoading || isSigningIn;

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
      {!iconOnly && 'Sign in with GitHub'}
    </Button>
  );
}
