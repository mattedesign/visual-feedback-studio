
import { Badge } from '@/components/ui/badge';

interface ImageIndicatorProps {
  currentImageIndex: number;
  totalImages: number;
  isMultiImage: boolean;
}

export const ImageIndicator = ({ currentImageIndex, totalImages, isMultiImage }: ImageIndicatorProps) => {
  if (!isMultiImage) return null;

  return (
    <div className="flex items-center justify-between mb-4">
      <Badge variant="outline" className="bg-slate-700 text-slate-200 border-slate-600">
        📸 Viewing Image {currentImageIndex + 1} of {totalImages}
      </Badge>
      <Badge variant="outline" className="bg-blue-900 text-blue-200 border-blue-700">
        🔄 Cross-image analysis
      </Badge>
    </div>
  );
};
