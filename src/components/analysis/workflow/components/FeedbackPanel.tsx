
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
  
  // Enhanced validation with detailed analysis
  const validateAnnotations = (annotations: Annotation[]) => {
    console.log('=== FEEDBACKPANEL VALIDATION ANALYSIS ===');
    console.log('Input annotations:', annotations.length);
    
    const validationResults = annotations.map((annotation, index) => {
      // Check if feedback exists and is meaningful
      const hasValidFeedback = annotation.feedback && 
        annotation.feedback.trim().length > 0 && 
        !annotation.feedback.toLowerCase().includes('no feedback') &&
        !annotation.feedback.toLowerCase().includes('feedback not provided') &&
        !annotation.feedback.toLowerCase().includes('tbd') &&
        annotation.feedback.trim() !== '';
      
      // Check if basic required fields exist
      const hasBasicFields = annotation.severity && annotation.category;
      
      // For debugging: check all fields
      const hasAllFields = hasBasicFields && 
        annotation.implementationEffort && 
        annotation.businessImpact;
      
      const isValid = hasValidFeedback && hasBasicFields;
      
      console.log(`Annotation ${index + 1} validation:`, {
        id: annotation.id,
        isValid,
        hasValidFeedback,
        hasBasicFields,
        hasAllFields,
        feedback: {
          exists: !!annotation.feedback,
          length: annotation.feedback?.length || 0,
          preview: annotation.feedback?.substring(0, 50),
          isEmpty: !annotation.feedback || annotation.feedback.trim().length === 0,
          hasPlaceholder: annotation.feedback?.toLowerCase().includes('no feedback') ||
                          annotation.feedback?.toLowerCase().includes('tbd')
        },
        fields: {
          severity: annotation.severity,
          category: annotation.category,
          implementationEffort: annotation.implementationEffort,
          businessImpact: annotation.businessImpact
        },
        coordinates: {
          x: annotation.x,
          y: annotation.y
        }
      });
      
      return { annotation, isValid, hasValidFeedback, hasBasicFields, hasAllFields };
    });
    
    const validAnnotations = validationResults
      .filter(result => result.isValid)
      .map(result => result.annotation);
    
    const invalidAnnotations = validationResults.filter(result => !result.isValid);
    
    console.log('Validation summary:', {
      total: annotations.length,
      valid: validAnnotations.length,
      invalid: invalidAnnotations.length,
      invalidReasons: invalidAnnotations.map(result => ({
        id: result.annotation.id,
        missingFeedback: !result.hasValidFeedback,
        missingBasicFields: !result.hasBasicFields,
        feedbackIssue: !result.annotation.feedback ? 'Missing' : 
                      result.annotation.feedback.trim().length === 0 ? 'Empty' :
                      result.annotation.feedback.toLowerCase().includes('no feedback') ? 'Placeholder' : 'Other'
      }))
    });
    
    return validAnnotations;
  };

  const validCurrentAnnotations = validateAnnotations(currentImageAIAnnotations);
  const validAllAnnotations = validateAnnotations(aiAnnotations);

  // Enhanced debug logging with more context
  console.log('=== FEEDBACKPANEL ENHANCED DEBUG ===');
  console.log('Component state:', {
    totalAnnotations: aiAnnotations.length,
    validAnnotations: validAllAnnotations.length,
    currentImageAnnotations: currentImageAIAnnotations.length,
    validCurrentImageAnnotations: validCurrentAnnotations.length,
    activeImageIndex,
    isMultiImage,
    filteredOutCount: aiAnnotations.length - validAllAnnotations.length
  });

  // Analyze the first few annotations in detail
  console.log('=== SAMPLE ANNOTATION ANALYSIS ===');
  aiAnnotations.slice(0, 3).forEach((annotation, index) => {
    console.log(`Sample annotation ${index + 1}:`, {
      id: annotation.id,
      feedback: {
        content: annotation.feedback,
        length: annotation.feedback?.length || 0,
        hasContent: !!annotation.feedback && annotation.feedback.trim().length > 0,
        isPlaceholder: annotation.feedback?.toLowerCase().includes('no feedback') ||
                      annotation.feedback?.toLowerCase().includes('tbd')
      },
      categorization: {
        severity: annotation.severity,
        category: annotation.category,
        implementationEffort: annotation.implementationEffort,
        businessImpact: annotation.businessImpact
      },
      positioning: {
        x: annotation.x,
        y: annotation.y,
        imageIndex: annotation.imageIndex
      },
      completeness: {
        hasAllRequiredFields: !!(annotation.feedback && annotation.severity && annotation.category),
        hasOptionalFields: !!(annotation.implementationEffort && annotation.businessImpact),
        totalFieldsPresent: Object.values(annotation).filter(v => v !== undefined && v !== null && v !== '').length
      }
    });
  });

  // Show detailed validation breakdown
  if (aiAnnotations.length !== validAllAnnotations.length) {
    console.log('=== VALIDATION BREAKDOWN ===');
    const invalidAnnotations = aiAnnotations.filter(ann => 
      !validAllAnnotations.some(valid => valid.id === ann.id)
    );
    
    console.log('Invalid annotations analysis:', invalidAnnotations.map(ann => ({
      id: ann.id,
      issues: {
        noFeedback: !ann.feedback,
        emptyFeedback: ann.feedback?.trim().length === 0,
        placeholderFeedback: ann.feedback?.toLowerCase().includes('no feedback') ||
                             ann.feedback?.toLowerCase().includes('tbd'),
        noSeverity: !ann.severity,
        noCategory: !ann.category,
        noImplementationEffort: !ann.implementationEffort,
        noBusinessImpact: !ann.businessImpact
      },
      feedbackSample: ann.feedback?.substring(0, 100)
    })));
  }

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
              <div className="text-xs text-amber-500 mt-1">
                Check console for validation details
              </div>
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
        
        {/* Enhanced debugging information when no valid annotations */}
        {validAllAnnotations.length === 0 && aiAnnotations.length > 0 ? (
          <div className="text-center py-8 text-amber-600 bg-amber-50 rounded-lg border-2 border-amber-200">
            <div className="space-y-3">
              <div className="text-4xl">⚠️</div>
              <h3 className="text-lg font-medium">Analysis Data Processing Issue Detected</h3>
              <div className="text-sm space-y-2">
                <p>Found {aiAnnotations.length} analysis results, but they appear to have validation issues.</p>
                <div className="bg-white p-3 rounded border text-xs text-left max-w-md mx-auto">
                  <strong>Validation Debug Info:</strong>
                  <div className="mt-1 space-y-1">
                    <div>Total annotations received: {aiAnnotations.length}</div>
                    <div>Valid annotations: {validAllAnnotations.length}</div>
                    <div>Filtered out: {aiAnnotations.length - validAllAnnotations.length}</div>
                    <div>Sample feedback: "{aiAnnotations[0]?.feedback?.substring(0, 50) || 'None'}"</div>
                    <div>Sample severity: {aiAnnotations[0]?.severity || 'None'}</div>
                    <div>Sample category: {aiAnnotations[0]?.category || 'None'}</div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  This suggests the AI response format may not match our validation criteria.
                  Check browser console for detailed analysis.
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

      {/* Analysis Quality Indicator with Debug Info */}
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
            {aiAnnotations.length !== validAllAnnotations.length && (
              <div className="flex justify-between">
                <span>Validation Rate:</span>
                <span className="font-medium text-amber-600">
                  {Math.round((validAllAnnotations.length / aiAnnotations.length) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Panel (only shown when there are validation issues) */}
      {process.env.NODE_ENV === 'development' && aiAnnotations.length !== validAllAnnotations.length && (
        <div className="border-t pt-4 mt-6">
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
              🔧 Debug Information ({aiAnnotations.length - validAllAnnotations.length} filtered annotations)
            </summary>
            <div className="mt-2 bg-gray-50 p-3 rounded text-xs">
              <p className="font-medium mb-2">Validation Issues Found:</p>
              <ul className="space-y-1">
                {aiAnnotations.filter(ann => !validAllAnnotations.some(valid => valid.id === ann.id)).map(ann => (
                  <li key={ann.id} className="text-gray-600">
                    • ID: {ann.id.substring(0, 8)}... - Issues: {
                      [
                        !ann.feedback && 'No feedback',
                        ann.feedback?.trim().length === 0 && 'Empty feedback',
                        ann.feedback?.toLowerCase().includes('no feedback') && 'Placeholder feedback',
                        !ann.severity && 'No severity',
                        !ann.category && 'No category'
                      ].filter(Boolean).join(', ')
                    }
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};
