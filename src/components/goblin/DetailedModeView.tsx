import React from 'react';

interface DetailedModeViewProps {
  images: any[];
  session: any;
  showAnnotations: boolean;
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowAnnotations: React.Dispatch<React.SetStateAction<boolean>>;
}

const DetailedModeView: React.FC<DetailedModeViewProps> = ({
  images,
  session,
  showAnnotations,
  currentImageIndex,
  setCurrentImageIndex,
  setShowAnnotations
}) => {
  const currentImage = images[currentImageIndex];
  const annotations = currentImage?.annotations || [];

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <img
          src={currentImage?.file_path}
          alt={`Screen ${currentImageIndex + 1}`}
          className="w-full h-full object-contain"
        />

        {showAnnotations && annotations.length > 0 && annotations.map((annotation: any, idx: number) => (
          <div
            key={idx}
            className="absolute border border-pink-500 bg-pink-500/10 rounded text-xs text-white p-1 cursor-pointer"
            style={{
              top: `${annotation.y * 100}%`,
              left: `${annotation.x * 100}%`,
              width: `${annotation.width * 100}%`,
              height: `${annotation.height * 100}%`
            }}
            title={annotation.text}
          >
            {annotation.text.length > 20
              ? annotation.text.slice(0, 20) + '...'
              : annotation.text}
          </div>
        ))}
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
