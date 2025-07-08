import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnnotationDialog from './AnnotationDialog';

interface DetailedModeViewProps {
  images: any[];
  session: any;
  results: any;
  showAnnotations: boolean;
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowAnnotations: React.Dispatch<React.SetStateAction<boolean>>;
  chatFeedbackAnchors?: {[messageId: string]: any[]};
}

const DetailedModeView: React.FC<DetailedModeViewProps> = ({
  images,
  session,
  results,
  showAnnotations,
  currentImageIndex,
  setCurrentImageIndex,
  setShowAnnotations,
  chatFeedbackAnchors = {}
}) => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const currentImage = images[currentImageIndex];
  // Filter annotations by current image
  const allAnnotations = results?.annotations || [];
  
  // ✅ PHASE 2: Enhanced annotation filtering with fallback logic
  const annotations = allAnnotations.filter((annotation: any) => {
    // Check if annotation has image_index or image_id that matches current image
    const hasImageIndex = annotation.image_index === currentImageIndex || annotation.imageIndex === currentImageIndex;
    const hasImageId = annotation.image_id === currentImage?.id;
    
    // If annotation is specifically tagged for this image, show it
    if (hasImageIndex || hasImageId) {
      return true;
    }
    
    // ✅ FALLBACK: If no annotations have image associations, show all on first image
    const hasAnyImageAssociations = allAnnotations.some((ann: any) => 
      ann.image_index !== undefined || ann.imageIndex !== undefined || ann.image_id !== undefined
    );
    
    // If no annotations have image associations, show them all on the first image only
    if (!hasAnyImageAssociations && currentImageIndex === 0) {
      return true;
    }
    
    return false;
  });

  // Get total feedback anchors count
  const totalFeedbackAnchors = Object.values(chatFeedbackAnchors).flat().length;

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

      <div className="flex gap-2 overflow-x-auto mb-4">
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
      
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <img
          src={currentImage?.file_path}
          alt={`Screen ${currentImageIndex + 1}`}
          className="w-full h-full object-contain"
        />

        {showAnnotations && annotations.length > 0 && annotations.map((annotation: any, idx: number) => {
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

          const handleAnnotationClick = () => {
            setSelectedAnnotation(annotation);
            setDialogOpen(true);
          };
          
          return (
            <div
              key={idx}
              className="absolute border-2 border-pink-500 bg-pink-500/20 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-pink-500/30 transition-colors shadow-lg"
              style={{
                top: `${y}%`,
                left: `${x}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={handleAnnotationClick}
              title="Click to view full annotation"
            >
              <span className="text-pink-900 font-bold text-sm">
                {idx + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chat Feedback Integration */}
      {totalFeedbackAnchors > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              💬 Chat Feedback Anchors ({totalFeedbackAnchors})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {Object.entries(chatFeedbackAnchors).map(([messageId, anchors]) => (
                <div key={messageId} className="space-y-1">
                  {anchors.map((anchor, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="bg-purple-100 text-purple-700">
                        {anchor.type}
                      </Badge>
                      <span className="text-purple-600">
                        {anchor.timestamp.toLocaleTimeString()}
                      </span>
                      {anchor.data && (
                        <span className="text-purple-800 truncate max-w-xs">
                          {typeof anchor.data === 'string' ? anchor.data.slice(0, 50) + '...' : 'Feedback data'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AnnotationDialog
        annotation={selectedAnnotation}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        persona={session?.persona_type || 'clarity'}
      />
    </div>
  );
};

export default DetailedModeView;
