
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ResultsCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  activeAnnotation?: string | null;
  onAnnotationClick?: (annotationId: string) => void;
}

export const ResultsCanvasState = ({ 
  workflow, 
  selectedDevice, 
  activeAnnotation, 
  onAnnotationClick 
}: ResultsCanvasStateProps) => {
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  const handleAnnotationClick = (annotation: any) => {
    setSelectedFeedback(annotation);
    if (onAnnotationClick) {
      onAnnotationClick(annotation.id);
    }
  };

  if (workflow.aiAnnotations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Analysis Complete
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your design has been analyzed. Results from your existing system should appear here.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Viewing: {selectedDevice} layout
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show existing annotations with active highlighting
  const imageUrl = workflow.selectedImages[0];
  const aiAnnotations = workflow.aiAnnotations;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analysis Results
        </h3>
        <Badge variant="secondary">
          {aiAnnotations.length} insights found
        </Badge>
      </div>

      <div className="relative inline-block max-w-full">
        <img
          src={imageUrl}
          alt="Analyzed design"
          className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
          style={{ maxHeight: '70vh' }}
        />
        
        {/* Display AI annotations with active highlighting */}
        {aiAnnotations.map((annotation, index) => {
          const isActive = activeAnnotation === annotation.id;
          
          return (
            <div
              key={annotation.id || index}
              className={`absolute w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10 ${
                isActive 
                  ? 'bg-blue-500 border-blue-300 scale-125 ring-4 ring-blue-200 dark:ring-blue-800' 
                  : 'bg-red-500 border-white hover:scale-110 hover:ring-2 hover:ring-red-200 dark:hover:ring-red-800'
              }`}
              style={{
                left: `${annotation.x}%`,
                top: `${annotation.y}%`
              }}
              onClick={() => handleAnnotationClick(annotation)}
            >
              <span className="text-white text-xs font-bold">
                {annotation.id || index + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Show feedback if available */}
      {selectedFeedback && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {selectedFeedback.title || 'Analysis Insight'}
              </h4>
              {selectedFeedback.feedback && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFeedback.feedback}
                </p>
              )}
              {selectedFeedback.recommendation && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Recommendation:</strong> {selectedFeedback.recommendation}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedFeedback && aiAnnotations.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Click on any marker above to see detailed feedback.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
