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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return defaultFeaturePreferences;
      }

      // Check if user has feature preferences in privacy_preferences table
      const { data, error } = await supabase
        .from('privacy_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching feature preferences:', error);
        return defaultFeaturePreferences;
      }

      // Extract holistic AI prototypes preference from metadata or use default
      const holisticAiPrototypes = data?.improve_product === true 
        ? localStorage.getItem('holistic-ai-prototypes-enabled') === 'true'
        : false;

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      // Store in localStorage for immediate effect
      localStorage.setItem('holistic-ai-prototypes-enabled', enabled.toString());

      // Update cache
      this.cache = {
        ...this.cache || defaultFeaturePreferences,
        holisticAiPrototypes: enabled,
      };

      // Track usage metrics
      if (enabled) {
        // Log feature enablement for analytics
        console.log('Holistic AI Prototypes enabled for user:', user.id);
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