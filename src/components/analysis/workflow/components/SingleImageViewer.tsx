
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Annotation } from '@/types/analysis';

interface SingleImageViewerProps {
  imageUrl: string;
  userAnnotations: any[];
  aiAnnotations: Annotation[];
  onAnnotationClick: (id: string) => void;
  activeAnnotation: string | null;
  getCategoryIcon: (category: string) => string;
}

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-500', border: 'border-red-300' };
    case 'suggested':
      return { bg: 'bg-yellow-500', border: 'border-yellow-300' };
    case 'enhancement':
      return { bg: 'bg-blue-500', border: 'border-blue-300' };
    default:
      return { bg: 'bg-purple-500', border: 'border-purple-300' };
  }
};

export const SingleImageViewer = ({
  imageUrl,
  userAnnotations,
  aiAnnotations,
  onAnnotationClick,
  activeAnnotation,
  getCategoryIcon
}: SingleImageViewerProps) => {
  // 🔧 CRITICAL FIX: For single image, filter annotations for image index 0
  const filteredAiAnnotations = aiAnnotations.filter(annotation => {
    const annotationImageIndex = annotation.imageIndex ?? 0;
    return annotationImageIndex === 0;
  });

  console.log('🔧 SINGLE IMAGE VIEWER - CORRELATION CHECK:', {
    totalAiAnnotations: aiAnnotations.length,
    filteredAiAnnotations: filteredAiAnnotations.length,
    imageUrl: imageUrl.substring(imageUrl.length - 30),
    annotationCorrelation: filteredAiAnnotations.map(a => ({
      id: a.id,
      imageIndex: a.imageIndex,
      feedback: a.feedback?.substring(0, 40) + '...'
    }))
  });

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Design Analysis</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={imageUrl}
            alt="Design analysis"
            className="w-full h-auto max-h-[70vh] object-contain bg-white rounded-b-lg"
            style={{ minHeight: '400px' }}
          />
          
          {/* 🔧 CRITICAL FIX: Only render filtered AI annotations */}
          {filteredAiAnnotations.map((annotation, annotationIndex) => {
            console.log(`🔧 SINGLE IMAGE - RENDERING ANNOTATION ${annotationIndex + 1}:`, {
              id: annotation.id,
              imageIndex: annotation.imageIndex,
              x: annotation.x,
              y: annotation.y
            });
            
            return (
              <div
                key={`annotation-${annotation.id}`}
                className={`absolute w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10 ${
                  activeAnnotation === annotation.id
                    ? 'bg-blue-500 border-blue-300 scale-125 ring-4 ring-blue-200'
                    : getSeverityStyles(annotation.severity).bg + ' ' + getSeverityStyles(annotation.severity).border + ' hover:scale-110'
                }`}
                style={{
                  left: `${annotation.x}%`,
                  top: `${annotation.y}%`
                }}
                onClick={() => onAnnotationClick(annotation.id)}
                title={annotation.feedback}
              >
                <span className="text-white text-xs font-bold leading-none">
                  {annotationIndex + 1}
                </span>
              </div>
            );
          })}
          
          {/* User annotations */}
          {userAnnotations.map((annotation, index) => (
            <div
              key={`user-annotation-${annotation.id}`}
              className="absolute w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${annotation.x}%`,
                top: `${annotation.y}%`
              }}
              title={annotation.comment}
            >
              <span className="text-white text-xs font-bold">U</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
