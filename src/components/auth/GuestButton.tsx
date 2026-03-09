'use client';

import { UserCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface GuestButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export function GuestButton({ className, variant = 'secondary', size = 'md', iconOnly = false }: GuestButtonProps) {
  const { signInAnonymously, isLoading: authLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInAnonymously();
    } catch (error) {
      console.error('Guest sign-in failed:', error);
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
        <UserCircle size={18} className={iconOnly ? '' : 'mr-2'} />
      )}
      {!iconOnly && 'Continue as Guest'}
    </Button>
  );
}
