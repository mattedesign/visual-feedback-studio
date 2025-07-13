import { supabase } from '@/integrations/supabase/client';
import { NotificationPreferences, CreateNotificationPreferencesData } from '@/types/notifications';

export class NotificationService {
  static async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }

    return data;
  }

  static async updatePreferences(userId: string, updates: CreateNotificationPreferencesData): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating notification preferences:', error);
      return null;
    }

    return data;
  }

  static async createPreferences(userId: string, preferencesData: CreateNotificationPreferencesData): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: userId,
        ...preferencesData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification preferences:', error);
      return null;
    }

    return data;
  }

  static async upsertPreferences(userId: string, preferencesData: CreateNotificationPreferencesData): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferencesData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting notification preferences:', error);
      return null;
    }

    return data;
  }
}