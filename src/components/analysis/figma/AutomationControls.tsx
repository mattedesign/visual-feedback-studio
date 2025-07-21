import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  Clock, 
  Target, 
  History,
  Settings,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { formatDistanceToNow } from 'date-fns';

interface AutomationControlsProps {
  className?: string;
}

export const AutomationControls = ({ className }: AutomationControlsProps) => {
  const {
    autoAnalysisEnabled,
    autoAnalysisHistory,
    toggleAutoAnalysis,
    setSmartTriggerThreshold,
    setAutoAnalysisDelay,
    selectedImages
  } = useAnalysisWorkflow();

  const [triggerThreshold, setTriggerThreshold] = React.useState(2);
  const [analysisDelay, setAnalysisDelay] = React.useState(3000);

  const handleThresholdChange = (value: number[]) => {
    const newThreshold = value[0];
    setTriggerThreshold(newThreshold);
    setSmartTriggerThreshold(newThreshold);
  };

  const handleDelayChange = (value: number[]) => {
    const newDelay = value[0] * 1000; // Convert seconds to milliseconds
    setAnalysisDelay(newDelay);
    setAutoAnalysisDelay(newDelay);
  };

  const clearHistory = () => {
    // Note: Would need to implement clearAutoAnalysisHistory in the workflow
    console.log('Clearing auto-analysis history');
  };

  return (
    <div className={className}>
      <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Automation Controls</CardTitle>
          </div>
          <CardDescription>
            Configure automated analysis triggers for your Figmant workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Auto-Analysis</div>
              <div className="text-xs text-muted-foreground">
                Automatically trigger analysis when conditions are met
              </div>
            </div>
            <Switch
              checked={autoAnalysisEnabled}
              onCheckedChange={toggleAutoAnalysis}
            />
          </div>

          {autoAnalysisEnabled && (
            <>
              <Separator />
              
              {/* Trigger Threshold */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <div className="text-sm font-medium">Image Threshold</div>
                  <Badge variant="secondary" className="ml-auto">
                    {triggerThreshold} {triggerThreshold === 1 ? 'image' : 'images'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Minimum number of images required to trigger auto-analysis
                </div>
                <Slider
                  value={[triggerThreshold]}
                  onValueChange={handleThresholdChange}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 image</span>
                  <span>5 images</span>
                </div>
              </div>

              {/* Analysis Delay */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div className="text-sm font-medium">Trigger Delay</div>
                  <Badge variant="secondary" className="ml-auto">
                    {analysisDelay / 1000}s
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Delay before auto-analysis starts after conditions are met
                </div>
                <Slider
                  value={[analysisDelay / 1000]}
                  onValueChange={handleDelayChange}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 second</span>
                  <span>10 seconds</span>
                </div>
              </div>

              {/* Current Status */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <div className="text-sm font-medium">Current Status</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Images uploaded</div>
                    <div className="font-medium">{selectedImages.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Ready to trigger</div>
                    <div className="font-medium">
                      {selectedImages.length >= triggerThreshold ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-orange-600">⏳ Need {triggerThreshold - selectedImages.length} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Analysis History */}
          {autoAnalysisHistory.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    <div className="text-sm font-medium">Auto-Analysis History</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {autoAnalysisHistory.slice(-5).reverse().map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <div className="text-xs">
                          <div className="font-medium">{entry.trigger}</div>
                          <div className="text-muted-foreground">
                            {entry.imageCount} images • {formatDistanceToNow(entry.timestamp)} ago
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Auto
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}

          {/* Batch Analysis Info */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-xs">
                <div className="font-medium text-primary mb-1">Batch Analysis</div>
                <div className="text-muted-foreground">
                  When multiple images are uploaded, Figmant automatically enables batch processing 
                  for comprehensive cross-design analysis and pattern detection.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};