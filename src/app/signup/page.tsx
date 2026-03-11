'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Github, Loader2, Rocket, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { user, isLoading, authError, signInWithGitHub, userProfile, getUserProfile } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // If user is already authenticated and is an organizer, redirect to dashboard
    if (user && !user.isAnonymous) {
      getUserProfile().then((profile) => {
        if (profile?.isOrganizer || (profile?.organizationIds?.length || 0) > 0) {
          router.push('/dashboard');
        } else {
          // User is authenticated but not an organizer yet - go to onboarding
          router.push('/onboarding');
        }
      });
    }
  }, [user, router, getUserProfile]);

  const handleGitHubSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGitHub();
      // Auth state change will trigger the useEffect above to handle redirect
    } catch (error) {
      console.error('Sign-in failed:', error);
      setIsSigningIn(false);
    }
  };

  if (isLoading || (user && !user.isAnonymous)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Start Your Buildathon
        </h1>
        <p className="text-xl text-zinc-400">
          Create and manage hackathon events with vanity URLs
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Rocket className="text-accent" size={24} />
          </div>
          <h3 className="font-semibold text-white mb-2">Self-Serve Events</h3>
          <p className="text-sm text-zinc-400">
            Create and manage your own buildathon events in minutes
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="text-accent" size={24} />
          </div>
          <h3 className="font-semibold text-white mb-2">Team Collaboration</h3>
          <p className="text-sm text-zinc-400">
            Invite team members and manage permissions together
          </p>
        </Card>

        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-accent" size={24} />
          </div>
          <h3 className="font-semibold text-white mb-2">Vanity URLs</h3>
          <p className="text-sm text-zinc-400">
            Custom event URLs like buildathon.live/e/your-event
          </p>
        </Card>
      </div>

      {/* Sign In Card */}
      <Card className="p-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Get Started
          </h2>
          <p className="text-zinc-400">
            Sign in with GitHub to create your first event
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{authError}</p>
          </div>
        )}

        <Button
          onClick={handleGitHubSignIn}
          disabled={isSigningIn}
          size="lg"
          className="w-full"
        >
          {isSigningIn ? (
            <>
              <Loader2 size={20} className="mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Github size={20} className="mr-2" />
              Sign in with GitHub
            </>
          )}
        </Button>

        <div className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/dashboard" className="text-accent hover:underline">
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>

      {/* Browse Events Link */}
      <div className="text-center mt-8">
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
          Just browsing? View public events
        </Link>
      </div>
    </div>
  );
}
