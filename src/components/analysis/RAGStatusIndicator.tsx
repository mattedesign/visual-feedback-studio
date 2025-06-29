
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle } from 'lucide-react';

interface RAGStatusIndicatorProps {
  hasResearchContext: boolean;
  researchSourcesCount: number;
  isAnalyzing?: boolean;
}

export const RAGStatusIndicator: React.FC<RAGStatusIndicatorProps> = ({
  hasResearchContext,
  researchSourcesCount,
  isAnalyzing = false
}) => {
  // ✅ RAG IS NOW ENABLED
  const ragEnabled = true;
  const displaySourcesCount = researchSourcesCount || 0;
  
  if (ragEnabled && hasResearchContext && displaySourcesCount > 0) {
    return (
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-green-400" />
        <Badge variant="outline" className="text-green-300 border-green-400 bg-green-900/20">
          RAG Enhanced
        </Badge>
        <span className="text-sm text-green-300">
          {isAnalyzing 
            ? `Analyzing with ${displaySourcesCount} research sources...`
            : `Enhanced with ${displaySourcesCount} research insights`
          }
        </span>
      </div>
    );
  }

  if (ragEnabled && isAnalyzing) {
    return (
      <div className="flex items-center gap-2">
        <Brain className="w-4 h-4 text-blue-400 animate-pulse" />
        <Badge variant="outline" className="text-blue-300 border-blue-400 bg-blue-900/20">
          Building Context
        </Badge>
        <span className="text-sm text-blue-300">
          Gathering research insights...
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-blue-400" />
      <Badge variant="outline" className="text-blue-300 border-blue-400 bg-blue-900/20">
        RAG Ready
      </Badge>
      <span className="text-sm text-blue-300">
        Research-enhanced analysis available
      </span>
    </div>
  );
};
