
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Annotation {
  id: string;
  x: number;
  y: number;
  comment: string;
}

interface ImageViewerProps {
  imageUrl: string;
  annotations: Annotation[];
  showFloatingHint: boolean;
  onImageClick: (e: React.MouseEvent<HTMLImageElement>) => void;
  onEditAnnotation: (id: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

export const ImageViewer = ({
  imageUrl,
  annotations,
  showFloatingHint,
  onImageClick,
  onEditAnnotation,
  onDeleteAnnotation,
}: ImageViewerProps) => {
  return (
    <div className="relative bg-white rounded-lg p-4">
      <img
        src={imageUrl}
        alt="Selected design"
        className="w-full h-auto cursor-crosshair rounded"
        onClick={onImageClick}
      />
      
      {/* Floating hint */}
      {showFloatingHint && annotations.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-blue-500/90 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Click anywhere to add feedback</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Annotations */}
      {annotations.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{
            left: `${annotation.x}%`,
            top: `${annotation.y}%`,
          }}
        >
          <div className="w-8 h-8 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
            <MessageSquare className="w-4 h-4" />
          </div>
          
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-64 bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <p className="text-sm text-slate-300 mb-2">{annotation.comment}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditAnnotation(annotation.id)}
                className="text-xs"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDeleteAnnotation(annotation.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
