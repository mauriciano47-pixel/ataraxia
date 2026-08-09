import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: { 
    text: '#FFFFFF', 
    background: '#050507', 
    backgroundElement: 'rgba(13, 17, 28, 0.92)', 
    backgroundSelected: 'rgba(212, 175, 55, 0.20)', 
    textSecondary: '#CBD5E1', 
    textMuted: '#94A3B8',
    accent: '#D4AF37', 
    gold: '#D4AF37',
    goldVivid: '#F59E0B',
    goldLight: '#FDE68A',
    goldDark: '#B45309',
    goldBorder: 'rgba(212, 175, 55, 0.38)',
    goldGlow: 'rgba(212, 175, 55, 0.30)',
    thunder: '#FFB300',
    thunderSpark: '#FFF066',
    electricBlue: '#D4AF37',
    sapphire: '#F59E0B',
    cyan: '#FCD34D',
    crimsonGlow: 'rgba(212, 175, 55, 0.25)',
  },
  dark: { // Imperial Gold & Thunder OLED Luxury
    text: '#FFFFFF', 
    background: '#050507', 
    backgroundElement: 'rgba(13, 17, 28, 0.92)', 
    backgroundSelected: 'rgba(212, 175, 55, 0.20)', 
    textSecondary: '#CBD5E1', 
    textMuted: '#94A3B8',
    accent: '#D4AF37', 
    gold: '#D4AF37',
    goldVivid: '#F59E0B',
    goldLight: '#FDE68A',
    goldDark: '#B45309',
    goldBorder: 'rgba(212, 175, 55, 0.38)',
    goldGlow: 'rgba(212, 175, 55, 0.30)',
    thunder: '#FFB300',
    thunderSpark: '#FFF066',
    electricBlue: '#D4AF37',
    sapphire: '#F59E0B',
    cyan: '#FCD34D',
    crimsonGlow: 'rgba(212, 175, 55, 0.25)',
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
