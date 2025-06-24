
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVectorKnowledge } from '@/hooks/knowledgeBase/useVectorKnowledge';
import { KnowledgeEntry } from '@/types/vectorDatabase';
import { toast } from 'sonner';

export const VectorDatabaseTest = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    category: 'ux-patterns' as KnowledgeEntry['category'],
    source: 'test',
    tags: [] as string[]
  });

  const {
    isLoading,
    searchResults,
    searchKnowledge,
    addKnowledgeEntry,
    clearResults
  } = useVectorKnowledge();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    await searchKnowledge(searchQuery);
  };

  const handleAddEntry = async () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }
    
    try {
      await addKnowledgeEntry(newEntry);
      setNewEntry({
        title: '',
        content: '',
        category: 'ux-patterns',
        source: 'test',
        tags: []
      });
      toast.success('Knowledge entry added successfully');
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Vector Database Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Knowledge Entry */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Add Knowledge Entry</h3>
            <Input
              placeholder="Title"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
            />
            <Textarea
              placeholder="Content"
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            />
            <Select value={newEntry.category} onValueChange={(value) => setNewEntry({ ...newEntry, category: value as KnowledgeEntry['category'] })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ux-patterns">UX Patterns</SelectItem>
                <SelectItem value="visual">Visual</SelectItem>
                <SelectItem value="accessibility">Accessibility</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddEntry} disabled={isLoading}>
              Add Entry
            </Button>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Search Knowledge</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter search query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                Search
              </Button>
              <Button variant="outline" onClick={clearResults}>
                Clear
              </Button>
            </div>
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Search Results</h3>
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <Card key={result.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{result.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{result.content}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {result.category}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              Similarity: {(result.similarity * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
