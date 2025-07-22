import { supabase } from '@/integrations/supabase/client';

export interface FeaturePreferences {
  holisticAiPrototypes: boolean;
  // Add other feature flags as needed in the future
}

const defaultFeaturePreferences: FeaturePreferences = {
  holisticAiPrototypes: false,
};

class FeaturePreferencesService {
  private cache: FeaturePreferences | null = null;

  async getPreferences(): Promise<FeaturePreferences> {
    if (this.cache) {
      return this.cache;
    }

    try {
      // Read directly from localStorage for consistency with useFeatureFlag hook
      const holisticAiPrototypes = localStorage.getItem('holistic-ai-prototypes-enabled') === 'true';

      this.cache = {
        holisticAiPrototypes,
      };

      return this.cache;
    } catch (error) {
      console.error('Error in getPreferences:', error);
      return defaultFeaturePreferences;
    }
  }

  async updateHolisticAiPrototypes(enabled: boolean): Promise<boolean> {
    try {
      // Store in localStorage for immediate effect
      localStorage.setItem('holistic-ai-prototypes-enabled', enabled.toString());

      // Clear cache to force reload
      this.clearCache();

      // Track usage metrics
      if (enabled) {
        // Log feature enablement for analytics
        console.log('Holistic AI Prototypes enabled for user');
      }

      return true;
    } catch (error) {
      console.error('Error updating holistic AI prototypes preference:', error);
      return false;
    }
  }

  clearCache(): void {
    this.cache = null;
  }

  // Helper method to check if holistic AI prototypes is enabled
  async isHolisticAiPrototypesEnabled(): Promise<boolean> {
    const preferences = await this.getPreferences();
    return preferences.holisticAiPrototypes;
  }
}

export const featurePreferencesService = new FeaturePreferencesService();