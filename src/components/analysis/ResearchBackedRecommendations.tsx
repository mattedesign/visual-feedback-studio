
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';

// Local type definitions since ragService was removed
interface ResearchSource {
  title: string;
  keyInsight: string;
  source: string;
  relevanceScore: number;
}

interface ResearchBackedRecommendation {
  category: string;
  priority: string;
  recommendation: string;
  reasoning: string;
  supportingResearch: ResearchSource[];
  implementationGuidance: string;
}

interface ResearchSummary {
  totalSourcesCited: number;
  primaryCategories: string[];
  confidenceScore: number;
}

interface EnhancedAnalysisResult {
  researchSummary: ResearchSummary;
  methodology: string;
  recommendations: ResearchBackedRecommendation[];
}

interface ResearchBackedRecommendationsProps {
  analysisResult: EnhancedAnalysisResult;
  onImplementationClick?: (recommendation: ResearchBackedRecommendation) => void;
}

export const ResearchBackedRecommendations: React.FC<ResearchBackedRecommendationsProps> = ({
  analysisResult,
  onImplementationClick
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ux': return '👤';
      case 'visual': return '🎨';
      case 'accessibility': return '♿';
      case 'conversion': return '📈';
      default: return '💡';
    }
  };

  return (
    <div className="space-y-6">
      {/* Research Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <BookOpen className="h-5 w-5" />
            Research-Backed Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {analysisResult.researchSummary.totalSourcesCited}
              </div>
              <div className="text-blue-600">Research Sources</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {analysisResult.researchSummary.primaryCategories.length}
              </div>
              <div className="text-blue-600">Research Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {(analysisResult.researchSummary.confidenceScore * 100).toFixed(0)}%
              </div>
              <div className="text-blue-600">Confidence Score</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Methodology:</strong> {analysisResult.methodology}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Research-Backed Recommendations ({analysisResult.recommendations.length})
        </h3>
        
        {analysisResult.recommendations.map((recommendation, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getCategoryIcon(recommendation.category)}
                    {recommendation.recommendation}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <Badge variant="outline">{recommendation.category}</Badge>
                  </div>
                </div>
                {onImplementationClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onImplementationClick(recommendation)}
                  >
                    View Implementation
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Reasoning */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Research-Based Reasoning:</h5>
                <p className="text-gray-700 text-sm">{recommendation.reasoning}</p>
              </div>

              {/* Supporting Research */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-sm p-0 h-auto">
                    <ChevronDown className="h-4 w-4" />
                    Supporting Research ({recommendation.supportingResearch.length} sources)
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  {recommendation.supportingResearch.map((research, researchIndex) => (
                    <div key={researchIndex} className="p-3 bg-gray-50 rounded-lg border-l-2 border-l-gray-300">
                      <div className="flex items-start justify-between mb-2">
                        <h6 className="font-medium text-gray-900 text-sm">{research.title}</h6>
                        <Badge variant="secondary" className="text-xs">
                          {(research.relevanceScore * 100).toFixed(0)}% match
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-xs mb-2">{research.keyInsight}</p>
                      <p className="text-gray-500 text-xs">
                        <strong>Source:</strong> {research.source}
                      </p>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Implementation Guidance */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h6 className="font-medium text-green-900 text-sm mb-1">Implementation Guidance:</h6>
                    <p className="text-green-700 text-sm">{recommendation.implementationGuidance}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
