
import { SubscriptionCheckout } from '@/components/subscription/SubscriptionCheckout';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Subscription() {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen gradient-bedrock flex items-center justify-center">
        <Card className="glass-card-dark border-white/10">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
            <p className="text-white/80">Loading subscription details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show pricing cards for freemium users or users without subscription
  const shouldShowPricingCards = !subscription || 
    subscription.status !== 'active' || 
    subscription.plan_type === 'freemium';

  return (
    <div className="min-h-screen gradient-orange-purple">
      <div className="relative z-10">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
        <div className="relative z-10 container-modern section-padding">
          {shouldShowPricingCards ? (
            <SubscriptionCheckout />
          ) : (
            <div className="max-w-2xl mx-auto">
              <h1 className="heading-lg text-center mb-8 text-white">Your Subscription</h1>
              <SubscriptionStatus />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
