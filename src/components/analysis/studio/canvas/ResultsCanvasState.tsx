
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

  // SAFETY CHECK: Ensure annotations exist and are valid with better validation
  const safeAnnotations = Array.isArray(workflow.aiAnnotations) 
    ? workflow.aiAnnotations.filter((annotation, index) => {
        // More comprehensive validation
        if (!annotation || typeof annotation !== 'object') {
          console.warn(`Invalid annotation at index ${index}:`, annotation);
          return false;
        }
        
        // Ensure required properties exist
        if (!annotation.id && annotation.id !== 0) {
          console.warn(`Annotation missing ID at index ${index}:`, annotation);
          return false;
        }
        
        // Ensure position properties are valid numbers
        if (typeof annotation.x !== 'number' || typeof annotation.y !== 'number') {
          console.warn(`Annotation has invalid position at index ${index}:`, annotation);
          return false;
        }
        
        return true;
      })
    : [];

  const handleAnnotationClick = (annotation: any, annotationIndex: number) => {
    console.log('🎯 ResultsCanvasState annotation clicked:', { 
      annotationId: annotation?.id, 
      annotationIndex, 
      displayNumber: annotationIndex + 1 
    });
    
    if (annotation && annotation.id) {
      setSelectedFeedback(annotation);
      if (onAnnotationClick && typeof onAnnotationClick === 'function') {
        onAnnotationClick(annotation.id);
      }
    }
  };

  // Early return if no valid annotations
  if (safeAnnotations.length === 0) {
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
              Your design has been analyzed. Results should appear here.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Viewing: {selectedDevice} layout
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // SAFETY CHECK: Ensure image data exists
  const currentImageUrl = workflow.activeImageUrl || (workflow.selectedImages && workflow.selectedImages[0]) || '';
  const selectedImages = Array.isArray(workflow.selectedImages) ? workflow.selectedImages : [];
  const uploadedFiles = Array.isArray(workflow.uploadedFiles) ? workflow.uploadedFiles : selectedImages;
  
  if (!currentImageUrl) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Image Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Unable to display analysis results without an image.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentImageIndex = uploadedFiles.indexOf(currentImageUrl);
  const safeCurrentImageIndex = currentImageIndex >= 0 ? currentImageIndex : 0;
  
  // CRITICAL FIX: Safely filter annotations for the current image only
  const filteredAiAnnotations = safeAnnotations.filter(annotation => {
    const annotationImageIndex = annotation.imageIndex ?? 0;
    return annotationImageIndex === safeCurrentImageIndex;
  });

  console.log('🔢 ResultsCanvasState rendering filtered annotations:', {
    currentImageIndex: safeCurrentImageIndex,
    totalAnnotations: safeAnnotations.length,
    filteredAnnotationsCount: filteredAiAnnotations.length,
    imageUrl: currentImageUrl
  });

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Analysis Results - Image {safeCurrentImageIndex + 1}
        </h3>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">
            {filteredAiAnnotations.length} insights found
          </Badge>
          {uploadedFiles.length > 1 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {safeCurrentImageIndex + 1} of {uploadedFiles.length}
            </div>
          )}
        </div>
      </div>

      <div className="relative inline-block max-w-full">
        <img
          src={currentImageUrl}
          alt="Analyzed design"
          className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
          style={{ maxHeight: '70vh' }}
          onError={(e) => {
            console.error('Image failed to load:', currentImageUrl);
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* FIXED ANNOTATION RENDERING: More robust key generation and validation */}
        {filteredAiAnnotations.map((annotation, index) => {
          // COMPREHENSIVE SAFETY CHECKS for each annotation
          if (!annotation || typeof annotation !== 'object') {
            console.warn('Skipping invalid annotation:', annotation);
            return null;
          }

          // Generate a more robust key
          const annotationId = annotation.id || `fallback-${index}-${Date.now()}`;
          const isActive = activeAnnotation === annotationId;
          
          // Validate position values with fallbacks
          const xPosition = (typeof annotation.x === 'number' && !isNaN(annotation.x)) ? annotation.x : 50;
          const yPosition = (typeof annotation.y === 'number' && !isNaN(annotation.y)) ? annotation.y : 50;
          
          // Ensure positions are within reasonable bounds
          const safeX = Math.max(0, Math.min(100, xPosition));
          const safeY = Math.max(0, Math.min(100, yPosition));
          
          return (
            <div
              key={`annotation-${annotationId}-${index}`}
              className={`absolute w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10 ${
                isActive 
                  ? 'bg-blue-500 border-blue-300 scale-125 ring-4 ring-blue-200 dark:ring-blue-800' 
                  : 'bg-red-500 border-white hover:scale-110 hover:ring-2 hover:ring-red-200 dark:hover:ring-red-800'
              }`}
              style={{
                left: `${safeX}%`,
                top: `${safeY}%`
              }}
              onClick={() => handleAnnotationClick(annotation, index)}
            >
              <span className="text-white text-xs font-bold leading-none">
                {index + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* SAFE FEEDBACK RENDERING: Show feedback if available */}
      {selectedFeedback && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {selectedFeedback.title || 'Analysis Insight'}
              </h4>
              {selectedFeedback.feedback && typeof selectedFeedback.feedback === 'string' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFeedback.feedback}
                </p>
              )}
              {selectedFeedback.recommendation && typeof selectedFeedback.recommendation === 'string' && (
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

      {!selectedFeedback && filteredAiAnnotations.length > 0 && (
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
