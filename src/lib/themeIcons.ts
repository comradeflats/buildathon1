import {
  Sparkles, Zap, Link2, Clock, Palette, Target,
  Lightbulb, Globe, Gauge, Code, Wand2, Eye,
  Rocket, Brain, Compass, Layers, Wrench, Terminal,
  Smartphone, Accessibility, HardDrive, Gamepad2, Activity,
  LucideIcon
} from 'lucide-react';

export const THEME_ICONS = {
  sparkles: Sparkles,
  zap: Zap,
  link: Link2,
  clock: Clock,
  palette: Palette,
  target: Target,
  lightbulb: Lightbulb,
  globe: Globe,
  gauge: Gauge,
  code: Code,
  wand: Wand2,
  eye: Eye,
  rocket: Rocket,
  brain: Brain,
  compass: Compass,
  layers: Layers,
  wrench: Wrench,
  terminal: Terminal,
  smartphone: Smartphone,
  accessibility: Accessibility,
  hardDrive: HardDrive,
  gamepad2: Gamepad2,
  activity: Activity,
} as const;

export const ICON_COLORS: Record<string, string> = {
  wrench: 'text-orange-400',
  palette: 'text-pink-400',
  terminal: 'text-emerald-400',
  smartphone: 'text-sky-400',
  zap: 'text-yellow-400',
  accessibility: 'text-blue-400',
  code: 'text-violet-400',
  gauge: 'text-cyan-400',
  link: 'text-indigo-400',
  hardDrive: 'text-slate-400',
  activity: 'text-red-400',
  gamepad2: 'text-fuchsia-400',
  sparkles: 'text-amber-400',
  lightbulb: 'text-yellow-400',
  globe: 'text-blue-400',
  target: 'text-red-400',
  wand: 'text-purple-400',
  eye: 'text-teal-400',
  rocket: 'text-orange-400',
  brain: 'text-pink-400',
  compass: 'text-indigo-400',
  layers: 'text-cyan-400',
  clock: 'text-amber-400',
};

export const THEME_EMOJIS: Record<string, string> = {
  sparkles: '✨',
  zap: '⚡',
  link: '🔗',
  clock: '⌛',
  palette: '🎨',
  target: '🎯',
  lightbulb: '💡',
  globe: '🌐',
  gauge: '⏲️',
  code: '💻',
  wand: '🪄',
  eye: '👁️',
  rocket: '🚀',
  brain: '🧠',
  compass: '🧭',
  layers: '🥞',
  wrench: '🔧',
  terminal: '🖥️',
  smartphone: '📱',
  accessibility: '♿',
  hardDrive: '💾',
  gamepad2: '🎮',
  activity: '📈',
};

export type ThemeIconKey = keyof typeof THEME_ICONS;

export const ICON_KEYS = Object.keys(THEME_ICONS) as ThemeIconKey[];

/**
 * Get the emoji for a given theme
 * @param theme - Theme object with emoji or iconKey property
 * @returns The emoji string or a default
 */
export function getThemeEmoji(theme: { emoji?: string; iconKey?: string } | null | undefined): string {
  if (theme?.emoji) return theme.emoji;
  if (theme?.iconKey) return THEME_EMOJIS[theme.iconKey as keyof typeof THEME_EMOJIS] || '✨';
  return '✨';
}

/**
 * Get the Lucide icon component for a given theme
 * @param theme - Theme object with iconKey property
 * @returns The Lucide icon component or a default icon
 */
export function getThemeIcon(theme: { iconKey?: string } | null | undefined): LucideIcon {
  if (!theme?.iconKey) return Sparkles;
  return THEME_ICONS[theme.iconKey as ThemeIconKey] || Sparkles;
}

/**
 * Get the Tailwind color class for a given theme's icon
 * @param theme - Theme object with iconColor and/or iconKey property
 * @returns The Tailwind text color class or a default
 */
export function getThemeIconColor(theme: { iconColor?: string; iconKey?: string } | null | undefined): string {
  if (theme?.iconColor) return theme.iconColor;
  if (theme?.iconKey) return ICON_COLORS[theme.iconKey] || 'text-zinc-400';
  return 'text-zinc-400';
}
