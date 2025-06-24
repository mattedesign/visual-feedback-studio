
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useVectorKnowledge } from '@/hooks/knowledgeBase/useVectorKnowledge';
import { KnowledgeEntry } from '@/types/vectorDatabase';
import { toast } from 'sonner';
import { Search, Plus, Database, TestTube } from 'lucide-react';

export const KnowledgeBaseTest = () => {
  const [openaiKey, setOpenaiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
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
    setOpenAIKey,
    clearResults
  } = useVectorKnowledge();

  const handleSetApiKey = () => {
    if (!openaiKey.trim()) {
      toast.error('Please enter your OpenAI API key');
      return;
    }
    setOpenAIKey(openaiKey);
    setIsKeySet(true);
    toast.success('OpenAI API key configured successfully');
  };

  const handleAddTestEntry = async () => {
    if (!isKeySet) {
      toast.error('Please set your OpenAI API key first');
      return;
    }

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
    if (!isKeySet) {
      toast.error('Please set your OpenAI API key first');
      return;
    }
    
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

      {/* API Key Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Enter your OpenAI API key"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              disabled={isKeySet}
            />
            <Button 
              onClick={handleSetApiKey}
              disabled={isKeySet || !openaiKey.trim()}
            >
              {isKeySet ? 'Key Set ✓' : 'Set API Key'}
            </Button>
          </div>
          {isKeySet && (
            <p className="text-sm text-green-600">
              ✓ OpenAI API key configured successfully
            </p>
          )}
        </CardContent>
      </Card>

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
              disabled={isLoading || !isKeySet}
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
                disabled={isLoading || !isKeySet}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">API Key</p>
              <p className="font-semibold">{isKeySet ? '✓ Configured' : '✗ Not Set'}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Loading State</p>
              <p className="font-semibold">{isLoading ? '⏳ Processing' : '✓ Ready'}</p>
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
