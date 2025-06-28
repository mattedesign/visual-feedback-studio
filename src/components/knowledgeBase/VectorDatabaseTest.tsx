
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useVectorKnowledge } from '@/hooks/knowledgeBase/useVectorKnowledge';
import { KnowledgeEntry } from '@/types/vectorDatabase';
import { toast } from 'sonner';

export const VectorDatabaseTest = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    category: 'ux-patterns' as KnowledgeEntry['category'],
    primary_category: 'patterns' as const,
    secondary_category: 'interaction-patterns',
    industry_tags: [] as string[],
    complexity_level: 'intermediate' as const,
    use_cases: [] as string[],
    source: 'test',
    tags: [] as string[]
  });

  const [searchFilters, setSearchFilters] = useState({
    primary_category: '' as '' | 'patterns' | 'compliance' | 'research' | 'optimization' | 'design',
    secondary_category: '',
    complexity_level: '' as '' | 'basic' | 'intermediate' | 'advanced',
    industry_tags: [] as string[]
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
    
    const filters = {
      primary_category: searchFilters.primary_category || undefined,
      secondary_category: searchFilters.secondary_category || undefined,
      complexity_level: searchFilters.complexity_level || undefined,
      industry_tags: searchFilters.industry_tags.length > 0 ? searchFilters.industry_tags : undefined
    };
    
    await searchKnowledge(searchQuery, filters);
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
        primary_category: 'patterns',
        secondary_category: 'interaction-patterns',
        industry_tags: [],
        complexity_level: 'intermediate',
        use_cases: [],
        source: 'test',
        tags: []
      });
      toast.success('Knowledge entry added successfully');
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleAddIndustryTag = (tag: string) => {
    if (tag && !newEntry.industry_tags.includes(tag)) {
      setNewEntry({
        ...newEntry,
        industry_tags: [...newEntry.industry_tags, tag]
      });
    }
  };

  const handleRemoveIndustryTag = (tagToRemove: string) => {
    setNewEntry({
      ...newEntry,
      industry_tags: newEntry.industry_tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Vector Database Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Add Knowledge Entry Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add Knowledge Entry</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Title"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              />
              
              <Select 
                value={newEntry.complexity_level} 
                onValueChange={(value: 'basic' | 'intermediate' | 'advanced') => setNewEntry({ ...newEntry, complexity_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Complexity Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select 
                value={newEntry.primary_category} 
                onValueChange={(value: 'patterns' | 'compliance' | 'research' | 'optimization' | 'design') => setNewEntry({ ...newEntry, primary_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Primary Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patterns">Patterns</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="optimization">Optimization</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Secondary Category"
                value={newEntry.secondary_category}
                onChange={(e) => setNewEntry({ ...newEntry, secondary_category: e.target.value })}
              />
            </div>

            <Textarea
              placeholder="Content"
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            />

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add industry tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddIndustryTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button 
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    handleAddIndustryTag(input.value);
                    input.value = '';
                  }}
                >
                  Add Tag
                </Button>
              </div>
              
              {newEntry.industry_tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newEntry.industry_tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveIndustryTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleAddEntry} disabled={isLoading}>
              Add Entry
            </Button>
          </div>

          {/* Search Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Search Knowledge</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Select 
                value={searchFilters.primary_category} 
                onValueChange={(value: '' | 'patterns' | 'compliance' | 'research' | 'optimization' | 'design') => setSearchFilters({ ...searchFilters, primary_category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Primary Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="patterns">Patterns</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="optimization">Optimization</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={searchFilters.complexity_level} 
                onValueChange={(value: '' | 'basic' | 'intermediate' | 'advanced') => setSearchFilters({ ...searchFilters, complexity_level: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

          {/* Results Section */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Search Results ({searchResults.length})</h3>
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <Card key={result.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-lg">{result.title}</h4>
                          <Badge variant="outline">
                            {((result.similarity || 0) * 100).toFixed(1)}% match
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-3">{result.content}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {result.primary_category && (
                            <Badge variant="default">
                              {result.primary_category}
                            </Badge>
                          )}
                          {result.secondary_category && (
                            <Badge variant="secondary">
                              {result.secondary_category}
                            </Badge>
                          )}
                          {result.complexity_level && (
                            <Badge variant="outline" className="text-xs">
                              {result.complexity_level}
                            </Badge>
                          )}
                          {result.freshness_score && (
                            <Badge variant="outline" className="text-xs">
                              Freshness: {(result.freshness_score * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>

                        {result.industry_tags && result.industry_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-gray-500">Industries:</span>
                            {result.industry_tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {result.use_cases && result.use_cases.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-gray-500">Use cases:</span>
                            {result.use_cases.map((useCase, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {useCase}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-gray-400 border-t pt-2">
                          Created: {result.created_at ? new Date(result.created_at).toLocaleDateString() : 'N/A'} | 
                          Source: {result.source || 'N/A'}
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
