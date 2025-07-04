import React from 'react';
import { MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserComment } from '@/types/userComment';

interface UserCommentMarkerProps {
  comment: UserComment;
  isActive: boolean;
  onClick: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  commentIndex: number;
}

export const UserCommentMarker: React.FC<UserCommentMarkerProps> = ({
  comment,
  isActive,
  onClick,
  onEdit,
  onDelete,
  commentIndex
}) => {
  const handleClick = () => {
    console.log('💬 UserCommentMarker clicked:', { commentId: comment.id, commentIndex });
    onClick();
  };

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
        isActive ? 'scale-110 z-20' : 'z-10 hover:scale-105'
      }`}
      style={{
        left: `${comment.x}%`,
        top: `${comment.y}%`,
      }}
      onClick={handleClick}
      title={comment.comment}
    >
      {/* Pulsing ring effect for active comments */}
      {isActive && (
        <div className="absolute inset-0 w-8 h-8 rounded-full border-4 border-green-400 animate-ping opacity-75"></div>
      )}
      
      <div
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300 bg-green-500 border-green-400 ${
          isActive ? 'ring-4 ring-green-400 ring-offset-2' : ''
        }`}
      >
        <MessageSquare className="w-4 h-4" />
      </div>
      
      {/* Active state tooltip */}
      {isActive && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in">
          Comment #{commentIndex + 1}
        </div>
      )}
      
      {/* Enhanced content overlay when active */}
      {isActive && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-80 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-xl z-30">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-900">
              Your Comment #{commentIndex + 1}
            </span>
          </div>
          
          <p className="text-sm text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">
            {comment.comment}
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(comment.id);
              }}
              className="text-xs hover:bg-blue-50"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(comment.id);
              }}
              className="text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
          
          {/* Arrow pointing to comment */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-gray-300 rotate-45"></div>
        </div>
      )}
    </div>
  );
};