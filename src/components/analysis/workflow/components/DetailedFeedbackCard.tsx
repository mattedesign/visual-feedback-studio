
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface DetailedFeedbackCardProps {
  activeAnnotation: string | null;
  aiAnnotations: Annotation[];
  isMultiImage: boolean;
  getSeverityColor: (severity: string) => string;
}

export const DetailedFeedbackCard = ({
  activeAnnotation,
  aiAnnotations,
  isMultiImage,
  getSeverityColor,
}: DetailedFeedbackCardProps) => {
  if (!activeAnnotation) return null;

  const annotation = aiAnnotations.find(a => a.id === activeAnnotation);
  if (!annotation) return null;

  return (
    <div className="bg-gray-100 border-2 border-gray-300 p-5 rounded-lg">
      <h4 className="font-bold text-lg mb-3 text-gray-900">Detailed Feedback</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Badge className={`text-sm font-semibold px-3 py-1 ${getSeverityColor(annotation.severity)}`}>
            {annotation.severity.toUpperCase()}
          </Badge>
          <span className="text-base font-semibold capitalize text-gray-700">{annotation.category}</span>
          {isMultiImage && (
            <Badge variant="outline" className="text-sm font-semibold border-gray-400 text-gray-700">
              Image {(annotation.imageIndex ?? 0) + 1}
            </Badge>
          )}
        </div>
        <p className="text-base text-gray-800 leading-relaxed font-medium">{annotation.feedback}</p>
        <div className="flex gap-6 text-sm text-gray-600 font-semibold">
          <span>Implementation: {annotation.implementationEffort}</span>
          <span>Business Impact: {annotation.businessImpact}</span>
        </div>
      </div>
    </div>
  );
};
