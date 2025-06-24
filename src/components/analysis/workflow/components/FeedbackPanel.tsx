
import { Annotation } from '@/types/analysis';
import { CurrentImageSummary } from './CurrentImageSummary';
import { OverallAnalysisSummary } from './OverallAnalysisSummary';
import { CategorySummaries } from './CategorySummaries';
import { PrioritySummary } from './PrioritySummary';
import { DetailedAnnotationsList } from './DetailedAnnotationsList';
import { DetailedFeedbackCard } from './DetailedFeedbackCard';

interface FeedbackPanelProps {
  currentImageAIAnnotations: Annotation[];
  currentImageUserAnnotations: Array<{
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
  activeImageIndex: number;
  isMultiImage: boolean;
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  aiAnnotations: Annotation[];
  getSeverityColor: (severity: string) => string;
}

export const FeedbackPanel = ({
  currentImageAIAnnotations,
  currentImageUserAnnotations,
  activeImageIndex,
  isMultiImage,
  activeAnnotation,
  onAnnotationClick,
  aiAnnotations,
  getSeverityColor,
}: FeedbackPanelProps) => {
  // Enhanced feedback validation
  const validateAnnotations = (annotations: Annotation[]) => {
    return annotations.filter(annotation => {
      const hasValidFeedback = annotation.feedback && 
        annotation.feedback.trim() !== '' && 
        annotation.feedback !== 'No feedback provided' &&
        annotation.feedback !== 'Feedback not provided';
      
      const hasValidMetadata = annotation.severity && 
        annotation.category && 
        annotation.implementationEffort && 
        annotation.businessImpact;
      
      return hasValidFeedback && hasValidMetadata;
    });
  };

  const validCurrentAnnotations = validateAnnotations(currentImageAIAnnotations);
  const validAllAnnotations = validateAnnotations(aiAnnotations);

  // Debug logging for annotation validation
  console.log('FeedbackPanel Debug:', {
    totalAnnotations: aiAnnotations.length,
    validAnnotations: validAllAnnotations.length,
    currentImageAnnotations: currentImageAIAnnotations.length,
    validCurrentImageAnnotations: validCurrentAnnotations.length,
    sampleAnnotation: aiAnnotations[0] ? {
      hasFeedback: !!aiAnnotations[0].feedback,
      feedbackLength: aiAnnotations[0].feedback?.length || 0,
      feedbackPreview: aiAnnotations[0].feedback?.substring(0, 50) || 'N/A'
    } : null
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Analysis Summary Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            📊 Analysis Summary
          </h2>
          {validAllAnnotations.length !== aiAnnotations.length && (
            <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              {aiAnnotations.length - validAllAnnotations.length} incomplete annotations filtered
            </div>
          )}
        </div>
        
        <OverallAnalysisSummary 
          annotations={validAllAnnotations}
          isMultiImage={isMultiImage}
          imageCount={isMultiImage ? Math.max(...aiAnnotations.map(a => (a.imageIndex ?? 0) + 1)) : 1}
        />
        
        <CategorySummaries annotations={validAllAnnotations} />
        
        <PrioritySummary annotations={validAllAnnotations} />
        
        {/* Research Enhancement Indicator */}
        {validAllAnnotations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <span className="text-sm">🔬</span>
              <span className="text-sm font-medium">Research-Enhanced Analysis</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              This analysis is backed by UX research and industry best practices for more reliable insights.
            </p>
          </div>
        )}
      </div>

      {/* Current Image Summary (for multi-image) */}
      {isMultiImage && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            🖼️ Image {activeImageIndex + 1} Analysis
          </h3>
          <CurrentImageSummary
            currentImageAIAnnotations={validCurrentAnnotations}
            currentImageUserAnnotations={currentImageUserAnnotations}
            isMultiImage={isMultiImage}
          />
        </div>
      )}

      {/* Enhanced Individual Comments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
            💬 Detailed Feedback
          </h2>
          <div className="text-sm text-gray-600">
            {isMultiImage ? validCurrentAnnotations.length : validAllAnnotations.length} 
            {' '}insights available
          </div>
        </div>
        
        {/* Show message if no valid annotations */}
        {validAllAnnotations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="space-y-3">
              <div className="text-4xl">🤔</div>
              <h3 className="text-lg font-medium">No Detailed Feedback Available</h3>
              <div className="text-sm space-y-2">
                <p>This could happen if:</p>
                <ul className="text-left inline-block space-y-1">
                  <li>• Analysis is still processing</li>
                  <li>• No significant issues were found</li>
                  <li>• There was an issue with AI analysis</li>
                </ul>
                <p className="mt-4 text-xs text-gray-400">
                  Try running the analysis again or check the console for technical details.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <DetailedAnnotationsList
            annotations={isMultiImage ? validCurrentAnnotations : validAllAnnotations}
            activeAnnotation={activeAnnotation}
            onAnnotationClick={onAnnotationClick}
            getSeverityColor={getSeverityColor}
            isMultiImage={isMultiImage}
          />
        )}
      </div>

      {/* Enhanced Selected Annotation Details */}
      {activeAnnotation && validAllAnnotations.some(a => a.id === activeAnnotation) && (
        <DetailedFeedbackCard
          activeAnnotation={activeAnnotation}
          aiAnnotations={validAllAnnotations}
          isMultiImage={isMultiImage}
          getSeverityColor={getSeverityColor}
        />
      )}

      {/* Analysis Quality Indicator */}
      {validAllAnnotations.length > 0 && (
        <div className="border-t pt-4 mt-6">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Analysis Quality:</span>
              <span className="font-medium text-green-600">
                {validAllAnnotations.length > 3 ? 'Comprehensive' : 
                 validAllAnnotations.length > 1 ? 'Good' : 'Basic'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Research-Backed:</span>
              <span className="font-medium text-blue-600">Yes</span>
            </div>
            <div className="flex justify-between">
              <span>Categories Covered:</span>
              <span className="font-medium">
                {[...new Set(validAllAnnotations.map(a => a.category))].length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
