import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: { 
    text: '#FFFFFF', 
    background: '#070B14', 
    backgroundElement: 'rgba(14, 20, 36, 0.88)', 
    backgroundSelected: 'rgba(29, 100, 242, 0.25)', 
    textSecondary: '#94A3B8', 
    accent: '#1D64F2', 
    electricBlue: '#1D64F2',
    sapphire: '#3B82F6',
    cyan: '#00C6FF',
    gold: '#E2C068',
    goldDark: '#C5A869',
    goldBorder: 'rgba(226, 192, 104, 0.35)',
    goldGlow: 'rgba(226, 192, 104, 0.20)',
    crimsonGlow: 'rgba(29, 100, 242, 0.25)',
  },
  dark: { // Cyber-Obsidian Royal Exact Style
    text: '#FFFFFF', 
    background: '#070B14', 
    backgroundElement: 'rgba(14, 20, 36, 0.88)', 
    backgroundSelected: 'rgba(29, 100, 242, 0.25)', 
    textSecondary: '#94A3B8', 
    accent: '#1D64F2', 
    electricBlue: '#1D64F2',
    sapphire: '#3B82F6',
    cyan: '#00C6FF',
    gold: '#E2C068',
    goldDark: '#C5A869',
    goldBorder: 'rgba(226, 192, 104, 0.35)',
    goldGlow: 'rgba(226, 192, 104, 0.20)',
    crimsonGlow: 'rgba(29, 100, 242, 0.25)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 600;
