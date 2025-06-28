import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Brain, Search, Zap } from 'lucide-react';

interface AnalyzingCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingCanvasState = ({ workflow }: AnalyzingCanvasStateProps) => {
  const analysisSteps = [
    { label: 'Image Processing', icon: Search, status: 'complete' },
    { label: 'UX Analysis', icon: Brain, status: 'active' },
    { label: 'Generating Insights', icon: Zap, status: 'pending' },
  ];

  return (
    <div className="h-full flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Analyzing Your Design
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI is examining your {workflow.selectedImages.length > 1 ? `${workflow.selectedImages.length} designs` : 'design'} for UX improvements, accessibility issues, and optimization opportunities.
              </p>
            </div>
            
            {/* Analysis Steps */}
            <div className="space-y-3">
              {analysisSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-center space-x-3 text-left">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'complete' ? 'bg-green-500' :
                      step.status === 'active' ? 'bg-blue-500' :
                      'bg-gray-300 dark:bg-slate-600'
                    }`}>
                      {step.status === 'active' ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      step.status === 'complete' ? 'text-green-600 dark:text-green-400' :
                      step.status === 'active' ? 'text-blue-600 dark:text-blue-400' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="bg-gray-200 dark:bg-slate-600 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: '75%' }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Processing images...</span>
                <span>75%</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 dark:bg-slate-800 rounded-lg p-4 text-left">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">What we're analyzing:</h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• User experience and navigation patterns</li>
                <li>• Accessibility compliance (WCAG guidelines)</li>
                <li>• Visual hierarchy and design consistency</li>
                <li>• Conversion optimization opportunities</li>
                {workflow.getTotalAnnotationsCount() > 0 && (
                  <li>• Your {workflow.getTotalAnnotationsCount()} custom annotations</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};