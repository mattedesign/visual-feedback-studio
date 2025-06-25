
import { stripeService } from '@/services/stripeService';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  priceId: string;
  badge: {
    text: string;
    variant: 'default' | 'secondary';
    icon: string;
  };
  features: string[];
  popular?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$19.99',
    period: 'per month',
    priceId: stripeService.getPricingConfig().monthlyPriceId,
    badge: {
      text: 'Most Popular',
      variant: 'default',
      icon: 'zap'
    },
    features: [
      'Unlimited analyses',
      'Priority support',
      'Advanced insights',
      'Export capabilities'
    ],
    popular: true
  },
  {
    id: 'annual',
    name: 'Pro Annual',
    price: '$199.99',
    period: 'per year',
    priceId: stripeService.getPricingConfig().yearlyPriceId,
    badge: {
      text: 'Best Value',
      variant: 'secondary',
      icon: 'crown'
    },
    features: [
      'Unlimited analyses',
      'Priority support',
      'Advanced insights',
      'Export capabilities',
      '2 months free',
      'Early access features'
    ]
  }
];
