import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, TestTube, Info } from 'lucide-react';
import { featurePreferencesService, type FeaturePreferences } from '@/services/figmant/featurePreferencesService';
import { toast } from 'sonner';

export function FeatureSettings() {
  const [preferences, setPreferences] = useState<FeaturePreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await featurePreferencesService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading feature preferences:', error);
      toast.error('Failed to load feature preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleHolisticAiToggle = async (enabled: boolean) => {
    if (!preferences) return;

    setUpdating(true);
    try {
      const success = await featurePreferencesService.updateHolisticAiPrototypes(enabled);
      
      if (success) {
        setPreferences({
          ...preferences,
          holisticAiPrototypes: enabled,
        });
        
        toast.success(
          enabled 
            ? 'Holistic AI Prototypes enabled! Try analyzing a design to see the new experience.'
            : 'Holistic AI Prototypes disabled. Switched back to classic mode.'
        );
      } else {
        toast.error('Failed to update preference');
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preference');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-5 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Experimental Features
          </CardTitle>
          <CardDescription>
            Enable cutting-edge features that are in beta testing. These features may change or be refined based on user feedback.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Holistic AI Prototypes Feature */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="holistic-ai-prototypes" className="text-base font-medium">
                  Holistic AI Prototypes
                </Label>
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Beta
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Experience our next-generation analysis system that understands your business context and generates targeted solutions instead of generic patterns.
              </p>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p>• Collects business context for personalized analysis</p>
                  <p>• Identifies specific UX problems affecting your goals</p>
                  <p>• Provides 3 solution approaches (conservative, balanced, innovative)</p>
                  <p>• Generates production-ready React prototypes</p>
                </div>
              </div>
            </div>
            <Switch
              id="holistic-ai-prototypes"
              checked={preferences?.holisticAiPrototypes || false}
              onCheckedChange={handleHolisticAiToggle}
              disabled={updating}
            />
          </div>

          {preferences?.holisticAiPrototypes && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Holistic AI Prototypes is now active!</p>
                  <p className="mt-1">
                    When you analyze designs, you'll see a context collection form and experience our enhanced prototype generation system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Rollout Plan</CardTitle>
          <CardDescription>
            Our safe deployment strategy for new features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Phase 1 (Current):</span>
              <span className="text-muted-foreground">Opt-in beta testing for early adopters</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <span className="font-medium">Phase 2 (2 weeks):</span>
              <span className="text-muted-foreground">Default experience for all users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <span className="font-medium">Phase 3 (30 days):</span>
              <span className="text-muted-foreground">Legacy patterns deprecated</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}