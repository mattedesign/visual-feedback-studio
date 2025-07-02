import { supabase } from '@/integrations/supabase/client';
import { UserProfile, CreateProfileData } from '@/types/profiles';

export class ProfileService {
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  static async updateProfile(userId: string, updates: Partial<CreateProfileData>): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  }

  static async createProfile(userId: string, profileData: CreateProfileData): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        ...profileData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return data;
  }
}