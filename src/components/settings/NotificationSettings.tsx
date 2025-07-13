import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { NotificationService } from '@/services/notificationService';
import { CreateNotificationPreferencesData } from '@/types/notifications';

interface NotificationPreferences {
  emailNotifications: boolean;
  analysisComplete: boolean;
  analysisError: boolean;
  weeklyDigest: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
}

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    analysisComplete: true,
    analysisError: true,
    weeklyDigest: false,
    systemUpdates: true,
    marketingEmails: false
  });

  // Load preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return;
      
      try {
        const savedPreferences = await NotificationService.getPreferences(user.id);
        if (savedPreferences) {
          setPreferences({
            emailNotifications: savedPreferences.email_notifications,
            analysisComplete: savedPreferences.analysis_complete,
            analysisError: savedPreferences.analysis_error,
            weeklyDigest: savedPreferences.weekly_digest,
            systemUpdates: savedPreferences.system_updates,
            marketingEmails: savedPreferences.marketing_emails
          });
        }
      } catch (error) {
        console.error('Error loading notification preferences:', error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const preferencesData: CreateNotificationPreferencesData = {
        email_notifications: preferences.emailNotifications,
        analysis_complete: preferences.analysisComplete,
        analysis_error: preferences.analysisError,
        weekly_digest: preferences.weeklyDigest,
        system_updates: preferences.systemUpdates,
        marketing_emails: preferences.marketingEmails
      };

      const result = await NotificationService.upsertPreferences(user.id, preferencesData);
      if (result) {
        toast.success('Notification preferences saved');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Notification preferences save error:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (initialLoad) {
    return <div className="space-y-6">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label htmlFor="email-notifications">Enable Email Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Analysis Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Label htmlFor="analysis-complete">Analysis Complete</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified when your analysis is finished
              </p>
            </div>
            <Switch
              id="analysis-complete"
              checked={preferences.analysisComplete}
              onCheckedChange={(checked) => updatePreference('analysisComplete', checked)}
              disabled={!preferences.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <Label htmlFor="analysis-error">Analysis Errors</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified when an analysis fails or encounters errors
              </p>
            </div>
            <Switch
              id="analysis-error"
              checked={preferences.analysisError}
              onCheckedChange={(checked) => updatePreference('analysisError', checked)}
              disabled={!preferences.emailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="weekly-digest">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your analysis activity
              </p>
            </div>
            <Switch
              id="weekly-digest"
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) => updatePreference('weeklyDigest', checked)}
              disabled={!preferences.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="system-updates">System Updates</Label>
              <p className="text-sm text-muted-foreground">
                Important updates about new features and maintenance
              </p>
            </div>
            <Switch
              id="system-updates"
              checked={preferences.systemUpdates}
              onCheckedChange={(checked) => updatePreference('systemUpdates', checked)}
              disabled={!preferences.emailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="marketing-emails">Marketing Communications</Label>
              <p className="text-sm text-muted-foreground">
                Tips, best practices, and product announcements
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={preferences.marketingEmails}
              onCheckedChange={(checked) => updatePreference('marketingEmails', checked)}
              disabled={!preferences.emailNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};