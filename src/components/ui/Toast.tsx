'use client';

import { CheckCircle, XCircle, X, Info, Zap, Sparkles } from 'lucide-react';
import { useVoting } from '@/context/VotingContext';

export function Toast() {
  const { toasts, clearToast } = useVoting();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let bgColor = 'bg-zinc-900/90 border-zinc-700';
        let textColor = 'text-white';
        let iconColor = 'text-zinc-400';
        let accentLine = 'bg-zinc-500';

        switch (toast.type) {
          case 'success':
            Icon = CheckCircle;
            bgColor = 'bg-emerald-950/90 border-emerald-500/30';
            iconColor = 'text-emerald-400';
            accentLine = 'bg-emerald-500';
            break;
          case 'error':
            Icon = XCircle;
            bgColor = 'bg-red-950/90 border-red-500/30';
            iconColor = 'text-red-400';
            accentLine = 'bg-red-500';
            break;
          case 'info':
            Icon = Info;
            bgColor = 'bg-blue-950/90 border-blue-500/30';
            iconColor = 'text-blue-400';
            accentLine = 'bg-blue-500';
            break;
          case 'phase':
            Icon = Zap;
            bgColor = 'bg-amber-950/90 border-amber-500/30';
            iconColor = 'text-amber-400';
            accentLine = 'bg-amber-500';
            break;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden flex items-center gap-3 px-4 py-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-right-full duration-300 ${bgColor}`}
          >
            {/* Live Wire Accent Line */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentLine}`} />
            
            <div className={`shrink-0 ${iconColor}`}>
               <Icon size={20} />
            </div>
            
            <div className="flex-1">
              <p className={`text-sm font-medium ${textColor}`}>
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => clearToast(toast.id)}
              className="shrink-0 text-zinc-500 hover:text-white transition-colors p-1"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
