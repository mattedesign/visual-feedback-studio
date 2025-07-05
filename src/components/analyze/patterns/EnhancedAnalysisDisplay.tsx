import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PatternHighlighter } from './PatternHighlighter';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Sparkles 
} from 'lucide-react';

interface AnalysisResult {
  summary: string;
  insights: Array<{
    type: string;
    severity: string;
    description: string;
    pattern?: string;
    validated?: boolean;
    validation_status?: string;
    evidence?: {
      perspectives: string[];
      agreement_score: number;
    };
  }>;
  recommendations: string[];
  confidence_score: number;
  pattern_validation_rate?: number;
}

interface EnhancedAnalysisDisplayProps {
  results: AnalysisResult;
  isMultiModel?: boolean;
}

export const EnhancedAnalysisDisplay: React.FC<EnhancedAnalysisDisplayProps> = ({ 
  results, 
  isMultiModel = false 
}) => {
  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  // Get validation badge
  const getValidationBadge = (validated?: boolean, status?: string) => {
    if (!validated) return null;
    
    const variants = {
      'confirmed': { color: 'bg-green-100 text-green-800', text: '✅ Verified' },
      'partially-confirmed': { color: 'bg-yellow-100 text-yellow-800', text: '⚠️ Partial' },
      'outdated': { color: 'bg-orange-100 text-orange-800', text: '🔄 Updated' },
      'incorrect': { color: 'bg-red-100 text-red-800', text: '❌ Changed' }
    };
    
    const variant = variants[status || 'confirmed'] || variants.confirmed;
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variant.color}`}>
        {variant.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Confidence and Pattern Validation Header */}
      {isMultiModel && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold">Pattern-Based Analysis</h2>
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex items-center space-x-3">
            {results.pattern_validation_rate !== undefined && (
              <Badge variant="outline" className="text-blue-600">
                {Math.round(results.pattern_validation_rate * 100)}% Patterns Validated
              </Badge>
            )}
            <Badge variant="outline" className="text-green-600">
              {Math.round(results.confidence_score * 100)}% Confidence
            </Badge>
          </div>
        </div>
      )}

      {/* Summary with Pattern Highlighting */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3 text-lg">Analysis Summary</h3>
        <div className="prose max-w-none">
          <PatternHighlighter 
            text={results.summary} 
            className="text-gray-700 leading-relaxed"
          />
        </div>
      </Card>

      {/* Pattern-Based Insights */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-lg">Key Findings</h3>
        <div className="space-y-3">
          {results.insights.map((insight, idx) => (
            <div 
              key={idx} 
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getSeverityIcon(insight.severity)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {insight.pattern && (
                        <Badge variant="secondary" className="text-xs">
                          {insight.pattern}
                        </Badge>
                      )}
                      {getValidationBadge(insight.validated, insight.validation_status)}
                    </div>
                    <PatternHighlighter 
                      text={insight.description}
                      className="text-sm text-gray-700"
                    />
                    {insight.evidence && (
                      <div className="mt-2 text-xs text-gray-500">
                        {insight.evidence.agreement_score && (
                          <span>
                            Agreement: {Math.round(insight.evidence.agreement_score * 100)}%
                          </span>
                        )}
                        {insight.evidence.perspectives && (
                          <span className="ml-3">
                            Sources: {insight.evidence.perspectives.join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Badge 
                  className={
                    insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                    insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }
                >
                  {insight.severity}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pattern-Enhanced Recommendations */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 text-lg">Recommendations</h3>
        <div className="space-y-2">
          {results.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <PatternHighlighter 
                text={rec}
                className="text-sm text-gray-700"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};