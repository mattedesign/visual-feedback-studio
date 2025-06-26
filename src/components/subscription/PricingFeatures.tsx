
import React from 'react';
import { Check } from 'lucide-react';

interface PricingFeaturesProps {
  features: string[];
}

export const PricingFeatures = ({ features }: PricingFeaturesProps) => {
  return (
    <div className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-3 w-3 text-green-600" />
          </div>
          <span className="text-gray-700 font-medium">
            {feature}
          </span>
        </div>
      ))}
    </div>
  );
};
