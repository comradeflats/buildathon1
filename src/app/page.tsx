'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, MapPin, Users2, Sparkles, Clock, Zap, Trophy, Globe, Search, PlayCircle, Star, Beer, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { SignInModal } from '@/components/auth/SignInModal';

export default function HomePage() {
  const { user } = useAuth();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const handleHostClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setIsSignInModalOpen(true);
    }
  };

  return (
    <div className="space-y-32 pb-20 overflow-x-hidden">
      {/* Hero Section - The Pitch */}
      <section className="relative pt-20 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10 opacity-60" />

        <div className="text-center max-w-4xl mx-auto space-y-8 px-6">
          <Badge variant="outline" className="py-1.5 px-5 border-emerald-500/30 text-emerald-400 bg-emerald-500/5 animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles size={14} className="mr-2 fill-emerald-400" />
            Your Portal to Live Innovation
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 break-words">
            buildathon.<span className="text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">live</span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 font-medium">
            A dedicated portal for connecting builders to <span className="text-white underline decoration-emerald-500 underline-offset-4 font-bold">Live, In-Person</span> hackathon events.
          </p>

          <p className="text-zinc-500 max-w-2xl mx-auto animate-in fade-in duration-1000 delay-500">
            We provide the infrastructure for high-energy building sessions where strangers become co-founders in a single afternoon.
          </p>

          <div className="pt-8 animate-bounce">
             <ChevronDown className="mx-auto text-zinc-700" size={32} />
          </div>
        </div>
      </section>

      {/* 1. The Narrative Flow: How it works */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-white mb-4">How it works</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">Short, intense, and social. Here is the blueprint for every live buildathon.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { step: '1. Set a Theme', desc: 'A specific challenge is revealed. Everyone starts at zero.', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { step: '2. Build & Ship', desc: 'The clock is ticking. Teams code, design, and pivot.', icon: Clock, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
            { step: '3. Demo & Vote', desc: 'Present to the room. The crowd and judges vote live.', icon: PlayCircle, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
            { step: '4. Win & Celebrate', desc: 'From beers to crypto—the best ideas take the prize.', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }
          ].map((item, i) => (
            <div key={i} className="space-y-4 text-center group transition-transform hover:-translate-y-1">
              <div className={`w-20 h-20 ${item.bg} rounded-2xl flex items-center justify-center mx-auto border ${item.border}`}>
                <item.icon className={item.color} size={40} />
              </div>
              <h3 className="font-bold text-white">{item.step}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. The Action: Ready to enter? */}
      <section className="text-center py-24 border-t border-zinc-900 relative">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
         <h2 className="text-4xl font-black text-white mb-6 leading-tight">Ready to enter the arena?</h2>
         <p className="text-zinc-400 mb-10 text-lg max-w-xl mx-auto">Sign up to discover upcoming events or get the tools to host your own live buildathon.</p>

         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/events" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:px-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black h-14 text-lg shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
                FIND AN EVENT
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link href="/signup" onClick={handleHostClick} className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:px-10 h-14 text-lg rounded-full border-zinc-700 bg-zinc-900/50 backdrop-blur hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95">
                Host Your Own
              </Button>
            </Link>
         </div>

         <div className="mt-12 pt-8 border-t border-zinc-900/50 flex flex-wrap items-center justify-center gap-8 text-zinc-500 font-medium">
            <Link href="/events" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
              <Globe size={18} />
              Explore the Arenas
            </Link>
         </div>
      </section>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        title="Host a Buildathon"
        description="Sign in to your account to start creating and managing live events in your city."
        hideGuest={true}
      />
    </div>
  );
}
