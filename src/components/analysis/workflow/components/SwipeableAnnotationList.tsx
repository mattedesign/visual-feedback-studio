
import { useState, useEffect } from 'react';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { Annotation } from '@/types/analysis';
import { ProgressiveAnnotationCard } from './ProgressiveAnnotationCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SwipeableAnnotationListProps {
  annotations: Annotation[];
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  getSeverityColor: (severity: string) => string;
  isMultiImage?: boolean;
  researchCitations?: string[];
}

export const SwipeableAnnotationList = ({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  getSeverityColor,
  isMultiImage = false,
  researchCitations = []
}: SwipeableAnnotationListProps) => {
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset to first annotation when list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [annotations]);

  const handleSwipeLeft = () => {
    if (currentIndex < annotations.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const swipeRef = useSwipeNavigation({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    enabled: isMobile && annotations.length > 1
  });

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < annotations.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  // Helper function to assign citations
  const getCitationForAnnotation = (annotation: Annotation, index: number): { number: number; text?: string } => {
    if (researchCitations.length === 0) return { number: 0 };
    
    const categoryKeywords = {
      'ux': ['ux', 'usability', 'user experience'],
      'visual': ['visual', 'design', 'aesthetic'],
      'accessibility': ['accessibility', 'wcag', 'inclusive'],
      'conversion': ['conversion', 'cro', 'optimize'],
      'brand': ['brand', 'identity', 'trust']
    };
    
    const annotationCategory = annotation.category.toLowerCase();
    const keywords = categoryKeywords[annotationCategory as keyof typeof categoryKeywords] || [];
    
    for (let i = 0; i < researchCitations.length; i++) {
      const citation = researchCitations[i].toLowerCase();
      if (keywords.some(keyword => citation.includes(keyword))) {
        return { number: i + 1, text: researchCitations[i] };
      }
    }
    
    const citationIndex = index % researchCitations.length;
    return { number: citationIndex + 1, text: researchCitations[citationIndex] };
  };

  if (annotations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No insights available.</p>
      </div>
    );
  }

  // Mobile swipe view
  if (isMobile && annotations.length > 1) {
    const currentAnnotation = annotations[currentIndex];
    const citation = getCitationForAnnotation(currentAnnotation, currentIndex);

    return (
      <div className="space-y-4">
        {/* Navigation Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentIndex + 1} of {annotations.length}
                </span>
                <div className="flex gap-1">
                  {annotations.slice(0, 5).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex 
                          ? 'bg-blue-600' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                  {annotations.length > 5 && (
                    <MoreHorizontal className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === annotations.length - 1}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Swipeable Annotation Card */}
        <div 
          ref={swipeRef}
          className={`transition-all duration-150 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
        >
          <ProgressiveAnnotationCard
            annotation={currentAnnotation}
            index={currentIndex}
            isActive={activeAnnotation === currentAnnotation.id}
            onClick={() => onAnnotationClick(currentAnnotation.id)}
            getSeverityColor={getSeverityColor}
            citationNumber={citation.number}
            citationText={citation.text}
            isMultiImage={isMultiImage}
          />
        </div>

        {/* Swipe Hint */}
        {annotations.length > 1 && (
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              👆 Swipe left or right to navigate between insights
            </p>
          </div>
        )}
      </div>
    );
  }

  // Desktop or single annotation view
  return (
    <div className="space-y-3">
      {annotations.map((annotation, index) => {
        const citation = getCitationForAnnotation(annotation, index);
        
        return (
          <ProgressiveAnnotationCard
            key={annotation.id}
            annotation={annotation}
            index={index}
            isActive={activeAnnotation === annotation.id}
            onClick={() => onAnnotationClick(annotation.id)}
            getSeverityColor={getSeverityColor}
            citationNumber={citation.number}
            citationText={citation.text}
            isMultiImage={isMultiImage}
          />
        );
      })}
    </div>
  );
};
