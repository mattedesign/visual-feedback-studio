export const FeedbackPanel = ({
  currentImageAIAnnotations,
  currentImageUserAnnotations,
  activeImageIndex,
  isMultiImage,
  activeAnnotation,
  onAnnotationClick,
  aiAnnotations,
  getSeverityColor,
  businessImpact,
  insights,
}: FeedbackPanelProps) => {
  
  // ✅ ADD: Debug logging for FeedbackPanel
  console.log('🔍 FEEDBACK PANEL DEBUG:', {
    isMultiImage,
    activeImageIndex,
    currentImageAIAnnotationsCount: currentImageAIAnnotations.length,
    totalAIAnnotationsCount: aiAnnotations.length,
    currentImageAIAnnotations,
    aiAnnotations,
    annotationsBeingPassedToList: isMultiImage ? currentImageAIAnnotations : aiAnnotations
  });

  return (
    <div className="space-y-8">
      // ... rest of your component


import { Annotation } from '@/types/analysis';
import { CurrentImageSummary } from './CurrentImageSummary';
import { OverallAnalysisSummary } from './OverallAnalysisSummary';
import { CategorySummaries } from './CategorySummaries';
import { PrioritySummary } from './PrioritySummary';
import { DetailedAnnotationsList } from './DetailedAnnotationsList';
import { DetailedFeedbackCard } from './DetailedFeedbackCard';
import { BusinessImpactSummary } from './BusinessImpactSummary';

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
  businessImpact?: {
    totalPotentialRevenue: string;
    quickWinsAvailable: number;
    criticalIssuesCount: number;
    averageROIScore: number;
    implementationRoadmap: {
      immediate: Annotation[];
      shortTerm: Annotation[];
      longTerm: Annotation[];
    };
  };
  insights?: {
    topRecommendation: string;
    quickestWin: string;
    highestImpact: string;
    competitiveAdvantage?: string;
    researchEvidence?: string;
  };
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
  businessImpact,
  insights,
}: FeedbackPanelProps) => {
  return (
    <div className="space-y-8">
      {/* Business Impact Summary (if available) */}
      {businessImpact && (
        <div className="mb-8">
          <BusinessImpactSummary 
            businessImpact={businessImpact}
            insights={insights}
          />
        </div>
      )}

      {/* Analysis Summary Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Analysis Summary
            </span>
          </h2>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Comprehensive insights and recommendations from your UX analysis
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <OverallAnalysisSummary 
            annotations={aiAnnotations}
            isMultiImage={isMultiImage}
            imageCount={isMultiImage ? Math.max(...aiAnnotations.map(a => (a.imageIndex ?? 0) + 1)) : 1}
          />
          
          <div className="border-t border-gray-100 pt-6">
            <CategorySummaries annotations={aiAnnotations} />
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <PrioritySummary annotations={aiAnnotations} />
          </div>
        </div>
      </div>

      {/* Current Image Summary (for multi-image) */}
      {isMultiImage && (
        <div className="mb-6">
          <CurrentImageSummary
            currentImageAIAnnotations={currentImageAIAnnotations}
            currentImageUserAnnotations={currentImageUserAnnotations}
            isMultiImage={isMultiImage}
          />
        </div>
      )}

      {/* Individual Comments Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-2xl">💬</span>
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Individual Comments
            </span>
          </h2>
          <p className="text-sm text-gray-600 mt-2 font-medium">
            Detailed feedback on specific areas of your design
          </p>
        </div>
        
        <div className="p-6">
          <DetailedAnnotationsList
            annotations={isMultiImage ? currentImageAIAnnotations : aiAnnotations}
            activeAnnotation={activeAnnotation}
            onAnnotationClick={onAnnotationClick}
            getSeverityColor={getSeverityColor}
            isMultiImage={isMultiImage}
          />
        </div>
      </div>

      {/* Selected Annotation Details */}
      {activeAnnotation && (
        <div className="mt-6">
          <DetailedFeedbackCard
            activeAnnotation={activeAnnotation}
            aiAnnotations={aiAnnotations}
            isMultiImage={isMultiImage}
            getSeverityColor={getSeverityColor}
          />
        </div>
      )}
    </div>
  );
};
