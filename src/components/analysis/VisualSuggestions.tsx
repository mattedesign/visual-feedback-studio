
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Maximize2 } from 'lucide-react';

interface VisualSuggestion {
  id: string;
  type: 'before_after' | 'style_variant' | 'accessibility_fix';
  description: string;
  imageUrl: string;
  originalIssue: string;
  improvement: string;
  timestamp: Date;
}

interface VisualSuggestionsProps {
  analysisInsights: string[];
  userContext: string;
  focusAreas: string[];
  designType: 'mobile' | 'desktop' | 'responsive';
}

export const VisualSuggestions: React.FC<VisualSuggestionsProps> = ({
  analysisInsights,
  userContext,
  focusAreas,
  designType
}) => {
  const [suggestions, setSuggestions] = useState<VisualSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateSuggestions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { visualSuggestionService } = await import('@/services/design/visualSuggestionService');
      
      const suggestions = await visualSuggestionService.generateVisualSuggestions({
        analysisInsights,
        userContext,
        focusAreas,
        designType
      });
      
      setSuggestions(suggestions);
    } catch (err) {
      setError('Failed to generate visual suggestions');
      console.error('Visual suggestions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'before_after': return '🔄';
      case 'style_variant': return '🎨';
      case 'accessibility_fix': return '♿';
      default: return '💡';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'before_after': return 'Before/After';
      case 'style_variant': return 'Style Variant';
      case 'accessibility_fix': return 'Accessibility Fix';
      default: return 'Suggestion';
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <span>🎨 Visual Design Suggestions</span>
          <Button 
            onClick={generateSuggestions}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Suggestions'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getTypeIcon(suggestion.type)} {getTypeName(suggestion.type)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square mb-3">
                    <img 
                      src={suggestion.imageUrl} 
                      alt={suggestion.description}
                      className="w-full h-full object-cover rounded border border-slate-600"
                    />
                  </div>
                  <p className="text-sm text-slate-300 mb-2">{suggestion.description}</p>
                  <p className="text-xs text-slate-400 mb-3">{suggestion.improvement}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {suggestions.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">Generate visual suggestions to see design improvements</p>
            <p className="text-xs text-slate-500">
              Based on your analysis insights: {analysisInsights.slice(0, 3).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
