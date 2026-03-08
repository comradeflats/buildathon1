import { Suspense } from 'react';
import VotePageClient from './VoteClient';
import { Loader2 } from 'lucide-react';

export default function VotePage() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <VotePageClient />
    </Suspense>
  );
}
