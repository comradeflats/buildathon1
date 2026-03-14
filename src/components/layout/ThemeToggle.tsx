'use client';

import { useTheme } from '@/context/ThemeContext';
import { Moon, Palette } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Call useTheme at top level (now SSR-safe)
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'colorblind' as const, label: 'Colorblind', icon: Palette },
  ];

  const CurrentIcon = themes.find(t => t.value === theme)?.icon || Moon;

  // Only render after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't render full UI during SSR - return placeholder
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400">
        <Moon size={18} />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        aria-label="Toggle theme"
      >
        <CurrentIcon size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                theme === value
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon size={16} />
              <span className="font-medium">{label}</span>
              {theme === value && (
                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
