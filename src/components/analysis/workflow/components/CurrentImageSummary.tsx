
import { Badge } from '@/components/ui/badge';

interface CurrentImageSummaryProps {
  currentImageAIAnnotations: any[];
  currentImageUserAnnotations: any[];
  isMultiImage: boolean;
  activeImageIndex?: number;
}

export const CurrentImageSummary = ({
  currentImageAIAnnotations,
  currentImageUserAnnotations,
  isMultiImage,
  activeImageIndex = 0,
}: CurrentImageSummaryProps) => {
  if (!isMultiImage) return null;

  return (
    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-3 text-gray-900">
        📊 Current Image Summary
        {isMultiImage && (
          <Badge className="bg-blue-600 text-white">
            Image {activeImageIndex + 1}
          </Badge>
        )}
      </h3>
      <div className="grid grid-cols-1 gap-3 text-base">
        <div className="text-gray-800">AI Insights: <span className="font-bold text-purple-700 text-lg">{currentImageAIAnnotations.length}</span></div>
        <div className="text-gray-800">Your Comments: <span className="font-bold text-green-700 text-lg">{currentImageUserAnnotations.length}</span></div>
      </div>
    </div>
  );
};
