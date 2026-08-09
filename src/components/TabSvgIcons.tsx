import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  color: any;
  size?: number;
  focused?: boolean;
}

export function HomeTabIcon({ color, size = 24, focused }: IconProps) {
  const colorStr = typeof color === 'string' ? color : '#D4AF37';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
        stroke={colorStr}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? 'rgba(212, 175, 55, 0.15)' : 'none'}
      />
    </Svg>
  );
}

export function BarbellTabIcon({ color, size = 24, focused }: IconProps) {
  const colorStr = typeof color === 'string' ? color : '#D4AF37';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 5V19M18 5V19M4 8H8M16 8H20M2 11H6M18 11H24M4 16H8M16 16H20M8 12H16"
        stroke={colorStr}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? 'rgba(212, 175, 55, 0.15)' : 'none'}
      />
    </Svg>
  );
}

export function NutritionTabIcon({ color, size = 24, focused }: IconProps) {
  const colorStr = typeof color === 'string' ? color : '#D4AF37';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C8 2 4 5 4 10C4 16 12 22 12 22C12 22 20 16 20 10C20 5 16 2 12 2Z"
        stroke={colorStr}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? 'rgba(212, 175, 55, 0.15)' : 'none'}
      />
      <Path
        d="M12 6V12M12 12L15 9"
        stroke={colorStr}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function JournalTabIcon({ color, size = 24, focused }: IconProps) {
  const colorStr = typeof color === 'string' ? color : '#D4AF37';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke={colorStr}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z"
        stroke={colorStr}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? 'rgba(212, 175, 55, 0.15)' : 'none'}
      />
    </Svg>
  );
}

export function ProgressTabIcon({ color, size = 24, focused }: IconProps) {
  const colorStr = typeof color === 'string' ? color : '#D4AF37';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 6L13.5 15.5L8.5 10.5L1 18"
        stroke={colorStr}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={focused ? 'rgba(212, 175, 55, 0.15)' : 'none'}
      />
      <Path
        d="M17 6H23V12"
        stroke={colorStr}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
