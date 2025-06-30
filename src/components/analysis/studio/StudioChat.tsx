
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIProviderConfig } from '@/hooks/analysis/useAIProviderConfig';
import { SimplifiedContextInput } from '../workflow/components/SimplifiedContextInput';

interface StudioChatProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const StudioChat = ({
  workflow
}: StudioChatProps) => {
  const { getRequestConfig } = useAIProviderConfig();

  const handleAnalyze = async () => {
    if (!workflow.analysisContext.trim() || workflow.selectedImages.length === 0) return;
    
    console.log('🚀 StudioChat: Starting analysis - transitioning to analyzing step');
    console.log('📊 Analysis params:', {
      selectedImages: workflow.selectedImages.length,
      context: workflow.analysisContext.length,
      annotations: workflow.getTotalAnnotationsCount(),
      aiConfig: getRequestConfig()
    });
    
    // Store AI configuration in the workflow for use during analysis
    workflow.setAIProviderConfig(getRequestConfig());
    
    workflow.goToStep('analyzing');
  };

  const canAnalyze = workflow.selectedImages.length > 0 && workflow.analysisContext.trim().length > 0 && !workflow.isAnalyzing;
  const hasImages = workflow.selectedImages.length > 0;

  if (workflow.currentStep !== 'upload' && workflow.currentStep !== 'annotate') {
    return null;
  }

  return (
    <div className="bg-transparent">
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Simplified Context Input with Model Selection */}
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
            <div className="text-center mt-4">
              <p className="hidden text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-700">
                ⚠️ Please upload and select images first before starting the analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
