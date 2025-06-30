
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Zap, Star, Award } from 'lucide-react';

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
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Primary Research Badge - Hero Treatment */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl shadow-lg">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-md">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 px-6 py-3 text-base font-bold shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 mb-2">
            <Star className="w-5 h-5 mr-2 fill-current" />
            Research-Backed Analysis
          </Badge>
          <p className="text-emerald-800 dark:text-emerald-200 text-sm font-semibold">
            Based on {knowledgeSourcesUsed} relevant UX studies from our 272-entry database
          </p>
        </div>
      </div>
      
      {/* Supporting Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border-2 border-emerald-200 dark:border-emerald-700 shadow-sm">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
            Evidence-Based Insights
          </span>
        </div>
        
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 px-4 py-2 text-sm font-bold shadow-md hover:from-amber-600 hover:to-orange-600 transition-all duration-200">
          <Zap className="w-4 h-4 mr-2" />
          Premium Analysis
        </Badge>
        
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-full border border-blue-200 dark:border-blue-700">
          <GraduationCap className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            272+ Studies
          </span>
        </div>
      </div>
    </div>
  );
};
