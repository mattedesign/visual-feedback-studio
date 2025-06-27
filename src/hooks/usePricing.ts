
import { useState, useEffect, useMemo } from 'react';
import { PricingService, UserPricingContext } from '../services/pricingService';
import { CreditPackage, UpgradePack } from '../config/enhancedPricing';

export interface UsePricingReturn {
  recommendedPackage: CreditPackage | null;
  upgradeSuggestions: UpgradePack[];
  calculateUpgradePrice: (upgradeId: string) => number;
  canAffordUpgrade: (upgradeId: string) => boolean;
  getUpgradeReason: (upgradeId: string) => string;
  trackUpgradeAction: (action: 'view' | 'click' | 'purchase', upgradeId: string) => void;
}

export const usePricing = (userContext: UserPricingContext): UsePricingReturn => {
  const [recommendations, setRecommendations] = useState<{
    recommendedPackage: CreditPackage;
    upgradeSuggestions: UpgradePack[];
    potentialSavings: number;
  } | null>(null);

  useEffect(() => {
    const personalizedRecs = PricingService.getPersonalizedRecommendations(userContext);
    setRecommendations(personalizedRecs);
  }, [userContext.packageId, userContext.monthlyUsage, userContext.currentCredits]);

  const pricingMethods = useMemo(() => ({
    calculateUpgradePrice: (upgradeId: string): number => {
      const pricing = PricingService.calculateDynamicPricing(upgradeId, userContext);
      return pricing.finalPrice;
    },

    canAffordUpgrade: (upgradeId: string): boolean => {
      const affordability = PricingService.canAffordUpgrade(upgradeId, userContext);
      return affordability.canAfford;
    },

    getUpgradeReason: (upgradeId: string): string => {
      const pricing = PricingService.calculateDynamicPricing(upgradeId, userContext);
      return pricing.reason;
    },

    trackUpgradeAction: (action: 'view' | 'click' | 'purchase', upgradeId: string) => {
      PricingService.trackUpgradeMetrics(action, upgradeId, userContext);
    }
  }), [userContext]);

  return {
    recommendedPackage: recommendations?.recommendedPackage || null,
    upgradeSuggestions: recommendations?.upgradeSuggestions || [],
    ...pricingMethods
  };
};
