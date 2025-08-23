
"use client"

import { Sun, BatteryCharging, Droplets, Car, Plug, Zap, LucideProps } from 'lucide-react';
import type { DerType } from '@/lib/types';

interface DerTypeIconProps extends LucideProps {
  type: DerType;
}

export function DerTypeIcon({ type, ...props }: DerTypeIconProps) {
  switch (type) {
    case 'Solar':
      return <Sun {...props} />;
    case 'Solar + Battery':
      return <BatteryCharging {...props} />;
    case 'Hot water':
      return <Droplets {...props} />;
    case 'EV chargers':
      return <Car {...props} />;
    case 'Other loads':
      return <Plug {...props} />;
    case 'Other generation':
      return <Zap {...props} />;
    default:
      return <Plug {...props} />;
  }
}
