
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Zap } from 'lucide-react';

interface ResearchBadgeProps {
  knowledgeSourcesUsed?: number;
  ragEnhanced?: boolean;
  className?: string;
}

export const ResearchBadge = ({ 
  knowledgeSourcesUsed = 0, 
  ragEnhanced = false,
  className = ""
}: ResearchBadgeProps) => {
  if (!ragEnhanced || knowledgeSourcesUsed === 0) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 px-4 py-2 text-sm font-bold shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200">
        <GraduationCap className="w-4 h-4 mr-2" />
        Research-Backed Analysis
      </Badge>
      
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
        <BookOpen className="w-3 h-3 text-emerald-600" />
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          Based on {knowledgeSourcesUsed} UX research sources
        </span>
      </div>
      
      <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400">
        <Zap className="w-3 h-3 mr-1" />
        Premium Analysis
      </Badge>
    </div>
  );
};
