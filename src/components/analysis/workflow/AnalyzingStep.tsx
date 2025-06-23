
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysis } from '@/hooks/analysis/useAIAnalysis';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  const { handleAnalyze } = useAIAnalysis({
    imageUrls: workflow.selectedImages,
    currentAnalysis: workflow.currentAnalysis,
    setIsAnalyzing: workflow.setIsAnalyzing,
    setAnnotations: workflow.setAiAnnotations,
    isComparative: workflow.selectedImages.length > 1
  });

  useEffect(() => {
    const performAnalysis = async () => {
      if (workflow.selectedImages.length === 0) return;

      try {
        await handleAnalyze(workflow.analysisContext, workflow.imageAnnotations);
        workflow.goToStep('results');
      } catch (error) {
        console.error('Error during analysis:', error);
        // Stay on analyzing step to show error state
      }
    };

    performAnalysis();
  }, [workflow, handleAnalyze]);

  const totalAnnotations = workflow.getTotalAnnotationsCount();
  const isMultiImage = workflow.selectedImages.length > 1;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-12 text-center">
          <div className="space-y-6">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-2">
                {isMultiImage ? 'Analyzing Your Designs' : 'Analyzing Your Design'}
              </h3>
              <p className="text-slate-400">
                {isMultiImage 
                  ? `AI is performing comparative analysis across ${workflow.selectedImages.length} images based on your comments...`
                  : 'AI is analyzing your design based on your specific comments and requests...'
                }
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium mb-2">Analysis Focus:</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• {totalAnnotations} specific areas you highlighted across {isMultiImage ? 'all images' : 'the image'}</li>
                {workflow.analysisContext && <li>• Your general context and requirements</li>}
                {isMultiImage && <li>• Comparative analysis between selected images</li>}
                <li>• UX and accessibility best practices</li>
                <li>• Conversion optimization opportunities</li>
              </ul>
            </div>

            <div className="animate-pulse bg-gradient-to-r from-blue-500/20 to-purple-500/20 h-2 rounded-full">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
