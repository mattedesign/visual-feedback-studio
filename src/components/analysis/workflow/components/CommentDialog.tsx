
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';

interface CommentDialogProps {
  show: boolean;
  commentText: string;
  editingId: string | null;
  currentImageIndex: number;
  currentPosition: { x: number; y: number } | null;
  onCommentTextChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CommentDialog = ({
  show,
  commentText,
  editingId,
  currentImageIndex,
  currentPosition,
  onCommentTextChange,
  onSave,
  onCancel,
}: CommentDialogProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {editingId ? 'Edit Comment' : 'Add Feedback Point'}
          </CardTitle>
          <p className="text-sm text-slate-400">
            Image {currentImageIndex + 1} • Position: {currentPosition?.x.toFixed(1)}%, {currentPosition?.y.toFixed(1)}%
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={commentText}
            onChange={(e) => onCommentTextChange(e.target.value)}
            placeholder="What specific feedback do you have for this area? Be detailed about what needs improvement..."
            className="bg-white dark:bg-slate-200 border-slate-300 dark:border-slate-400 text-slate-900 placeholder:text-slate-600"
            rows={4}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-slate-600"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={!commentText.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {editingId ? 'Update' : 'Add'} Comment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
