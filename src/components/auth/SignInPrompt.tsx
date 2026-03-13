'use client';

import { useState } from 'react';
import { Github, UserCircle, Loader2, Vote, Mail, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

interface SignInPromptProps {
  title?: string;
  description?: string;
  onComplete?: () => void;
  hideGuest?: boolean;
}

export function SignInPrompt({
  title = 'Sign in to Vote',
  description = 'You need to sign in to submit votes. Choose how you want to continue:',
  onComplete,
  hideGuest = false,
}: SignInPromptProps) {
  const { signInWithGitHub, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAnonymously } = useAuth();
  const [isSigningInGitHub, setIsSigningInGitHub] = useState(false);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [isSigningInAnon, setIsSigningInAnon] = useState(false);
  const [isSigningInEmail, setIsSigningInEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatError = (err: any) => {
    console.error('[AUTH] Formatting error:', err.code, err.message);
    if (err.code === 'auth/account-exists-with-different-credential') {
      return (
        <div className="space-y-2 text-left">
          <p className="font-bold text-amber-400">📧 ACCOUNT ALREADY EXISTS</p>
          <p>You've previously signed in using a different method (likely Google or Email) with this same email address.</p>
          <p className="text-xs opacity-90">Please sign in using your <b>original</b> method to access your account.</p>
        </div>
      );
    }
    if (err.code === 'auth/operation-not-allowed') {
      return 'This sign-in method is not enabled in Firebase. Please enable it in the console.';
    }
    if (err.code === 'auth/operation-not-supported-in-this-environment') {
      return 'This browser is not supported for popup auth. Mobile browsers require redirect mode (which should be automatic).';
    }
    if (err.code === 'auth/popup-blocked') {
      return 'The sign-in popup was blocked. Please allow popups or try again.';
    }
    if (err.code === 'auth/unauthorized-domain') {
      return (
        <div className="space-y-2">
          <p className="font-bold">🚨 ACTION REQUIRED:</p>
          <p>This domain (buildathon.live) is not authorized in Firebase Console.</p>
          <p className="text-[10px] mt-2 opacity-80">Fix: Go to Firebase Console &gt; Auth &gt; Settings &gt; Authorized Domains and add: <b>buildathon.live</b></p>
        </div>
      );
    }
    if (err.code === 'auth/internal-error' || err.message?.includes('network')) {
      return (
        <div className="space-y-2">
          <p className="font-bold">📱 MOBILE AUTH TIP:</p>
          <p>If you see a loop, ensure you aren't in "Private/Incognito" mode, or try a different browser.</p>
          <p className="text-[10px] mt-2 opacity-80 italic">Developers: Check for Auth Domain Mismatch in console logs.</p>
        </div>
      );
    }
    return err.message || 'An unexpected error occurred. Please try again.';
  };

  const handleGitHubSignIn = async () => {
    setIsSigningInGitHub(true);
    setError(null);
    try {
      await signInWithGitHub();
      onComplete?.();
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setIsSigningInGitHub(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningInGoogle(true);
    setError(null);
    try {
      await signInWithGoogle();
      onComplete?.();
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningInEmail(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onComplete?.();
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setIsSigningInEmail(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsSigningInAnon(true);
    setError(null);
    try {
      await signInAnonymously();
      onComplete?.();
    } catch (err: any) {
      setError(formatError(err));
    } finally {
      setIsSigningInAnon(false);
    }
  };

  const isLoading = isSigningInGitHub || isSigningInGoogle || isSigningInAnon || isSigningInEmail;

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

      {showEmailForm ? (
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isSigningInEmail ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Mail size={18} className="mr-2" />
            )}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
          <div className="flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-accent hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              className="text-zinc-400 hover:text-white"
            >
              Back to options
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <Button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className="w-full !bg-[#24292F] hover:!bg-[#24292F]/90 text-white border-none"
            size="lg"
          >
            {isSigningInGitHub ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Github size={18} className="mr-2" />
            )}
            Sign in with GitHub
          </Button>

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-zinc-100 text-zinc-900 border-none"
            size="lg"
          >
            {isSigningInGoogle ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Chrome size={18} className="mr-2" />
            )}
            Sign in with Google
          </Button>

          <Button
            onClick={() => setShowEmailForm(true)}
            disabled={isLoading}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            <Mail size={18} className="mr-2" />
            Continue with Email
          </Button>

          {!hideGuest && (
            <>
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
                variant="ghost"
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
            </>
          )}
        </div>
      )}

      <p className="text-xs text-zinc-500 text-center mt-6">
        {showEmailForm ? 'Secure authentication powered by Firebase.' : hideGuest ? 'Full account required for hosting.' : 'Guest sessions are local to this browser.'}
      </p>
    </Card>
  );
}
