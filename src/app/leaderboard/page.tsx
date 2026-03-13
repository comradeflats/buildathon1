'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LeaderboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/events');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 size={32} className="animate-spin text-emerald-500" />
      <p className="text-zinc-500 font-medium animate-pulse">Redirecting to Explore...</p>
    </div>
  );
}
