
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContextIntelligenceDisplayProps {
  analysisContext: string;
  focusAreas: string[];
  researchSourcesCount?: number;
  isAnalyzing?: boolean;
}

export const ContextIntelligenceDisplay = ({
  analysisContext,
  focusAreas,
  researchSourcesCount,
  isAnalyzing = false
}: ContextIntelligenceDisplayProps) => {
  if (!analysisContext && focusAreas.length === 0) return null;

  return (
    <Card className="bg-slate-700/50 border-slate-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
          🧠 Context Intelligence
          {isAnalyzing && (
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {analysisContext && (
          <div>
            <h4 className="text-xs font-medium text-slate-300 mb-1">Your Context:</h4>
            <p className="text-xs text-slate-200 italic bg-slate-800/50 p-2 rounded">
              "{analysisContext}"
            </p>
          </div>
        )}
        
        {focusAreas.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-slate-300 mb-2">Detected Focus Areas:</h4>
            <div className="flex flex-wrap gap-1">
              {focusAreas.map((area) => (
                <Badge key={area} variant="secondary" className="text-xs bg-blue-600/80 text-white">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {researchSourcesCount && (
          <div className="pt-2 border-t border-slate-600">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{researchSourcesCount} research sources active</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
