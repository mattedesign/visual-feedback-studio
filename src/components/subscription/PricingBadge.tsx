
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getIcon } from '@/utils/iconMapping';

interface PricingBadgeProps {
  text: string;
  variant: 'default' | 'secondary';
  icon: string;
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
          {getIcon(icon, "h-3 w-3")}
          {text}
        </span>
      </Badge>
    </div>
  );
};
