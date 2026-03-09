import {
  Sparkles, Zap, Link2, Clock, Palette, Target,
  Lightbulb, Globe, Gauge, Code, Wand2, Eye,
  Rocket, Brain, Compass, Layers
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
} as const;

export type ThemeIconKey = keyof typeof THEME_ICONS;

export const ICON_KEYS = Object.keys(THEME_ICONS) as ThemeIconKey[];
