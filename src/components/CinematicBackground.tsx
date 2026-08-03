import React from 'react';
import { PearlElectricBackground } from './PearlElectricBackground';

interface CinematicBackgroundProps {
  opacity?: number;
  scrollY?: any;
  parallaxFactor?: number;
  accentColor?: string;
  children?: React.ReactNode;
  source?: any;
}

export function CinematicBackground({ accentColor = '#0052FF', children }: CinematicBackgroundProps) {
  return <PearlElectricBackground glowColor="rgba(0, 82, 255, 0.08)">{children}</PearlElectricBackground>;
}
