import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useKnowledgePopulationManager } from '@/hooks/knowledgeBase/useKnowledgePopulationManager';
import { Database, Play, CheckCircle, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const KnowledgePopulationManager = () => {
  const [showStats, setShowStats] = useState(false);
  
  const {
    initialBatch,
    batchTwo,
    batchThree,
    batchFour,
    batchFive,
    batchSix,
    batchSeven,
    batchEight,
    batchNine,
    activeBatch,
    isAnyBatchPopulating,
    isInitialized,
    executePopulation,
    clearAllResults,
    batchSizes
  } = useKnowledgePopulationManager();

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const batches = [
    { 
      name: 'Initial Batch', 
      key: 'initial', 
      hook: initialBatch, 
      size: batchSizes.initial,
      description: 'Core UX patterns and design fundamentals'
    },
    { 
      name: 'Batch 2', 
      key: 'batch2', 
      hook: batchTwo, 
      size: batchSizes.batch2,
      description: 'Advanced UX patterns and industry standards'
    },
    { 
      name: 'Batch 3', 
      key: 'batch3', 
      hook: batchThree, 
      size: batchSizes.batch3,
      description: 'Mobile UX, accessibility, and interaction patterns'
    },
    { 
      name: 'Batch 4', 
      key: 'batch4', 
      hook: batchFour, 
      size: batchSizes.batch4,
      description: 'Industry-specific patterns (Gaming, Education, Energy, Gov)'
    },
    { 
      name: 'Batch 5', 
      key: 'batch5', 
      hook: batchFive, 
      size: batchSizes.batch5,
      description: 'Advanced specialized patterns and frameworks'
    },
    { 
      name: 'Batch 6', 
      key: 'batch6', 
      hook: batchSix, 
      size: batchSizes.batch6,
      description: 'Cross-platform and emerging technology patterns'
    },
    { 
      name: 'Batch 7', 
      key: 'batch7', 
      hook: batchSeven, 
      size: batchSizes.batch7,
      description: 'Performance optimization and analytics patterns'
    },
    { 
      name: 'Batch 8', 
      key: 'batch8', 
      hook: batchEight, 
      size: batchSizes.batch8,
      description: 'Advanced business and conversion patterns'
    },
    { 
      name: 'Batch 9', 
      key: 'batch9', 
      hook: batchNine, 
      size: batchSizes.batch9,
      description: 'Cutting-edge design trends and future patterns'
    }
  ];

  const totalEntries = batches.reduce((sum, batch) => sum + batch.size, 0);
  const completedBatches = batches.filter(batch => batch.hook.results !== null).length;

  const handleRunAllBatches = async () => {
    if (isAnyBatchPopulating) return;
    
    toast.info('Starting comprehensive knowledge base population...', {
      description: `This will populate ${totalEntries} entries across 9 batches`,
      duration: 6000
    });

    for (const batch of batches) {
      if (!batch.hook.results) {
        await executePopulation(batch.key);
        // Small delay between batches to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const getProgressPercentage = () => {
    const totalProcessed = batches.reduce((sum, batch) => {
      const progress = batch.hook.progress;
      if (!progress) return sum;
      return sum + progress.currentEntry;
    }, 0);
    
    return Math.round((totalProcessed / totalEntries) * 100);
  };

  const getBatchIcon = (batch: any) => {
    if (batch.hook.isPopulating) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    }
    if (batch.hook.results) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (batch.hook.progress?.stage === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return <Play className="w-4 h-4 text-gray-400" />;
  };

  const getBatchStatus = (batch: any) => {
    if (batch.hook.isPopulating) return 'Running...';
    if (batch.hook.results) return 'Completed';
    if (batch.hook.progress?.stage === 'error') return 'Error';
    return 'Pending';
  };

  return (
    <div className="space-y-6">
      
      {/* Main Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Knowledge Base Population Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <Badge variant="outline">
                {completedBatches}/{batches.length} Batches Complete
              </Badge>
            </div>
            
            {isAnyBatchPopulating && (
              <div className="space-y-2">
                <Progress value={getProgressPercentage()} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {getProgressPercentage()}% Complete ({batches.find(b => b.hook.isPopulating)?.name || 'Processing'}...)
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-blue-600">{totalEntries.toLocaleString()}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedBatches}</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{batches.length - completedBatches}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Active Batch</p>
                <p className="text-2xl font-bold text-purple-600">{activeBatch || 'None'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Main Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleRunAllBatches}
              disabled={isAnyBatchPopulating || completedBatches === batches.length}
              size="lg"
              className="flex-1"
            >
              {isAnyBatchPopulating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Populating Knowledge Base...
                </>
              ) : completedBatches === batches.length ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  All Batches Complete
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Run All Remaining Batches
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowStats(!showStats)}
              disabled={completedBatches === 0}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showStats ? 'Hide' : 'Show'} Statistics
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearAllResults}
              disabled={isAnyBatchPopulating}
            >
              Clear All Results
            </Button>
          </div>

          {/* Warning for large operation */}
          {!isAnyBatchPopulating && completedBatches < batches.length && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will populate {totalEntries.toLocaleString()} knowledge entries. 
                The process may take several minutes to complete. Each batch will run sequentially 
                with progress tracking and error handling.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Individual Batch Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Batch Control</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {batches.map((batch, index) => (
              <div key={batch.key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getBatchIcon(batch)}
                    <div>
                      <h4 className="font-medium">{batch.name}</h4>
                      <p className="text-sm text-muted-foreground">{batch.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {batch.size} entries
                    </Badge>
                    <Badge variant={batch.hook.results ? 'default' : 'secondary'}>
                      {getBatchStatus(batch)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => executePopulation(batch.key)}
                      disabled={isAnyBatchPopulating || batch.hook.results !== null}
                    >
                      {batch.hook.isPopulating ? 'Running...' : 'Run Batch'}
                    </Button>
                  </div>
                </div>
                
                {/* Individual batch progress */}
                {batch.hook.progress && batch.hook.isPopulating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{batch.hook.progress.currentTitle || 'Processing...'}</span>
                      <span>{batch.hook.progress.currentEntry}/{batch.hook.progress.totalEntries}</span>
                    </div>
                    <Progress 
                      value={(batch.hook.progress.currentEntry / batch.hook.progress.totalEntries) * 100} 
                      className="w-full h-2" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Display */}
      {showStats && completedBatches > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Population Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {batches
                  .filter(batch => batch.hook.results)
                  .map(batch => (
                    <div key={batch.key} className="border rounded p-3">
                      <h4 className="font-semibold mb-2">{batch.name} Results</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Entries:</span>
                          <p className="font-medium">{batch.hook.results?.totalEntries || 0}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Categories:</span>
                          <p className="font-medium">{batch.hook.results?.categoryBreakdown?.length || 0}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sample Entries:</span>
                          <p className="font-medium">{batch.hook.results?.sampleEntries?.length || 0}</p>
                        </div>
                      </div>
                      
                      {batch.hook.results?.categoryBreakdown && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Category Breakdown:</p>
                          <div className="flex flex-wrap gap-1">
                            {batch.hook.results.categoryBreakdown.map(({ category, count }) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}: {count}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
