import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Link, Package, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  plan_type: string;
  analyses_limit: number;
  product_id: string | null;
  user_profiles?: {
    email: string;
  };
}

interface Product {
  id: string;
  name: string;
  analyses_limit: number;
}

export const SubscriptionProductLinker = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingLoading, setLinkingLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch subscriptions without product links
      const { data: subsData, error: subsError } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          plan_type,
          analyses_limit,
          product_id,
          user_id
        `)
        .is('product_id', null)
        .limit(20);

      // Get user emails separately
      let subscriptionsWithEmails = [];
      if (subsData && subsData.length > 0) {
        const userIds = subsData.map(sub => sub.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', userIds);
        
        subscriptionsWithEmails = subsData.map(sub => ({
          ...sub,
          user_profiles: profilesData?.find(profile => profile.user_id === sub.user_id)
        }));
      }

      if (subsError) throw subsError;

      // Fetch active products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, analyses_limit')
        .eq('is_active', true)
        .order('analyses_limit');

      if (productsError) throw productsError;

      setSubscriptions(subscriptionsWithEmails || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const linkSubscriptionToProduct = async (subscriptionId: string, productId: string) => {
    setLinkingLoading(subscriptionId);
    
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ product_id: productId })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast.success('Subscription linked to product successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error linking subscription:', error);
      toast.error('Failed to link subscription to product');
    } finally {
      setLinkingLoading(null);
    }
  };

  const getSuggestedProduct = (subscription: Subscription) => {
    // Simple matching logic based on analyses_limit
    return products.find(p => p.analyses_limit === subscription.analyses_limit) || products[0];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading subscriptions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Subscription-Product Linker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>All subscriptions are already linked to products!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Subscription-Product Linker
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Link existing subscriptions to products to enable the new system
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptions.map((subscription) => {
          const suggestedProduct = getSuggestedProduct(subscription);
          
          return (
            <div key={subscription.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {subscription.user_profiles?.email || 'Unknown User'}
                    </span>
                    <Badge variant="outline">
                      {subscription.plan_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current limit: {subscription.analyses_limit} analyses
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select
                    onValueChange={(productId) => linkSubscriptionToProduct(subscription.id, productId)}
                    disabled={linkingLoading === subscription.id}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue 
                        placeholder={suggestedProduct ? `Link to ${suggestedProduct.name}` : 'Select product'} 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{product.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {product.analyses_limit} analyses
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {linkingLoading === subscription.id && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Linking subscriptions to products enables the new product-based 
            system while maintaining backward compatibility. Users will see product names and features 
            instead of plan types.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};