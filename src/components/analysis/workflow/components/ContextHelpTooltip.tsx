
import { HelpCircle, Target, Zap, Eye, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ContextHelpTooltipProps {
  className?: string;
}

export const ContextHelpTooltip = ({ className = "" }: ContextHelpTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={className}>
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="space-y-3">
            <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              How Context Improves Analysis
            </div>
            
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex items-start gap-2">
                <Zap className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                <div>
                  <strong>More Targeted:</strong> Specific context helps AI focus on relevant issues
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Eye className="w-3 h-3 mt-0.5 text-purple-500 flex-shrink-0" />
                <div>
                  <strong>Better Insights:</strong> Context guides research and best practices lookup
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                <div>
                  <strong>Actionable Results:</strong> Focused analysis provides clearer next steps
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Example:</strong> "E-commerce checkout optimization" will focus on conversion, 
                cart abandonment, and payment flow issues.
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
