import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: { 
    text: '#F8FAFC', 
    background: '#070B19', 
    backgroundElement: 'rgba(15, 23, 42, 0.88)', 
    backgroundSelected: 'rgba(0, 82, 255, 0.20)', 
    textSecondary: '#94A3B8', 
    accent: '#0052FF', 
    electricBlue: '#0052FF',
    sapphire: '#0066FF',
    cyan: '#00C6FF',
    gold: '#D4AF37',
    goldGlow: 'rgba(212, 175, 55, 0.20)',
    crimsonGlow: 'rgba(0, 82, 255, 0.25)',
  },
  dark: { // Cyber-Obsidian Royal Style
    text: '#F8FAFC', 
    background: '#070B19', 
    backgroundElement: 'rgba(15, 23, 42, 0.88)', 
    backgroundSelected: 'rgba(0, 82, 255, 0.20)', 
    textSecondary: '#94A3B8', 
    accent: '#0052FF', 
    electricBlue: '#0052FF',
    sapphire: '#0066FF',
    cyan: '#00C6FF',
    gold: '#D4AF37',
    goldGlow: 'rgba(212, 175, 55, 0.20)',
    crimsonGlow: 'rgba(0, 82, 255, 0.25)',
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
