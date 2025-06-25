
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PricingBadgeProps {
  text: string;
  variant: 'default' | 'secondary';
  icon: React.ReactNode;
  popular?: boolean;
}

export const PricingBadge = ({ text, variant, icon, popular }: PricingBadgeProps) => {
  return (
    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
      <Badge 
        className={`px-4 py-2 text-sm font-semibold ${
          popular ? 'gradient-badge text-purple-700' : 'bg-gray-100 text-gray-700'
        }`}
      >
        <span className="flex items-center gap-2">
          {icon}
          {text}
        </span>
      </Badge>
    </div>
  );
};
