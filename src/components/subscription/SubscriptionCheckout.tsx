
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';

export const SubscriptionCheckout = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoading(priceId);
    
    try {
      // Create or get Stripe customer
      const customer = await stripeService.createStripeCustomer(user.email!, user.id);
      if (!customer) {
        throw new Error('Failed to create customer');
      }

      // Create checkout session
      const session = await stripeService.createCheckoutSession({
        customerId: customer.id,
        priceId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription`,
        metadata: {
          plan_name: planName,
          user_id: user.id
        }
      });

      if (!session?.url) {
        throw new Error('Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.open(session.url, '_blank');
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setLoading(null);
    }
  };

  const config = stripeService.getPricingConfig();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-gray-600">Upgrade to unlock unlimited design analyses</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Pro Monthly
            </CardTitle>
            <div className="text-3xl font-bold">
              ${(config.monthlyAmount / 100).toFixed(2)}
              <span className="text-base font-normal text-gray-500">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Unlimited design analyses
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Advanced AI insights
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Priority support
              </li>
            </ul>
            <Button 
              className="w-full"
              onClick={() => handleSubscribe(config.monthlyPriceId, 'Pro Monthly')}
              disabled={!!loading}
            >
              {loading === config.monthlyPriceId ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Get Started
            </Button>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className="relative border-2 border-purple-200">
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
            Best Value
          </Badge>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-500" />
              Enterprise Yearly
            </CardTitle>
            <div className="text-3xl font-bold">
              ${(config.yearlyAmount / 100).toFixed(2)}
              <span className="text-base font-normal text-gray-500">/year</span>
            </div>
            <p className="text-sm text-green-600 font-medium">
              Save 31% compared to monthly
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Everything in Pro
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Team collaboration features
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Advanced analytics
              </li>
            </ul>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => handleSubscribe(config.yearlyPriceId, 'Enterprise Yearly')}
              disabled={!!loading}
            >
              {loading === config.yearlyPriceId ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        <p>30-day money-back guarantee • Cancel anytime</p>
      </div>
    </div>
  );
};
