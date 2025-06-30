
import { useState } from 'react';
import { Annotation } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SwipeableAnnotationList } from './SwipeableAnnotationList';
import { TopRecommendationsQuickView } from './TopRecommendationsQuickView';
import { AnnotationFilterControls } from './AnnotationFilterControls';
import { Share2, Download, Eye, Filter, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileFriendlyAnnotationViewerProps {
  annotations: Annotation[];
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  getSeverityColor: (severity: string) => string;
  isMultiImage?: boolean;
  researchCitations?: string[];
}

export const MobileFriendlyAnnotationViewer = ({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  getSeverityColor,
  isMultiImage = false,
  researchCitations = []
}: MobileFriendlyAnnotationViewerProps) => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'recommendations' | 'all' | 'filtered'>('recommendations');
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  // Filter annotations based on selected filters
  const filteredAnnotations = annotations.filter(annotation => {
    const severityMatch = severityFilter.length === 0 || severityFilter.includes(annotation.severity);
    const categoryMatch = categoryFilter.length === 0 || categoryFilter.includes(annotation.category);
    return severityMatch && categoryMatch;
  });

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
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleExport = () => {
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

  const handleReset = () => {
    setSeverityFilter([]);
    setCategoryFilter([]);
    setViewMode('recommendations');
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
      {/* Mobile Action Bar */}
      {isMobile && (
        <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
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

            {/* View Mode Selector */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'recommendations' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('recommendations')}
                className="flex items-center gap-1 text-xs"
              >
                <Star className="w-3 h-3" />
                Top 5
              </Button>
              <Button
                variant={viewMode === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('all')}
                className="flex items-center gap-1 text-xs"
              >
                <Eye className="w-3 h-3" />
                All
              </Button>
              <Button
                variant={viewMode === 'filtered' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('filtered')}
                className="flex items-center gap-1 text-xs"
              >
                <Filter className="w-3 h-3" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content based on view mode */}
      {viewMode === 'recommendations' && (
        <TopRecommendationsQuickView
          annotations={annotations}
          onAnnotationClick={onAnnotationClick}
          onViewAllClick={() => setViewMode('all')}
        />
      )}

      {viewMode === 'filtered' && (
        <>
          <AnnotationFilterControls
            totalCount={filteredAnnotations.length}
            severityFilter={severityFilter}
            categoryFilter={categoryFilter}
            onSeverityFilterChange={setSeverityFilter}
            onCategoryFilterChange={setCategoryFilter}
            onReset={handleReset}
          />
          <SwipeableAnnotationList
            annotations={filteredAnnotations}
            activeAnnotation={activeAnnotation}
            onAnnotationClick={onAnnotationClick}
            getSeverityColor={getSeverityColor}
            isMultiImage={isMultiImage}
            researchCitations={researchCitations}
          />
        </>
      )}

      {viewMode === 'all' && (
        <SwipeableAnnotationList
          annotations={annotations}
          activeAnnotation={activeAnnotation}
          onAnnotationClick={onAnnotationClick}
          getSeverityColor={getSeverityColor}
          isMultiImage={isMultiImage}
          researchCitations={researchCitations}
        />
      )}

      {/* Back to recommendations button */}
      {viewMode !== 'recommendations' && isMobile && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('recommendations')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            ↑ Back to Top Recommendations
          </Button>
        </div>
      )}
    </div>
  );
};
