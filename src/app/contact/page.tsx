'use client';

import { useState } from 'react';
import { Mail, Send, Loader2, CheckCircle, AlertCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { executeRecaptcha } from '@/lib/recaptcha';
import Link from 'next/link';

type SubjectType = 'bug' | 'feature' | 'question' | 'other';

const SUBJECT_OPTIONS: { value: SubjectType; label: string; emoji: string }[] = [
  { value: 'bug', label: 'Bug Report', emoji: '🐛' },
  { value: 'feature', label: 'Feature Request', emoji: '✨' },
  { value: 'question', label: 'Question', emoji: '❓' },
  { value: 'other', label: 'Other', emoji: '💬' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'question' as SubjectType,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (formData.message.length < 10) {
      setError('Message must be at least 10 characters');
      return;
    }

    if (formData.message.length > 1000) {
      setError('Message must be less than 1000 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate reCAPTCHA token
      const recaptchaToken = await executeRecaptcha('contact');

      const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
      if (!accessKey) {
        throw new Error('Contact form is not configured. Please try again later.');
      }

      // Get subject label for email
      const subjectLabel = SUBJECT_OPTIONS.find(s => s.value === formData.subject)?.label || 'Contact';

      // Submit to Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: formData.name,
          email: formData.email,
          subject: `buildathon.live: ${subjectLabel}`,
          message: `Subject: ${subjectLabel}\n\n${formData.message}\n\n---\nSent from: buildathon.live/contact`,
          recaptcha_response: recaptchaToken || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to send message');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: 'question', message: '' });
    } catch (error: any) {
      console.error('Contact form error:', error);
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <Card className="p-8">
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Message Sent!
                </h2>
                <p className="text-zinc-400">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
              </div>
              <Button
                onClick={() => setSuccess(false)}
                variant="secondary"
                size="lg"
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} className="text-accent" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Get in Touch
                </h1>
                <p className="text-zinc-400">
                  Have a question, bug report, or feature request? We'd love to hear from you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Subject
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SUBJECT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, subject: option.value })}
                        disabled={isSubmitting}
                        className={`p-3 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 ${
                          formData.subject === option.value
                            ? 'bg-accent/10 border-accent text-accent'
                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <span className="block text-lg mb-1">{option.emoji}</span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none disabled:opacity-50"
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Minimum 10 characters</span>
                    <span className={formData.message.length > 1000 ? 'text-red-400' : ''}>
                      {formData.message.length} / 1000
                    </span>
                  </div>
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
                      <Send size={18} className="mr-2" />
                      Send Message
                    </>
                  )}
                </Button>

                <p className="text-xs text-zinc-500 text-center">
                  Protected by reCAPTCHA. Your information is secure and will only be used to respond to your inquiry.
                </p>
              </form>
            </>
          )}
        </Card>

        <p className="text-xs text-zinc-500 text-center mt-6">
          Typically respond within 24-48 hours
        </p>
      </div>
    </div>
  );
}
