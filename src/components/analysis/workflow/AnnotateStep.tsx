
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { MessageSquare, Lightbulb, AlertCircle, X } from 'lucide-react';
import { MultiImageAnnotateStep } from './MultiImageAnnotateStep';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageViewer } from './components/ImageViewer';
import { CommentDialog } from './components/CommentDialog';

interface AnnotateStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnnotateStep = ({ workflow }: AnnotateStepProps) => {
  // If multiple images are selected, use the multi-image component
  if (workflow.selectedImages.length > 1) {
    return <MultiImageAnnotateStep workflow={workflow} />;
  }

  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Get user comments for the current selected image
  const currentImageComments = workflow.userComments.find(
    ic => ic.imageUrl === workflow.selectedImageUrl
  )?.comments || [];

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentPosition({ x, y });
    setShowCommentDialog(true);
    setCommentText('');
    setEditingId(null);
  };

  const handleSaveComment = () => {
    if (!currentPosition || !commentText.trim() || !workflow.selectedImageUrl) return;

    if (editingId) {
      // Update existing comment logic would go here
      // For now, we'll add as new
    }
    
    workflow.addUserAnnotation(workflow.selectedImageUrl, {
      x: currentPosition.x,
      y: currentPosition.y,
      comment: commentText
    });

    setShowCommentDialog(false);
    setCommentText('');
    setCurrentPosition(null);
    setEditingId(null);
  };

  const handleEditAnnotation = (id: string) => {
    const comment = currentImageComments.find(c => c.id === id);
    if (comment) {
      setCurrentPosition({ x: comment.x, y: comment.y });
      setCommentText(comment.comment);
      setEditingId(id);
      setShowCommentDialog(true);
    }
  };

  const handleDeleteAnnotation = (id: string) => {
    if (!workflow.selectedImageUrl) return;
    workflow.removeUserAnnotation(workflow.selectedImageUrl, id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Analysis Context Input */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            What should I analyze?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={workflow.analysisContext}
            onChange={(e) => workflow.setAnalysisContext(e.target.value)}
            placeholder="Describe what you want analyzed about this design..."
            className="min-h-20 text-gray-900 dark:text-white bg-white dark:bg-slate-700"
            maxLength={1000}
          />
          
          {workflow.analysisContext.length < 10 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                Please provide more context (at least 10 characters)
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-center">
            <Button
              onClick={workflow.goToNextStep}
              disabled={workflow.analysisContext.length < 10}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Start Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simple Image Viewer with Comments */}
      <Card className="bg-white dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="text-center text-gray-900 dark:text-white">
            Add Comments (Optional)
          </CardTitle>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Click anywhere on the image to add specific feedback
          </p>
        </CardHeader>
        <CardContent>
          <ImageViewer
            imageUrl={workflow.selectedImageUrl!}
            annotations={currentImageComments}
            showFloatingHint={currentImageComments.length === 0}
            onImageClick={handleImageClick}
            onEditAnnotation={handleEditAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
          />
        </CardContent>
      </Card>

      <CommentDialog
        show={showCommentDialog}
        commentText={commentText}
        editingId={editingId}
        currentImageIndex={0}
        currentPosition={currentPosition}
        onCommentTextChange={setCommentText}
        onSave={handleSaveComment}
        onCancel={() => setShowCommentDialog(false)}
      />
    </div>
  );
};
