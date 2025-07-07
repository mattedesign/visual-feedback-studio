import React from 'react';
import { Button } from '@/components/ui/button';

interface DetailedModeViewProps {
  images: any[];
  session: any;
  results: any;
  showAnnotations: boolean;
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowAnnotations: React.Dispatch<React.SetStateAction<boolean>>;
}

const DetailedModeView: React.FC<DetailedModeViewProps> = ({
  images,
  session,
  results,
  showAnnotations,
  currentImageIndex,
  setCurrentImageIndex,
  setShowAnnotations
}) => {
  const currentImage = images[currentImageIndex];
  // Get annotations from results.annotations array, filter by current image if needed
  const annotations = results?.annotations || [];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Image Analysis ({currentImageIndex + 1} of {images.length})</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAnnotations(!showAnnotations)}
            variant={showAnnotations ? "default" : "outline"}
            size="sm"
          >
            {showAnnotations ? '👁️ Hide' : '👁️ Show'} Annotations ({annotations.length})
          </Button>
        </div>
      </div>
      
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <img
          src={currentImage?.file_path}
          alt={`Screen ${currentImageIndex + 1}`}
          className="w-full h-full object-contain"
        />

        {showAnnotations && annotations.length > 0 && annotations.map((annotation: any, idx: number) => {
          // Handle different annotation data structures with fallbacks
          const annotationText = annotation.feedback || annotation.description || annotation.text || `Annotation ${idx + 1}`;
          
          // Handle coordinates - they might be directly on annotation or nested
          let x, y, width, height;
          if (annotation.coordinates) {
            x = annotation.coordinates.x || 0;
            y = annotation.coordinates.y || 0;
            width = annotation.coordinates.width || 8;
            height = annotation.coordinates.height || 4;
          } else {
            // Coordinates directly on annotation object
            x = annotation.x || 0;
            y = annotation.y || 0;
            width = annotation.width || 8;
            height = annotation.height || 4;
          }
          
          return (
            <div
              key={idx}
              className="absolute border border-pink-500 bg-pink-500/10 rounded text-xs text-white p-1 cursor-pointer"
              style={{
                top: `${y}%`,
                left: `${x}%`,
                width: `${width}%`,
                height: `${height}%`
              }}
              title={annotationText}
            >
              {annotationText.length > 20
                ? annotationText.slice(0, 20) + '...'
                : annotationText}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => setCurrentImageIndex(idx)}
            className={`w-20 h-20 rounded border-2 overflow-hidden ${
              idx === currentImageIndex ? 'border-green-500' : 'border-gray-300'
            }`}
          >
            <img src={img.file_path} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default DetailedModeView;
