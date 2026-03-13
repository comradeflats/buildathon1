'use client';

import { Suspense } from 'react';
import { Loader2, LayoutGrid, Search, Trophy } from 'lucide-react';
import { TeamGallery } from '@/components/gallery/TeamGallery';
import { Card } from '@/components/ui/Card';

function GlobalGalleryContent() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <LayoutGrid size={28} />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight italic">GLOBAL <span className="text-emerald-400">GALLERY</span></h1>
          </div>
          <p className="text-zinc-500 max-w-xl font-medium">
            Explore every project ever shipped across all buildathon arenas. 
            From early prototypes to production-ready applications.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
           <div className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-bold shadow-lg">
              All Arenas
           </div>
           <div className="px-4 py-2 text-zinc-500 text-sm font-bold">
              Featured
           </div>
        </div>
      </div>

      {/* Main Gallery */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <TeamGallery />
      </div>

      {/* Footer Info */}
      <Card className="p-8 border-dashed border-zinc-800 bg-zinc-950/30 text-center">
        <Trophy size={32} className="mx-auto text-zinc-800 mb-4" />
        <h3 className="text-lg font-bold text-zinc-500 uppercase tracking-widest">Want to see your project here?</h3>
        <p className="text-sm text-zinc-600 mt-2">Join an active arena and ship something amazing to join the global wall of fame.</p>
      </Card>
    </div>
  );
}

export default function GlobalGalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    }>
      <GlobalGalleryContent />
    </Suspense>
  );
}
