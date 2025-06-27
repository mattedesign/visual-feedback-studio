import { 
  ENHANCED_PRICING_CONFIG, 
  COST_PROJECTIONS,
  PricingCalculator,
  CreditPackage,
  UpgradePack 
} from '../config/enhancedPricing';

export interface UserPricingContext {
  packageId: string;
  currentCredits: number;
  monthlyUsage: number;
  upgradeHistory: string[];
  industryType?: string;
}

export class PricingService {
  
  /**
   * Get personalized pricing recommendations for a user
   */
  static getPersonalizedRecommendations(context: UserPricingContext): {
    recommendedPackage: CreditPackage;
    upgradeSuggestions: UpgradePack[];
    potentialSavings: number;
  } {
    
    // Analyze usage patterns
    const needsUpgrades = context.upgradeHistory.length > 0;
    const recommendedPackageId = PricingCalculator.getRecommendedPackage(
      context.monthlyUsage, 
      needsUpgrades
    );
    
    const recommendedPackage = ENHANCED_PRICING_CONFIG.packages[recommendedPackageId];
    
    // Suggest relevant upgrades based on usage
    const upgradeSuggestions = this.getRelevantUpgrades(context);
    
    // Calculate potential savings
    const currentPackage = ENHANCED_PRICING_CONFIG.packages[context.packageId];
    const potentialSavings = recommendedPackage.price < currentPackage?.price ? 
      currentPackage.price - recommendedPackage.price : 0;

    return {
      recommendedPackage,
      upgradeSuggestions,
      potentialSavings
    };
  }

  /**
   * Get relevant upgrade suggestions based on user context
   */
  private static getRelevantUpgrades(context: UserPricingContext): UpgradePack[] {
    const allUpgrades = Object.values(ENHANCED_PRICING_CONFIG.upgrade_packs);
    const suggestions: UpgradePack[] = [];

    // Always suggest style variety for first-time users
    if (context.upgradeHistory.length === 0) {
      suggestions.push(allUpgrades.find(u => u.id === 'style_variety_pack')!);
    }

    // Suggest responsive design for mobile-heavy industries
    const mobileIndustries = ['ecommerce', 'retail', 'gaming', 'social'];
    if (mobileIndustries.includes(context.industryType || '')) {
      suggestions.push(allUpgrades.find(u => u.id === 'responsive_design_pack')!);
    }

    // Suggest A/B testing for conversion-focused users
    if (context.monthlyUsage >= 5) { // Regular users likely need testing
      suggestions.push(allUpgrades.find(u => u.id === 'ab_test_variants')!);
    }

    // Limit to top 3 suggestions
    return suggestions.slice(0, 3);
  }

  /**
   * Calculate dynamic pricing based on user loyalty and usage
   * Now includes Stripe Price ID information
   */
  static calculateDynamicPricing(
    upgradePackId: string, 
    userContext: UserPricingContext
  ): {
    basePrice: number;
    discount: number;
    finalPrice: number;
    reason: string;
    stripePrice?: string;
  } {
    
    const upgradePack = ENHANCED_PRICING_CONFIG.upgrade_packs[upgradePackId];
    const userPackage = ENHANCED_PRICING_CONFIG.packages[userContext.packageId];
    
    if (!upgradePack || !userPackage) {
      return {
        basePrice: 4,
        discount: 0,
        finalPrice: 4,
        reason: 'Default pricing'
      };
    }

    const basePrice = PricingCalculator.calculateUpgradePrice(upgradePackId, userContext.packageId);
    let discount = userPackage.upgrade_discount;
    let reason = `${Math.round(discount * 100)}% ${userPackage.name} discount`;

    // Loyalty bonus for frequent upgraders
    if (userContext.upgradeHistory.length >= 5) {
      discount += 0.05; // Additional 5% for loyal customers
      reason += ' + 5% loyalty bonus';
    }

    // First-time upgrade incentive
    if (userContext.upgradeHistory.length === 0 && upgradePackId === 'style_variety_pack') {
      discount += 0.1; // 10% off first upgrade
      reason = '10% first-time upgrade discount';
    }

    const finalPrice = Math.max(1, Math.round(basePrice * (1 - discount)));

    const result: any = {
      basePrice,
      discount,
      finalPrice,
      reason
    };

    // Add Stripe Price ID if available
    if ('stripe_price_id' in upgradePack) {
      result.stripePrice = upgradePack.stripe_price_id;
    }

    return result;
  }

  /**
   * Get Stripe Price ID for an upgrade pack
   */
  static getStripePriceId(upgradePackId: string): string | null {
    const upgradePack = ENHANCED_PRICING_CONFIG.upgrade_packs[upgradePackId];
    if (upgradePack && 'stripe_price_id' in upgradePack) {
      return upgradePack.stripe_price_id;
    }
    return null;
  }

  /**
   * Validate if user can afford an upgrade
   */
  static canAffordUpgrade(upgradePackId: string, userContext: UserPricingContext): {
    canAfford: boolean;
    creditsNeeded: number;
    suggestedAction: string;
  } {
    
    const pricing = this.calculateDynamicPricing(upgradePackId, userContext);
    const canAfford = userContext.currentCredits >= pricing.finalPrice;
    
    let suggestedAction = '';
    if (!canAfford) {
      const shortfall = pricing.finalPrice - userContext.currentCredits;
      const smallestPackage = Object.values(ENHANCED_PRICING_CONFIG.packages)
        .filter(pkg => pkg.credits >= shortfall)
        .sort((a, b) => a.price - b.price)[0];
      
      suggestedAction = smallestPackage ? 
        `Buy ${smallestPackage.name} (${smallestPackage.credits} credits for $${smallestPackage.price})` :
        'Buy more credits to continue';
    }

    return {
      canAfford,
      creditsNeeded: pricing.finalPrice,
      suggestedAction
    };
  }

  /**
   * Track and analyze upgrade conversion metrics
   */
  static trackUpgradeMetrics(action: 'view' | 'click' | 'purchase', upgradePackId: string, userContext: UserPricingContext) {
    // This would integrate with your analytics service
    const metrics = {
      action,
      upgradePackId,
      userPackage: userContext.packageId,
      userCredits: userContext.currentCredits,
      timestamp: Date.now()
    };

    console.log('📊 Upgrade metrics:', metrics);
    
    // Send to analytics service
    // analyticsService.track('upgrade_funnel', metrics);
  }
}

export const pricingService = PricingService;
