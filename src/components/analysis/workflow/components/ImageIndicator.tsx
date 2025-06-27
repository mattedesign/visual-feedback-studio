
import { Badge } from '@/components/ui/badge';

interface ImageIndicatorProps {
  currentImageIndex: number;
  totalImages: number;
  isMultiImage: boolean;
}

export const ImageIndicator = ({ 
  currentImageIndex, 
  totalImages, 
  isMultiImage 
}: ImageIndicatorProps) => {
  if (!isMultiImage) return null;

  return (
    <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-base px-4 py-2 bg-blue-600 text-white border-blue-500">
            📋 Image {currentImageIndex + 1}
          </Badge>
          <span className="text-slate-300 text-sm">
            Currently viewing insights for Image {currentImageIndex + 1} of {totalImages}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalImages }, (_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentImageIndex 
                  ? 'bg-blue-500' 
                  : 'bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
