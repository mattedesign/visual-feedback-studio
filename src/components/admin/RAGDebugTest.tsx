
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  BookOpen, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Database,
  Zap,
  Settings,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RAGTestResult {
  success: boolean;
  stage: string;
  searchTerms?: string[];
  knowledgeCount?: number;
  enhancedPromptLength?: number;
  citations?: string[];
  industryContext?: string;
  error?: string;
  debugLogs?: string[];
  embeddingSuccess?: boolean;
  databaseQuerySuccess?: boolean;
  promptEnhancementSuccess?: boolean;
}

interface DatabaseTestResult {
  success: boolean;
  error?: any;
  data?: any;
  timestamp: string;
  count: number;
}

export const RAGDebugTest = () => {
  const [testPrompt, setTestPrompt] = useState('Analyze this checkout flow for conversion optimization and accessibility issues');
  const [isTestingRAG, setIsTestingRAG] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [isTestingDB, setIsTestingDB] = useState(false);
  const [testResult, setTestResult] = useState<RAGTestResult | null>(null);
  const [dbTestResult, setDbTestResult] = useState<DatabaseTestResult | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = useCallback((message: string) => {
    console.log(`[RAG DEBUG] ${message}`);
    setDebugLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  }, []);

  const populateTestData = async () => {
    setIsPopulating(true);
    addDebugLog('🔧 Starting test knowledge population...');
    
    try {
      const { data, error } = await supabase.functions.invoke('populate-test-knowledge', {
        body: {}
      });

      if (error) {
        addDebugLog(`❌ Population failed: ${error.message}`);
        toast.error(`Failed to populate test data: ${error.message}`);
      } else {
        addDebugLog(`✅ Test data populated: ${JSON.stringify(data)}`);
        toast.success(data?.message || 'Test knowledge entries populated successfully!');
      }
    } catch (error) {
      addDebugLog(`❌ Population failed with exception: ${error.message}`);
      toast.error(`Population failed: ${error.message}`);
    } finally {
      setIsPopulating(false);
    }
  };

  const testDatabaseAccess = async () => {
    setIsTestingDB(true);
    setDbTestResult(null);
    addDebugLog('🔍 Testing direct database access...');
    
    try {
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('id, title, category, tags')
        .limit(5);

      const result: DatabaseTestResult = {
        success: !error,
        error: error,
        data: data,
        timestamp: new Date().toISOString(),
        count: data?.length || 0
      };
      
      setDbTestResult(result);

      if (error) {
        addDebugLog(`❌ Database access failed: ${error.message}`);
        toast.error(`Database test failed: ${error.message}`);
      } else {
        addDebugLog(`✅ Database access successful: Found ${data?.length || 0} entries`);
        toast.success(`Database test passed! Found ${data?.length || 0} knowledge entries`);
      }
    } catch (error) {
      addDebugLog(`❌ Database test failed with exception: ${error.message}`);
      const result: DatabaseTestResult = {
        success: false,
        error: { message: error.message },
        data: null,
        timestamp: new Date().toISOString(),
        count: 0
      };
      setDbTestResult(result);
      toast.error(`Database test failed: ${error.message}`);
    } finally {
      setIsTestingDB(false);
    }
  };

  const testEnvironmentVars = async () => {
    addDebugLog('🔍 Testing environment variable access...');
    try {
      const { data, error } = await supabase.functions.invoke('build-rag-context', {
        body: {
          userPrompt: "test environment",
          imageUrls: [],
          imageAnnotations: [],
          analysisId: 'env-test-' + Date.now()
        }
      });

      if (error) {
        addDebugLog(`Environment test error: ${error.message}`);
        if (error.message.includes('Missing required environment variables')) {
          toast.error('Environment variables are not properly configured');
        } else if (error.message.includes('OPENAI_API_KEY_RAG')) {
          toast.error('OpenAI API key is missing or invalid');
        } else {
          toast.error(`Environment test failed: ${error.message}`);
        }
      } else {
        addDebugLog('✅ Environment variables properly configured');
        toast.success('Environment variables are properly configured');
      }
    } catch (error) {
      addDebugLog(`❌ Environment test failed: ${error.message}`);
      toast.error(`Environment test failed: ${error.message}`);
    }
  };

  const testRAGFunction = async () => {
    setIsTestingRAG(true);
    setTestResult(null);
    setDebugLogs([]);
    
    try {
      addDebugLog('Starting RAG context building test...');
      addDebugLog(`Test prompt: "${testPrompt}"`);

      // Call the build-rag-context function directly
      const { data, error } = await supabase.functions.invoke('build-rag-context', {
        body: {
          userPrompt: testPrompt,
          imageUrls: ['https://example.com/test-image.jpg'],
          imageAnnotations: [],
          analysisId: 'test-' + Date.now()
        }
      });

      if (error) {
        addDebugLog(`❌ RAG function error: ${error.message}`);
        throw new Error(error.message);
      }

      addDebugLog('✅ RAG function call successful');
      addDebugLog(`Response data structure: ${JSON.stringify(Object.keys(data || {}))}`);

      // Analyze the response
      const result: RAGTestResult = {
        success: true,
        stage: 'completed',
        searchTerms: data?.searchTermsUsed || [],
        knowledgeCount: data?.totalEntriesFound || 0,
        enhancedPromptLength: data?.enhancedPrompt?.length || 0,
        citations: data?.researchCitations || [],
        industryContext: data?.industryContext || 'none',
        debugLogs: [...debugLogs],
        embeddingSuccess: (data?.searchTermsUsed?.length || 0) > 0,
        databaseQuerySuccess: (data?.totalEntriesFound || 0) > 0,
        promptEnhancementSuccess: (data?.enhancedPrompt?.length || 0) > testPrompt.length
      };

      addDebugLog(`Search terms extracted: ${result.searchTerms?.length || 0}`);
      addDebugLog(`Knowledge entries found: ${result.knowledgeCount}`);
      addDebugLog(`Citations generated: ${result.citations?.length || 0}`);
      addDebugLog(`Industry context: ${result.industryContext}`);
      addDebugLog(`Enhanced prompt length: ${result.enhancedPromptLength} chars`);

      if (result.knowledgeCount === 0) {
        addDebugLog('⚠️ WARNING: No knowledge entries found - this may indicate:');
        addDebugLog('  - Empty knowledge base');
        addDebugLog('  - Embedding generation failure');
        addDebugLog('  - Database query issues');
        addDebugLog('  - Similarity threshold too high');
      }

      if (result.citations && result.citations.length > 0) {
        addDebugLog(`✅ Successfully generated ${result.citations.length} research citations`);
        result.citations.forEach((citation, i) => {
          addDebugLog(`  Citation ${i + 1}: ${citation.substring(0, 100)}...`);
        });
      }

      setTestResult(result);

      if (result.knowledgeCount > 0) {
        toast.success(`RAG test successful! Found ${result.knowledgeCount} knowledge entries with ${result.citations?.length || 0} citations`);
      } else {
        toast.warning('RAG function works but found no knowledge entries. Check knowledge base population.');
      }

    } catch (error) {
      addDebugLog(`❌ Test failed: ${error.message}`);
      
      setTestResult({
        success: false,
        stage: 'error',
        error: error.message,
        debugLogs: [...debugLogs]
      });

      toast.error(`RAG test failed: ${error.message}`);
    } finally {
      setIsTestingRAG(false);
    }
  };

  const clearResults = () => {
    setTestResult(null);
    setDbTestResult(null);
    setDebugLogs([]);
    toast.info('Test results cleared');
  };

  const getStatusColor = (success: boolean) => success ? 'text-green-600' : 'text-red-600';
  const getStatusIcon = (success: boolean) => success ? CheckCircle : AlertCircle;

  return (
    <div className="space-y-6 p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Enhanced RAG Context Debug Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Analysis Prompt</label>
            <Textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a UX analysis prompt to test RAG context building..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              onClick={populateTestData}
              disabled={isPopulating}
              variant="outline"
              size="sm"
            >
              {isPopulating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Populating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Populate Test Data
                </>
              )}
            </Button>
            
            <Button 
              onClick={testDatabaseAccess}
              disabled={isTestingDB}
              variant="outline"
              size="sm"
            >
              {isTestingDB ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing DB...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Test Database
                </>
              )}
            </Button>
            
            <Button 
              onClick={testEnvironmentVars}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Test Environment
            </Button>
            
            <Button 
              onClick={clearResults}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Results
            </Button>
          </div>

          <Button 
            onClick={testRAGFunction}
            disabled={isTestingRAG || !testPrompt.trim()}
            className="w-full"
          >
            {isTestingRAG ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing RAG Function...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Test RAG Context Building
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {dbTestResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Test Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={dbTestResult.success ? 'text-green-600' : 'text-red-600'}>
                  {dbTestResult.success ? 'SUCCESS' : 'FAILED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Entries Found:</span>
                <span>{dbTestResult.count}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{new Date(dbTestResult.timestamp).toLocaleTimeString()}</span>
              </div>
              {dbTestResult.error && (
                <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
                  Error: {dbTestResult.error.message}
                </div>
              )}
              {dbTestResult.data && dbTestResult.data.length > 0 && (
                <div className="text-green-600 text-xs bg-green-50 p-2 rounded">
                  Sample entries: {dbTestResult.data.slice(0, 3).map((e: any) => e.title).join(', ')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              RAG Function Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="citations">Citations</TabsTrigger>
                <TabsTrigger value="debug">Debug Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {testResult.searchTerms?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Search Terms</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${testResult.knowledgeCount ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.knowledgeCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Knowledge Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {testResult.citations?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Citations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {testResult.enhancedPromptLength || 0}
                    </div>
                    <div className="text-sm text-gray-600">Enhanced Chars</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Embedding Generation
                    </span>
                    <div className={`flex items-center gap-1 ${getStatusColor(testResult.embeddingSuccess || false)}`}>
                      {React.createElement(getStatusIcon(testResult.embeddingSuccess || false), { className: "w-4 h-4" })}
                      {testResult.embeddingSuccess ? 'Success' : 'Failed'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Database Query
                    </span>
                    <div className={`flex items-center gap-1 ${getStatusColor(testResult.databaseQuerySuccess || false)}`}>
                      {React.createElement(getStatusIcon(testResult.databaseQuerySuccess || false), { className: "w-4 h-4" })}
                      {testResult.databaseQuerySuccess ? 'Success' : 'No Results'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Prompt Enhancement
                    </span>
                    <div className={`flex items-center gap-1 ${getStatusColor(testResult.promptEnhancementSuccess || false)}`}>
                      {React.createElement(getStatusIcon(testResult.promptEnhancementSuccess || false), { className: "w-4 h-4" })}
                      {testResult.promptEnhancementSuccess ? 'Enhanced' : 'Unchanged'}
                    </div>
                  </div>
                </div>

                {!testResult.success && testResult.error && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Error:</strong> {testResult.error}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Search Terms Extracted ({testResult.searchTerms?.length || 0})</h4>
                  <div className="flex flex-wrap gap-2">
                    {testResult.searchTerms?.map((term, index) => (
                      <Badge key={index} variant="outline">{term}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Industry Context</h4>
                  <Badge variant="secondary">{testResult.industryContext}</Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Enhanced Prompt Preview</h4>
                  <div className="p-3 bg-gray-50 rounded text-sm max-h-40 overflow-y-auto">
                    Enhanced prompt length: {testResult.enhancedPromptLength} characters
                    {testResult.enhancedPromptLength > testPrompt.length ? (
                      <div className="text-green-600 mt-1">✅ Prompt was enhanced with research context</div>
                    ) : (
                      <div className="text-yellow-600 mt-1">⚠️ Prompt was not enhanced (may indicate no knowledge found)</div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="citations" className="space-y-3">
                <h4 className="font-medium">Research Citations ({testResult.citations?.length || 0})</h4>
                {testResult.citations && testResult.citations.length > 0 ? (
                  <div className="space-y-2">
                    {testResult.citations.map((citation, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                        <div className="text-sm font-medium">Citation {index + 1}</div>
                        <div className="text-sm text-gray-700 mt-1">{citation}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <BookOpen className="h-4 w-4" />
                    <AlertDescription>
                      No research citations were generated. This indicates that no relevant knowledge entries were found for your query.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="debug" className="space-y-3">
                <h4 className="font-medium">Debug Logs ({debugLogs.length})</h4>
                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                  {debugLogs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
