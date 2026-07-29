import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

interface IconProps {
  color?: string;
  size?: number;
}

export function FlameIcon({ color = '#D32F2F', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C10.5 4.5 9 6.5 9 9C9 10.66 9.67 12.16 10.76 13.24C11.5 12.5 12.5 12 13.5 12C15.98 12 18 14.02 18 16.5C18 19.54 15.54 22 12.5 22C8.36 22 5 18.64 5 14.5C5 9.5 9 4.5 12 2Z"
        fill={color}
      />
    </Svg>
  );
}

export function FootstepsIcon({ color = '#FFD54F', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.5 4C13.5 2.9 12.6 2 11.5 2S9.5 2.9 9.5 4S10.4 6 11.5 6S13.5 5.1 13.5 4ZM7.5 9C6.4 9 5.5 9.9 5.5 11S6.4 13 7.5 13S9.5 12.1 9.5 11S8.6 9 7.5 9ZM16.5 9C15.4 9 14.5 9.9 14.5 11S15.4 13 16.5 13S18.5 12.1 18.5 11S17.6 9 16.5 9ZM12 15C9.8 15 8 16.8 8 19C8 20.7 9.3 22 11 22H13C14.7 22 16 20.7 16 19C16 16.8 14.2 15 12 15Z"
        fill={color}
      />
    </Svg>
  );
}

export function MapIcon({ color = '#38BDF8', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 6V22L8 18L16 22L23 18V2L16 6L8 2L1 6Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M8 2V18M16 6V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function CalculatorIcon({ color = '#FF6F00', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth="2" />
      <Rect x="7" y="5" width="10" height="4" fill={color} opacity="0.3" stroke={color} strokeWidth="1" />
      <Circle cx="8" cy="13" r="1" fill={color} />
      <Circle cx="12" cy="13" r="1" fill={color} />
      <Circle cx="16" cy="13" r="1" fill={color} />
      <Circle cx="8" cy="17" r="1" fill={color} />
      <Circle cx="12" cy="17" r="1" fill={color} />
      <Circle cx="16" cy="17" r="1" fill={color} />
    </Svg>
  );
}

export function SettingsIcon({ color = '#A0AEC0', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
      <Path
        d="M19.4 15A1.65 1.65 0 0 0 19.7 16.8L20.4 17.5A2 2 0 0 1 17.5 20.4L16.8 19.7A1.65 1.65 0 0 0 15 19.4V20.5A2 2 0 0 1 11 20.5V19.4A1.65 1.65 0 0 0 9.2 19.7L8.5 20.4A2 2 0 0 1 5.6 17.5L6.3 16.8A1.65 1.65 0 0 0 6.6 15H5.5A2 2 0 0 1 5.5 11H6.6A1.65 1.65 0 0 0 6.3 9.2L5.6 8.5A2 2 0 0 1 8.5 5.6L9.2 6.3A1.65 1.65 0 0 0 11 6.6V5.5A2 2 0 0 1 15 5.5V6.6A1.65 1.65 0 0 0 16.8 6.3L17.5 5.6A2 2 0 0 1 20.4 8.5L19.7 9.2A1.65 1.65 0 0 0 19.4 11H20.5A2 2 0 0 1 20.5 15H19.4Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
}

export function HeartIcon({ color = '#D32F2F', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.84 4.61A5.5 5.5 0 0 0 13 5.75L12 6.75L11 5.75A5.5 5.5 0 0 0 3.16 12.44L12 21.25L20.84 12.44A5.5 5.5 0 0 0 20.84 4.61Z"
        stroke={color}
        strokeWidth="2"
        fill={color}
        fillOpacity="0.2"
      />
    </Svg>
  );
}

export function WaterIcon({ color = '#38BDF8', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.69L17.5 9.5C19.5 12 19.5 15.5 17.5 18C15.5 20.5 11.5 20.5 9.5 18C7.5 15.5 7.5 12 9.5 9.5L12 2.69Z"
        stroke={color}
        strokeWidth="2"
        fill={color}
        fillOpacity="0.25"
      />
    </Svg>
  );
}

export function RestaurantIcon({ color = '#FF6F00', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 2V12M18 12V22M18 12H22V2H18Z" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M6 2V7C6 8.65 7.35 10 9 10C10.65 10 12 8.65 12 7V2M9 10V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function TrophyIcon({ color = '#FFD700', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9C6 11.76 8.24 14 11 14H13C15.76 14 18 11.76 18 9V3H6V9Z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2" />
      <Path d="M6 5H2V8C2 9.66 3.34 11 5 11H6" stroke={color} strokeWidth="2" />
      <Path d="M18 5H22V8C22 9.66 20.66 11 19 11H18" stroke={color} strokeWidth="2" />
      <Path d="M12 14V18M8 21H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function PersonIcon({ color = '#FFF', size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2" />
      <Path d="M4 20C4 16 7.5 14 12 14C16.5 14 20 16 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function CheckmarkIcon({ color = '#D32F2F', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2" />
      <Polyline points="8 12 11 15 16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
