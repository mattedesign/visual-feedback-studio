import { ProductSelection } from '@/components/subscription/ProductSelection';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
export default function Subscription() {
  const {
    subscription,
    loading
  } = useSubscription();
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading subscription details...</p>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen w-full bg-white">
      <div className="container mx-auto py-8">
        {subscription && subscription.status === 'active' ? <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Your Subscription</h1>
            <SubscriptionStatus />
          </div> : <ProductSelection />}
      </div>
    </div>;
}