
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface RAGStatusIndicatorProps {
  hasResearchContext: boolean;
  researchSourcesCount: number;
  isAnalyzing?: boolean;
  isBuilding?: boolean;
}

export const RAGStatusIndicator: React.FC<RAGStatusIndicatorProps> = ({
  hasResearchContext,
  researchSourcesCount,
  isAnalyzing = false,
  isBuilding = false
}) => {
  if (isBuilding) {
    return (
      <div className="flex items-center gap-2 text-blue-400 animate-pulse">
        <Sparkles className="w-4 h-4 animate-spin" />
        <span className="text-sm">Building research context...</span>
      </div>
    );
  }

  if (isAnalyzing && hasResearchContext) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Research-enhanced analysis in progress...</span>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex items-center gap-2 text-blue-400">
        <Sparkles className="w-4 h-4 animate-spin" />
        <span className="text-sm">Standard analysis in progress...</span>
      </div>
    );
  }

  if (hasResearchContext && researchSourcesCount > 0) {
    return (
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-green-500" />
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
          Research-Enhanced
        </Badge>
        <span className="text-sm text-green-600">
          {researchSourcesCount} UX research sources
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <AlertCircle className="w-4 h-4 text-yellow-500" />
      <Badge variant="outline" className="text-yellow-700 border-yellow-300">
        Standard Analysis
      </Badge>
      <span className="text-sm text-yellow-600">
        No specific research found
      </span>
    </div>
  );
};
