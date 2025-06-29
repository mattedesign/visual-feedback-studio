
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertCircle } from 'lucide-react';

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
  // 🔥 SHOW DISABLED STATE - Since RAG is currently disabled
  const ragEnabled = false; // Changed from true to false
  const displaySourcesCount = researchSourcesCount || 0;
  
  return (
    <div className="flex items-center gap-2">
      <AlertCircle className="w-4 h-4 text-yellow-400" />
      <Badge variant="outline" className="text-yellow-300 border-yellow-400 bg-yellow-900/20">
        RAG Disabled
      </Badge>
      <span className="text-sm text-yellow-300">
        {isAnalyzing 
          ? `Running basic analysis (enhanced features temporarily disabled)`
          : `Enhanced research features are temporarily disabled`
        }
      </span>
    </div>
  );
};
