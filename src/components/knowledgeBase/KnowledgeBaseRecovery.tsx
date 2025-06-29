
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKnowledgePopulationManager } from '@/hooks/knowledgeBase/useKnowledgePopulationManager';
import { checkKnowledgeBaseStatus } from '@/utils/knowledgeBaseChecker';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  BarChart3,
  Search,
  FileText,
  Zap,
  Server
} from 'lucide-react';

interface BatchStatus {
  batchNumber: number;
  expectedEntries: number;
  actualEntries: number;
  isComplete: boolean;
  missingCount: number;
  categories: string[];
}

interface DatabaseStats {
  totalEntries: number;
  totalWithEmbeddings: number;
  totalWithoutEmbeddings: number;
  embeddingValidationRate: number;
  categoryBreakdown: Array<{ category: string; count: number }>;
  recentEntries: number;
  oldestEntry: string;
  newestEntry: string;
}

export const KnowledgeBaseRecovery: React.FC = () => {
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [batchStatuses, setBatchStatuses] = useState<BatchStatus[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegeneratingEmbeddings, setIsRegeneratingEmbeddings] = useState(false);
  const [embeddingProgress, setEmbeddingProgress] = useState({ current: 0, total: 0 });
  
  const manager = useKnowledgePopulationManager();

  // Expected batch sizes based on the population scripts
  const expectedBatchSizes = {
    1: 50,  // Initial batch
    2: 30,  // Batch two  
    3: 40,  // Batch three
    4: 25,  // Batch four
    5: 30,  // Batch five
    6: 35,  // Batch six
    7: 20,  // Batch seven
    8: 25,  // Batch eight
    9: 30   // Batch nine
  };

  const totalExpectedEntries = Object.values(expectedBatchSizes).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    analyzeDatabaseStatus();
  }, []);

  const analyzeDatabaseStatus = async () => {
    setIsAnalyzing(true);
    try {
      console.log('🔍 Starting comprehensive knowledge base analysis...');
      
      // Get overall database statistics
      const dbStatus = await checkKnowledgeBaseStatus();
      
      // Get detailed statistics
      const { data: allEntries, error: entriesError } = await supabase
        .from('knowledge_entries')
        .select('id, title, category, embedding, created_at')
        .order('created_at', { ascending: true });

      if (entriesError) {
        throw entriesError;
      }

      // Calculate comprehensive stats
      const totalEntries = allEntries?.length || 0;
      const entriesWithEmbeddings = allEntries?.filter(entry => entry.embedding && entry.embedding.trim() !== '').length || 0;
      const entriesWithoutEmbeddings = totalEntries - entriesWithEmbeddings;
      const embeddingValidationRate = totalEntries > 0 ? (entriesWithEmbeddings / totalEntries) * 100 : 0;
      
      // Get date ranges
      const oldestEntry = allEntries?.[0]?.created_at || '';
      const newestEntry = allEntries?.[allEntries.length - 1]?.created_at || '';
      
      // Recent entries (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const recentEntries = allEntries?.filter(entry => entry.created_at > oneDayAgo).length || 0;

      const stats: DatabaseStats = {
        totalEntries,
        totalWithEmbeddings: entriesWithEmbeddings,
        totalWithoutEmbeddings: entriesWithoutEmbeddings,
        embeddingValidationRate,
        categoryBreakdown: dbStatus.entriesByCategory ? Object.entries(dbStatus.entriesByCategory).map(([category, count]) => ({ category, count: count as number })) : [],
        recentEntries,
        oldestEntry,
        newestEntry
      };

      setDatabaseStats(stats);
      
      // Analyze batch completeness
      const batchAnalysis: BatchStatus[] = [];
      for (let i = 1; i <= 9; i++) {
        const expectedCount = expectedBatchSizes[i as keyof typeof expectedBatchSizes];
        // This is a rough estimation - in practice, you'd need to identify entries by batch
        const actualCount = Math.min(expectedCount, totalEntries); // Simplified for now
        
        batchAnalysis.push({
          batchNumber: i,
          expectedEntries: expectedCount,
          actualEntries: actualCount,
          isComplete: actualCount >= expectedCount,
          missingCount: Math.max(0, expectedCount - actualCount),
          categories: [`batch-${i}`] // Simplified
        });
      }
      
      setBatchStatuses(batchAnalysis);
      
      console.log('📊 Analysis complete:', {
        totalFound: totalEntries,
        totalExpected: totalExpectedEntries,
        missingCount: Math.max(0, totalExpectedEntries - totalEntries),
        embeddingValidationRate: embeddingValidationRate.toFixed(1) + '%'
      });

      toast.success(`Analysis complete: Found ${totalEntries}/${totalExpectedEntries} expected entries`);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      toast.error('Failed to analyze knowledge base');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const regenerateAllEmbeddings = async () => {
    setIsRegeneratingEmbeddings(true);
    setEmbeddingProgress({ current: 0, total: 0 });
    
    try {
      console.log('🔄 Starting embedding regeneration...');
      toast.info('Starting embedding regeneration process...');
      
      const { data, error } = await supabase.functions.invoke('generate-missing-embeddings', {
        body: { testMode: false, batchSize: 10 }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Embedding regeneration result:', data);
      
      if (data.success) {
        toast.success(`Embeddings regenerated: ${data.processed} entries processed, ${data.totalTokensUsed} tokens used`);
        // Refresh the analysis
        await analyzeDatabaseStatus();
      } else {
        throw new Error(data.error || 'Embedding regeneration failed');
      }
      
    } catch (error) {
      console.error('❌ Embedding regeneration failed:', error);
      toast.error('Failed to regenerate embeddings');
    } finally {
      setIsRegeneratingEmbeddings(false);
    }
  };

  const restoreSpecificBatch = async (batchNumber: number) => {
    const batchMethods = {
      1: manager.initialBatch.populateKnowledgeBase,
      2: manager.batchTwo.populateBatchTwo,
      3: manager.batchThree.populateBatchThree,
      4: manager.batchFour.populateBatchFour,
      5: manager.batchFive.populateBatchFive,
      6: manager.batchSix.populateBatchSix,
      7: manager.batchSeven.populateBatchSeven,
      8: manager.batchEight.populateBatchEight,
      9: manager.batchNine.populateBatchNine,
    };

    const method = batchMethods[batchNumber as keyof typeof batchMethods];
    if (method) {
      console.log(`🔄 Restoring batch ${batchNumber}...`);
      await method();
      // Refresh analysis after restoration
      setTimeout(() => analyzeDatabaseStatus(), 2000);
    }
  };

  const restoreAllMissingBatches = async () => {
    const incompleteBatches = batchStatuses.filter(batch => !batch.isComplete);
    
    toast.info(`Restoring ${incompleteBatches.length} incomplete batches...`);
    
    for (const batch of incompleteBatches) {
      console.log(`🔄 Restoring batch ${batch.batchNumber}...`);
      await restoreSpecificBatch(batch.batchNumber);
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    toast.success('All missing batches restoration initiated');
  };

  if (!databaseStats) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading knowledge base analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionRate = (databaseStats.totalEntries / totalExpectedEntries) * 100;
  const healthScore = (completionRate + databaseStats.embeddingValidationRate) / 2;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Knowledge Base Health Status
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your knowledge base integrity and completeness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{databaseStats.totalEntries}</div>
              <div className="text-sm text-muted-foreground">Current Entries</div>
              <div className="text-xs text-muted-foreground">of {totalExpectedEntries} expected</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{databaseStats.embeddingValidationRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Embedding Coverage</div>
              <div className="text-xs text-muted-foreground">{databaseStats.totalWithoutEmbeddings} missing</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{healthScore.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Overall Health</div>
              <div className="text-xs text-muted-foreground">Completion + Embeddings</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Database Completion</span>
                <span>{completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Embedding Coverage</span>
                <span>{databaseStats.embeddingValidationRate.toFixed(1)}%</span>
              </div>
              <Progress value={databaseStats.embeddingValidationRate} className="h-2" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <Button 
              onClick={analyzeDatabaseStatus} 
              disabled={isAnalyzing}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Refresh Analysis
            </Button>
            
            {databaseStats.totalWithoutEmbeddings > 0 && (
              <Button 
                onClick={regenerateAllEmbeddings}
                disabled={isRegeneratingEmbeddings}
                variant="secondary"
              >
                <Zap className="w-4 h-4 mr-2" />
                Regenerate Embeddings ({databaseStats.totalWithoutEmbeddings})
              </Button>
            )}
            
            {databaseStats.totalEntries < totalExpectedEntries && (
              <Button 
                onClick={restoreAllMissingBatches}
                disabled={manager.isAnyBatchPopulating}
              >
                <Server className="w-4 h-4 mr-2" />
                Restore Missing Batches
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="batches" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batches">Batch Analysis</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          <TabsTrigger value="diagnostics">System Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Completion Status</CardTitle>
              <CardDescription>
                Status of all nine knowledge batches and their restoration options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {batchStatuses.map((batch) => (
                  <div key={batch.batchNumber} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {batch.isComplete ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">Batch {batch.batchNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {batch.actualEntries}/{batch.expectedEntries} entries
                          {batch.missingCount > 0 && (
                            <span className="text-red-500 ml-2">({batch.missingCount} missing)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={batch.isComplete ? "default" : "destructive"}>
                        {batch.isComplete ? "Complete" : "Incomplete"}
                      </Badge>
                      {!batch.isComplete && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restoreSpecificBatch(batch.batchNumber)}
                          disabled={manager.isAnyBatchPopulating}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>
                Breakdown of knowledge entries by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {databaseStats.categoryBreakdown.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <span className="capitalize">{category.category.replace(/-/g, ' ')}</span>
                    <Badge variant="secondary">{category.count} entries</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Diagnostics</CardTitle>
              <CardDescription>
                Detailed system information and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Current Status:</strong> Found {databaseStats.totalEntries} entries out of {totalExpectedEntries} expected. 
                    {databaseStats.totalEntries < totalExpectedEntries && (
                      <span className="text-red-600 ml-1">
                        Missing {totalExpectedEntries - databaseStats.totalEntries} entries.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Recent Activity:</strong> {databaseStats.recentEntries} entries added in last 24h
                  </div>
                  <div>
                    <strong>Embedding Status:</strong> {databaseStats.totalWithEmbeddings} have embeddings
                  </div>
                  <div>
                    <strong>Oldest Entry:</strong> {databaseStats.oldestEntry ? new Date(databaseStats.oldestEntry).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <strong>Newest Entry:</strong> {databaseStats.newestEntry ? new Date(databaseStats.newestEntry).toLocaleDateString() : 'N/A'}
                  </div>
                </div>

                {isRegeneratingEmbeddings && (
                  <Alert>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Regenerating embeddings... This may take several minutes.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
