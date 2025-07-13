import { supabase } from '@/integrations/supabase/client';
import { PrivacyPreferences, CreatePrivacyPreferencesData } from '@/types/privacy';

export class PrivacyService {
  static async getPreferences(userId: string): Promise<PrivacyPreferences | null> {
    const { data, error } = await supabase
      .from('privacy_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching privacy preferences:', error);
      return null;
    }

    return data;
  }

  static async updatePreferences(userId: string, updates: CreatePrivacyPreferencesData): Promise<PrivacyPreferences | null> {
    const { data, error } = await supabase
      .from('privacy_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating privacy preferences:', error);
      return null;
    }

    return data;
  }

  static async createPreferences(userId: string, preferencesData: CreatePrivacyPreferencesData): Promise<PrivacyPreferences | null> {
    const { data, error } = await supabase
      .from('privacy_preferences')
      .insert({
        user_id: userId,
        ...preferencesData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating privacy preferences:', error);
      return null;
    }

    return data;
  }

  static async upsertPreferences(userId: string, preferencesData: CreatePrivacyPreferencesData): Promise<PrivacyPreferences | null> {
    const { data, error } = await supabase
      .from('privacy_preferences')
      .upsert({
        user_id: userId,
        ...preferencesData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting privacy preferences:', error);
      return null;
    }

    return data;
  }
}