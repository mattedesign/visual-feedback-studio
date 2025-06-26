
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

// Centralized Stripe configuration
const STRIPE_CONFIG = {
  monthlyPriceId: "price_1RdxIAB0UJfBqFIHrJkzb238",
  yearlyPriceId: "price_1RdxIfB0UJfBqFIHMGtudpgk",
  monthlyAmount: 1999, // $19.99 in cents
  yearlyAmount: 19900, // $199.00 in cents
};

export const pricingPlans: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Pro Monthly',
    price: '$19.99',
    period: 'per month',
    priceId: STRIPE_CONFIG.monthlyPriceId,
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
    priceId: STRIPE_CONFIG.yearlyPriceId,
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

export const getStripeConfig = () => STRIPE_CONFIG;
