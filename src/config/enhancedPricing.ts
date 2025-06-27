export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  visual_generations: number;
  upgrade_discount: number;
  features: string[];
  popular?: boolean;
  bestValue?: boolean;
  savings?: number;
}

export interface AnalysisCost {
  credits: number;
  includes_visual: boolean;
  analysis_type: string;
  description: string;
}

export interface UpgradePack {
  id: string;
  name: string;
  credits: number;
  generates: number;
  description: string;
  value_proposition: string;
  popular?: boolean;
  technical?: boolean;
  business_focused?: boolean;
}

export const ENHANCED_PRICING_CONFIG = {
  // Updated Credit Packages (modest increases + visual value)
  packages: {
    starter: {
      id: 'starter',
      name: 'Starter Pack',
      credits: 20,
      price: 24, // +$5 from original $19
      pricePerCredit: 1.20,
      visual_generations: 20, // 1 per analysis
      upgrade_discount: 0,
      features: [
        '1 smart visual per analysis',
        'AI style reasoning included', 
        'Basic upgrade options',
        'Email support'
      ],
      savings: 0
    } as CreditPackage,

    growth: {
      id: 'growth', 
      name: 'Growth Pack',
      credits: 60,
      price: 59, // +$10 from original $49
      pricePerCredit: 0.98,
      visual_generations: 60,
      upgrade_discount: 0.1, // 10% off upgrade packs
      features: [
        '1 smart visual per analysis',
        'Advanced style selection',
        'Priority upgrade generation',
        'Industry-specific insights',
        'Chat support'
      ],
      popular: true,
      savings: 18 // vs buying starter packs
    } as CreditPackage,

    professional: {
      id: 'professional',
      name: 'Professional Pack', 
      credits: 150,
      price: 119, // +$20 from original $99
      pricePerCredit: 0.79,
      visual_generations: 150,
      upgrade_discount: 0.15, // 15% off upgrade packs
      features: [
        '1 smart visual per analysis',
        'Industry-specific styling',
        'Bulk upgrade discounts', 
        'Priority queue access',
        'Advanced export options',
        'Priority support'
      ],
      bestValue: true,
      savings: 61 // vs buying growth packs
    } as CreditPackage,

    enterprise: {
      id: 'enterprise',
      name: 'Enterprise Pack',
      credits: 350, 
      price: 249, // +$50 from original $199
      pricePerCredit: 0.71,
      visual_generations: 350,
      upgrade_discount: 0.2, // 20% off upgrade packs
      features: [
        '1 smart visual per analysis',
        'Custom style training',
        'Unlimited upgrade generations',
        'White-label options',
        'API access',
        'Dedicated account manager',
        'Custom integrations'
      ],
      savings: 147 // vs buying professional packs
    } as CreditPackage
  },

  // Analysis costs (same credits, but now include 1 smart visual)
  analysis_costs: {
    basic_competitor: {
      credits: 1,
      includes_visual: true,
      analysis_type: 'Competitor Analysis',
      description: 'AI analysis + 1 smart visual suggestion'
    } as AnalysisCost,

    ab_testing: {
      credits: 2, 
      includes_visual: true,
      analysis_type: 'A/B Testing Strategy',
      description: 'Testing framework + 1 optimized visual'
    } as AnalysisCost,

    revenue_analysis: {
      credits: 3,
      includes_visual: true, 
      analysis_type: 'Revenue Impact Analysis',
      description: 'ROI modeling + 1 conversion-focused visual'
    } as AnalysisCost,

    hierarchy_analysis: {
      credits: 4,
      includes_visual: true,
      analysis_type: 'Visual Hierarchy Analysis', 
      description: 'Eye-tracking simulation + 1 hierarchy demonstration'
    } as AnalysisCost,

    comprehensive: {
      credits: 10,
      includes_visual: true,
      analysis_type: 'Comprehensive Business Analysis',
      description: 'Full market analysis + 1 complete visual redesign'
    } as AnalysisCost
  },

  // New upgrade pack options with Stripe Price IDs
  upgrade_packs: {
    style_variety: {
      id: 'style_variety_pack',
      name: 'Style Variety Pack',
      credits: 2,
      generates: 3, // Professional, minimal, bold
      description: 'See 3 additional style approaches for comparison',
      value_proposition: 'Compare different design directions before making final decisions',
      popular: true,
      stripe_price_id: 'price_1RehvWB0UJfBqFIHgbpYCfPc' // Your actual Stripe price ID
    } as UpgradePack & { stripe_price_id: string },

    responsive_design: {
      id: 'responsive_design_pack', 
      name: 'Responsive Design Pack',
      credits: 2,
      generates: 3, // Mobile, tablet, desktop
      description: 'See how your design works across all devices',
      value_proposition: 'Ensure perfect user experience on mobile, tablet, and desktop',
      technical: true,
      stripe_price_id: 'price_1RehvWB0UJfBqFIHbVisazQp' // Your actual Stripe price ID
    } as UpgradePack & { stripe_price_id: string },

    ab_test_variants: {
      id: 'ab_test_variants',
      name: 'A/B Test Variants',
      credits: 3,
      generates: 2, // Two statistically different versions
      description: 'Generate 2 distinct versions for conversion testing',
      value_proposition: 'Get proven-different designs for statistical testing',
      business_focused: true,
      stripe_price_id: 'price_1RehvWB0UJfBqFIHSi8pYtMT' // Your actual Stripe price ID
    } as UpgradePack & { stripe_price_id: string },

    accessibility_focus: {
      id: 'accessibility_focus',
      name: 'Accessibility Enhancement Pack',
      credits: 2,
      generates: 2, // WCAG compliant + high contrast versions
      description: 'WCAG 2.1 compliant versions with accessibility improvements',
      value_proposition: 'Ensure legal compliance and expand market reach',
      technical: true,
      stripe_price_id: 'price_1RehvWB0UJfBqFIHAccessibility' // Your actual Stripe price ID
    } as UpgradePack & { stripe_price_id: string }
  }
};

