
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedContext } from '@/services/analysis/enhancedRagService';

interface EnhancedAnalysisDisplayProps {
  enhancedContext: EnhancedContext | null;
  isAnalyzing?: boolean;
}

export const EnhancedAnalysisDisplay = ({ 
  enhancedContext, 
  isAnalyzing = false 
}: EnhancedAnalysisDisplayProps) => {
  if (!enhancedContext) return null;

  return (
    <Card className="bg-slate-700/50 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
          🧠 Enhanced Analysis Context
          {isAnalyzing && (
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Vision Analysis Summary */}
        <div>
          <h4 className="text-xs font-medium text-slate-300 mb-2">Vision Analysis:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/50 p-2 rounded">
              <span className="text-slate-400">Industry:</span>
              <br />
              <span className="text-slate-200">
                {enhancedContext.visionAnalysis.industry.industry}
              </span>
              <Badge variant="outline" className="ml-1 text-xs">
                {Math.round(enhancedContext.visionAnalysis.industry.confidence * 100)}%
              </Badge>
            </div>
            <div className="bg-slate-800/50 p-2 rounded">
              <span className="text-slate-400">Layout:</span>
              <br />
              <span className="text-slate-200">
                {enhancedContext.visionAnalysis.layout.type}
              </span>
              <Badge variant="outline" className="ml-1 text-xs">
                {Math.round(enhancedContext.visionAnalysis.layout.confidence * 100)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Knowledge Sources */}
        <div>
          <h4 className="text-xs font-medium text-slate-300 mb-2">Knowledge Sources:</h4>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-600/80 text-white">
              {enhancedContext.knowledgeSourcesUsed} sources
            </Badge>
            <Badge variant="outline" className="text-xs">
              {Math.round(enhancedContext.confidenceScore * 100)}% confidence
            </Badge>
          </div>
        </div>

        {/* Search Queries */}
        {enhancedContext.searchQueries.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-slate-300 mb-2">Research Areas:</h4>
            <div className="flex flex-wrap gap-1">
              {enhancedContext.searchQueries.slice(0, 4).map((query, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-blue-600/60">
                  {query.category.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Processing Stats */}
        <div className="pt-2 border-t border-slate-600">
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>Processing: {enhancedContext.processingTime}ms</div>
            <div>Citations: {enhancedContext.citations.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
