'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SignInPrompt } from './SignInPrompt';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  hideGuest?: boolean;
}

export function SignInModal({ isOpen, onClose, title, description, hideGuest = false }: SignInModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 hide-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>
        <SignInPrompt 
          title={title} 
          description={description} 
          onComplete={onClose} 
          hideGuest={hideGuest}
        />
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