// Cost analysis and projections
export const COST_PROJECTIONS = {
  dalle_api_costs: {
    cost_per_image_standard: 0.04,
    cost_per_image_hd: 0.08,
    recommended_quality: 'hd' // For professional results
  },

  monthly_scenarios: {
    conservative: {
      name: 'Conservative Growth',
      active_users: 200,
      avg_analyses_per_user: 2.5,
      total_base_visuals: 500, // 200 * 2.5
      upgrade_adoption_rate: 0.20, // 20% buy upgrades
      avg_upgrade_visuals: 2.5,
      total_upgrade_visuals: 250, // 40 users * 2.5 upgrades * 2.5 visuals
      total_monthly_visuals: 750,
      monthly_dalle_cost: 60, // 750 * $0.08
      avg_revenue_per_user: 35,
      total_monthly_revenue: 7000,
      profit_margin: 0.991 // 99.1%
    },

    growth: {
      name: 'Growth Scenario',
      active_users: 500,
      avg_analyses_per_user: 3,
      total_base_visuals: 1500,
      upgrade_adoption_rate: 0.35, // 35% buy upgrades
      avg_upgrade_visuals: 3,
      total_upgrade_visuals: 787, // 175 users * 3 upgrades * 3 visuals
      total_monthly_visuals: 2287,
      monthly_dalle_cost: 183,
      avg_revenue_per_user: 48,
      total_monthly_revenue: 24000,
      profit_margin: 0.992 // 99.2%
    },

    scale: {
      name: 'Scale Scenario', 
      active_users: 1000,
      avg_analyses_per_user: 3.5,
      total_base_visuals: 3500,
      upgrade_adoption_rate: 0.50, // 50% buy upgrades
      avg_upgrade_visuals: 4,
      total_upgrade_visuals: 2000, // 500 users * 4 upgrades * 4 visuals
      total_monthly_visuals: 5500,
      monthly_dalle_cost: 440,
      avg_revenue_per_user: 62,
      total_monthly_revenue: 62000,
      profit_margin: 0.993 // 99.3%
    }
  }
};

// Revenue optimization utilities
export class PricingCalculator {
  
  static calculatePackageSavings(packageId: string): number {
    const pkg = ENHANCED_PRICING_CONFIG.packages[packageId];
    if (!pkg) return 0;

    // Calculate savings vs buying individual starter packs
    const starterPackPrice = ENHANCED_PRICING_CONFIG.packages.starter.price;
    const starterCredits = ENHANCED_PRICING_CONFIG.packages.starter.credits;
    const equivalentStarterPacks = Math.ceil(pkg.credits / starterCredits);
    const starterPacksCost = equivalentStarterPacks * starterPackPrice;
    
    return Math.max(0, starterPacksCost - pkg.price);
  }

  static calculateUpgradePrice(upgradePackId: string, userPackageId: string): number {
    const upgradePack = ENHANCED_PRICING_CONFIG.upgrade_packs[upgradePackId];
    const userPackage = ENHANCED_PRICING_CONFIG.packages[userPackageId];
    
    if (!upgradePack || !userPackage) return upgradePack?.credits * 2 || 4; // Default fallback

    const basePrice = upgradePack.credits * 2; // $2 per credit base price
    const discountMultiplier = 1 - userPackage.upgrade_discount;
    
    return Math.round(basePrice * discountMultiplier);
  }

  static getRecommendedPackage(monthlyAnalyses: number, needsUpgrades: boolean): string {
    const monthlyCreditsNeeded = monthlyAnalyses * 2.5; // Average credits per analysis
    
    if (needsUpgrades) {
      // Account for upgrade costs
      const upgradeCreditsNeeded = monthlyAnalyses * 0.3 * 2.5; // 30% upgrade rate * avg credits
      const totalCreditsNeeded = monthlyCreditsNeeded + upgradeCreditsNeeded;
      
      if (totalCreditsNeeded <= 60) return 'growth';
      if (totalCreditsNeeded <= 150) return 'professional'; 
      return 'enterprise';
    }

    if (monthlyCreditsNeeded <= 20) return 'starter';
    if (monthlyCreditsNeeded <= 60) return 'growth';
    if (monthlyCreditsNeeded <= 150) return 'professional';
    return 'enterprise';
  }

  static calculateROI(currentMonthlySpend: number, figmantPackageId: string): {
    monthlySavings: number;
    annualSavings: number;
    roiPercentage: number;
  } {
    const figmantCost = ENHANCED_PRICING_CONFIG.packages[figmantPackageId]?.price || 0;
    const monthlySavings = Math.max(0, currentMonthlySpend - figmantCost);
    const annualSavings = monthlySavings * 12;
    const roiPercentage = currentMonthlySpend > 0 ? (monthlySavings / currentMonthlySpend) * 100 : 0;

    return {
      monthlySavings,
      annualSavings, 
      roiPercentage
    };
  }
}

// Export utility functions
export const getPricingConfig = () => ENHANCED_PRICING_CONFIG;
export const getCostProjections = () => COST_PROJECTIONS;
export const pricingCalculator = PricingCalculator;
