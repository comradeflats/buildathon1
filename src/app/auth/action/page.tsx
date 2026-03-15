'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode, applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Lock, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

type ActionMode = 'resetPassword' | 'verifyEmail' | 'recoverEmail';

function AuthActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams?.get('mode') as ActionMode;
  const oobCode = searchParams?.get('oobCode');

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');

  // For password reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verify action code on mount
  useEffect(() => {
    if (!auth || !oobCode) {
      setVerificationError('Invalid or missing action code');
      setIsVerifying(false);
      return;
    }

    const verifyCode = async () => {
      try {
        if (mode === 'resetPassword') {
          // Verify the password reset code and get user email
          const userEmail = await verifyPasswordResetCode(auth, oobCode);
          setEmail(userEmail);
        } else if (mode === 'verifyEmail') {
          // Apply email verification code
          await applyActionCode(auth, oobCode);
          setSuccess(true);
        }
        setIsVerifying(false);
      } catch (error: any) {
        console.error('Action code verification error:', error);
        if (error.code === 'auth/invalid-action-code') {
          setVerificationError('This link is invalid or has already been used.');
        } else if (error.code === 'auth/expired-action-code') {
          setVerificationError('This link has expired. Please request a new one.');
        } else {
          setVerificationError(error.message || 'Failed to verify action code');
        }
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [mode, oobCode]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!auth || !oobCode) {
      setError('Invalid reset link');
      return;
    }

    setIsSubmitting(true);

    try {
      // Confirm password reset
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Use a stronger password.');
      } else if (error.code === 'auth/invalid-action-code') {
        setError('This reset link is invalid or has already been used.');
      } else if (error.code === 'auth/expired-action-code') {
        setError('This reset link has expired. Please request a new one.');
      } else {
        setError(error.message || 'Failed to reset password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-accent" size={40} />
          <h2 className="text-xl font-bold text-white mb-2">Verifying...</h2>
          <p className="text-zinc-400 text-sm">Please wait while we verify your request.</p>
        </Card>
      </div>
    );
  }

  // Verification error
  if (verificationError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Link Invalid</h2>
            <p className="text-zinc-400 mb-6">{verificationError}</p>
            <div className="space-y-3">
              <Link href="/reset-password">
                <Button variant="primary" className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Email verification success
  if (mode === 'verifyEmail' && success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-zinc-400 mb-6">
              Your email has been successfully verified. You can now access all features.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">
                Go to Dashboard
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Password reset form
  if (mode === 'resetPassword') {
    if (success) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-zinc-400 mb-2">
                Your password has been successfully reset.
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                Redirecting to dashboard...
              </p>
              <Link href="/dashboard">
                <Button className="w-full">
                  Go to Dashboard Now
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-accent" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Set New Password</h2>
            <p className="text-zinc-400 text-sm">
              Enter a new password for <span className="text-accent font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all disabled:opacity-50"
              />
              <p className="text-xs text-zinc-500">Minimum 6 characters</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                <>
                  <Lock size={18} className="mr-2" />
                  Reset Password
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Unknown mode
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <AlertCircle className="mx-auto mb-4 text-amber-500" size={40} />
        <h2 className="text-xl font-bold text-white mb-2">Unknown Action</h2>
        <p className="text-zinc-400 mb-6">This link is not recognized.</p>
        <Link href="/dashboard">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md w-full text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-accent" size={40} />
            <h2 className="text-xl font-bold text-white mb-2">Loading...</h2>
            <p className="text-zinc-400 text-sm">Please wait.</p>
          </Card>
        </div>
      }
    >
      <AuthActionContent />
    </Suspense>
  );
}
