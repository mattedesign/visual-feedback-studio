
import { Annotation } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CitationIndicator } from './CitationIndicator';

interface DetailedAnnotationsListProps {
  annotations: Annotation[];
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  getSeverityColor: (severity: string) => string;
  isMultiImage: boolean;
  researchCitations?: string[];
}

export const DetailedAnnotationsList = ({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  getSeverityColor,
  isMultiImage,
  researchCitations = []
}: DetailedAnnotationsListProps) => {
  // 🔍 DETAILED ANNOTATIONS LIST DEBUG
  console.log('📝 DETAILED ANNOTATIONS LIST - DEBUG:', {
    componentName: 'DetailedAnnotationsList',
    annotationsCount: annotations.length,
    annotationsPreview: annotations.slice(0, 3).map((a, i) => ({
      index: i + 1,
      id: a.id,
      feedback: a.feedback,
      feedbackLength: a.feedback?.length || 0,
      feedbackPreview: a.feedback?.substring(0, 50) + '...',
      category: a.category,
      severity: a.severity,
      isValidFeedback: !!(a.feedback && a.feedback.trim() && a.feedback !== 'Analysis insight')
    })),
    activeAnnotation,
    isMultiImage,
    researchCitationsCount: researchCitations.length
  });

  if (annotations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No detailed insights available for this image.</p>
      </div>
    );
  }

  // Helper function to assign citations to annotations based on categories
  const getCitationForAnnotation = (annotation: Annotation, index: number): { number: number; text?: string } => {
    if (researchCitations.length === 0) return { number: 0 };
    
    // Match citation to annotation category
    const categoryKeywords = {
      'ux': ['ux', 'usability', 'user experience'],
      'visual': ['visual', 'design', 'aesthetic'],
      'accessibility': ['accessibility', 'wcag', 'inclusive'],
      'conversion': ['conversion', 'cro', 'optimize'],
      'brand': ['brand', 'identity', 'trust']
    };
    
    const annotationCategory = annotation.category.toLowerCase();
    const keywords = categoryKeywords[annotationCategory as keyof typeof categoryKeywords] || [];
    
    // Find matching citation
    for (let i = 0; i < researchCitations.length; i++) {
      const citation = researchCitations[i].toLowerCase();
      if (keywords.some(keyword => citation.includes(keyword))) {
        return { number: i + 1, text: researchCitations[i] };
      }
    }
    
    // Fallback: assign citation based on index
    const citationIndex = index % researchCitations.length;
    return { number: citationIndex + 1, text: researchCitations[citationIndex] };
  };

  return (
    <div className="space-y-4">
      {annotations.map((annotation, index) => {
        const isActive = activeAnnotation === annotation.id;
        const citation = getCitationForAnnotation(annotation, index);
        
        console.log(`📝 ANNOTATION ${index + 1} RENDER:`, {
          id: annotation.id,
          feedback: annotation.feedback,
          feedbackLength: annotation.feedback?.length || 0,
          isActive,
          category: annotation.category,
          severity: annotation.severity,
          citationNumber: citation.number,
          hasCitation: citation.number > 0
        });

        return (
          <Card
            key={annotation.id}
            className={`cursor-pointer transition-all duration-200 ${
              isActive 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                : 'hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700'
            }`}
            onClick={() => onAnnotationClick(annotation.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getSeverityColor(annotation.severity).split(' ')[0]}`}>
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getSeverityColor(annotation.severity)}>
                      {annotation.severity?.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {annotation.category}
                    </Badge>
                    {isMultiImage && annotation.imageIndex !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        Image {annotation.imageIndex + 1}
                      </Badge>
                    )}
                    {/* Citation Indicator */}
                    {citation.number > 0 && (
                      <CitationIndicator
                        citationNumber={citation.number}
                        citationText={citation.text}
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      {annotation.feedback}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>
                        <strong>Effort:</strong> {annotation.implementationEffort}
                      </span>
                      <span>
                        <strong>Impact:</strong> {annotation.businessImpact}
                      </span>
                      {citation.number > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Research-backed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
