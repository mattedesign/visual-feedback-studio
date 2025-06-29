
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysis } from '@/hooks/analysis/useAIAnalysis';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, ChevronDown, ChevronUp, Play } from 'lucide-react';

interface StudioChatProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const StudioChat = ({ workflow }: StudioChatProps) => {
  const { analyzeImages, isAnalyzing } = useAIAnalysis();
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded for better UX

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
        deviceType: 'desktop'
      });

      if (result.success && result.annotations) {
        workflow.setAiAnnotations(result.annotations);
        workflow.goToStep('results');
      } else {
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

  const hasImages = workflow.selectedImages.length > 0;
  const hasContext = workflow.analysisContext.trim().length > 0;

  // Show for both upload and annotate steps
  if (workflow.currentStep !== 'upload' && workflow.currentStep !== 'annotate') {
    return null;
  }

  // Context suggestion chips
  const contextSuggestions = [
    'UX & Usability Review',
    'Accessibility Audit', 
    'Conversion Optimization',
    'Mobile Experience Check',
    'Visual Design Analysis'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    const currentText = workflow.analysisContext.trim();
    const newText = currentText ? `${currentText}, ${suggestion}` : suggestion;
    workflow.setAnalysisContext(newText);
  };

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Status indicators
  const getStatusColor = (condition: boolean) => condition ? 'text-green-600' : 'text-gray-400';
  const getStatusIcon = (condition: boolean) => condition ? '✓' : '○';

  return (
    <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
      {!isExpanded ? (
        /* Collapsed State - Prominent call-to-action */
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
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
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Analysis
                </Button>
              ) : (
                <Button
                  onClick={handleExpandToggle}
                  variant="outline"
                  size="lg"
                  className="font-semibold px-6 py-3"
                >
                  Set Up Analysis
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Expanded State - Full interface */
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
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>

            {/* Quick context suggestions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>Quick analysis types:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {contextSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors border border-gray-200 dark:border-slate-600"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis context input */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What would you like to analyze? <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={workflow.analysisContext}
                onChange={(e) => workflow.setAnalysisContext(e.target.value)}
                placeholder="Describe what you want to analyze (e.g., 'Check this checkout flow for usability issues and conversion blockers')"
                className="min-h-[100px] text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                rows={4}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Be specific about what you want to focus on. This will help provide more targeted insights.
              </div>
            </div>

            {/* Analysis button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 text-lg font-semibold shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Zap className="w-6 h-6 mr-3 animate-pulse" />
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
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
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
