export type ThemeId = 'neural-aurora' | 'urfi-futuristic' | 'dark' | 'light' | 'sunset-gold' | 'cyber-violet';

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
  isLight?: boolean;
  previewColors: string[];
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'neural-aurora': {
    id: 'neural-aurora',
    name: 'Neural Aurora',
    subtitle: 'Futuristic AI',
    badge: 'Neural Aurora',
    primaryColor: '#00f0ff',
    secondaryColor: '#a855f7',
    accentColor: '#c084fc',
    darkColor: '#050811',
    glowColor: 'rgba(0, 240, 255, 0.35)',
    glowStrong: 'rgba(0, 240, 255, 0.7)',
    personality: 'Next-generation AI interface with midnight-black depth, electric cyan, and soft violet aurora.',
    previewColors: ['#00f0ff', '#a855f7', '#050811', '#080d1e'],
  },
  'urfi-futuristic': {
    id: 'urfi-futuristic',
    name: 'URFI Futuristic',
    subtitle: 'Cybernetic Neon Pulse',
    badge: 'Signature',
    primaryColor: '#22d3ee',
    secondaryColor: '#06b6d4',
    accentColor: '#0891b2',
    darkColor: '#0e7490',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    glowStrong: 'rgba(34, 211, 238, 0.8)',
    personality: 'Futuristic AI assistant with neon cyan glowing accents and dark navy matrix.',
    previewColors: ['#22d3ee', '#06b6d4', '#0891b2', '#020617'],
  },
  'dark': {
    id: 'dark',
    name: 'Dark Mode',
    subtitle: 'Minimal Deep Slate',
    badge: 'Stealth',
    primaryColor: '#38bdf8',
    secondaryColor: '#64748b',
    accentColor: '#475569',
    darkColor: '#1e293b',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    glowStrong: 'rgba(56, 189, 248, 0.7)',
    personality: 'Clean, understated dark theme engineered for long nocturnal sessions.',
    previewColors: ['#38bdf8', '#94a3b8', '#334155', '#090d16'],
  },
  'light': {
    id: 'light',
    name: 'Light Mode',
    subtitle: 'Crisp High-Contrast Daylight',
    badge: 'Clean Day',
    primaryColor: '#0284c7',
    secondaryColor: '#0369a1',
    accentColor: '#075985',
    darkColor: '#e0f2fe',
    glowColor: 'rgba(2, 132, 199, 0.25)',
    glowStrong: 'rgba(2, 132, 199, 0.5)',
    personality: 'Bright, highly legible daytime interface with cool sapphire highlights.',
    isLight: true,
    previewColors: ['#0284c7', '#38bdf8', '#e2e8f0', '#f8fafc'],
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

export const DEFAULT_THEME: ThemeId = 'neural-aurora';

export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem('urfi_theme') as ThemeId;
  if (stored && THEMES[stored]) {
    return stored;
  }
  // Backwards compatibility for 'neon-cyan'
  if (stored === ('neon-cyan' as any)) return 'urfi-futuristic';
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
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
}
