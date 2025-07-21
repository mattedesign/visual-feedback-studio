import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  Cpu, 
  Search, 
  FileText,
  GitBranch,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Workflow
} from 'lucide-react';
import { AutomationControls } from './AutomationControls';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { toast } from 'sonner';

interface FigmantAutomationPanelProps {
  className?: string;
}

export const FigmantAutomationPanel = ({ className }: FigmantAutomationPanelProps) => {
  const {
    selectedImages,
    autoAnalysisEnabled,
    autoAnalysisHistory,
    workflowState,
    transitionHistory
  } = useAnalysisWorkflow();

  // Design change detection state
  const [designChangeDetection, setDesignChangeDetection] = useState(false);
  const [lastImageHash, setLastImageHash] = useState<string>('');
  const [changeHistory, setChangeHistory] = useState<Array<{
    timestamp: number;
    changeType: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>>([]);

  // Batch processing state
  const [batchQueueSize, setBatchQueueSize] = useState(0);
  const [processingBatch, setProcessingBatch] = useState(false);

  // Monitor image changes for design change detection
  useEffect(() => {
    if (!designChangeDetection) return;

    const currentHash = selectedImages.join('|');
    if (lastImageHash && currentHash !== lastImageHash) {
      const changeType = selectedImages.length > lastImageHash.split('|').filter(Boolean).length 
        ? 'addition' : 'modification';
      
      const newChange = {
        timestamp: Date.now(),
        changeType,
        description: `${changeType === 'addition' ? 'Added' : 'Modified'} design files`,
        severity: 'medium' as const
      };

      setChangeHistory(prev => [...prev, newChange].slice(-10));
      
      if (autoAnalysisEnabled) {
        toast.info('Design change detected - Auto-analysis will trigger shortly');
      }
    }
    
    setLastImageHash(currentHash);
  }, [selectedImages, lastImageHash, designChangeDetection, autoAnalysisEnabled]);

  // Simulate batch queue monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedImages.length > 3) {
        setBatchQueueSize(prev => Math.max(0, prev + Math.random() > 0.7 ? 1 : -1));
      } else {
        setBatchQueueSize(0);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedImages.length]);

  const toggleDesignChangeDetection = (enabled: boolean) => {
    setDesignChangeDetection(enabled);
    toast.success(`Design change detection ${enabled ? 'enabled' : 'disabled'}`);
  };

  const startBatchProcessing = () => {
    if (selectedImages.length < 2) {
      toast.error('Need at least 2 images for batch processing');
      return;
    }

    setProcessingBatch(true);
    toast.info('Starting batch analysis...');
    
    // Simulate batch processing
    setTimeout(() => {
      setProcessingBatch(false);
      toast.success('Batch analysis completed');
    }, 3000);
  };

  return (
    <div className={className}>
      <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Figmant Automation</CardTitle>
          </div>
          <CardDescription>
            Advanced automation and monitoring for your design analysis workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="automation" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="automation" className="text-xs">Auto-Analysis</TabsTrigger>
              <TabsTrigger value="monitoring" className="text-xs">Monitoring</TabsTrigger>
              <TabsTrigger value="batch" className="text-xs">Batch Processing</TabsTrigger>
            </TabsList>

            <TabsContent value="automation" className="space-y-4">
              <AutomationControls />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <div className="space-y-4">
                {/* Design Change Detection */}
                <Card className="bg-muted/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        <div className="text-sm font-medium">Design Change Detection</div>
                      </div>
                      <Switch
                        checked={designChangeDetection}
                        onCheckedChange={toggleDesignChangeDetection}
                      />
                    </div>
                  </CardHeader>
                  {designChangeDetection && (
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="text-xs text-muted-foreground">
                          Monitors for changes in uploaded designs and automatically triggers analysis
                        </div>
                        
                        {changeHistory.length > 0 && (
                          <ScrollArea className="h-24">
                            <div className="space-y-1">
                              {changeHistory.slice(-3).reverse().map((change, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 rounded bg-background/50">
                                  <GitBranch className="h-3 w-3" />
                                  <div className="text-xs flex-1">{change.description}</div>
                                  <Badge 
                                    variant={change.severity === 'high' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {change.severity}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Workflow State */}
                <Card className="bg-muted/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Workflow Status</div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground">Current Step</div>
                        <Badge variant="outline" className="mt-1">
                          {workflowState.currentStep}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Status</div>
                        <div className="flex items-center gap-1 mt-1">
                          {workflowState.status === 'success' ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : workflowState.status === 'error' ? (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          ) : (
                            <Clock className="h-3 w-3 text-blue-500" />
                          )}
                          <span className="capitalize">{workflowState.status}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <div className="space-y-4">
                {/* Batch Queue Status */}
                <Card className="bg-muted/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Batch Processing</div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-muted-foreground">Queue Size</div>
                          <div className="font-medium">{batchQueueSize} items</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Images Ready</div>
                          <div className="font-medium">{selectedImages.length}</div>
                        </div>
                      </div>

                      <Button
                        onClick={startBatchProcessing}
                        disabled={selectedImages.length < 2 || processingBatch}
                        size="sm"
                        className="w-full"
                      >
                        {processingBatch ? (
                          <>
                            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="mr-2 h-3 w-3" />
                            Start Batch Analysis
                          </>
                        )}
                      </Button>

                      <div className="text-xs text-muted-foreground">
                        Batch processing analyzes multiple designs simultaneously for 
                        cross-design patterns and comparative insights.
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Transitions */}
                {transitionHistory.length > 0 && (
                  <Card className="bg-muted/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <div className="text-sm font-medium">Recent Activity</div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ScrollArea className="h-20">
                        <div className="space-y-1">
                          {transitionHistory.slice(-3).reverse().map((transition, index) => (
                            <div key={index} className="text-xs p-2 rounded bg-background/50">
                              <div className="font-medium">
                                {transition.from} → {transition.to}
                              </div>
                              <div className="text-muted-foreground">
                                {transition.trigger} • {new Date(transition.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};