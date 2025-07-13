export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  analysis_complete: boolean;
  analysis_error: boolean;
  weekly_digest: boolean;
  system_updates: boolean;
  marketing_emails: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationPreferencesData {
  email_notifications?: boolean;
  analysis_complete?: boolean;
  analysis_error?: boolean;
  weekly_digest?: boolean;
  system_updates?: boolean;
  marketing_emails?: boolean;
}