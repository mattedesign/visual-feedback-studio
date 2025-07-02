import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ChevronDown, ChevronRight, CreditCard, TrendingUp } from 'lucide-react';
import { ENHANCED_PRICING_CONFIG } from '@/config/enhancedPricing';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';

interface UpgradeOption {
  id: string;
  name: string;
  credits: number;
  description: string;
  styles: string[];
  value_proposition: string;
}

interface VisualSuggestion {
  id: string;
  type: 'before_after' | 'style_variant' | 'accessibility_fix' | 'smart_before_after';
  description: string;
  imageUrl: string;
  originalIssue: string;
  improvement: string;
  timestamp: Date;
  confidence?: number;
  style?: string;
  reasoning?: string;
  upgradeOptions?: UpgradeOption[];
  generatedAt?: string;
}

interface UpgradeOptionsPanelProps {
  suggestion: VisualSuggestion;
  onPurchaseUpgrade: (optionId: string) => Promise<void>;
  userCredits: number;
  onGenerateUpgrade?: (optionId: string) => Promise<void>;
  isGenerating?: boolean;
}

export const UpgradeOptionsPanel: React.FC<UpgradeOptionsPanelProps> = ({
  suggestion,
  onPurchaseUpgrade,
  userCredits,
  onGenerateUpgrade,
  isGenerating = false
}) => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePurchase = async (optionId: string) => {
    if (!user) {
      toast.error('Please sign in to purchase upgrades');
      return;
    }

    setPurchasing(optionId);
    try {
      // Get the upgrade pack configuration with Price ID
      const upgradePack = ENHANCED_PRICING_CONFIG.upgrade_packs[optionId];
      if (!upgradePack || !('stripe_price_id' in upgradePack)) {
        throw new Error('Upgrade configuration not found');
      }

      console.log('🚀 Starting upgrade purchase:', { 
        optionId, 
        priceId: upgradePack.stripe_price_id,
        userEmail: user.email 
      });
      
      // Create or get Stripe customer
      const customer = await stripeService.createStripeCustomer(user.email!, user.id);
      if (!customer) {
        throw new Error('Failed to create customer');
      }

      console.log('✅ Stripe customer ready:', customer.id);

      // Create checkout session using plan type
      const session = await stripeService.createCheckoutSession({
        customerId: customer.id,
        planType: 'monthly', // Default to monthly for upgrade packs
        successUrl: `${window.location.origin}/analysis?upgrade_success=true&upgrade_id=${optionId}`,
        cancelUrl: `${window.location.origin}/analysis`,
        metadata: {
          upgrade_type: optionId,
          upgrade_name: upgradePack.name,
          credits: upgradePack.credits.toString(),
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
      
      // Call the original purchase handler for any additional logic
      await onPurchaseUpgrade(optionId);
      
    } catch (error) {
      console.error('❌ Upgrade purchase error:', error);
      toast.error('Failed to start upgrade purchase process');
    } finally {
      setPurchasing(null);
    }
  };

  const toggleExpanded = (optionId: string) => {
    setExpandedOption(expandedOption === optionId ? null : optionId);
  };

  const getUpgradeBenefits = (optionId: string) => {
    switch (optionId) {
      case 'style_variety_pack':
        return [
          'Compare professional vs minimal vs bold approaches',
          'See which style resonates with your target audience',
          'Make data-driven design decisions'
        ];
      case 'responsive_design_pack':
        return [
          'Ensure consistent UX across all devices',
          'Identify mobile-specific optimization opportunities',
          'Validate responsive design patterns'
        ];
      case 'ab_test_variants':
        return [
          'Get statistically different designs for testing',
          'Maximize conversion optimization potential',
          'Reduce time to statistical significance'
        ];
      default:
        return ['Enhanced design options', 'Professional quality results', 'Expanded creative possibilities'];
    }
  };

  if (!suggestion.upgradeOptions || suggestion.upgradeOptions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-800 border-slate-700 mt-6">
      <CardContent className="p-6">
        {/* Current Suggestion Info */}
        <div className="mb-6 pb-6 border-b border-slate-600">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              {suggestion.style && (
                <Badge className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                  {suggestion.style.toUpperCase()}
                </Badge>
              )}
              {suggestion.confidence && (
                <Badge variant="outline" className="text-green-400 border-green-400">
                  {Math.round(suggestion.confidence * 100)}% Confidence
                </Badge>
              )}
            </div>
          </div>
          
          {suggestion.reasoning && (
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <span>💡</span>
                Why this style?
              </h4>
              <p className="text-slate-300 text-sm">{suggestion.reasoning}</p>
            </div>
          )}
        </div>

        {/* Upgrade Section */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <h4 className="text-white font-semibold text-lg mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              🚀 Want to explore more options?
            </h4>
            <p className="text-slate-400 text-sm">
              Get additional design approaches to compare and validate your decisions
            </p>
          </div>

          <div className="space-y-4">
            {suggestion.upgradeOptions.map((option) => {
              const canAfford = userCredits >= option.credits;
              const isExpanded = expandedOption === option.id;
              const isPurchasing = purchasing === option.id;
              
              // Get the upgrade pack config for Price ID
              const upgradePack = ENHANCED_PRICING_CONFIG.upgrade_packs[option.id];
              const hasPriceId = upgradePack && 'stripe_price_id' in upgradePack;

              return (
                <Card 
                  key={option.id} 
                  className={`bg-slate-700 border-slate-600 transition-all duration-300 ${
                    !canAfford ? 'opacity-60 border-red-500/50' : ''
                  } ${isExpanded ? 'border-blue-500' : ''}`}
                >
                  <CardContent className="p-4">
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleExpanded(option.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h5 className="text-white font-medium text-base">{option.name}</h5>
                          <p className="text-slate-300 text-sm mt-1">{option.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-600 rounded-lg px-3 py-2 text-center min-w-[60px]">
                            <div className="text-white font-bold text-lg leading-none">{option.credits}</div>
                            <div className="text-slate-400 text-xs uppercase tracking-wide">credits</div>
                          </div>
                          {isExpanded ? 
                            <ChevronDown className="w-4 h-4 text-slate-400" /> : 
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          }
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <div className="bg-slate-600 rounded-lg p-3 mb-4">
                          <strong className="text-white text-sm">Value:</strong>
                          <span className="text-slate-300 text-sm ml-2">{option.value_proposition}</span>
                        </div>
                        
                        <div className="mb-4">
                          <span className="text-slate-400 text-sm font-medium">Includes:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {option.styles.map((style) => (
                              <Badge key={style} variant="outline" className="text-xs text-blue-400 border-blue-400">
                                {style.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mb-4">
                          <ul className="space-y-1">
                            {getUpgradeBenefits(option.id).map((benefit, index) => (
                              <li key={index} className="text-slate-300 text-sm flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <Button
                        onClick={() => handlePurchase(option.id)}
                        disabled={isPurchasing || !canAfford || isGenerating || !hasPriceId}
                        className={`w-full ${
                          !canAfford 
                            ? 'bg-red-600/20 text-red-400 border-red-600/50' 
                            : isPurchasing 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        }`}
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : !canAfford ? (
                          'Need more credits'
                        ) : !hasPriceId ? (
                          'Coming Soon'
                        ) : (
                          `Get ${option.name}`
                        )}
                      </Button>

                      {!canAfford && (
                        <div className="text-center mt-2">
                          <span className="text-red-400 text-xs">
                            Need {option.credits - userCredits} more credits
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Credit Status & Purchase */}
        <div className="border-t border-slate-600 pt-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{userCredits}</span>
              <span className="text-slate-400 text-sm">credits remaining</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Buy Credits
            </Button>
          </div>

          {userCredits < 3 && (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
              <p className="text-yellow-300 text-sm flex items-center gap-2">
                <span>⚠️</span>
                Running low on credits. Consider purchasing a credit pack for continued access to upgrade options.
              </p>
            </div>
          )}
        </div>

        {/* Social Proof */}
        <div className="text-center bg-slate-700 rounded-lg p-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-green-400">87%</span>
            <span className="text-slate-300 text-xs max-w-[200px] leading-tight">
              of users find additional styles helpful for decision making
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
