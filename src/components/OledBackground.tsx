import React from 'react';
import { PearlElectricBackground } from './PearlElectricBackground';

interface OledBackgroundProps {
  glowColor?: string;
  children?: React.ReactNode;
}

export function OledBackground({ glowColor = 'rgba(0, 82, 255, 0.08)', children }: OledBackgroundProps) {
  return <PearlElectricBackground glowColor={glowColor}>{children}</PearlElectricBackground>;
}
