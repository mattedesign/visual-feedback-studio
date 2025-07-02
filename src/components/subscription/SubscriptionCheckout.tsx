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

  const handleSubscribe = async (planType: 'monthly' | 'yearly', planName: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoading(planType);
    
    try {
      // Create or get Stripe customer
      const customer = await stripeService.createStripeCustomer(user.email!, user.id);
      if (!customer) {
        throw new Error('Failed to create customer');
      }

      // Create checkout session
      const session = await stripeService.createCheckoutSession({
        customerId: customer.id,
        planType,
        successUrl: `${window.location.origin}/?subscription_success=true`,
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600">
          Upgrade to get 25 professional UX analyses per month
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Monthly Plan */}
        <Card className="relative border-2 border-blue-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <Badge className="mx-auto mb-2 bg-blue-100 text-blue-700">
              Most Popular
            </Badge>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Monthly Pro
            </CardTitle>
            <div className="text-center">
              <span className="text-4xl font-bold text-gray-900">$29</span>
              <span className="text-gray-600">/month</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">25 UX analyses per month</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Research-backed insights</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Business impact analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Professional reports</span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => handleSubscribe('monthly', 'Monthly Pro')}
                disabled={loading === 'monthly'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading === 'monthly' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Start Monthly Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className="relative border-2 border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <Badge className="mx-auto mb-2 bg-green-100 text-green-700">
              Save 16%
            </Badge>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Yearly Pro
            </CardTitle>
            <div className="text-center">
              <span className="text-4xl font-bold text-gray-900">$290</span>
              <span className="text-gray-600">/year</span>
              <div className="text-sm text-gray-500 mt-1">
                <span className="line-through">$348</span> Save $58
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">25 UX analyses per month</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Research-backed insights</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Business impact analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Professional reports</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">Priority support</span>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => handleSubscribe('yearly', 'Yearly Pro')}
                disabled={loading === 'yearly'}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {loading === 'yearly' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Start Yearly Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>All plans include secure payment processing via Stripe</p>
      </div>
    </div>
  );
};