
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
  // Fixed validation logic - be more lenient with what constitutes valid feedback
  const validateAnnotations = (annotations: Annotation[]) => {
    return annotations.filter(annotation => {
      // Check if feedback exists and is not empty or placeholder text
      const hasValidFeedback = annotation.feedback && 
        annotation.feedback.trim().length > 0 && 
        !annotation.feedback.toLowerCase().includes('no feedback') &&
        !annotation.feedback.toLowerCase().includes('feedback not provided');
      
      // Check if basic required fields exist
      const hasBasicFields = annotation.severity && annotation.category;
      
      // Be more lenient - only require feedback and basic categorization
      console.log('Annotation validation:', {
        id: annotation.id,
        hasValidFeedback,
        hasBasicFields,
        feedbackPreview: annotation.feedback?.substring(0, 50),
        severity: annotation.severity,
        category: annotation.category
      });
      
      return hasValidFeedback && hasBasicFields;
    });
  };

  const validCurrentAnnotations = validateAnnotations(currentImageAIAnnotations);
  const validAllAnnotations = validateAnnotations(aiAnnotations);

  // Enhanced debug logging
  console.log('FeedbackPanel Enhanced Debug:', {
    totalAnnotations: aiAnnotations.length,
    validAnnotations: validAllAnnotations.length,
    currentImageAnnotations: currentImageAIAnnotations.length,
    validCurrentImageAnnotations: validCurrentAnnotations.length,
    firstAnnotationSample: aiAnnotations[0] ? {
      id: aiAnnotations[0].id,
      feedback: aiAnnotations[0].feedback,
      feedbackLength: aiAnnotations[0].feedback?.length || 0,
      severity: aiAnnotations[0].severity,
      category: aiAnnotations[0].category,
      implementationEffort: aiAnnotations[0].implementationEffort,
      businessImpact: aiAnnotations[0].businessImpact
    } : null,
    validationResults: aiAnnotations.slice(0, 3).map(ann => ({
      id: ann.id,
      hasValidFeedback: ann.feedback && ann.feedback.trim().length > 0,
      feedbackPreview: ann.feedback?.substring(0, 30),
      hasRequiredFields: !!(ann.severity && ann.category)
    }))
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
        
        {/* Show message if no valid annotations but raw annotations exist */}
        {validAllAnnotations.length === 0 && aiAnnotations.length > 0 ? (
          <div className="text-center py-8 text-amber-600 bg-amber-50 rounded-lg border-2 border-amber-200">
            <div className="space-y-3">
              <div className="text-4xl">⚠️</div>
              <h3 className="text-lg font-medium">Analysis Data Found But Processing Issue Detected</h3>
              <div className="text-sm space-y-2">
                <p>We found {aiAnnotations.length} analysis results, but they may be incomplete.</p>
                <div className="bg-white p-3 rounded border text-xs text-left max-w-md mx-auto">
                  <strong>Debug Info:</strong>
                  <div className="mt-1 space-y-1">
                    <div>Total annotations: {aiAnnotations.length}</div>
                    <div>Valid annotations: {validAllAnnotations.length}</div>
                    <div>Sample feedback: "{aiAnnotations[0]?.feedback?.substring(0, 50) || 'None'}"</div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  This suggests a data formatting issue in the analysis pipeline.
                </p>
              </div>
            </div>
          </div>
        ) : validAllAnnotations.length === 0 ? (
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
