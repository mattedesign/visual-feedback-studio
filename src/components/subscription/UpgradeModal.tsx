
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Loader2, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal = ({ isOpen, onClose }: UpgradeModalProps) => {
  const { user } = useAuth();
  const { isTrialUser } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const config = stripeService.getPricingConfig();

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoading(priceId);
    
    try {
      console.log('🚀 Starting subscription process:', { priceId, planName, userEmail: user.email });
      
      // Create or get Stripe customer
      const customer = await stripeService.createStripeCustomer(user.email!, user.id);
      if (!customer) {
        throw new Error('Failed to create customer');
      }

      console.log('✅ Stripe customer ready:', customer.id);

      // Create checkout session
      const session = await stripeService.createCheckoutSession({
        customerId: customer.id,
        priceId,
        successUrl: `${window.location.origin}/analysis`,
        cancelUrl: `${window.location.origin}/analysis`,
        metadata: {
          plan_name: planName,
          user_id: user.id
        }
      });

      if (!session?.url) {
        throw new Error('Failed to create checkout session');
      }

      console.log('✅ Checkout session created:', session.id);

      // Open Stripe Checkout in new tab
      window.open(session.url, '_blank');
      
      toast.success('Opening Stripe checkout...');
    } catch (error) {
      console.error('❌ Subscription error:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setLoading(null);
    }
  };

  const trialUser = isTrialUser();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center mb-2">
            {trialUser ? "You've Used All 3 Free Analyses" : "Get Unlimited Analyses"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-slate-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="text-center mb-6">
          <p className="text-slate-300">
            {trialUser 
              ? "Upgrade to continue analyzing your designs with unlimited AI-powered insights"
              : "Unlock unlimited design analyses with advanced AI insights"
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-400" />
                  <h3 className="text-xl font-semibold">Pro Monthly</h3>
                </div>
                <div className="text-3xl font-bold mb-1">
                  $19.99
                  <span className="text-base font-normal text-slate-400">/month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-slate-200">Unlimited design analyses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-slate-200">Advanced AI insights</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-slate-200">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-slate-200">Export reports</span>
                </li>
              </ul>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                onClick={() => handleSubscribe(config.monthlyPriceId, 'Pro Monthly')}
                disabled={!!loading}
              >
                {loading === config.monthlyPriceId ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Upgrade Now
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="bg-slate-700 border-slate-600 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
              Best Value
            </Badge>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-purple-400" />
                  <h3 className="text-xl font-semibold">Enterprise Yearly</h3>
                </div>
                <div className="text-3xl font-bold mb-1">
                  $199.00
                  <span className="text-base font-normal text-slate-400">/year</span>
                </div>
                <p className="text-sm text-green-400 font-medium">
                  Save $40 compared to monthly
                </p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-slate-200">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-slate-200">Team collaboration features</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-slate-200">Advanced analytics dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-slate-200">Priority email support</span>
                </li>
              </ul>
              
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 transition-colors"
                onClick={() => handleSubscribe(config.yearlyPriceId, 'Enterprise Yearly')}
                disabled={!!loading}
              >
                {loading === config.yearlyPriceId ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-6 text-sm text-slate-400">
          <p>30-day money-back guarantee • Cancel anytime • Secure payment with Stripe</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
