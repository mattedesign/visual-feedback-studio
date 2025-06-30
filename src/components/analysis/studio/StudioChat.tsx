
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SimplifiedContextInput } from '../workflow/components/SimplifiedContextInput';

interface StudioChatProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const StudioChat = ({ workflow }: StudioChatProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAnalyze = async () => {
    if (!workflow.analysisContext.trim() || workflow.selectedImages.length === 0) return;

    console.log('🚀 StudioChat: Starting analysis - transitioning to analyzing step');
    console.log('📊 Analysis params:', {
      selectedImages: workflow.selectedImages.length,
      context: workflow.analysisContext.length,
      annotations: workflow.getTotalAnnotationsCount()
    });
    
    workflow.goToStep('analyzing');
  };

  const canAnalyze = workflow.selectedImages.length > 0 && 
                   workflow.analysisContext.trim().length > 0 && 
                   !workflow.isAnalyzing;

  const hasImages = workflow.selectedImages.length > 0;
  const hasContext = workflow.analysisContext.trim().length > 0;

  if (workflow.currentStep !== 'upload' && workflow.currentStep !== 'annotate') {
    return null;
  }

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const getStatusColor = (condition: boolean) => condition ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500';
  const getStatusIcon = (condition: boolean) => condition ? '✓' : '○';

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-lg">
      {!isExpanded ? (
        /* Collapsed State */
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ready to Analyze?
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <span className={`flex items-center space-x-1 ${getStatusColor(hasImages)}`}>
                    <span>{getStatusIcon(hasImages)}</span>
                    <span>Images ({workflow.selectedImages.length})</span>
                  </span>
                  <span className={`flex items-center space-x-1 ${getStatusColor(hasContext)}`}>
                    <span>{getStatusIcon(hasContext)}</span>
                    <span>Context</span>
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandToggle}
                className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Expanded State - Clean Interface */
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header with status and collapse button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Analysis Setup
                </h3>
                <div className="flex items-center space-x-3 text-sm">
                  <span className={`flex items-center space-x-1 ${getStatusColor(hasImages)}`}>
                    <span>{getStatusIcon(hasImages)}</span>
                    <span>Images ({workflow.selectedImages.length})</span>
                  </span>
                  <span className={`flex items-center space-x-1 ${getStatusColor(hasContext)}`}>
                    <span>{getStatusIcon(hasContext)}</span>
                    <span>Context</span>
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandToggle}
                className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Simplified Context Input */}
            <SimplifiedContextInput
              analysisContext={workflow.analysisContext}
              onAnalysisContextChange={workflow.setAnalysisContext}
              onAnalyze={handleAnalyze}
              canAnalyze={canAnalyze}
              isAnalyzing={workflow.isAnalyzing}
              uploadedImageCount={workflow.selectedImages.length}
            />

            {/* Helper text */}
            {!hasImages && (
              <div className="text-center">
                <p className="hidden text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  ⚠️ Please upload and select images first before starting the analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
