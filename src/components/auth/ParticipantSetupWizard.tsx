'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, User as UserIcon, Zap, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ParticipantSetupWizardProps {
  userProfile: any;
  hasSubmissions: boolean;
}

export function ParticipantSetupWizard({ userProfile, hasSubmissions }: ParticipantSetupWizardProps) {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const steps = [
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Set your role and bio to unlock the Verified Builder badge.',
      icon: <UserIcon className="text-blue-400" size={20} />,
      isCompleted: !!userProfile?.profileCompleted,
      actionLabel: 'Edit Profile',
      actionHref: '/settings', // We'll need a settings page or a modal
    },
    {
      id: 'event',
      title: 'Join an Event',
      description: 'Find a buildathon and register to participate.',
      icon: <Zap className="text-amber-400" size={20} />,
      isCompleted: hasSubmissions, // For now, if they've submitted, they've joined
      actionLabel: 'Browse Events',
      actionHref: '/events',
    },
    {
      id: 'submit',
      title: 'First Submission',
      description: 'Build something and share it with the world.',
      icon: <Trophy className="text-emerald-400" size={20} />,
      isCompleted: hasSubmissions,
      actionLabel: 'Submit Project',
      actionHref: '/submit',
    },
  ];

  const completedCount = steps.filter(s => s.isCompleted).length;
  const isFullyCompleted = completedCount === steps.length;

  if (isFullyCompleted) {
    return (
      <Card className="p-4 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <Trophy className="text-emerald-500" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Verified Builder
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <CheckCircle2 size={12} className="mr-1" />
                  Verified
                </Badge>
              </h3>
              <p className="text-xs text-zinc-400">You've completed your setup! Ready for the next buildathon.</p>
            </div>
          </div>
          <Link href="/events">
            <Button variant="ghost" size="sm" className="text-xs">
              Find Events
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-accent/20 bg-accent/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-accent" />
            Get Started
          </h2>
          <p className="text-zinc-400 text-sm">Complete these steps to make the most of buildathon.live</p>
        </div>
        <div className="text-sm font-medium text-zinc-500">
          {completedCount}/{steps.length}
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              step.isCompleted 
                ? 'bg-zinc-900/50 border-emerald-500/20 opacity-75' 
                : 'bg-zinc-800/50 border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${step.isCompleted ? 'bg-emerald-500/10' : 'bg-zinc-800'}`}>
                {step.icon}
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${step.isCompleted ? 'text-zinc-400 line-through' : 'text-white'}`}>
                  {step.title}
                </h3>
                <p className="text-[11px] text-zinc-500">{step.description}</p>
              </div>
            </div>

            {step.isCompleted ? (
              <CheckCircle2 className="text-emerald-500" size={20} />
            ) : (
              <Link href={step.actionHref}>
                <Button size="sm" variant="ghost" className="text-xs h-8 px-3">
                  {step.actionLabel}
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
