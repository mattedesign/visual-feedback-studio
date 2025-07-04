
import { MessageSquare, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserComment } from '@/types/userComment';
import { UserCommentMarker } from '@/components/viewer/UserCommentMarker';

interface ImageViewerProps {
  imageUrl: string;
  annotations: UserComment[];
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
      
      {/* User Comments */}
      {annotations.map((comment, index) => (
        <UserCommentMarker
          key={comment.id}
          comment={comment}
          isActive={false}
          onClick={() => {}}
          onEdit={onEditAnnotation}
          onDelete={onDeleteAnnotation}
          commentIndex={index}
        />
      ))}
    </div>
  );
};
