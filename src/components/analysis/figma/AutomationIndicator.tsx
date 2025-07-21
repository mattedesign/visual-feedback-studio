import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Zap, 
  Settings, 
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AutomationSettingsDialog } from './AutomationSettingsDialog';
import { automationPreferencesService } from '@/services/figmant/automationPreferencesService';

interface AutomationIndicatorProps {
  className?: string;
}

export const AutomationIndicator = ({ className }: AutomationIndicatorProps) => {
  const [automationSummary, setAutomationSummary] = useState<{
    isActive: boolean;
    activeFeatures: string[];
    triggerThreshold: number;
  } | null>(null);

  useEffect(() => {
    loadAutomationStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(loadAutomationStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAutomationStatus = async () => {
    try {
      const summary = await automationPreferencesService.getAutomationSummary();
      setAutomationSummary(summary);
    } catch (error) {
      console.warn('Failed to load automation status:', error);
    }
  };

  // Don't render if automation is not active
  if (!automationSummary?.isActive) {
    return null;
  }

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2">
            <Activity className="h-3 w-3 text-green-500 animate-pulse" />
            <span className="text-xs">Automation Active</span>
            <Badge variant="secondary" className="text-xs px-1 py-0">
              {automationSummary.activeFeatures.length}
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-medium text-sm">Automation Status</span>
            </div>
            
            <div className="space-y-2">
              {automationSummary.activeFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {feature}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Trigger threshold: {automationSummary.triggerThreshold} images
            </div>

            <AutomationSettingsDialog>
              <Button variant="ghost" size="sm" className="w-full justify-start h-8">
                <Settings className="h-3 w-3 mr-2" />
                Automation Settings
              </Button>
            </AutomationSettingsDialog>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};