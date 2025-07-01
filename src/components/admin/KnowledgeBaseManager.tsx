
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { vectorKnowledgeService } from '@/services/knowledgeBase/vectorService';
import { checkKnowledgeBaseStatus, populateBasicKnowledgeEntries } from '@/utils/knowledgeBaseChecker';
import { supabase } from '@/integrations/supabase/client';
import { Database, AlertTriangle, CheckCircle, RefreshCw, Upload, Search, FileText, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface KnowledgeStats {
  totalEntries: number;
  entriesByCategory: Record<string, number>;
  sampleEntries: Array<{ id: string; title: string; category: string }>;
  hasData: boolean;
}

interface MissingEntriesStatus {
  professionalEntries: number;
  coreEntries: number;
  additionalEntries: number;
  totalExpected: number;
  totalActual: number;
  missingCount: number;
}

export const KnowledgeBaseManager = () => {
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [missingStatus, setMissingStatus] = useState<MissingEntriesStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [restorationProgress, setRestorationProgress] = useState(0);
  const [restorationLog, setRestorationLog] = useState<string[]>([]);

  // Load initial stats
  useEffect(() => {
    loadKnowledgeStats();
    analyzeMissingEntries();
  }, []);

  const loadKnowledgeStats = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Loading knowledge base statistics...');
      const status = await checkKnowledgeBaseStatus();
      setStats(status);
      
      console.log('📊 Knowledge base status:', {
        totalEntries: status.totalEntries,
        categoriesCount: Object.keys(status.entriesByCategory).length,
        hasData: status.hasData
      });
      
      if (status.totalEntries < 200) {
        toast.warning(`Only ${status.totalEntries} entries found. Expected 274+`);
      }
    } catch (error) {
      console.error('❌ Failed to load knowledge stats:', error);
      toast.error('Failed to load knowledge base statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeMissingEntries = async () => {
    try {
      console.log('🔍 Analyzing missing entries...');
      
      // Expected counts based on the data files
      const expectedCounts = {
        professionalEntries: 25, // From PROFESSIONAL_UX_ENTRIES
        coreEntries: 5,          // From CORE_UX_KNOWLEDGE
        additionalEntries: 244,  // From ADDITIONAL_UX_ENTRIES (estimated)
        totalExpected: 274
      };

      // Get actual count
      const { data: actualEntries, error } = await supabase
        .from('knowledge_entries')
        .select('id, title, category, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const actualCount = actualEntries?.length || 0;
      const missingCount = expectedCounts.totalExpected - actualCount;

      const status: MissingEntriesStatus = {
        ...expectedCounts,
        totalActual: actualCount,
        missingCount: Math.max(0, missingCount)
      };

      setMissingStatus(status);
      
      console.log('📊 Missing entries analysis:', status);
      
      if (missingCount > 0) {
        addToLog(`⚠️ Missing ${missingCount} entries from knowledge base`);
        addToLog(`📊 Expected: ${expectedCounts.totalExpected}, Actual: ${actualCount}`);
      }
    } catch (error) {
      console.error('❌ Failed to analyze missing entries:', error);
      addToLog(`❌ Error analyzing missing entries: ${error}`);
    }
  };

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setRestorationLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const restoreMissingEntries = async () => {
    setIsRestoring(true);
    setRestorationProgress(0);
    setRestorationLog([]);
    
    try {
      addToLog('🚀 Starting knowledge base restoration...');
      
      // Step 1: Check current state
      addToLog('📊 Checking current database state...');
      setRestorationProgress(10);
      
      const currentStats = await checkKnowledgeBaseStatus();
      addToLog(`📈 Current entries: ${currentStats.totalEntries}`);
      
      // Step 2: Populate basic entries if needed
      if (currentStats.totalEntries < 50) {
        addToLog('📝 Populating basic knowledge entries...');
        setRestorationProgress(25);
        await populateBasicKnowledgeEntries();
        addToLog('✅ Basic entries populated');
      }
      
      // Step 3: Run comprehensive population
      addToLog('🔄 Running comprehensive knowledge population...');
      setRestorationProgress(40);
      
      // Call the population function
      const { data: populationResult, error: populationError } = await supabase.functions.invoke('populate-knowledge-simple', {
        body: { 
          comprehensive: true,
          includeEmbeddings: true 
        }
      });
      
      if (populationError) {
        throw new Error(`Population failed: ${populationError.message}`);
      }
      
      addToLog(`📊 Population result: ${JSON.stringify(populationResult, null, 2)}`);
      setRestorationProgress(70);
      
      // Step 4: Generate missing embeddings
      addToLog('🧠 Generating missing embeddings...');
      const { data: embeddingResult, error: embeddingError } = await supabase.functions.invoke('generate-missing-embeddings', {
        body: { testMode: false, batchSize: 10 }
      });
      
      if (embeddingError) {
        console.warn('⚠️ Embedding generation had issues:', embeddingError);
        addToLog(`⚠️ Embedding generation warning: ${embeddingError.message}`);
      } else {
        addToLog(`🧠 Embeddings generated: ${embeddingResult?.processed || 0} entries`);
      }
      
      setRestorationProgress(90);
      
      // Step 5: Verify final state
      addToLog('✅ Verifying restoration results...');
      const finalStats = await checkKnowledgeBaseStatus();
      setStats(finalStats);
      await analyzeMissingEntries();
      
      setRestorationProgress(100);
      addToLog(`🎉 Restoration complete! Final count: ${finalStats.totalEntries}`);
      
      if (finalStats.totalEntries >= 200) {
        toast.success(`Knowledge base restored successfully! ${finalStats.totalEntries} entries available.`);
      } else {
        toast.warning(`Restoration completed with ${finalStats.totalEntries} entries. Some entries may still be missing.`);
      }
      
    } catch (error) {
      console.error('❌ Restoration failed:', error);
      addToLog(`❌ Restoration failed: ${error}`);
      toast.error('Knowledge base restoration failed. Check the logs for details.');
    } finally {
      setIsRestoring(false);
    }
  };

  const generateMissingEmbeddings = async () => {
    setIsLoading(true);
    try {
      addToLog('🧠 Starting embedding generation...');
      const { data, error } = await supabase.functions.invoke('generate-missing-embeddings', {
        body: { testMode: false, batchSize: 20 }
      });

      if (error) throw error;

      addToLog(`✅ Generated embeddings for ${data.processed} entries`);
      toast.success(`Generated embeddings for ${data.processed} entries`);
      
      // Refresh stats
      await loadKnowledgeStats();
    } catch (error) {
      console.error('❌ Embedding generation failed:', error);
      addToLog(`❌ Embedding generation failed: ${error}`);
      toast.error('Failed to generate embeddings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base Manager</h1>
          <p className="text-muted-foreground">
            Investigate and restore missing RAG entries
          </p>
        </div>
        <Button onClick={loadKnowledgeStats} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="restoration">Restoration</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalEntries || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Expected: 274+
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missing Entries</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {missingStatus?.missingCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Need restoration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats ? Object.keys(stats.entriesByCategory).length : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Knowledge areas
                </p>
              </CardContent>
            </Card>
          </div>

          {missingStatus && missingStatus.missingCount > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Knowledge Base Incomplete:</strong> {missingStatus.missingCount} entries are missing. 
                Expected {missingStatus.totalExpected} but found {missingStatus.totalActual}.
                Use the restoration tab to fix this issue.
              </AlertDescription>
            </Alert>
          )}

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.entriesByCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm">{category}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Missing Entries Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {missingStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">Expected Entries</h4>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>Professional UX: {missingStatus.professionalEntries}</li>
                        <li>Core Entries: {missingStatus.coreEntries}</li>
                        <li>Additional Entries: {missingStatus.additionalEntries}</li>
                        <li className="font-bold">Total Expected: {missingStatus.totalExpected}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">Current Status</h4>
                      <ul className="text-sm space-y-1 mt-2">
                        <li>Total Actual: {missingStatus.totalActual}</li>
                        <li className="text-red-600 font-bold">
                          Missing: {missingStatus.missingCount}
                        </li>
                        <li>Completion: {Math.round((missingStatus.totalActual / missingStatus.totalExpected) * 100)}%</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Progress 
                    value={(missingStatus.totalActual / missingStatus.totalExpected) * 100} 
                    className="w-full"
                  />
                </div>
              ) : (
                <p>Loading analysis...</p>
              )}
            </CardContent>
          </Card>

          {stats?.sampleEntries && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Entries (Recent)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.sampleEntries.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm font-medium">{entry.title}</span>
                      <Badge variant="outline">{entry.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="restoration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Restoration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Restore missing entries and fix the knowledge base
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isRestoring && (
                <div className="space-y-2">
                  <Progress value={restorationProgress} className="w-full" />
                  <p className="text-sm text-center">{restorationProgress}% Complete</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={restoreMissingEntries}
                  disabled={isRestoring}
                  size="lg"
                  className="w-full"
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Restoring Knowledge Base...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Start Full Restoration
                    </>
                  )}
                </Button>

                <Button 
                  onClick={generateMissingEmbeddings}
                  disabled={isLoading || isRestoring}
                  variant="outline"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Generate Missing Embeddings Only
                </Button>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <strong>Full Restoration Process:</strong>
                  <ol className="mt-2 text-sm list-decimal list-inside space-y-1">
                    <li>Analyze current database state</li>
                    <li>Populate basic knowledge entries</li>
                    <li>Run comprehensive knowledge population</li>
                    <li>Generate missing embeddings</li>
                    <li>Verify final state and update counts</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restoration Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="space-y-1">
                  {restorationLog.length > 0 ? (
                    restorationLog.map((log, index) => (
                      <div key={index} className="text-sm font-mono p-2 bg-muted rounded">
                        {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No logs yet. Start a restoration to see activity.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
