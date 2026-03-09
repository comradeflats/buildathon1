'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import { Theme } from '@/lib/types';
import { THEME_ICONS, ThemeIconKey } from '@/lib/themeIcons';

interface ThemeFilterDropdownProps {
  themes: Theme[];
  selectedThemeId: string;
  onChange: (themeId: string) => void;
}

export function ThemeFilterDropdown({ themes, selectedThemeId, onChange }: ThemeFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const isKeyboardNavRef = useRef(false);

  // Options include "All Themes" at index 0
  const options = [{ id: '', name: 'All Themes', isAll: true }, ...themes.map(t => ({ ...t, isAll: false }))];
  const selectedOption = options.find((o) => o.id === selectedThemeId) || options[0];

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
      const selectedIdx = options.findIndex((o) => o.id === selectedThemeId);
      setFocusedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    }
  }, [isOpen, options, selectedThemeId]);

  // Scroll focused item into view (only for keyboard navigation)
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current && isKeyboardNavRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' });
      isKeyboardNavRef.current = false;
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
        isKeyboardNavRef.current = true;
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        isKeyboardNavRef.current = true;
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].id);
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

  function getOptionIcon(option: typeof options[0], size: number = 18) {
    if (option.isAll) {
      return <LayoutGrid size={size} className="text-zinc-400 flex-shrink-0" />;
    }
    const theme = option as Theme;
    const iconKey = theme.iconKey as ThemeIconKey | undefined;
    if (iconKey && THEME_ICONS[iconKey]) {
      const Icon = THEME_ICONS[iconKey];
      return <Icon size={size} className="text-accent flex-shrink-0" />;
    }
    // Fallback to emoji for themes without iconKey
    return <span className="flex-shrink-0 text-lg">{theme.emoji}</span>;
  }

  return (
    <div ref={dropdownRef} className="relative min-w-[200px]">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Filter by theme"
        className="w-full flex items-center justify-between bg-zinc-800 border border-zinc-700 rounded-lg pl-3 pr-3 py-2 text-left text-white focus:outline-none focus:border-accent cursor-pointer hover:border-zinc-600 transition-colors"
      >
        <span className="flex items-center gap-2">
          {getOptionIcon(selectedOption)}
          <span className="truncate">{selectedOption.name}</span>
        </span>
        <ChevronDown
          size={18}
          className={`text-zinc-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          aria-activedescendant={focusedIndex >= 0 ? `theme-filter-option-${options[focusedIndex]?.id || 'all'}` : undefined}
          onKeyDown={handleKeyDown}
          className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-64 overflow-auto"
        >
          {options.map((option, index) => (
            <li
              key={option.id || 'all'}
              id={`theme-filter-option-${option.id || 'all'}`}
              role="option"
              aria-selected={option.id === selectedThemeId}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
                buttonRef.current?.focus();
              }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                index === focusedIndex ? 'bg-zinc-700' : ''
              } ${option.id === selectedThemeId ? 'bg-accent/10 text-accent' : 'text-white hover:bg-zinc-700/50'}`}
            >
              {getOptionIcon(option)}
              <span className="truncate">{option.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
