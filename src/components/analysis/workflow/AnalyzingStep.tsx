
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getAnnotationsForAnalysis } from '@/services/annotationsService';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  useEffect(() => {
    const performAnalysis = async () => {
      if (!workflow.selectedImageUrl) return;

      workflow.setIsAnalyzing(true);

      try {
        // Create analysis context from user annotations and general context
        let analysisPrompt = 'Analyze this design focusing on the user\'s specific concerns:\n\n';
        
        if (workflow.userAnnotations.length > 0) {
          analysisPrompt += 'User has highlighted these specific areas:\n';
          workflow.userAnnotations.forEach((annotation, index) => {
            analysisPrompt += `${index + 1}. At position ${annotation.x.toFixed(1)}%, ${annotation.y.toFixed(1)}%: ${annotation.comment}\n`;
          });
        }
        
        if (workflow.analysisContext.trim()) {
          analysisPrompt += `\nGeneral context: ${workflow.analysisContext}\n`;
        }
        
        analysisPrompt += '\nPlease provide specific feedback addressing these concerns and identify any additional UX, accessibility, or conversion optimization opportunities.';

        // Call the AI analysis edge function
        const { data, error } = await supabase.functions.invoke('analyze-design', {
          body: {
            imageUrl: workflow.selectedImageUrl,
            analysisId: workflow.currentAnalysis?.id || 'temp',
            analysisPrompt,
            designType: 'web'
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
          toast.success(`Analysis complete! Found ${data.totalAnnotations} insights.`);
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

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-12 text-center">
          <div className="space-y-6">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-2">Analyzing Your Design</h3>
              <p className="text-slate-400">
                Claude is analyzing your design based on your specific comments and requests...
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium mb-2">Analysis Focus:</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• {workflow.userAnnotations.length} specific areas you highlighted</li>
                {workflow.analysisContext && <li>• Your general context and requirements</li>}
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
