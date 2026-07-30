import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: { 
    text: '#FFFFFF', 
    background: '#050507', 
    backgroundElement: 'rgba(18, 18, 24, 0.88)', 
    backgroundSelected: 'rgba(212, 175, 55, 0.3)', 
    textSecondary: '#A0A4B0', 
    accent: '#D32F2F', 
    gold: '#D4AF37',
    goldGlow: 'rgba(212, 175, 55, 0.15)',
    crimsonGlow: 'rgba(211, 47, 47, 0.2)',
  },
  dark: { // Imperial Marble & Crimson Gold Theme
    text: '#FFFFFF', 
    background: '#050507', 
    backgroundElement: 'rgba(18, 18, 24, 0.88)', 
    backgroundSelected: 'rgba(212, 175, 55, 0.3)', 
    textSecondary: '#A0A4B0', 
    accent: '#D32F2F', 
    gold: '#D4AF37',
    goldGlow: 'rgba(212, 175, 55, 0.15)',
    crimsonGlow: 'rgba(211, 47, 47, 0.2)',
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
