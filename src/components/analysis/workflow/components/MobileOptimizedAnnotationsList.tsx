
import { useState, useEffect } from 'react';
import { Annotation } from '@/types/analysis';
import { ProgressiveAnnotationCard } from './ProgressiveAnnotationCard';
import { AnnotationFilterControls } from './AnnotationFilterControls';
import { TopRecommendationsQuickView } from './TopRecommendationsQuickView';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft, ChevronRight, Share2, Download } from 'lucide-react';

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
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [showTopRecommendations, setShowTopRecommendations] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  const itemsPerPage = isMobile ? 3 : 10;

  // Filter annotations based on selected filters
  const filteredAnnotations = annotations.filter(annotation => {
    const severityMatch = severityFilter.length === 0 || severityFilter.includes(annotation.severity);
    const categoryMatch = categoryFilter.length === 0 || categoryFilter.includes(annotation.category);
    return severityMatch && categoryMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAnnotations.length / itemsPerPage);
  const paginatedAnnotations = filteredAnnotations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [severityFilter, categoryFilter]);

  // Helper function to assign citations to annotations
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

  const handleReset = () => {
    setSeverityFilter([]);
    setCategoryFilter([]);
    setCurrentPage(0);
  };

  const handleShare = async () => {
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: 'UX Analysis Results',
          text: `Found ${annotations.length} insights to improve this design`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Sharing cancelled or failed', error);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const handleExport = () => {
    // Create a simple text export of the annotations
    const exportText = annotations.map((annotation, index) => {
      return `${index + 1}. ${annotation.severity.toUpperCase()} - ${annotation.category.toUpperCase()}\n${annotation.feedback}\n\n`;
    }).join('');
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ux-analysis-insights.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      {/* Mobile-optimized sharing controls */}
      {isMobile && (
        <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {annotations.length} insights found
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Tap to share or export
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
      <div className="space-y-3">
        {paginatedAnnotations.map((annotation, index) => {
          const actualIndex = currentPage * itemsPerPage + index;
          const citation = getCitationForAnnotation(annotation, actualIndex);
          
          return (
            <ProgressiveAnnotationCard
              key={annotation.id}
              annotation={annotation}
              index={actualIndex}
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

      {/* Mobile-optimized Pagination */}
      {totalPages > 1 && (
        <Card className="bg-white dark:bg-slate-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {isMobile ? 'Prev' : 'Previous'}
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {currentPage + 1} of {totalPages}
                </Badge>
                {!isMobile && (
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    ({filteredAnnotations.length} total)
                  </span>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-2"
              >
                {isMobile ? 'Next' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {isMobile && (
              <div className="text-center mt-2 text-xs text-gray-600 dark:text-gray-400">
                Showing {paginatedAnnotations.length} of {filteredAnnotations.length} insights
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Back to Top Recommendations (mobile) */}
      {!showTopRecommendations && isMobile && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowTopRecommendations(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            ↑ Back to Top Recommendations
          </Button>
        </div>
      )}
    </div>
  );
};
