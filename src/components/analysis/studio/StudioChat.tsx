
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysis } from '@/hooks/analysis/useAIAnalysis';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisContextPanel } from '../workflow/components/AnalysisContextPanel';

interface StudioChatProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const StudioChat = ({ workflow }: StudioChatProps) => {
  const { analyzeImages, isAnalyzing } = useAIAnalysis();
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Context suggestion chips
  const contextSuggestions = [
    'UX & Usability',
    'Accessibility Review', 
    'Conversion Focus',
    'Mobile Experience',
    'Visual Design'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    const currentText = workflow.analysisContext.trim();
    const newText = currentText ? `${currentText}, ${suggestion}` : suggestion;
    workflow.setAnalysisContext(newText);
    
    // Auto-expand when user adds a suggestion
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
      {!isExpanded ? (
        /* Collapsed State - Simple input with sparkles icon */
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
              <button
                onClick={handleExpandToggle}
                className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
              </button>
              
              <div 
                className="flex-1 text-gray-600 dark:text-gray-400 cursor-pointer"
                onClick={handleExpandToggle}
              >
                Describe what you'd like to analyze...
              </div>
              
              {workflow.selectedImages.length === 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Upload images first
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Expanded State - Full interface */
        <div className="p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Header with collapse button */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Analysis Context
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandToggle}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Context suggestion chips */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Sparkles className="w-3 h-3" />
                <span>Quick context suggestions:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {contextSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Full context input */}
            <div>
              <Textarea
                value={workflow.analysisContext}
                onChange={(e) => workflow.setAnalysisContext(e.target.value)}
                placeholder="Add context for analyzing all images (e.g., 'Focus on checkout flow accessibility', 'Compare mobile responsiveness')"
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                rows={3}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This context will guide the AI analysis and help provide more relevant insights.
              </div>
            </div>

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
      )}
    </div>
  );
};
