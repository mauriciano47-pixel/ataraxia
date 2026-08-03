import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: { 
    text: '#0F172A', 
    background: '#F8FAFC', 
    backgroundElement: 'rgba(255, 255, 255, 0.88)', 
    backgroundSelected: 'rgba(0, 82, 255, 0.12)', 
    textSecondary: '#64748B', 
    accent: '#0052FF', 
    electricBlue: '#0052FF',
    sapphire: '#0066FF',
    cyan: '#00C6FF',
    emerald: '#0052FF',
    mint: '#00C6FF',
    gold: '#0052FF',
    goldGlow: 'rgba(0, 82, 255, 0.12)',
    crimsonGlow: 'rgba(0, 198, 255, 0.15)',
  },
  dark: { // Pearl Luxury & Electric Blue Style
    text: '#0F172A', 
    background: '#F8FAFC', 
    backgroundElement: 'rgba(255, 255, 255, 0.88)', 
    backgroundSelected: 'rgba(0, 82, 255, 0.12)', 
    textSecondary: '#64748B', 
    accent: '#0052FF', 
    electricBlue: '#0052FF',
    sapphire: '#0066FF',
    cyan: '#00C6FF',
    emerald: '#0052FF',
    mint: '#00C6FF',
    gold: '#0052FF',
    goldGlow: 'rgba(0, 82, 255, 0.12)',
    crimsonGlow: 'rgba(0, 198, 255, 0.15)',
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
