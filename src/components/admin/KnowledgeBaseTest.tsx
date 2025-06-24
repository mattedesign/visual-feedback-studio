import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useVectorKnowledge } from '@/hooks/knowledgeBase/useVectorKnowledge';
import { useKnowledgePopulation } from '@/hooks/knowledgeBase/useKnowledgePopulation';
import { KnowledgeEntry } from '@/types/vectorDatabase';
import { toast } from 'sonner';
import { Search, Plus, TestTube, Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const KnowledgeBaseTest = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [testEntry, setTestEntry] = useState({
    title: 'Button Color Psychology in UX',
    content: 'Button colors significantly impact user behavior and conversion rates. Red buttons create urgency and are effective for calls-to-action, while blue buttons convey trust and are preferred for primary actions. Green buttons suggest positive actions like "Submit" or "Go", while orange buttons can increase conversion rates by up to 32.5% compared to other colors. The contrast ratio should meet WCAG guidelines, and color should never be the only way to convey information.',
    category: 'ux-patterns' as KnowledgeEntry['category'],
    source: 'UX Psychology Research',
    industry: 'technology',
    element_type: 'button-design',
    tags: ['button-design', 'color-psychology', 'conversion', 'accessibility']
  });

  const {
    isLoading,
    searchResults,
    searchKnowledge,
    addKnowledgeEntry,
    clearResults
  } = useVectorKnowledge();

  const {
    isPopulating,
    progress,
    verificationResults,
    populateKnowledgeBase,
    clearResults: clearPopulationResults
  } = useKnowledgePopulation();

  const handleAddTestEntry = async () => {
    try {
      const result = await addKnowledgeEntry(testEntry);
      console.log('Test entry added successfully:', result);
      toast.success(`Test entry "${testEntry.title}" added successfully!`);
    } catch (error) {
      console.error('Error adding test entry:', error);
      toast.error('Failed to add test entry');
    }
  };

  const handleSearch = async () => {    
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    await searchKnowledge(searchQuery, { match_threshold: 0.7, match_count: 5 });
  };

  const predefinedQueries = [
    'button design',
    'accessibility guidelines',
    'conversion optimization',
    'mobile UX patterns',
    'form design best practices'
  ];

  const getStageIcon = () => {
    if (!progress) return null;
    
    switch (progress.stage) {
      case 'preparing':
      case 'populating':
      case 'verifying':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStageText = () => {
    if (!progress) return '';
    
    switch (progress.stage) {
      case 'preparing':
        return 'Preparing to populate knowledge base...';
      case 'populating':
        return `Adding entry ${progress.currentEntry}/${progress.totalEntries}: ${progress.currentTitle}`;
      case 'verifying':
        return 'Verifying knowledge base...';
      case 'completed':
        return 'Knowledge base population completed!';
      case 'error':
        return 'Population failed - check console for details';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <TestTube className="w-8 h-8" />
          Knowledge Base Testing Suite
        </h1>
        <p className="text-gray-600 mt-2">
          Test the vector knowledge system functionality
        </p>
      </div>

      {/* Population Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Knowledge Base Population
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={populateKnowledgeBase} 
              disabled={isPopulating}
              className="flex-1"
              size="lg"
            >
              {isPopulating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Populating Knowledge Base...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Populate Full Knowledge Base
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearPopulationResults}
              disabled={isPopulating}
            >
              Clear Results
            </Button>
          </div>

          {progress && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getStageIcon()}
                <span className="text-sm font-medium">{getStageText()}</span>
              </div>
              
              {progress.stage === 'populating' && (
                <div className="space-y-2">
                  <Progress 
                    value={(progress.currentEntry / progress.totalEntries) * 100} 
                    className="w-full" 
                  />
                  <p className="text-xs text-gray-500 text-center">
                    {progress.currentEntry} of {progress.totalEntries} entries processed
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Results */}
      {verificationResults && (
        <Card>
          <CardHeader>
            <CardTitle>Population Verification Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-green-600">{verificationResults.totalEntries}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-blue-600">{verificationResults.categoryBreakdown.length}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Sample Entries</p>
                <p className="text-2xl font-bold text-purple-600">{verificationResults.sampleEntries.length}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Category Breakdown:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {verificationResults.categoryBreakdown.map(({ category, count }) => (
                  <Badge key={category} variant="outline" className="justify-between">
                    <span>{category}</span>
                    <span className="ml-2 font-bold">{count}</span>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Sample Entries Added:</h4>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {verificationResults.sampleEntries.map((entry, index) => (
                    <div key={entry.id} className="border rounded p-3 text-sm">
                      <div className="font-medium">{entry.title}</div>
                      <div className="text-gray-600 mt-1">{entry.content.substring(0, 100)}...</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{entry.category}</Badge>
                        {entry.industry && (
                          <Badge variant="outline" className="text-xs">{entry.industry}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Test Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Test Knowledge Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Title"
              value={testEntry.title}
              onChange={(e) => setTestEntry({ ...testEntry, title: e.target.value })}
            />
            
            <Textarea
              placeholder="Content"
              value={testEntry.content}
              onChange={(e) => setTestEntry({ ...testEntry, content: e.target.value })}
              rows={4}
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Select 
                value={testEntry.category} 
                onValueChange={(value) => setTestEntry({ ...testEntry, category: value as KnowledgeEntry['category'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ux-patterns">UX Patterns</SelectItem>
                  <SelectItem value="visual">Visual Design</SelectItem>
                  <SelectItem value="accessibility">Accessibility</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                  <SelectItem value="ecommerce-patterns">E-commerce</SelectItem>
                  <SelectItem value="saas-patterns">SaaS</SelectItem>
                  <SelectItem value="fintech-patterns">Fintech</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Source"
                value={testEntry.source}
                onChange={(e) => setTestEntry({ ...testEntry, source: e.target.value })}
              />
            </div>

            <Button 
              onClick={handleAddTestEntry} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Adding...' : 'Add Test Entry'}
            </Button>
          </CardContent>
        </Card>

        {/* Search Knowledge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Knowledge Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter search query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isLoading}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Quick test queries:</p>
              <div className="flex flex-wrap gap-2">
                {predefinedQueries.map((query) => (
                  <Badge
                    key={query}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => setSearchQuery(query)}
                  >
                    {query}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={clearResults}
                size="sm"
              >
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{result.title}</h4>
                      <Badge variant="secondary">
                        {(result.similarity * 100).toFixed(1)}% match
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {result.content}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline">{result.category}</Badge>
                      {result.industry && (
                        <Badge variant="outline">{result.industry}</Badge>
                      )}
                      {result.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      ID: {result.id} | Source: {result.source || 'Unknown'}
                    </div>
                    
                    {index < searchResults.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Test Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Loading State</p>
              <p className="font-semibold">{isLoading || isPopulating ? '⏳ Processing' : '✓ Ready'}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Results Found</p>
              <p className="font-semibold">{searchResults.length} entries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
