
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ImageNavigationBarProps {
  selectedImages: string[];
  activeImageUrl: string;
  imageAnnotations: Array<{
    imageUrl: string;
    annotations: Array<{ id: string; x: number; y: number; comment: string }>;
  }>;
  currentImageIndex: number;
  onImageSelect: (imageUrl: string) => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export const ImageNavigationBar = ({
  selectedImages,
  activeImageUrl,
  imageAnnotations,
  currentImageIndex,
  onImageSelect,
  onPrevImage,
  onNextImage,
  canGoPrev,
  canGoNext,
}: ImageNavigationBarProps) => {
  return (
    <div className="flex items-center justify-between mb-4 bg-slate-700/50 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevImage}
          disabled={!canGoPrev}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">
          Image {currentImageIndex + 1} of {selectedImages.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNextImage}
          disabled={!canGoNext}
          className="h-8 w-8 p-0"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Quick image thumbnails */}
      <div className="flex gap-1">
        {selectedImages.map((imageUrl, index) => {
          const imageAnnotationsData = imageAnnotations.find(ia => ia.imageUrl === imageUrl);
          const annotationCount = imageAnnotationsData?.annotations.length || 0;
          
          return (
            <button
              key={imageUrl}
              onClick={() => onImageSelect(imageUrl)}
              className={`relative w-12 h-8 rounded border-2 overflow-hidden transition-all ${
                activeImageUrl === imageUrl ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <img
                src={imageUrl}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {annotationCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">{annotationCount}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
