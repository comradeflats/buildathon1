'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Theme } from '@/lib/types';
import { getThemeIcon, getThemeIconColor } from '@/lib/themeIcons';

interface ThemeSelectorProps {
  themes: Theme[];
  selectedThemeId: string;
  onChange: (themeId: string) => void;
}

export function ThemeSelector({ themes, selectedThemeId, onChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedTheme = themes.find((t) => t.id === selectedThemeId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset focused index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const selectedIdx = themes.findIndex((t) => t.id === selectedThemeId);
      setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
  }, [isOpen, themes, selectedThemeId]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => (prev < themes.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < themes.length) {
          onChange(themes[focusedIndex].id);
          setIsOpen(false);
          buttonRef.current?.focus();
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-400">
        Theme <span className="text-red-400">*</span>
      </label>

      <div ref={dropdownRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="theme-selector-label"
          className="w-full flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent cursor-pointer hover:border-zinc-600 transition-colors"
        >
          <span className="flex items-center gap-3">
            {selectedTheme ? (
              <>
                {(() => {
                  const ThemeIcon = getThemeIcon(selectedTheme);
                  return <ThemeIcon size={20} className={getThemeIconColor(selectedTheme)} />;
                })()}
                <span>{selectedTheme.name}</span>
              </>
            ) : (
              <span className="text-zinc-400">Select a theme...</span>
            )}
          </span>
          <ChevronDown
            size={20}
            className={`text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <ul
            ref={listRef}
            role="listbox"
            aria-activedescendant={focusedIndex >= 0 ? `theme-option-${themes[focusedIndex]?.id}` : undefined}
            onKeyDown={handleKeyDown}
            className="absolute z-50 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-64 overflow-auto"
          >
            {themes.map((theme, index) => (
              <li
                key={theme.id}
                id={`theme-option-${theme.id}`}
                role="option"
                aria-selected={theme.id === selectedThemeId}
                onClick={() => {
                  onChange(theme.id);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                onMouseEnter={() => setFocusedIndex(index)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  index === focusedIndex ? 'bg-zinc-700' : ''
                } ${theme.id === selectedThemeId ? 'bg-accent/10 text-accent' : 'text-white hover:bg-zinc-700/50'}`}
              >
                {(() => {
                  const ThemeIcon = getThemeIcon(theme);
                  return <ThemeIcon size={18} className={getThemeIconColor(theme)} />;
                })()}
                <span className="truncate">{theme.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedTheme && (
        <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-3 mb-2">
            {(() => {
              const ThemeIcon = getThemeIcon(selectedTheme);
              return <ThemeIcon size={28} className={getThemeIconColor(selectedTheme)} />;
            })()}
            <span className="font-semibold text-white">{selectedTheme.name}</span>
          </div>
          <p className="text-sm text-zinc-400 mb-3 italic">{selectedTheme.concept}</p>

          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Judging Criteria
            </p>
            <ul className="space-y-1">
              {selectedTheme.judgingCriteria.map((criterion, index) => (
                <li
                  key={index}
                  className="text-sm text-zinc-300 flex items-start gap-2"
                >
                  <span className="text-accent font-medium">{index + 1}.</span>
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
