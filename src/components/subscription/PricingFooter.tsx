
import React from 'react';
import { Check } from 'lucide-react';

export const PricingFooter = () => {
  return (
    <div className="text-center mt-16 space-y-3">
      <div className="flex items-center justify-center gap-6 text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <span>30-day money-back guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          <span>Cancel anytime</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 max-w-md mx-auto">
        All plans include SSL security, 99.9% uptime guarantee, and priority customer support
      </p>
    </div>
  );
};
