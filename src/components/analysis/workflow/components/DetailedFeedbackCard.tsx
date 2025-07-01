
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';
import { getAnnotationTitle, getAnnotationDescription } from '@/types/analysis';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

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
  const useSeparatedFields = useFeatureFlag('separated-annotation-fields');
  
  if (!activeAnnotation) return null;

  const annotation = aiAnnotations.find(a => a.id === activeAnnotation);
  if (!annotation) return null;

  // Use new title/description fields or fallback to feedback
  const title = useSeparatedFields ? getAnnotationTitle(annotation) : annotation.feedback;
  const description = useSeparatedFields ? getAnnotationDescription(annotation) : null;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
        <h4 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-xl">💡</span>
          <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {useSeparatedFields ? title : 'Detailed Feedback'}
          </span>
        </h4>
        <p className="text-sm text-gray-600 font-medium mt-1">
          {useSeparatedFields ? 'Actionable UX improvement recommendation' : 'In-depth analysis and actionable recommendations'}
        </p>
      </div>
      
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={`text-sm font-bold px-4 py-2 rounded-lg shadow-sm ${getSeverityColor(annotation.severity)}`}>
            {annotation.severity.toUpperCase()}
          </Badge>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
            <div className={`w-3 h-3 rounded-full ${
              annotation.category === 'ux' ? 'bg-blue-500' :
              annotation.category === 'visual' ? 'bg-purple-500' :
              annotation.category === 'accessibility' ? 'bg-green-500' :
              annotation.category === 'conversion' ? 'bg-orange-500' :
              annotation.category === 'brand' ? 'bg-pink-500' :
              'bg-gray-500'
            }`}></div>
            <span className="text-base font-bold capitalize text-gray-800">{annotation.category}</span>
          </div>
          {isMultiImage && (
            <Badge variant="outline" className="text-sm font-bold border-2 border-indigo-300 text-indigo-700 bg-indigo-50 px-3 py-2">
              Image {(annotation.imageIndex ?? 0) + 1}
            </Badge>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
          <div className="text-base text-gray-800 leading-relaxed font-medium whitespace-pre-wrap">
            {useSeparatedFields && description ? description : annotation.feedback}
          </div>
        </div>
        
        <div className="flex gap-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-bold text-gray-700">Implementation:</span>
            <span className="text-sm font-semibold text-blue-700 capitalize">{annotation.implementationEffort}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-bold text-gray-700">Business Impact:</span>
            <span className="text-sm font-semibold text-green-700 capitalize">{annotation.businessImpact}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
