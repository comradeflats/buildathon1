import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'winner' | 'secondary' | 'outline';
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-700 text-zinc-300',
    success: 'bg-success/20 text-success border border-success/50',
    winner: 'bg-winner/20 text-winner border border-winner/50',
    secondary: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
    outline: 'bg-transparent text-zinc-400 border border-zinc-600',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
