
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  useEffect(() => {
    const performAnalysis = async () => {
      if (workflow.selectedImages.length === 0) return;

      workflow.setIsAnalyzing(true);

      try {
        // Create analysis context from user annotations and general context
        let analysisPrompt = '';
        
        const isComparative = workflow.selectedImages.length > 1;
        
        if (isComparative) {
          analysisPrompt = `Perform comparative analysis across ${workflow.selectedImages.length} design images. `;
          analysisPrompt += 'Please analyze each image individually and then provide comparative insights.\n\n';
        } else {
          analysisPrompt = 'Analyze this design focusing on the user\'s specific concerns:\n\n';
        }
        
        // Add image-specific annotations
        workflow.imageAnnotations.forEach((imageAnnotation, imageIndex) => {
          if (imageAnnotation.annotations.length > 0) {
            analysisPrompt += `Image ${imageIndex + 1} - User highlighted areas:\n`;
            imageAnnotation.annotations.forEach((annotation, index) => {
              analysisPrompt += `${index + 1}. At position ${annotation.x.toFixed(1)}%, ${annotation.y.toFixed(1)}%: ${annotation.comment}\n`;
            });
            analysisPrompt += '\n';
          }
        });
        
        if (workflow.analysisContext.trim()) {
          analysisPrompt += `General context and comparative analysis request: ${workflow.analysisContext}\n\n`;
        }
        
        if (isComparative) {
          analysisPrompt += 'Please provide specific feedback for each image and highlight key differences, similarities, and recommendations for comparative improvements.';
        } else {
          analysisPrompt += 'Please provide specific feedback addressing these concerns and identify any additional UX, accessibility, or conversion optimization opportunities.';
        }

        // Call the AI analysis edge function with multiple images
        const { data, error } = await supabase.functions.invoke('analyze-design', {
          body: {
            imageUrls: workflow.selectedImages,
            imageUrl: workflow.selectedImages[0], // Backward compatibility
            analysisId: workflow.currentAnalysis?.id || 'temp',
            analysisPrompt,
            designType: 'web',
            isComparative
          }
        });

        if (error) {
          console.error('AI analysis error:', error);
          throw new Error(error.message || 'AI analysis failed');
        }

        console.log('AI analysis completed:', data);

        if (data.success && data.annotations) {
          workflow.setAiAnnotations(data.annotations);
          workflow.goToStep('results');
          const imageText = workflow.selectedImages.length > 1 ? `${workflow.selectedImages.length} images` : 'image';
          const analysisType = isComparative ? 'Comparative analysis' : 'Analysis';
          toast.success(`${analysisType} complete! Found ${data.totalAnnotations} insights across ${imageText}.`);
        } else {
          throw new Error('Invalid response from AI analysis');
        }
        
      } catch (error) {
        console.error('Error during analysis:', error);
        toast.error(`Analysis failed: ${error.message}`);
        // Stay on analyzing step but show error state
      } finally {
        workflow.setIsAnalyzing(false);
      }
    };

    performAnalysis();
  }, [workflow]);

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
                  ? `Claude is performing comparative analysis across ${workflow.selectedImages.length} images based on your comments...`
                  : 'Claude is analyzing your design based on your specific comments and requests...'
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
