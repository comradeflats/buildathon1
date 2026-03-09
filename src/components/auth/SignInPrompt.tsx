'use client';

import { useState } from 'react';
import { Github, UserCircle, Loader2, Vote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

interface SignInPromptProps {
  title?: string;
  description?: string;
  onComplete?: () => void;
}

export function SignInPrompt({
  title = 'Sign in to Vote',
  description = 'You need to sign in to submit votes. Choose how you want to continue:',
  onComplete,
}: SignInPromptProps) {
  const { signInWithGitHub, signInAnonymously } = useAuth();
  const [isSigningInGitHub, setIsSigningInGitHub] = useState(false);
  const [isSigningInAnon, setIsSigningInAnon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGitHubSignIn = async () => {
    setIsSigningInGitHub(true);
    setError(null);
    try {
      await signInWithGitHub();
      onComplete?.();
    } catch (err) {
      setError('Failed to sign in with GitHub. Please try again.');
    } finally {
      setIsSigningInGitHub(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsSigningInAnon(true);
    setError(null);
    try {
      await signInAnonymously();
      onComplete?.();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsSigningInAnon(false);
    }
  };

  const isLoading = isSigningInGitHub || isSigningInAnon;

  return (
    <Card className="p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Vote size={32} className="text-accent" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-zinc-400 text-sm">{description}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleGitHubSignIn}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isSigningInGitHub ? (
            <Loader2 size={18} className="animate-spin mr-2" />
          ) : (
            <Github size={18} className="mr-2" />
          )}
          Sign in with GitHub
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-zinc-500">or</span>
          </div>
        </div>

        <Button
          onClick={handleAnonymousSignIn}
          disabled={isLoading}
          variant="secondary"
          className="w-full"
          size="lg"
        >
          {isSigningInAnon ? (
            <Loader2 size={18} className="animate-spin mr-2" />
          ) : (
            <UserCircle size={18} className="mr-2" />
          )}
          Continue as Guest
        </Button>
      </div>

      <p className="text-xs text-zinc-500 text-center mt-4">
        Guest votes are tracked by browser. Sign in with GitHub to vote from any device.
      </p>
    </Card>
  );
}
