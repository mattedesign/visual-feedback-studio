export interface PrivacyPreferences {
  id: string;
  user_id: string;
  analytics_tracking: boolean;
  improve_product: boolean;
  data_sharing: boolean;
  public_profile: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePrivacyPreferencesData {
  analytics_tracking?: boolean;
  improve_product?: boolean;
  data_sharing?: boolean;
  public_profile?: boolean;
}