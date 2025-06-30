
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Brain, Target, BookOpen, Zap } from 'lucide-react';

interface ContextIntelligencePreviewProps {
  analysisContext: string;
  imageCount: number;
  onTogglePreview?: (show: boolean) => void;
}

export const ContextIntelligencePreview = ({
  analysisContext,
  imageCount,
  onTogglePreview
}: ContextIntelligencePreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [researchTopics, setResearchTopics] = useState<string[]>([]);
  const [analysisType, setAnalysisType] = useState<'targeted' | 'comprehensive'>('comprehensive');

  useEffect(() => {
    if (analysisContext.trim().length > 10) {
      const { areas, topics, type } = analyzeContext(analysisContext);
      setFocusAreas(areas);
      setResearchTopics(topics);
      setAnalysisType(type);
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [analysisContext]);

  const analyzeContext = (context: string): {
    areas: string[];
    topics: string[];
    type: 'targeted' | 'comprehensive';
  } => {
    const lower = context.toLowerCase();
    const areas: string[] = [];
    const topics: string[] = [];

    // E-commerce detection
    if (lower.match(/\b(checkout|cart|purchase|payment|buy|shop|ecommerce|e-commerce|order|product)\b/)) {
      areas.push('E-commerce');
      topics.push('Checkout optimization', 'Cart abandonment', 'Payment flows');
    }

    // Mobile detection
    if (lower.match(/\b(mobile|responsive|touch|tablet|phone|ios|android|device)\b/)) {
      areas.push('Mobile UX');
      topics.push('Mobile responsiveness', 'Touch interfaces', 'Mobile navigation');
    }

    // Accessibility detection
    if (lower.match(/\b(accessibility|contrast|wcag|ada|screen reader|keyboard|disability)\b/)) {
      areas.push('Accessibility');
      topics.push('WCAG compliance', 'Color contrast', 'Keyboard navigation');
    }

    // Conversion detection
    if (lower.match(/\b(conversion|cta|revenue|optimize|funnel|landing|signup)\b/)) {
      areas.push('Conversion');
      topics.push('CTA optimization', 'Landing page design', 'Conversion funnels');
    }

    // Visual design detection
    if (lower.match(/\b(visual|design|color|typography|layout|brand|aesthetic)\b/)) {
      areas.push('Visual Design');
      topics.push('Visual hierarchy', 'Typography', 'Brand consistency');
    }

    // UX detection
    if (lower.match(/\b(ux|usability|user experience|navigation|flow|journey|interaction)\b/)) {
      areas.push('UX/Usability');
      topics.push('User flows', 'Navigation patterns', 'Interaction design');
    }

    const type = areas.length > 0 ? 'targeted' : 'comprehensive';
    
    // Add default topics if none found
    if (topics.length === 0) {
      topics.push('UI best practices', 'Design principles', 'Usability standards');
    }

    return { areas, topics, type };
  };

  const handleToggle = () => {
    const newState = !showPreview;
    setShowPreview(newState);
    onTogglePreview?.(newState);
  };

  if (!analysisContext || analysisContext.trim().length < 10) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-600" />
            Analysis Intelligence Preview
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-6 w-6 p-0"
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
        </div>
      </CardHeader>
      
      {showPreview && (
        <CardContent className="space-y-4">
          {/* Analysis Type */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Analysis Type:</span>
            <Badge variant={analysisType === 'targeted' ? 'default' : 'secondary'}>
              {analysisType === 'targeted' ? 'Targeted Analysis' : 'Comprehensive Review'}
            </Badge>
          </div>

          {/* Focus Areas */}
          {focusAreas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Focus Areas:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {focusAreas.map((area, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Research Topics */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Research Topics:</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs text-gray-600 dark:text-gray-400">
              {researchTopics.slice(0, 4).map((topic, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  {topic}
                </div>
              ))}
              {researchTopics.length > 4 && (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  +{researchTopics.length - 4} more topics...
                </div>
              )}
            </div>
          </div>

          {/* Image Analysis Info */}
          <div className="pt-2 border-t border-indigo-200 dark:border-indigo-700">
            <div className="text-xs text-indigo-700 dark:text-indigo-300">
              <strong>Analysis Scope:</strong> {imageCount} image{imageCount > 1 ? 's' : ''} • 
              {imageCount > 1 ? ' Comparative analysis included' : ' Single-image deep dive'}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
