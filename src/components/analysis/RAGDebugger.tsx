
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Database, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RAGDebugResult {
  query: string;
  embeddingGenerated: boolean;
  embeddingDimensions: number;
  knowledgeEntriesFound: number;
  knowledgeEntries: Array<{
    id: string;
    title: string;
    category: string;
    similarity: number;
    contentPreview: string;
  }>;
  researchContextLength: number;
  researchContextPreview: string;
  finalPromptLength: number;
  finalPromptStructure: {
    hasOriginalPrompt: boolean;
    hasResearchSection: boolean;
    hasRAGContext: boolean;
    hasJSONInstructions: boolean;
  };
  timestamp: string;
}

export const RAGDebugger: React.FC = () => {
  const [query, setQuery] = useState('button sizes mobile usability');
  const [isLoading, setIsLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<RAGDebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDebugRAG = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDebugResult(null);

    try {
      console.log('🔍 Starting RAG debug for query:', query);
      
      const { data, error: functionError } = await supabase.functions.invoke('analyze-design', {
        body: { query },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }, {
        get: (url: string) => url.includes('debug-rag') ? url : url + '?debug-rag=true'
      });

      if (functionError) {
        console.error('❌ Debug function error:', functionError);
        throw new Error(functionError.message || 'Failed to debug RAG');
      }

      if (!data.success) {
        throw new Error(data.error || 'Debug request failed');
      }

      console.log('✅ RAG debug completed:', data.debug);
      setDebugResult(data.debug);
      toast.success(`Found ${data.debug.knowledgeEntriesFound} knowledge entries`);

    } catch (err) {
      console.error('❌ RAG debug error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Debug failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Alternative method using direct function call
  const handleDebugRAGDirect = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDebugResult(null);

    try {
      console.log('🔍 Starting direct RAG debug for query:', query);
      
      // Make direct HTTP call to the debug endpoint
      const response = await fetch('/api/debug-rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Debug request failed');
      }

      console.log('✅ Direct RAG debug completed:', data.debug);
      setDebugResult(data.debug);
      toast.success(`Found ${data.debug.knowledgeEntriesFound} knowledge entries`);

    } catch (err) {
      console.error('❌ Direct RAG debug error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Debug failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            RAG Knowledge Retrieval Debugger
          </CardTitle>
          <CardDescription>
            Test and debug the knowledge retrieval pipeline. Enter a query to see exactly what knowledge entries are retrieved and how they're integrated into the final prompt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query (e.g., 'button sizes mobile usability')"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleDebugRAG()}
            />
            <Button 
              onClick={handleDebugRAG} 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Debugging...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Debug RAG
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleDebugRAGDirect} 
              disabled={isLoading}
              variant="outline"
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Debugging...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Direct Debug
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugResult && (
        <div className="space-y-4">
          {/* Query and Basic Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Debug Results</CardTitle>
              <CardDescription>Query: "{debugResult.query}"</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Embedding: {debugResult.embeddingDimensions}D</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Found: {debugResult.knowledgeEntriesFound} entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Context: {debugResult.researchContextLength} chars</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Prompt: {debugResult.finalPromptLength} chars</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Entries */}
          {debugResult.knowledgeEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Retrieved Knowledge Entries</CardTitle>
                <CardDescription>
                  {debugResult.knowledgeEntries.length} entries found (sorted by relevance)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {debugResult.knowledgeEntries.map((entry, index) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{index + 1}. {entry.title}</h4>
                          <div className="flex gap-2">
                            <Badge variant="outline">{entry.category}</Badge>
                            <Badge variant="secondary">
                              {(entry.similarity * 100).toFixed(1)}% match
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.contentPreview}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Research Context Preview */}
          {debugResult.researchContextLength > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Research Context Preview</CardTitle>
                <CardDescription>
                  How the knowledge entries are formatted for the AI ({debugResult.researchContextLength} characters)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <pre className="text-sm whitespace-pre-wrap bg-muted p-4 rounded">
                    {debugResult.researchContextPreview}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Final Prompt Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Final Prompt Structure</CardTitle>
              <CardDescription>
                Verification that all components are properly integrated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {debugResult.finalPromptStructure.hasOriginalPrompt ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-red-500" />
                  )}
                  <span className="text-sm">Original Prompt Included</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugResult.finalPromptStructure.hasResearchSection ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-red-500" />
                  )}
                  <span className="text-sm">Research Section Added</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugResult.finalPromptStructure.hasRAGContext ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-red-500" />
                  )}
                  <span className="text-sm">RAG Context Included</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugResult.finalPromptStructure.hasJSONInstructions ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-red-500" />
                  )}
                  <span className="text-sm">JSON Instructions Added</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
