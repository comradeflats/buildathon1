'use client';

import { useState } from 'react';
import {
  X, CheckCircle, AlertCircle, Loader2,
  User, Code, Users, Star, ArrowRight, Sparkles, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { executeRecaptcha } from '@/lib/recaptcha';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    skillLevel: string;
    teamIntent: string;
    displayName?: string;
    email?: string;
    recaptchaToken?: string;
  }) => Promise<void>;
  isWaitlist: boolean;
  eventDate?: string;
}

export function RegisterModal({ isOpen, onClose, onConfirm, isWaitlist, eventDate }: RegisterModalProps) {
  const { isAnonymous } = useAuth();
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [teamIntent, setTeamIntent] = useState('find_team');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError('Please agree to the Fair Play Commitment');
      return;
    }

    if (isAnonymous) {
      if (!displayName.trim()) {
        setError('Please enter a display name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Generate reCAPTCHA token for spam prevention
      const recaptchaToken = await executeRecaptcha('register');

      await onConfirm({
        skillLevel,
        teamIntent,
        displayName: isAnonymous ? displayName : undefined,
        email: isAnonymous ? email : undefined,
        recaptchaToken: recaptchaToken || undefined,
      });
      onClose();
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full z-[100] flex items-center justify-center min-h-screen p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <Card className="relative w-full max-w-lg bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-accent" />
              {isWaitlist ? 'Join the Waitlist' : 'Complete Registration'}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Tell us a bit about yourself before you join.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto hide-scrollbar">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Guest Identity Fields */}
          {isAnonymous && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} />
                  Full Name / Alias
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Mail size={14} />
                  Contact Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For event updates"
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
                <p className="text-[10px] text-zinc-500 mt-1 italic">
                  Note: Guest registration is linked to this browser.
                </p>
              </div>
            </div>
          )}

          {/* Skill Level */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Code size={14} />
              Skill Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['beginner', 'intermediate', 'expert'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSkillLevel(level)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                    skillLevel === level 
                      ? 'bg-accent/10 border-accent text-accent' 
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Team Intent */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} />
              Participation Style
            </label>
            <div className="space-y-2">
              {[
                { id: 'solo', label: 'Going Solo', icon: <User size={14} /> },
                { id: 'find_team', label: 'Looking for a team at the event', icon: <Users size={14} /> },
                { id: 'have_team', label: 'I already have a team', icon: <CheckCircle size={14} /> }
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setTeamIntent(style.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    teamIntent === style.id 
                      ? 'bg-accent/10 border-accent text-accent' 
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={teamIntent === style.id ? 'text-accent' : 'text-zinc-600'}>
                      {style.icon}
                    </div>
                    <span className="text-sm font-medium">{style.label}</span>
                  </div>
                  {teamIntent === style.id && <div className="w-2 h-2 rounded-full bg-accent" />}
                </button>
              ))}
            </div>
          </div>

          {/* Commitment Pledge */}
          <div className={`p-4 rounded-xl border transition-colors ${agreed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-800/50 border-zinc-700'}`}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center h-5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-accent focus:ring-accent transition-all cursor-pointer"
                />
              </div>
              <div className="text-sm">
                <p className={`font-bold transition-colors ${agreed ? 'text-emerald-400' : 'text-zinc-300'}`}>
                  The Fair Play Commitment
                </p>
                <p className="text-zinc-500 mt-1 leading-relaxed">
                  I understand that spots are limited. If I cannot attend, I will withdraw my registration so someone on the waitlist can join.
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pb-2">
            <Button
              type="submit"
              disabled={!agreed || isSubmitting}
              className="w-full h-12 text-lg font-bold group"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isWaitlist ? 'Join Waitlist' : 'Confirm Registration'}
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest">
              {isWaitlist 
                ? 'Waitlisted users are promoted automatically as spots open.' 
                : 'Registration confirms your entry and allows you to submit projects later.'}
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
