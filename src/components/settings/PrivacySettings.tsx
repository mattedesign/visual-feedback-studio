import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Eye, Download, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface PrivacyPreferences {
  dataSharing: boolean;
  analyticsTracking: boolean;
  improveProduct: boolean;
  publicProfile: boolean;
}

export const PrivacySettings = () => {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    dataSharing: false,
    analyticsTracking: true,
    improveProduct: true,
    publicProfile: false
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Privacy settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof PrivacyPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDataExport = async () => {
    try {
      toast.success('Data export initiated. You will receive an email when ready.');
    } catch (error) {
      toast.error('Failed to initiate data export');
    }
  };

  const handleAccountDeletion = async () => {
    try {
      toast.success('Account deletion request submitted. This may take up to 30 days to complete.');
    } catch (error) {
      toast.error('Failed to process deletion request');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <Label htmlFor="analytics-tracking">Analytics Tracking</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Allow collection of usage analytics to improve our service
              </p>
            </div>
            <Switch
              id="analytics-tracking"
              checked={preferences.analyticsTracking}
              onCheckedChange={(checked) => updatePreference('analyticsTracking', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="improve-product">Help Improve Product</Label>
              <p className="text-sm text-muted-foreground">
                Share anonymous usage data to help us improve features
              </p>
            </div>
            <Switch
              id="improve-product"
              checked={preferences.improveProduct}
              onCheckedChange={(checked) => updatePreference('improveProduct', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="data-sharing">Data Sharing with Partners</Label>
              <p className="text-sm text-muted-foreground">
                Allow sharing anonymized data with trusted research partners
              </p>
            </div>
            <Switch
              id="data-sharing"
              checked={preferences.dataSharing}
              onCheckedChange={(checked) => updatePreference('dataSharing', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="public-profile">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch
              id="public-profile"
              checked={preferences.publicProfile}
              onCheckedChange={(checked) => updatePreference('publicProfile', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Data Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your data is encrypted at rest and in transit. We use industry-standard security measures to protect your information.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Data Retention</p>
            <p className="text-sm text-muted-foreground">
              Analysis data is retained for 2 years. Account data is retained until you delete your account.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Export Your Data</Label>
              <p className="text-sm text-muted-foreground">
                Download a copy of all your data
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDataExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-red-600">Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Delete Account
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account, 
                    all your analyses, and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAccountDeletion}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};