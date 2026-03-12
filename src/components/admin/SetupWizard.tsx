'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Calendar, Sparkles, Users, ArrowRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel: string;
  actionHref: string;
  isCompleted: boolean;
}

interface SetupWizardProps {
  orgSlug: string;
  hasEvents: boolean;
  hasThemes: boolean;
  hasMembers: boolean;
}

export function SetupWizard({ orgSlug, hasEvents, hasThemes, hasMembers }: SetupWizardProps) {
  const steps: Step[] = [
    {
      id: 'event',
      title: 'Create an Event',
      description: 'Start by creating your first buildathon event.',
      icon: <Calendar className="text-blue-400" size={20} />,
      actionLabel: 'Create Event',
      actionHref: `/dashboard/${orgSlug}/events/new`,
      isCompleted: hasEvents,
    },
    {
      id: 'themes',
      title: 'Generate Themes',
      description: 'Themes provide the creative spark for your participants.',
      icon: <Sparkles className="text-amber-400" size={20} />,
      actionLabel: 'Manage Themes',
      actionHref: `/dashboard/${orgSlug}/events`, // Direct to events list to pick one
      isCompleted: hasThemes,
    },
    {
      id: 'judging',
      title: 'Setup Judging',
      description: 'Invite judges or enable peer voting for your event.',
      icon: <Users className="text-emerald-400" size={20} />,
      actionLabel: 'Invite Members',
      actionHref: `/dashboard/${orgSlug}/members`,
      isCompleted: hasMembers,
    },
    {
      id: 'launch',
      title: 'Launch!',
      description: 'Your event is ready for registration and submissions.',
      icon: <Flag className="text-accent" size={20} />,
      actionLabel: 'Go to Portal',
      actionHref: `/org/${orgSlug}`,
      isCompleted: hasEvents && hasThemes,
    },
  ];

  const completedCount = steps.filter(s => s.isCompleted).length;
  const progress = (completedCount / steps.length) * 100;

  if (completedCount === steps.length) return null;

  return (
    <Card className="p-6 border-accent/20 bg-accent/5 overflow-hidden relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles size={20} className="text-accent" />
            Organizer Setup Guide
          </h2>
          <p className="text-zinc-400 text-sm">
            Complete these steps to launch your first successful buildathon.
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-zinc-300 mb-2">
            {completedCount} of {steps.length} steps completed
          </div>
          <div className="w-48 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`p-4 rounded-xl border transition-all ${
              step.isCompleted 
                ? 'bg-zinc-900/50 border-emerald-500/20 opacity-75' 
                : 'bg-zinc-800/50 border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${step.isCompleted ? 'bg-emerald-500/10' : 'bg-zinc-800'}`}>
                {step.icon}
              </div>
              {step.isCompleted ? (
                <CheckCircle2 className="text-emerald-500" size={18} />
              ) : (
                <Circle className="text-zinc-700" size={18} />
              )}
            </div>
            
            <h3 className={`font-semibold mb-1 ${step.isCompleted ? 'text-zinc-300' : 'text-white'}`}>
              {step.title}
            </h3>
            <p className="text-xs text-zinc-500 mb-4 min-h-[32px]">
              {step.description}
            </p>

            {!step.isCompleted ? (
              <Link href={step.actionHref}>
                <Button size="sm" className="w-full text-xs h-8">
                  {step.actionLabel}
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
            ) : (
              <div className="text-xs text-emerald-500 font-medium py-1.5 flex items-center justify-center gap-1">
                <CheckCircle2 size={12} />
                Completed
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
