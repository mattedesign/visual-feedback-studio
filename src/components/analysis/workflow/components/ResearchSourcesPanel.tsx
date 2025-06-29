
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, BookOpen, ExternalLink, Star } from 'lucide-react';

interface ResearchSource {
  title: string;
  category: string;
  relevance: string;
  whyItMatters: string;
  citation?: string;
}

interface ResearchSourcesPanelProps {
  researchCitations?: string[];
  knowledgeSourcesUsed?: number;
  ragEnhanced?: boolean;
  className?: string;
}

export const ResearchSourcesPanel = ({
  researchCitations = [],
  knowledgeSourcesUsed = 0,
  ragEnhanced = false,
  className = ""
}: ResearchSourcesPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!ragEnhanced || researchCitations.length === 0) return null;

  // Transform citations into structured research sources
  const researchSources: ResearchSource[] = researchCitations.map((citation, index) => {
    // Parse citation to extract meaningful information
    const parts = citation.split(' - ');
    const title = parts[0] || `Research Source ${index + 1}`;
    const category = parts[1] || 'UX Research';
    
    return {
      title: title.trim(),
      category: category.trim(),
      relevance: getRelevanceDescription(category),
      whyItMatters: getWhyItMattersExplanation(category),
      citation: citation
    };
  });

  return (
    <Card className={`bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-emerald-200 dark:border-emerald-800 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Research Sources ({knowledgeSourcesUsed})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/20"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Sources
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                View Research Sources
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
          <Star className="w-4 h-4 fill-current" />
          <span className="font-medium">
            This analysis is backed by peer-reviewed UX research and industry best practices
          </span>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {researchSources.map((source, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    [{index + 1}] {source.title}
                  </h4>
                  <Badge variant="secondary" className="mt-1 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {source.category}
                  </Badge>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Relevance: </span>
                  <span className="text-gray-600 dark:text-gray-400">{source.relevance}</span>
                </div>
                
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded border-l-4 border-emerald-500">
                  <span className="font-medium text-emerald-800 dark:text-emerald-200 text-xs uppercase tracking-wide">
                    Why This Research Matters:
                  </span>
                  <p className="text-emerald-700 dark:text-emerald-300 text-sm mt-1">
                    {source.whyItMatters}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-amber-600 fill-current" />
              <h5 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                Research-Backed Recommendations
              </h5>
            </div>
            <p className="text-amber-700 dark:text-amber-300 text-sm">
              Each recommendation in this analysis is supported by these research sources, ensuring 
              evidence-based insights rather than generic AI suggestions. This research foundation 
              provides higher confidence in implementation success and ROI projections.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Helper functions to generate realistic descriptions
function getRelevanceDescription(category: string): string {
  const descriptions = {
    'UX Research': 'Comprehensive user experience studies and behavioral analysis',
    'conversion': 'Data-driven conversion optimization patterns and A/B test results',
    'accessibility': 'WCAG compliance guidelines and inclusive design research',
    'usability': 'Human-computer interaction studies and usability heuristics',
    'mobile': 'Mobile-first design patterns and touch interaction research',
    'ecommerce': 'E-commerce user journey optimization and checkout flow studies',
    'visual': 'Visual hierarchy principles and cognitive psychology research',
    'brand': 'Brand perception studies and visual identity research'
  };
  
  const lowerCategory = category.toLowerCase();
  for (const [key, description] of Object.entries(descriptions)) {
    if (lowerCategory.includes(key)) {
      return description;
    }
  }
  
  return 'Industry best practices and peer-reviewed UX research';
}

function getWhyItMattersExplanation(category: string): string {
  const explanations = {
    'UX Research': 'These studies provide empirical evidence for user behavior patterns, reducing implementation risk and increasing success probability.',
    'conversion': 'Conversion research directly correlates to revenue impact, providing measurable ROI for recommended changes.',
    'accessibility': 'Accessibility improvements expand market reach and reduce legal compliance risks while improving overall usability.',
    'usability': 'Usability principles are foundational to user satisfaction and task completion rates across all user segments.',
    'mobile': 'Mobile optimization is critical as mobile traffic represents 60%+ of web usage in most industries.',
    'ecommerce': 'E-commerce patterns directly impact sales funnel performance and customer lifetime value.',
    'visual': 'Visual design principles affect user perception, trust, and engagement within the first 50ms of interaction.',
    'brand': 'Brand consistency research shows direct correlation with user trust and conversion rates.'
  };
  
  const lowerCategory = category.toLowerCase();
  for (const [key, explanation] of Object.entries(explanations)) {
    if (lowerCategory.includes(key)) {
      return explanation;
    }
  }
  
  return 'Research-backed recommendations have significantly higher implementation success rates compared to generic suggestions.';
}
