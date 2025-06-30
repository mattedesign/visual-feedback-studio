
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { EnhancedAnalysisContextPanel } from '../workflow/components/EnhancedAnalysisContextPanel';

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
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExpandToggle}
                  className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all hover:scale-105 shadow-lg"
                >
                  <Sparkles className="w-6 h-6" />
                </button>
                
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    Ready to Analyze?
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {hasImages && hasContext 
                      ? `${workflow.selectedImages.length} image${workflow.selectedImages.length > 1 ? 's' : ''} ready for analysis`
                      : 'Add context to start your analysis'
                    }
                  </div>
                </div>
              </div>

              {canAnalyze ? (
                <Button
                  onClick={handleAnalyze}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-3 shadow-lg"
                  disabled={workflow.isAnalyzing}
                >
                  {workflow.isAnalyzing ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Start Analysis
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleExpandToggle}
                  variant="outline"
                  size="lg"
                  className="font-semibold px-6 py-3 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  Set Up Analysis
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Expanded State */
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

            {/* Enhanced Analysis Context Panel */}
            <EnhancedAnalysisContextPanel
              analysisContext={workflow.analysisContext}
              onAnalysisContextChange={workflow.setAnalysisContext}
              uploadedImageCount={workflow.selectedImages.length}
              showAsExpanded={true}
              showAsCard={true}
            />

            {/* Analysis button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 text-lg font-semibold shadow-lg"
              >
                {workflow.isAnalyzing ? (
                  <>
                    <Sparkles className="w-6 h-6 mr-3 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-3" />
                    Start Analysis
                  </>
                )}
              </Button>
            </div>

            {/* Helper text */}
            {!hasImages && (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
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
