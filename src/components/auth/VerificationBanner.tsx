'use client';

import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { Mail, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function VerificationBanner() {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if:
  // - No user
  // - User is anonymous
  // - Email is already verified
  // - Banner was dismissed
  if (!user || user.isAnonymous || user.emailVerified || isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsSending(true);
    setMessage(null);

    try {
      await sendEmailVerification(user, {
        url: window.location.origin + '/dashboard', // Redirect after verification
        handleCodeInApp: false,
      });

      setMessage({
        type: 'success',
        text: 'Verification email sent! Check your inbox.',
      });

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error: any) {
      console.error('Email verification error:', error);

      let errorText = 'Failed to send email. Please try again.';
      if (error.code === 'auth/too-many-requests') {
        errorText = 'Too many requests. Please wait a few minutes and try again.';
      }

      setMessage({
        type: 'error',
        text: errorText,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <Mail size={20} className="text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className="text-sm font-bold text-amber-400">
                Please verify your email
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                We've sent a verification link to <span className="font-medium text-white">{user.email}</span>
              </p>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-zinc-500 hover:text-zinc-400 transition-colors shrink-0"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 text-xs mb-2 p-2 rounded ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle size={14} className="shrink-0" />
              ) : (
                <AlertCircle size={14} className="shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            <Button
              onClick={handleResendVerification}
              disabled={isSending}
              variant="secondary"
              size="sm"
              className="text-xs"
            >
              {isSending ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1" />
                  Sending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>

            <p className="text-[10px] text-zinc-500">
              Didn't receive it? Check spam folder or click resend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
