
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Maximize2, Sparkles, TrendingUp } from 'lucide-react';
import { UpgradeOptionsPanel } from './UpgradeOptionsPanel';
import { stripeService } from '@/services/stripeService';
import PromptTuner from '../PromptTuner';
import { TunerSettings, CustomVisualResult } from '../../types/promptTuner';

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

interface VisualSuggestionsProps {
  analysisInsights: string[];
  userContext: string;
  focusAreas: string[];
  designType: 'mobile' | 'desktop' | 'responsive';
}

export const VisualSuggestions: React.FC<VisualSuggestionsProps> = ({
  analysisInsights,
  userContext,
  focusAreas,
  designType
}) => {
  const [suggestions, setSuggestions] = useState<VisualSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userCredits, setUserCredits] = useState(15); // Mock user credits
  const [purchasingUpgrade, setPurchasingUpgrade] = useState(false);
  
  // New state management for Prompt Tuner
  const [showPromptTuner, setShowPromptTuner] = useState<string | null>(null);
  const [isCustomGenerating, setIsCustomGenerating] = useState(false);
  const [customResults, setCustomResults] = useState<Record<string, CustomVisualResult>>({});

  const handleCustomGeneration = async (
    enhancedPrompt: string, 
    settings: TunerSettings, 
    suggestionId: string
  ) => {
    setIsCustomGenerating(true);
    try {
      console.log('🎛️ Generating custom visual with settings:', settings);
      
      // Create custom result (for now with placeholder)
      const customResult: CustomVisualResult = {
        id: `custom_${suggestionId}_${Date.now()}`,
        imageUrl: 'https://via.placeholder.com/400x300?text=Custom+Visual+Generated',
        settings,
        prompt: enhancedPrompt,
        createdAt: new Date()
      };

      // Store the custom result
      setCustomResults(prev => ({
        ...prev,
        [suggestionId]: customResult
      }));
      
      setShowPromptTuner(null);
      console.log('✅ Custom visual stored');
      
    } catch (error) {
      console.error('❌ Custom generation failed:', error);
    } finally {
      setIsCustomGenerating(false);
    }
  };

  const generateSuggestions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { visualSuggestionService } = await import('@/services/design/visualSuggestionService');
      
      const suggestions = await visualSuggestionService.generateVisualSuggestions({
        analysisInsights,
        userContext,
        focusAreas,
        designType
      });
      
      setSuggestions(suggestions);
    } catch (err) {
      setError('Failed to generate visual suggestions');
      console.error('Visual suggestions error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add helper function to map upgrade IDs to Stripe price IDs
  const getStripePriceId = (upgradeOptionId: string): string => {
    // Map upgrade IDs to actual Stripe price IDs from your enhanced pricing config
    const priceMappings: Record<string, string> = {
      'style_variety_pack': 'price_1RehvWB0UJfBqFIHgbpYCfPc',
      'responsive_design_pack': 'price_1RehvWB0UJfBqFIHbVisazQp', 
      'ab_test_variants': 'price_1RehvWB0UJfBqFIHSi8pYtMT',
      'accessibility_focus': 'price_1RehvWB0UJfBqFIHAccessibility'
    };
    
    const priceId = priceMappings[upgradeOptionId];
    if (!priceId) {
      throw new Error(`No price ID configured for upgrade: ${upgradeOptionId}`);
    }
    
    return priceId;
  };

  // Replace mock handleUpgradePurchase with real Stripe integration
  const handleUpgradePurchase = async (optionId: string) => {
    setPurchasingUpgrade(true);
    try {
      console.log('Starting upgrade purchase:', optionId);
      
      // Find the upgrade option details
      const option = suggestions.flatMap(s => s.upgradeOptions || []).find(o => o.id === optionId);
      if (!option) {
        throw new Error('Upgrade option not found');
      }

      // Get the Stripe Price ID for this upgrade
      const priceId = getStripePriceId(optionId);
      console.log('Using Stripe Price ID:', priceId);

      // Create Stripe checkout session using existing service
      const checkoutSession = await stripeService.createCheckoutSession({
        customerId: '', // This will be handled by the service to create/get customer
        priceId: priceId,
        successUrl: `${window.location.origin}/upgrade-success?session_id={CHECKOUT_SESSION_ID}&upgrade=${optionId}`,
        cancelUrl: window.location.href,
        metadata: {
          upgrade_type: optionId,
          upgrade_name: option.name,
          credits: option.credits.toString(),
          analysis_context: JSON.stringify({
            insights: analysisInsights.slice(0, 2), // Limit to avoid metadata size issues
            userContext: typeof userContext === 'string' ? userContext.slice(0, 100) : JSON.stringify(userContext).slice(0, 100),
            designType
          })
        }
      });

      if (checkoutSession?.url) {
        console.log('Redirecting to Stripe checkout:', checkoutSession.url);
        // Open Stripe checkout in new tab
        window.open(checkoutSession.url, '_blank');
      } else {
        throw new Error('Failed to create checkout session - no URL returned');
      }
      
    } catch (error) {
      console.error('Upgrade purchase failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to start upgrade purchase: ${errorMessage}. Please try again.`);
    } finally {
      setPurchasingUpgrade(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'smart_before_after': return '🧠';
      case 'before_after': return '🔄';
      case 'style_variant': return '🎨';
      case 'accessibility_fix': return '♿';
      default: return '💡';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'smart_before_after': return 'Smart Redesign';
      case 'before_after': return 'Before/After';
      case 'style_variant': return 'Style Variant';
      case 'accessibility_fix': return 'Accessibility Fix';
      default: return 'Suggestion';
    }
  };

  const getStyleBadgeColor = (style: string) => {
    switch (style) {
      case 'professional': return 'bg-blue-600 text-white';
      case 'minimal': return 'bg-gray-600 text-white';
      case 'bold': return 'bg-red-600 text-white';
      case 'playful': return 'bg-green-600 text-white';
      default: return 'bg-purple-600 text-white';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            🎨 Smart Visual Design Suggestions
          </span>
          <Button 
            onClick={generateSuggestions}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Smart Suggestions
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="space-y-6">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id}>
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {getTypeIcon(suggestion.type)} {getTypeName(suggestion.type)}
                        </Badge>
                        {suggestion.style && (
                          <Badge className={`text-xs ${getStyleBadgeColor(suggestion.style)}`}>
                            {suggestion.style.toUpperCase()}
                          </Badge>
                        )}
                        {suggestion.confidence && (
                          <Badge variant="outline" className="text-xs text-green-400">
                            {Math.round(suggestion.confidence * 100)}% Confidence
                          </Badge>
                        )}
                      </div>
                    </div>
                    {suggestion.reasoning && (
                      <div className="mt-2 p-2 bg-slate-600 rounded text-xs text-slate-300">
                        <strong>💡 Why this style:</strong> {suggestion.reasoning}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Main visual */}
                      <div>
                        <div className="aspect-square mb-3">
                          <img 
                            src={suggestion.imageUrl} 
                            alt={suggestion.description}
                            className="w-full h-full object-cover rounded border border-slate-600"
                          />
                        </div>
                        <p className="text-sm text-slate-300 mb-2">{suggestion.description}</p>
                        <p className="text-xs text-slate-400 mb-3">{suggestion.improvement}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline">
                            <Maximize2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Upgrade options preview */}
                      {suggestion.upgradeOptions && suggestion.upgradeOptions.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Available Upgrades
                          </h4>
                          {suggestion.upgradeOptions.slice(0, 2).map((option) => (
                            <Card key={option.id} className="bg-slate-600 border-slate-500 p-3">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h5 className="text-sm font-medium text-white">{option.name}</h5>
                                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{option.description}</p>
                                </div>
                                <Badge className="bg-yellow-600 text-yellow-100 text-xs ml-2">
                                  {option.credits} credits
                                </Badge>
                              </div>
                            </Card>
                          ))}
                          <p className="text-xs text-slate-400 text-center">
                            See full upgrade options below ↓
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Customize Button and Custom Results */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setShowPromptTuner(suggestion.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                      >
                        <span>🎛️</span>
                        Customize Visual
                      </button>
                      
                      {customResults[suggestion.id] && (
                        <button
                          onClick={() => window.open(customResults[suggestion.id].imageUrl, '_blank')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                        >
                          <span>✨</span>
                          View Custom
                        </button>
                      )}
                    </div>

                    {/* Prompt Tuner Panel */}
                    {showPromptTuner === suggestion.id && (
                      <PromptTuner
                        basePrompt={`Create a UI mockup that addresses: ${suggestion.description}`}
                        onGenerate={(enhancedPrompt, settings) => 
                          handleCustomGeneration(enhancedPrompt, settings, suggestion.id)
                        }
                        isGenerating={isCustomGenerating}
                        onClose={() => setShowPromptTuner(null)}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Integrated Upgrade Options Panel */}
                <UpgradeOptionsPanel
                  suggestion={suggestion}
                  onPurchaseUpgrade={handleUpgradePurchase}
                  userCredits={userCredits}
                  isGenerating={purchasingUpgrade}
                />
              </div>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <div className="mb-4">
              <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400 mb-4">Generate smart visual suggestions with AI-selected optimal styles</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-left">
              <h4 className="text-white font-medium mb-2">🧠 Smart Visual Generation Features:</h4>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>• AI selects optimal design style based on your context</li>
                <li>• Industry-specific recommendations</li>
                <li>• Upgrade options for additional styles</li>
                <li>• 75% cost reduction vs traditional approach</li>
              </ul>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Context: {analysisInsights.slice(0, 2).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
