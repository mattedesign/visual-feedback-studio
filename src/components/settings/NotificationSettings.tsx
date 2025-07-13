import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationPreferences {
  emailNotifications: boolean;
  analysisComplete: boolean;
  analysisError: boolean;
  weeklyDigest: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
}

export const NotificationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    analysisComplete: true,
    analysisError: true,
    weeklyDigest: false,
    systemUpdates: true,
    marketingEmails: false
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences saved');
    } catch (error) {
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