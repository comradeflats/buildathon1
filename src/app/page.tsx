'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, MapPin, Users2, Sparkles, Clock, Zap, Trophy, Globe, LayoutGrid, Search, PlayCircle, Star, Beer } from 'lucide-react';
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
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10 opacity-60" />
        
        <div className="text-center max-w-4xl mx-auto space-y-8 px-4">
          <Badge variant="outline" className="py-1.5 px-5 border-emerald-500/30 text-emerald-400 bg-emerald-500/5 animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles size={14} className="mr-2 fill-emerald-400" />
            The Home of Live Hackathons
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            buildathon.<span className="text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text">live</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 font-medium">
            Where strangers become co-founders in a single afternoon. Experience the electric energy of <span className="text-white underline decoration-emerald-500 underline-offset-4">Face to Face</span> innovation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Link href="/events" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:px-10 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black h-14 text-lg rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
                DISCOVER EVENTS
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
            <Link href="/signup" onClick={handleHostClick} className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:px-10 h-14 text-lg rounded-full border-zinc-700 bg-zinc-900/50 backdrop-blur hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95">
                Host a Buildathon
              </Button>
            </Link>
          </div>

          <div className="pt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-zinc-500 font-medium animate-in fade-in duration-1000 delay-500">
             <div className="flex items-center gap-2">
                <Users2 size={18} className="text-emerald-500/70" />
                <span>All Skill Levels</span>
             </div>
             <div className="hidden sm:block w-1.5 h-1.5 bg-zinc-800 rounded-full" />
             <div className="flex items-center gap-2">
                <MapPin size={18} className="text-emerald-500/70" />
                <span>Face to Face</span>
             </div>
             <div className="hidden sm:block w-1.5 h-1.5 bg-zinc-800 rounded-full" />
             <div className="flex items-center gap-2">
                <Clock size={18} className="text-emerald-500/70" />
                <span>Real Time Action</span>
             </div>
          </div>
        </div>
      </section>

      {/* The Live Flow Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-white mb-4">The Live Flow</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">Short, intense, and incredibly social. Here's how a typical buildathon goes down.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <Zap className="text-emerald-500" size={28} />
            </div>
            <h3 className="font-bold text-white">1. Set a Theme</h3>
            <p className="text-sm text-zinc-500">We reveal a specific challenge. Everyone starts at zero together.</p>
          </div>

          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto border border-cyan-500/20">
              <Clock className="text-cyan-500" size={28} />
            </div>
            <h3 className="font-bold text-white">2. Build & Ship</h3>
            <p className="text-sm text-zinc-500">The clock is ticking. Teams code, design, and pivot in real-time.</p>
          </div>

          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
              <PlayCircle className="text-indigo-500" size={28} />
            </div>
            <h3 className="font-bold text-white">3. Demo & Vote</h3>
            <p className="text-sm text-zinc-500">Present your work to the room. The crowd and judges vote live.</p>
          </div>

          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto border border-yellow-500/20">
              <Trophy className="text-yellow-500" size={28} />
            </div>
            <h3 className="font-bold text-white">4. Win & Celebrate</h3>
            <p className="text-sm text-zinc-500">From a free beer to USDC—the best ideas take home the prize.</p>
          </div>
        </div>
      </section>

      {/* Discovery Section Teaser */}
      <section className="max-w-5xl mx-auto px-4 bg-zinc-900/30 border border-zinc-800 rounded-[3rem] p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -z-10" />
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white leading-tight">Buildathons Near You</h2>
            <p className="text-zinc-400 text-lg">
              It started in <span className="text-emerald-400 font-bold">Da Nang</span>. Now it's spreading. Find a live room in your city or see where the next global sprint is happening.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/events?view=map">
                <Button className="w-full sm:w-auto rounded-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 border-none font-bold">
                  <Globe className="mr-2" size={18} />
                  View Global Map
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="ghost" className="w-full sm:w-auto text-emerald-400 font-bold">
                  Browse by Date
                  <ChevronRight className="ml-1" size={18} />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl aspect-square md:aspect-video flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="text-center p-8 space-y-4 z-10">
              <MapPin size={48} className="text-emerald-500 mx-auto animate-bounce" />
              <p className="text-zinc-500 font-medium">Interactive Map Integration Coming Soon</p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="bg-zinc-900/80 border-zinc-700">Da Nang</Badge>
                <Badge variant="outline" className="bg-zinc-900/80 border-zinc-700 opacity-50">Ho Chi Minh</Badge>
                <Badge variant="outline" className="bg-zinc-900/80 border-zinc-700 opacity-30">Singapore</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center py-20 border-t border-zinc-900">
         <h2 className="text-4xl font-black text-white mb-6">Inspired by the live energy?</h2>
         <p className="text-zinc-400 mb-10 text-lg max-w-xl mx-auto">Take the Da Nang blueprint to your city. We provide the tools to run your own live arena.</p>
         <Link href="/signup" onClick={handleHostClick}>
            <Button size="lg" className="rounded-full px-12 bg-white text-zinc-950 font-black hover:bg-zinc-200 transition-colors">
               START A BUILDATHON
            </Button>
         </Link>
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
