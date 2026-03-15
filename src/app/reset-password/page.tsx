'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!auth) {
        throw new Error('Firebase not initialized');
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin, // Redirect to home after reset
        handleCodeInApp: false,
      });

      setSuccess(true);
      setEmail(''); // Clear email field
    } catch (error: any) {
      console.error('Password reset error:', error);

      // Handle Firebase errors
      if (error.code === 'auth/user-not-found') {
        // Don't reveal if user exists (security best practice)
        setSuccess(true);
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError(error.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={32} className="text-accent" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Reset Your Password
            </h1>
            <p className="text-zinc-400 text-sm">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                  <CheckCircle size={20} />
                  <p className="font-medium">Check your email!</p>
                </div>
                <p className="text-sm text-zinc-400">
                  If an account exists with that email address, we've sent password reset instructions.
                </p>
              </div>

              <div className="space-y-2 text-sm text-zinc-500">
                <p>Didn't receive the email?</p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li>Check your spam/junk folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and check again</li>
                </ul>
              </div>

              <Button
                onClick={() => setSuccess(false)}
                variant="secondary"
                className="w-full"
              >
                Try Another Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={18} className="mr-2" />
                    Send Reset Instructions
                  </>
                )}
              </Button>

              <p className="text-xs text-zinc-500 text-center">
                Remember your password?{' '}
                <Link href="/dashboard" className="text-accent hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </Card>

        <p className="text-xs text-zinc-500 text-center mt-6">
          For security reasons, we don't reveal whether an account exists with a given email address.
        </p>
      </div>
    </div>
  );
}
