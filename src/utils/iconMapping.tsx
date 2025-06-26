
import React from 'react';
import { Check, Zap, Crown } from 'lucide-react';

export const iconMap = {
  check: Check,
  zap: Zap,
  crown: Crown,
};

export type IconName = keyof typeof iconMap;

export const getIcon = (iconName: string, className?: string) => {
  const IconComponent = iconMap[iconName as IconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in iconMap`);
    return null;
  }
  return <IconComponent className={className} />;
};
