import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { visualPatterns, getPatternsByCategory } from '@/data/visualPatternLibrary';
import { VisualPatternPreview } from './VisualPatternPreview';

interface Props {
  onPatternSelect?: (patternId: string) => void;
  selectedCategory?: string;
}

export function PatternSearch({ onPatternSelect, selectedCategory }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique categories and tags
  const allPatterns = Object.values(visualPatterns);
  const categories = [...new Set(allPatterns.map(p => p.category))];
  const allTags = [...new Set(allPatterns.flatMap(p => p.tags))];

  // Filter patterns based on search and filters
  const filteredPatterns = useMemo(() => {
    let filtered = allPatterns;

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pattern => 
        pattern.name.toLowerCase().includes(query) ||
        pattern.company.toLowerCase().includes(query) ||
        pattern.description.toLowerCase().includes(query) ||
        pattern.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(pattern => pattern.category === selectedCategory);
    }

    // Tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(pattern => 
        selectedTags.some(tag => pattern.tags.includes(tag))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedTags, allPatterns]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Pattern Library</h2>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search patterns by name, company, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by tags:</span>
          {allTags.slice(0, 8).map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedTags.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchQuery && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs flex items-center gap-1">
                Search: "{searchQuery}"
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => setSearchQuery('')}
                />
              </span>
            )}
            {selectedTags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleTag(tag)}
                />
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {filteredPatterns.length} pattern{filteredPatterns.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredPatterns.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patterns found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms or filters</p>
            <button
              onClick={clearAllFilters}
              className="text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatterns.map(pattern => (
              <div key={pattern.id} className="space-y-3">
                <VisualPatternPreview 
                  patternId={pattern.id}
                  showInteraction={true}
                />
                
                {/* Pattern Info */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{pattern.name}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {pattern.implementation_time}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600">{pattern.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {pattern.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {onPatternSelect && (
                      <button
                        onClick={() => onPatternSelect(pattern.id)}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        Use Pattern
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}