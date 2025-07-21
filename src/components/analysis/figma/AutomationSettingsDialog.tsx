import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  Settings, 
  Clock, 
  Target,
  Search,
  Cpu,
  Bell,
  RotateCcw,
  Activity
} from 'lucide-react';
import { automationPreferencesService, AutomationPreferences } from '@/services/figmant/automationPreferencesService';
import { toast } from 'sonner';

interface AutomationSettingsDialogProps {
  children: React.ReactNode;
}

export const AutomationSettingsDialog = ({ children }: AutomationSettingsDialogProps) => {
  const [preferences, setPreferences] = useState<AutomationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Load preferences when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

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
    if (!preferences) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    const success = await automationPreferencesService.updatePreferences({ [key]: value });
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
    const success = await automationPreferencesService.resetToDefaults();
    if (success) {
      loadPreferences();
    }
  };

  if (!preferences && !isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Automation Settings
          </DialogTitle>
          <DialogDescription>
            Configure automated analysis and workflow triggers for Figmant
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : preferences ? (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Auto-Analysis */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">Auto-Analysis</CardTitle>
                    </div>
                    <Switch
                      checked={preferences.autoAnalysisEnabled}
                      onCheckedChange={(checked) => updatePreference('autoAnalysisEnabled', checked)}
                    />
                  </div>
                  <CardDescription>
                    Automatically trigger analysis when conditions are met
                  </CardDescription>
                </CardHeader>
                {preferences.autoAnalysisEnabled && (
                  <CardContent className="space-y-4">
                    {/* Threshold Setting */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          <span className="text-sm font-medium">Image Threshold</span>
                        </div>
                        <Badge variant="secondary">
                          {preferences.smartTriggerThreshold} {preferences.smartTriggerThreshold === 1 ? 'image' : 'images'}
                        </Badge>
                      </div>
                      <Slider
                        value={[preferences.smartTriggerThreshold]}
                        onValueChange={handleThresholdChange}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Delay Setting */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Trigger Delay</span>
                        </div>
                        <Badge variant="secondary">
                          {preferences.autoAnalysisDelay / 1000}s
                        </Badge>
                      </div>
                      <Slider
                        value={[preferences.autoAnalysisDelay / 1000]}
                        onValueChange={handleDelayChange}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Design Change Detection */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">Design Change Detection</CardTitle>
                    </div>
                    <Switch
                      checked={preferences.designChangeDetection}
                      onCheckedChange={(checked) => updatePreference('designChangeDetection', checked)}
                    />
                  </div>
                  <CardDescription>
                    Monitor for design modifications and trigger re-analysis
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Batch Processing */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">Batch Processing</CardTitle>
                    </div>
                    <Switch
                      checked={preferences.batchProcessingEnabled}
                      onCheckedChange={(checked) => updatePreference('batchProcessingEnabled', checked)}
                    />
                  </div>
                  <CardDescription>
                    Automatically queue multiple designs for efficient analysis
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base">Notifications</CardTitle>
                    </div>
                    <Switch
                      checked={preferences.notificationsEnabled}
                      onCheckedChange={(checked) => updatePreference('notificationsEnabled', checked)}
                    />
                  </div>
                  <CardDescription>
                    Receive notifications when automation triggers activate
                  </CardDescription>
                </CardHeader>
              </Card>

              <Separator />

              {/* Reset Button */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Reset all automation settings to their default values
                </div>
                <Button variant="outline" onClick={resetToDefaults} size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};