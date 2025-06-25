
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface RAGStatusIndicatorProps {
  hasResearchContext: boolean;
  researchSourcesCount: number;
  isAnalyzing?: boolean;
}

export const RAGStatusIndicator: React.FC<RAGStatusIndicatorProps> = () => {
  // RAG DISABLED - Always show disabled state
  return (
    <div className="flex items-center gap-2">
      <AlertCircle className="w-4 h-4 text-gray-500" />
      <Badge variant="outline" className="text-gray-700 border-gray-300">
        RAG Disabled
      </Badge>
      <span className="text-sm text-gray-600">
        Research enhancement disabled
      </span>
    </div>
  );
};
