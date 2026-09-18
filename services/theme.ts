export type ThemeId = 'neon-cyan' | 'sunset-gold' | 'cyber-violet';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  badge: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkColor: string;
  glowColor: string;
  glowStrong: string;
  personality: string;
  previewColors: string[];
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'neon-cyan': {
    id: 'neon-cyan',
    name: 'Neon Cyan',
    subtitle: 'Precision Cybernetic Pulse',
    badge: 'Neural Default',
    primaryColor: '#22d3ee',
    secondaryColor: '#06b6d4',
    accentColor: '#0891b2',
    darkColor: '#0e7490',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    glowStrong: 'rgba(34, 211, 238, 0.8)',
    personality: 'Analytical, calm, and razor-sharp with crystalline cybernetic feedback.',
    previewColors: ['#22d3ee', '#06b6d4', '#0891b2', '#020617'],
  },
  'sunset-gold': {
    id: 'sunset-gold',
    name: 'Sunset Gold',
    subtitle: 'Solar Radiance & Warm Energy',
    badge: 'Solar Core',
    primaryColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    accentColor: '#d97706',
    darkColor: '#b45309',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    glowStrong: 'rgba(251, 191, 36, 0.8)',
    personality: 'Warm, empathetic, and invigorating with amber solar waveforms.',
    previewColors: ['#fbbf24', '#f59e0b', '#d97706', '#1a120b'],
  },
  'cyber-violet': {
    id: 'cyber-violet',
    name: 'Cyber Violet',
    subtitle: 'Deep Psionic & Synthwave Matrix',
    badge: 'Psionic Matrix',
    primaryColor: '#c084fc',
    secondaryColor: '#a855f7',
    accentColor: '#9333ea',
    darkColor: '#7e22ce',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    glowStrong: 'rgba(192, 132, 252, 0.8)',
    personality: 'Mysterious, visionary, and hyper-intuitive with neon amethyst pulses.',
    previewColors: ['#c084fc', '#a855f7', '#9333ea', '#170e26'],
  },
};

export const DEFAULT_THEME: ThemeId = 'neon-cyan';

export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem('urfi_theme') as ThemeId;
  if (stored && THEMES[stored]) {
    return stored;
  }
  return DEFAULT_THEME;
}

export function saveStoredTheme(theme: ThemeId): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('urfi_theme', theme);
  }
}

export function applyThemeToDocument(theme: ThemeId): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
}
