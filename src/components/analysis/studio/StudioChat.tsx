
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysis } from '@/hooks/analysis/useAIAnalysis';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';
import { AnalysisContextPanel } from '../workflow/components/AnalysisContextPanel';

interface StudioChatProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const StudioChat = ({ workflow }: StudioChatProps) => {
  const { analyzeImages, isAnalyzing } = useAIAnalysis();

  const handleAnalyze = async () => {
    if (!workflow.analysisContext.trim() || workflow.selectedImages.length === 0) return;

    console.log('🚀 Starting analysis from StudioChat');

    // Start analyzing step
    workflow.goToStep('analyzing');

    try {
      // Prepare user annotations for analysis
      const userAnnotations = workflow.imageAnnotations.flatMap(imageAnnotation => 
        imageAnnotation.annotations.map((annotation: any) => ({
          imageUrl: imageAnnotation.imageUrl,
          x: annotation.x,
          y: annotation.y,
          comment: annotation.comment,
          id: annotation.id
        }))
      );

      // Call the AI analysis
      const result = await analyzeImages({
        imageUrls: workflow.selectedImages,
        userAnnotations,
        analysisPrompt: workflow.analysisContext,
        deviceType: 'desktop' // This should come from selectedDevice in the future
      });

      if (result.success && result.annotations) {
        workflow.setAiAnnotations(result.annotations);
        workflow.goToStep('results');
      } else {
        // If analysis failed, go back to annotate step
        workflow.goToStep('annotate');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      workflow.goToStep('annotate');
    }
  };

  const canAnalyze = workflow.selectedImages.length > 0 && 
                   workflow.analysisContext.trim().length > 0 && 
                   !isAnalyzing;

  // Only show on annotate step
  if (workflow.currentStep !== 'annotate') {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Context Panel */}
        <AnalysisContextPanel 
          workflow={workflow} 
          showAsExpanded={true}
          showAsCard={false}
          className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg"
        />

        {/* Analyze Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Zap className="w-5 h-5 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Design
              </>
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Make sure to set your analysis context above before running the analysis.
          {workflow.selectedImages.length === 0 && " Please upload and select images first."}
        </p>
      </div>
    </div>
  );
};
