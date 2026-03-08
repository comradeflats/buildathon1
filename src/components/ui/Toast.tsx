'use client';

import { CheckCircle, XCircle, X } from 'lucide-react';
import { useVoting } from '@/context/VotingContext';

export function Toast() {
  const { toast, clearToast } = useVoting();

  if (!toast) return null;

  const Icon = toast.type === 'success' ? CheckCircle : XCircle;
  const bgColor = toast.type === 'success' ? 'bg-success/20 border-success' : 'bg-red-500/20 border-red-500';

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColor} animate-slide-up`}
    >
      <Icon
        size={20}
        className={toast.type === 'success' ? 'text-success' : 'text-red-500'}
      />
      <span className="text-white">{toast.message}</span>
      <button
        onClick={clearToast}
        className="text-zinc-400 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
