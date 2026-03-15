'use client';

import { useState } from 'react';
import { Loader2, AlertCircle, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  eventName: string;
  eventDate: string;
  registrationStatus: 'approved' | 'waitlisted';
}

export function WithdrawModal({
  isOpen,
  onClose,
  onConfirm,
  eventName,
  eventDate,
  registrationStatus
}: WithdrawModalProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError(null);
    setIsWithdrawing(true);

    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isApproved = registrationStatus === 'approved';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isWithdrawing}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 mb-3">
              <LogOut size={24} />
            </div>
            <h2 className="text-2xl font-black text-white">Withdraw from Event?</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              This action cannot be undone. {isApproved && 'Your spot will be freed up for someone on the waitlist.'}
            </p>
          </div>

          {/* Event Details */}
          <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 space-y-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Event Name</p>
              <p className="text-sm font-bold text-white">{eventName}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Event Date</p>
              <p className="text-sm font-medium text-zinc-400">{eventDate}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Current Status</p>
              <Badge className={`text-[10px] font-bold ${
                isApproved
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
              }`}>
                {isApproved ? 'REGISTERED' : 'WAITLISTED'}
              </Badge>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400 leading-relaxed">
              {isApproved
                ? 'If you withdraw now, you may need to rejoin the waitlist if you change your mind.'
                : 'Withdrawing will remove you from the waitlist permanently.'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isWithdrawing}
              className="flex-1 h-11 border border-zinc-700 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isWithdrawing}
              className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              {isWithdrawing ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <LogOut size={16} className="mr-2" />
                  Withdraw
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
