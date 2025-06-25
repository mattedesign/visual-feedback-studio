
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';
import { ExternalLink, Loader2 } from 'lucide-react';

export const SubscriptionManager = () => {
  const { subscription } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    if (!subscription?.stripe_customer_id) {
      toast.error('No customer found');
      return;
    }

    setLoading(true);
    try {
      const portalUrl = await stripeService.createCustomerPortalSession(
        subscription.stripe_customer_id,
        window.location.origin
      );

      if (portalUrl) {
        window.open(portalUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
    } finally {
      setLoading(false);
    }
  };

  if (!subscription || subscription.status !== 'active') {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Update your payment method, billing information, or cancel your subscription.
        </p>
        <Button 
          onClick={handleManageSubscription}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          Manage Subscription
        </Button>
      </CardContent>
    </Card>
  );
};
