import { useState, useEffect } from 'react';
import { Annotation } from '@/types/analysis';
import { MobileFriendlyAnnotationViewer } from './MobileFriendlyAnnotationViewer';
import { SwipeableAnnotationList } from './SwipeableAnnotationList';
import { AnnotationFilterControls } from './AnnotationFilterControls';
import { TopRecommendationsQuickView } from './TopRecommendationsQuickView';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOptimizedAnnotationsListProps {
  annotations: Annotation[];
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  getSeverityColor: (severity: string) => string;
  isMultiImage: boolean;
  researchCitations?: string[];
}

export const MobileOptimizedAnnotationsList = ({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  getSeverityColor,
  isMultiImage,
  researchCitations = []
}: MobileOptimizedAnnotationsListProps) => {
  const isMobile = useIsMobile();

  // Use the new mobile-friendly viewer for mobile devices
  if (isMobile) {
    return (
      <MobileFriendlyAnnotationViewer
        annotations={annotations}
        activeAnnotation={activeAnnotation}
        onAnnotationClick={onAnnotationClick}
        getSeverityColor={getSeverityColor}
        isMultiImage={isMultiImage}
        researchCitations={researchCitations}
      />
    );
  }

  // Desktop version - keep existing functionality
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [showTopRecommendations, setShowTopRecommendations] = useState(true);

  // Filter annotations based on selected filters
  const filteredAnnotations = annotations.filter(annotation => {
    const severityMatch = severityFilter.length === 0 || severityFilter.includes(annotation.severity);
    const categoryMatch = categoryFilter.length === 0 || categoryFilter.includes(annotation.category);
    return severityMatch && categoryMatch;
  });

  const handleReset = () => {
    setSeverityFilter([]);
    setCategoryFilter([]);
  };

  if (annotations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No insights available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Recommendations Quick View */}
      {showTopRecommendations && (
        <TopRecommendationsQuickView
          annotations={annotations}
          onAnnotationClick={onAnnotationClick}
          onViewAllClick={() => setShowTopRecommendations(false)}
        />
      )}

      {/* Filter Controls */}
      <AnnotationFilterControls
        totalCount={filteredAnnotations.length}
        severityFilter={severityFilter}
        categoryFilter={categoryFilter}
        onSeverityFilterChange={setSeverityFilter}
        onCategoryFilterChange={setCategoryFilter}
        onReset={handleReset}
      />

      {/* Annotations List */}
      <SwipeableAnnotationList
        annotations={filteredAnnotations}
        activeAnnotation={activeAnnotation}
        onAnnotationClick={onAnnotationClick}
        getSeverityColor={getSeverityColor}
        isMultiImage={isMultiImage}
        researchCitations={researchCitations}
      />

      {/* Back to Top Recommendations */}
      {!showTopRecommendations && (
        <div className="text-center">
          <button
            onClick={() => {
              setShowTopRecommendations(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm underline"
          >
            ↑ Back to Top Recommendations
          </button>
        </div>
      )}
    </div>
  );
};
