
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { vectorKnowledgeService } from '@/services/knowledgeBase/vectorService';
import { ragService } from '@/services/analysis/ragService';
import { BookOpen, Search, Sparkles, AlertCircle } from 'lucide-react';

export const DirectRAGTest: React.FC = () => {
  const [query, setQuery] = useState('button design usability');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [ragContext, setRagContext] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testDirectSearch = async () => {
    setIsSearching(true);
    setError(null);
    try {
      console.log('🧪 Testing direct vector search...');
      
      const searchResults = await vectorKnowledgeService.searchKnowledge(query, {
        match_threshold: 0.3, // Lower threshold for better results
        match_count: 5
      });
      
      setResults(searchResults);
      console.log('✅ Direct search results:', searchResults);
      
    } catch (err) {
      console.error('❌ Direct search failed:', err);
      setError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const testRAGContext = async () => {
    setIsSearching(true);
    setError(null);
    try {
      console.log('🧪 Testing RAG context building...');
      
      const context = await ragService.buildRAGContext(query, {
        maxResults: 5,
        similarityThreshold: 0.3 // Lower threshold
      });
      
      setRagContext(context);
      console.log('✅ RAG context built:', context);
      
    } catch (err) {
      console.error('❌ RAG context failed:', err);
      setError(err.message || 'RAG context failed');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Direct RAG System Test - Bypass TypeScript Issues
          </CardTitle>
          <p className="text-gray-600">
            Testing RAG system with your 23 UX research entries
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your UX query (e.g., 'button design usability')"
              className="flex-1"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={testDirectSearch} 
              disabled={isSearching || !query.trim()}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isSearching ? 'Searching...' : 'Test Direct Vector Search'}
            </Button>
            
            <Button 
              onClick={testRAGContext} 
              disabled={isSearching || !query.trim()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              {isSearching ? 'Building...' : 'Test RAG Context'}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <strong className="text-red-800">Error:</strong>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Direct Search Results ({results.length})</h3>
              {results.map((result, i) => (
                <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-green-900">{result.title}</h4>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {((result.similarity || 0) * 100).toFixed(1)}% match
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mb-2">
                    {result.content?.substring(0, 200)}...
                  </p>
                  <div className="flex gap-2 text-xs text-green-600">
                    <span>Category: {result.category}</span>
                    {result.source && <span>• Source: {result.source}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {ragContext && (
            <div className="space-y-3">
              <h3 className="font-semibold">RAG Context Results</h3>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center mb-3">
                  <div>
                    <div className="text-2xl font-bold text-blue-700">
                      {ragContext.totalRelevantEntries}
                    </div>
                    <div className="text-xs text-blue-600">Knowledge Entries</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-700">
                      {ragContext.categories?.length || 0}
                    </div>
                    <div className="text-xs text-blue-600">Categories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-700">
                      {ragContext.retrievalMetadata?.processingTime || 0}ms
                    </div>
                    <div className="text-xs text-blue-600">Processing Time</div>
                  </div>
                </div>
                
                {ragContext.relevantKnowledge?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">Retrieved Research:</h4>
                    {ragContext.relevantKnowledge.slice(0, 3).map((entry, i) => (
                      <div key={i} className="text-sm text-blue-700">
                        • <strong>{entry.title}</strong> ({((entry.similarity || 0) * 100).toFixed(1)}% match)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
