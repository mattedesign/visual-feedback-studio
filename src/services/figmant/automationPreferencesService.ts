import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AutomationPreferences {
  autoAnalysisEnabled: boolean;
  smartTriggerThreshold: number;
  autoAnalysisDelay: number;
  designChangeDetection: boolean;
  batchProcessingEnabled: boolean;
  notificationsEnabled: boolean;
}

export const defaultAutomationPreferences: AutomationPreferences = {
  autoAnalysisEnabled: false,
  smartTriggerThreshold: 2,
  autoAnalysisDelay: 3000,
  designChangeDetection: false,
  batchProcessingEnabled: true,
  notificationsEnabled: true
};

class AutomationPreferencesService {
  private cache: AutomationPreferences | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // ✅ Get user automation preferences
  async getPreferences(): Promise<AutomationPreferences> {
    // Check cache first
    if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return defaultAutomationPreferences;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('automation_preferences')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('Failed to load automation preferences:', error);
        return defaultAutomationPreferences;
      }

      const preferences = profile?.automation_preferences || defaultAutomationPreferences;
      
      // Update cache
      this.cache = preferences;
      this.cacheTimestamp = Date.now();
      
      return preferences;
    } catch (error) {
      console.error('Error fetching automation preferences:', error);
      return defaultAutomationPreferences;
    }
  }

  // ✅ Update user automation preferences
  async updatePreferences(preferences: Partial<AutomationPreferences>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save automation preferences');
        return false;
      }

      // Get current preferences and merge with updates
      const currentPreferences = await this.getPreferences();
      const updatedPreferences = { ...currentPreferences, ...preferences };

      const { error } = await supabase
        .from('profiles')
        .update({
          automation_preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update automation preferences:', error);
        toast.error('Failed to save automation preferences');
        return false;
      }

      // Update cache
      this.cache = updatedPreferences;
      this.cacheTimestamp = Date.now();

      toast.success('Automation preferences saved');
      return true;
    } catch (error) {
      console.error('Error updating automation preferences:', error);
      toast.error('Failed to save automation preferences');
      return false;
    }
  }

  // ✅ Toggle specific automation feature
  async toggleFeature(feature: keyof AutomationPreferences, enabled: boolean): Promise<boolean> {
    const update = { [feature]: enabled };
    return await this.updatePreferences(update);
  }

  // ✅ Update threshold setting
  async updateThreshold(threshold: number): Promise<boolean> {
    return await this.updatePreferences({ smartTriggerThreshold: threshold });
  }

  // ✅ Update delay setting
  async updateDelay(delay: number): Promise<boolean> {
    return await this.updatePreferences({ autoAnalysisDelay: delay });
  }

  // ✅ Reset to defaults
  async resetToDefaults(): Promise<boolean> {
    const success = await this.updatePreferences(defaultAutomationPreferences);
    if (success) {
      toast.success('Automation preferences reset to defaults');
    }
    return success;
  }

  // ✅ Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  // ✅ Check if automation is active
  async isAutomationActive(): Promise<boolean> {
    const preferences = await this.getPreferences();
    return preferences.autoAnalysisEnabled || preferences.designChangeDetection;
  }

  // ✅ Get summary for UI indicators
  async getAutomationSummary(): Promise<{
    isActive: boolean;
    activeFeatures: string[];
    triggerThreshold: number;
  }> {
    const preferences = await this.getPreferences();
    const activeFeatures: string[] = [];

    if (preferences.autoAnalysisEnabled) activeFeatures.push('Auto-analysis');
    if (preferences.designChangeDetection) activeFeatures.push('Change detection');
    if (preferences.batchProcessingEnabled) activeFeatures.push('Batch processing');

    return {
      isActive: activeFeatures.length > 0,
      activeFeatures,
      triggerThreshold: preferences.smartTriggerThreshold
    };
  }
}

// Export singleton instance
export const automationPreferencesService = new AutomationPreferencesService();