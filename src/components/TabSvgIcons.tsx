import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface IconProps {
  color?: any;
  size?: number;
  focused?: boolean;
}

export function HoyIcon({ color = '#D4AF37', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 6v6l4 2" />
    </Svg>
  );
}

export function JournalIcon({ color = '#D4AF37', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </Svg>
  );
}

export function TrainerIcon({ color = '#D4AF37', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12" />
    </Svg>
  );
}

export function ProgressIcon({ color = '#D4AF37', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 20V10M12 20V4M6 20v-6" />
    </Svg>
  );
}

export function NutritionIcon({ color = '#D4AF37', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2a10 10 0 1 0 10 10H12V2z" />
      <Path d="M12 2a10 10 0 0 1 10 10" />
    </Svg>
  );
}

export function ProfileIcon({ color = '#D4AF37', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

export function ArchonCrownIcon({ color = '#D4AF37', size = 24, focused }: IconProps) {
  const safeColor = color || '#D4AF37';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={safeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill={focused ? 'rgba(212, 175, 55, 0.3)' : 'none'} />
      <Circle cx="12" cy="3" r="1.5" fill={safeColor} />
      <Circle cx="5" cy="4" r="1.5" fill={safeColor} />
      <Circle cx="19" cy="4" r="1.5" fill={safeColor} />
      <Path d="M5 20h14" strokeWidth={2.5} />
    </Svg>
  );
}

export function SculptureCameraIcon({ color = '#D4AF37', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <Circle cx="12" cy="13" r="4" />
    </Svg>
  );
}

export function InfoTabIcon({ color = '#D4AF37', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M12 16v-4" />
      <Path d="M12 8h.01" strokeWidth={3} />
    </Svg>
  );
}


