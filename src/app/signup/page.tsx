'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Rocket, Users, Calendar, Trophy, Globe, Zap, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { SignInPrompt } from '@/components/auth/SignInPrompt';

export default function SignupPage() {
  const router = useRouter();
  const { user, isLoading, userProfile } = useAuth();

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
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
          Join the <span className="text-emerald-400">Arena</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
          Whether you're here to build, compete, or host, your journey starts with a permanent builder profile.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Value Propositions */}
        <div className="space-y-12">
          {/* For Builders */}
          <section className="space-y-6">
            <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={16} /> For Builders
            </h2>
            <div className="grid gap-6">
              <div className="flex gap-4 group">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
                  <Trophy className="text-emerald-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Builder Legacy</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">Track your rankings, project history, and achievements across every arena you enter.</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                  <Globe className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Verified Profile</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">Claim your unique builder handle and link your GitHub to showcase your shipping history.</p>
                </div>
              </div>
            </div>
          </section>

          {/* For Organizers */}
          <section className="space-y-6">
            <h2 className="text-sm font-black text-violet-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Rocket size={16} /> For Organizers
            </h2>
            <div className="grid gap-6">
              <div className="flex gap-4 group">
                <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-violet-500/20 group-hover:bg-violet-500/20 transition-all">
                  <ShieldCheck className="text-violet-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">White-Label Arenas</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">Launch professional hackathons with your own branding, judges, and custom domains.</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                  <Calendar className="text-amber-400" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Live Event Management</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">Real-time theme generation, participant tracking, and automated judging workflows.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Auth Section */}
        <div className="sticky top-24">
          <Card className="p-8 border-zinc-800 bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10" />
            
            <SignInPrompt 
              title="Create Your Account" 
              description="Sign in to claim your profile and access full features."
              hideGuest={true}
            />
            
            <div className="mt-8 pt-8 border-t border-zinc-800/50 text-center">
              <p className="text-zinc-500 text-sm font-medium mb-4">Just looking around?</p>
              <Link href="/events">
                <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 font-bold">
                  Continue as Guest to Explore
                </Button>
              </Link>
            </div>
          </Card>
          
          <p className="mt-6 text-center text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">
            By continuing, you agree to the Arena Rules of Engagement
          </p>
        </div>
      </div>
    </div>
  );
}
