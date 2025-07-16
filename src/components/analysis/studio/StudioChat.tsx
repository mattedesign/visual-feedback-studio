
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { SimplifiedContextInput } from '../workflow/components/SimplifiedContextInput';
import { toast } from 'sonner';

interface StudioChatProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  sidebarCollapsed: boolean;
}

export const StudioChat = ({
  workflow,
  sidebarCollapsed
}: StudioChatProps) => {
  const handleAnalyze = async () => {
    if (!workflow.analysisContext.trim()) {
      toast.error('Please provide analysis context - describe what you want me to analyze');
      return;
    }
    
    if (workflow.selectedImages.length === 0) {
      toast.error('Please select at least one image to analyze');
      return;
    }
    
    console.log('🚀 StudioChat: Starting optimized analysis');
    console.log('📊 Analysis params:', {
      selectedImages: workflow.selectedImages.length,
      context: workflow.analysisContext.length,
      annotations: workflow.getTotalAnnotationsCount()
    });
    
    try {
      await workflow.startAnalysis();
      console.log('✅ Analysis started successfully');
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
    }
  };

  const canAnalyze = workflow.selectedImages.length > 0 && workflow.analysisContext.trim().length > 0 && !workflow.isAnalyzing;
  const hasImages = workflow.selectedImages.length > 0;

  if (workflow.currentStep !== 'upload' && workflow.currentStep !== 'annotate') {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 bg-transparent pointer-events-none" 
         style={{ left: sidebarCollapsed ? '64px' : '300px' }}>
      <div className="px-4 pt-4 pb-0 pointer-events-auto">
        <div className="max-w-4xl mx-auto">
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
