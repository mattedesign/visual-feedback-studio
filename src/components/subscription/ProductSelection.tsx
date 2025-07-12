import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Loader2, Package, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { stripeService } from '@/services/stripeService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  analyses_limit: number;
  is_active: boolean;
  stripe_product_id?: string;
  features?: ProductFeature[];
}

interface ProductFeature {
  id: string;
  feature_key: string;
  feature_value: any;
}

export const ProductSelection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_features (*)
        `)
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      
      const formattedProducts = data?.map(product => ({
        ...product,
        features: product.product_features || []
      })) || [];
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load available plans');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleProductSubscribe = async (
    product: Product, 
    billingCycle: 'monthly' | 'yearly'
  ) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoading(`${product.id}-${billingCycle}`);
    
    try {
      // Create or get Stripe customer
      const customer = await stripeService.createStripeCustomer(user.email!, user.id);
      if (!customer) {
        throw new Error('Failed to create customer');
      }

      // Create checkout session with product information
      const session = await stripeService.createCheckoutSession({
        customerId: customer.id,
        planType: billingCycle,
        successUrl: `${window.location.origin}/?subscription_success=true`,
        cancelUrl: `${window.location.origin}/subscription`,
        productId: product.id, // Pass product ID for new system
        metadata: {
          plan_name: product.name,
          user_id: user.id,
          product_id: product.id,
          billing_cycle: billingCycle
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

  const handleLegacySubscribe = async (planType: 'monthly' | 'yearly', planName: string) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoading(`legacy-${planType}`);
    
    try {
      // Create or get Stripe customer
      const customer = await stripeService.createStripeCustomer(user.email!, user.id);
      if (!customer) {
        throw new Error('Failed to create customer');
      }

      // Create checkout session for legacy plans
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

  const renderProductFeatures = (product: Product) => {
    const standardFeatures = [
      `${product.analyses_limit} UX analyses per month`,
      'Research-backed insights',
      'Business impact analysis',
      'Professional reports'
    ];

    const customFeatures = product.features?.map(feature => {
      const value = feature.feature_value;
      if (typeof value === 'boolean') {
        return value ? feature.feature_key.replace(/_/g, ' ') : null;
      } else if (typeof value === 'string' || typeof value === 'number') {
        return `${feature.feature_key.replace(/_/g, ' ')}: ${value}`;
      }
      return null;
    }).filter(Boolean) || [];

    return [...standardFeatures, ...customFeatures];
  };

  const getPopularBadge = (product: Product, index: number) => {
    if (index === 0 && products.length > 1) {
      return <Badge className="mx-auto mb-2 bg-blue-100 text-blue-700">Most Popular</Badge>;
    }
    if (product.price_yearly && product.price_monthly) {
      const yearlyMonthly = product.price_yearly / 12;
      const savings = ((product.price_monthly - yearlyMonthly) / product.price_monthly) * 100;
      if (savings > 10) {
        return <Badge className="mx-auto mb-2 bg-green-100 text-green-700">Save {Math.round(savings)}%</Badge>;
      }
    }
    return null;
  };

  if (productsLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading available plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-gray-600">
          Upgrade to get professional UX analyses and insights
        </p>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {products.map((product, index) => (
              <Card key={product.id} className="relative border-2 border-gray-200 shadow-lg">
                <CardHeader className="text-center pb-4">
                  {getPopularBadge(product, index)}
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    <Package className="w-5 h-5" />
                    {product.name}
                  </CardTitle>
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {renderProductFeatures(product).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Monthly Option */}
                  {product.price_monthly > 0 && (
                    <div className="pt-4 border-t">
                      <div className="text-center mb-3">
                        <span className="text-2xl font-bold text-gray-900">${product.price_monthly}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <Button
                        onClick={() => handleProductSubscribe(product, 'monthly')}
                        disabled={loading === `${product.id}-monthly`}
                        className="w-full"
                        variant="outline"
                      >
                        {loading === `${product.id}-monthly` ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Crown className="w-4 h-4 mr-2" />
                        )}
                        Monthly Plan
                      </Button>
                    </div>
                  )}

                  {/* Yearly Option */}
                  {product.price_yearly > 0 && (
                    <div className="pt-2">
                      <div className="text-center mb-3">
                        <span className="text-2xl font-bold text-gray-900">${product.price_yearly}</span>
                        <span className="text-gray-600">/year</span>
                        {product.price_monthly > 0 && (
                          <div className="text-sm text-green-600 mt-1">
                            Save ${Math.round((product.price_monthly * 12) - product.price_yearly)} annually
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleProductSubscribe(product, 'yearly')}
                        disabled={loading === `${product.id}-yearly`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {loading === `${product.id}-yearly` ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        Yearly Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Fallback to Legacy Plans */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
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
                    onClick={() => handleLegacySubscribe('monthly', 'Monthly Pro')}
                    disabled={loading === 'legacy-monthly'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading === 'legacy-monthly' ? (
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
                    onClick={() => handleLegacySubscribe('yearly', 'Yearly Pro')}
                    disabled={loading === 'legacy-yearly'}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading === 'legacy-yearly' ? (
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
        </>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>All plans include secure payment processing via Stripe</p>
      </div>
    </div>
  );
};