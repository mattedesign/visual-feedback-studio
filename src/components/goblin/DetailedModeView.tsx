import React, { Dispatch, SetStateAction } from 'react';

interface DetailedModeViewProps {
  images: any[];
  session: any;
  showAnnotations: boolean;
  currentImageIndex: number;
  setCurrentImageIndex: Dispatch<SetStateAction<number>>;
  setShowAnnotations: Dispatch<SetStateAction<boolean>>;
}

const DetailedModeView: React.FC<DetailedModeViewProps> = ({
  images,
  session,
  showAnnotations,
  currentImageIndex,
  setCurrentImageIndex,
  setShowAnnotations
}) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Detailed Analysis View
      </h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-600 mb-4">
          Detailed mode view - coming soon!
        </p>
        <div className="text-sm text-gray-500">
          <p>Images: {images.length}</p>
          <p>Session: {session?.title || 'Unknown'}</p>
          <p>Current Image: {currentImageIndex + 1}</p>
          <p>Show Annotations: {showAnnotations ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailedModeView;