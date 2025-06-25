
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
    <div className="space-y-6">
      {/* Business Impact Summary (if available) */}
      {businessImpact && (
        <BusinessImpactSummary 
          businessImpact={businessImpact}
          insights={insights}
        />
      )}

      {/* Analysis Summary Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
          📊 Analysis Summary
        </h2>
        
        <OverallAnalysisSummary 
          annotations={aiAnnotations}
          isMultiImage={isMultiImage}
          imageCount={isMultiImage ? Math.max(...aiAnnotations.map(a => (a.imageIndex ?? 0) + 1)) : 1}
        />
        
        <CategorySummaries annotations={aiAnnotations} />
        
        <PrioritySummary annotations={aiAnnotations} />
      </div>

      {/* Current Image Summary (for multi-image) */}
      {isMultiImage && (
        <CurrentImageSummary
          currentImageAIAnnotations={currentImageAIAnnotations}
          currentImageUserAnnotations={currentImageUserAnnotations}
          isMultiImage={isMultiImage}
        />
      )}

      {/* Individual Comments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
          💬 Individual Comments
        </h2>
        
        <DetailedAnnotationsList
          annotations={isMultiImage ? currentImageAIAnnotations : aiAnnotations}
          activeAnnotation={activeAnnotation}
          onAnnotationClick={onAnnotationClick}
          getSeverityColor={getSeverityColor}
          isMultiImage={isMultiImage}
        />
      </div>

      {/* Selected Annotation Details */}
      <DetailedFeedbackCard
        activeAnnotation={activeAnnotation}
        aiAnnotations={aiAnnotations}
        isMultiImage={isMultiImage}
        getSeverityColor={getSeverityColor}
      />
    </div>
  );
};
