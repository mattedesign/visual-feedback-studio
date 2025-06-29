
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookOpen } from 'lucide-react';

interface CitationIndicatorProps {
  citationNumber: number;
  citationText?: string;
  className?: string;
}

export const CitationIndicator = ({ 
  citationNumber, 
  citationText,
  className = "" 
}: CitationIndicatorProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`inline-flex items-center gap-1 ml-1 text-xs cursor-help border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-600 dark:hover:bg-emerald-900/40 transition-colors ${className}`}
          >
            <BookOpen className="w-2.5 h-2.5" />
            [{citationNumber}]
          </Badge>
        </TooltipTrigger>
        {citationText && (
          <TooltipContent 
            side="top" 
            className="max-w-xs bg-emerald-900 text-emerald-100 border-emerald-700"
          >
            <p className="text-sm font-medium">Research Source:</p>
            <p className="text-xs mt-1 opacity-90">{citationText}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
