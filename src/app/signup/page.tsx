'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Rocket, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { SignInPrompt } from '@/components/auth/SignInPrompt';

export default function SignupPage() {
  const router = useRouter();
  const { user, isLoading, userProfile, getUserProfile } = useAuth();

  useEffect(() => {
    // If user is already authenticated, decide where to send them
    if (user && !user.isAnonymous && !isLoading) {
      if (userProfile && (userProfile.isOrganizer || (userProfile.organizationIds?.length || 0) > 0)) {
        router.push('/dashboard');
      } else {
        // If they just signed in and have no org, send to onboarding
        router.push('/onboarding');
      }
    }
  }, [user, isLoading, userProfile, router]);

  if (isLoading || (user && !user.isAnonymous)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="animate-spin text-emerald-500" />
        <p className="text-zinc-500 animate-pulse">Syncing with the arena...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Start Hosting
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Create and manage hackathon events with custom branding and vanity URLs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Features list */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
              <Rocket className="text-accent" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Self-Serve Events</h3>
              <p className="text-zinc-400">Launch your competition in minutes with our intuitive builder.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Users className="text-emerald-500" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Collaborative Management</h3>
              <p className="text-zinc-400">Invite judges and co-organizers to help manage the event.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="text-yellow-500" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Vanity URLs</h3>
              <p className="text-zinc-400">Professional custom links like platform.live/e/your-event.</p>
            </div>
          </div>
        </div>

        {/* Sign In Card */}
        <div className="animate-in fade-in slide-in-from-right-4 duration-700">
          <SignInPrompt 
            title="Create Organizer Account" 
            description="Sign in to start building your first event."
            hideGuest={true}
          />
          
          <div className="mt-8 text-center text-sm text-zinc-500">
            Just browsing?{' '}
            <Link href="/events" className="text-accent hover:underline">
              View public events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
