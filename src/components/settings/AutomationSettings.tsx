import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Target, 
  Clock, 
  Search, 
  Cpu, 
  Bell, 
  RotateCcw,
  Info,
  CheckCircle2
} from 'lucide-react';
import { automationPreferencesService, AutomationPreferences, defaultAutomationPreferences } from '@/services/figmant/automationPreferencesService';
import { toast } from 'sonner';

export const AutomationSettings = () => {
  const [preferences, setPreferences] = useState<AutomationPreferences>(defaultAutomationPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const prefs = await automationPreferencesService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      toast.error('Failed to load automation preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (key: keyof AutomationPreferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    setIsSaving(true);
    const success = await automationPreferencesService.updatePreferences({ [key]: value });
    setIsSaving(false);

    if (!success) {
      // Revert on failure
      setPreferences(preferences);
    }
  };

  const handleThresholdChange = (value: number[]) => {
    updatePreference('smartTriggerThreshold', value[0]);
  };

  const handleDelayChange = (value: number[]) => {
    updatePreference('autoAnalysisDelay', value[0] * 1000);
  };

  const resetToDefaults = async () => {
    setIsSaving(true);
    const success = await automationPreferencesService.resetToDefaults();
    setIsSaving(false);
    
    if (success) {
      setPreferences(defaultAutomationPreferences);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Automation Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure automated analysis and workflow triggers for your Figmant projects
        </p>
      </div>

      {/* Status Overview */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {preferences.autoAnalysisEnabled || preferences.designChangeDetection ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium">Automation Active</div>
                  <div className="text-sm text-muted-foreground">
                    Your workflow automation is configured and running
                  </div>
                </div>
              </>
            ) : (
              <>
                <Info className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Automation Disabled</div>
                  <div className="text-sm text-muted-foreground">
                    Enable automation features below to streamline your workflow
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-Analysis Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Auto-Analysis</CardTitle>
            </div>
            <Switch
              checked={preferences.autoAnalysisEnabled}
              onCheckedChange={(checked) => updatePreference('autoAnalysisEnabled', checked)}
              disabled={isSaving}
            />
          </div>
          <CardDescription>
            Automatically trigger analysis when multiple images are uploaded and conditions are met
          </CardDescription>
        </CardHeader>
        {preferences.autoAnalysisEnabled && (
          <CardContent className="space-y-6">
            {/* Image Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">Image Threshold</span>
                </div>
                <Badge variant="secondary">
                  {preferences.smartTriggerThreshold} {preferences.smartTriggerThreshold === 1 ? 'image' : 'images'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Minimum number of images required to trigger automatic analysis
              </p>
              <Slider
                value={[preferences.smartTriggerThreshold]}
                onValueChange={handleThresholdChange}
                max={5}
                min={1}
                step={1}
                className="w-full"
                disabled={isSaving}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 image</span>
                <span>5 images</span>
              </div>
            </div>

            {/* Trigger Delay */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Trigger Delay</span>
                </div>
                <Badge variant="secondary">
                  {preferences.autoAnalysisDelay / 1000} seconds
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Wait time before analysis starts after conditions are met
              </p>
              <Slider
                value={[preferences.autoAnalysisDelay / 1000]}
                onValueChange={handleDelayChange}
                max={10}
                min={1}
                step={1}
                className="w-full"
                disabled={isSaving}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 second</span>
                <span>10 seconds</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Design Change Detection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              <CardTitle>Design Change Detection</CardTitle>
            </div>
            <Switch
              checked={preferences.designChangeDetection}
              onCheckedChange={(checked) => updatePreference('designChangeDetection', checked)}
              disabled={isSaving}
            />
          </div>
          <CardDescription>
            Monitor for design modifications and automatically trigger re-analysis when changes are detected
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Batch Processing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-primary" />
              <CardTitle>Batch Processing</CardTitle>
            </div>
            <Switch
              checked={preferences.batchProcessingEnabled}
              onCheckedChange={(checked) => updatePreference('batchProcessingEnabled', checked)}
              disabled={isSaving}
            />
          </div>
          <CardDescription>
            Automatically queue multiple designs for efficient batch analysis and improved performance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Automation Notifications</CardTitle>
            </div>
            <Switch
              checked={preferences.notificationsEnabled}
              onCheckedChange={(checked) => updatePreference('notificationsEnabled', checked)}
              disabled={isSaving}
            />
          </div>
          <CardDescription>
            Receive notifications when automation triggers activate or complete analysis
          </CardDescription>
        </CardHeader>
      </Card>

      <Separator />

      {/* Reset to Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Reset Settings</CardTitle>
          <CardDescription>
            Reset all automation settings to their default values. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={resetToDefaults} 
            disabled={isSaving}
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {isSaving ? 'Resetting...' : 'Reset to Defaults'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};