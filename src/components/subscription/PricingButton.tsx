
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';

interface PricingButtonProps {
  planId: string;
  planName: string;
  popular?: boolean;
  loading: string | null;
  isCurrentPlan: boolean;
  onSubscribe: () => void;
}

export const PricingButton = ({ 
  planId, 
  planName, 
  popular, 
  loading, 
  isCurrentPlan, 
  onSubscribe 
}: PricingButtonProps) => {
  return (
    <>
      <Button
        onClick={onSubscribe}
        disabled={!!loading || isCurrentPlan}
        className={`
          w-full py-4 text-lg font-semibold border-0 text-white
          ${popular 
            ? 'gradient-button' 
            : 'bg-gray-900 hover:bg-gray-800 active:bg-gray-900'
          }
          ${isCurrentPlan 
            ? '!bg-green-600 hover:!bg-green-600 cursor-default' 
            : ''
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        `}
      >
        {loading === planId ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </span>
        ) : isCurrentPlan ? (
          <span className="flex items-center justify-center gap-2">
            <Check className="h-5 w-5" />
            Current Plan
          </span>
        ) : (
          'Get Started'
        )}
      </Button>

      {isCurrentPlan && (
        <p className="text-center text-sm text-gray-500 mt-3">
          You're currently subscribed to this plan
        </p>
      )}
    </>
  );
};
