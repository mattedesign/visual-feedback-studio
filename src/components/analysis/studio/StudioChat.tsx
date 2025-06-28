
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysis } from '@/hooks/analysis/useAIAnalysis';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';

interface StudioChatProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const StudioChat = ({ workflow }: StudioChatProps) => {
  const [contextInput, setContextInput] = useState('');
  const { analyzeImages, isAnalyzing } = useAIAnalysis();

  const contextSuggestions = [
    'Focus on accessibility and WCAG compliance',
    'Analyze for conversion optimization',
    'Review mobile responsiveness',
    'Check visual hierarchy and readability',
    'Evaluate user experience flow',
    'Assess brand consistency'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setContextInput(suggestion);
  };

  const handleAnalyze = async () => {
    if (!contextInput.trim() || workflow.selectedImages.length === 0) return;

    console.log('🚀 Starting analysis from StudioChat');

    // Set the context in workflow
    workflow.setAnalysisContext(contextInput);
    
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
        analysisPrompt: contextInput,
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
                   contextInput.trim().length > 0 && 
                   !isAnalyzing;

  // Only show on annotate step
  if (workflow.currentStep !== 'annotate') {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Context Suggestions */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            What would you like to analyze? Try one of these:
          </p>
          <div className="flex flex-wrap gap-2">
            {contextSuggestions.map((suggestion, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 text-xs"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Analysis Context Input & Analyze Button */}
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Textarea
              placeholder="Describe what you'd like to analyze about your design..."
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              className="min-h-[80px] bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
              rows={3}
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed h-[80px] px-6"
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
          The more specific you are, the better insights you'll get. 
          {workflow.selectedImages.length === 0 && " Please upload and select images first."}
        </p>
      </div>
    </div>
  );
};
