import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { X, MessageSquare, Sparkles } from 'lucide-react';
import { MultiImageAnnotateStep } from './MultiImageAnnotateStep';

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
      workflow.updateUserAnnotation(workflow.selectedImageUrl, editingId, commentText);
    } else {
      workflow.addUserAnnotation(workflow.selectedImageUrl, {
        x: currentPosition.x,
        y: currentPosition.y,
        comment: commentText
      });
    }

    setShowCommentDialog(false);
    setCommentText('');
    setCurrentPosition(null);
    setEditingId(null);
  };

  const handleEditAnnotation = (id: string) => {
    const annotation = workflow.userAnnotations.find(ann => ann.id === id);
    if (annotation) {
      setCurrentPosition({ x: annotation.x, y: annotation.y });
      setCommentText(annotation.comment);
      setEditingId(id);
      setShowCommentDialog(true);
    }
  };

  const handleDeleteAnnotation = (id: string) => {
    if (!workflow.selectedImageUrl) return;
    workflow.removeUserAnnotation(workflow.selectedImageUrl, id);
  };

  const handleSubmitForAnalysis = () => {
    workflow.goToStep('analyzing');
  };

  const handleBack = () => {
    if (workflow.uploadedFiles.length > 1) {
      workflow.goToStep('review');
    } else {
      workflow.goToStep('upload');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Add Your Comments</CardTitle>
          <p className="text-slate-400 text-center">
            Click anywhere on the image to add comments about what you'd like analyzed.
            You can also add general context below.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image viewer */}
            <div className="lg:col-span-2">
              <div className="relative bg-white rounded-lg p-4">
                <img
                  src={workflow.selectedImageUrl!}
                  alt="Selected design"
                  className="w-full h-auto cursor-crosshair rounded"
                  onClick={handleImageClick}
                />
                
                {/* User annotations */}
                {workflow.userAnnotations.map((annotation) => (
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
                          onClick={() => handleEditAnnotation(annotation.id)}
                          className="text-xs"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Your Comments ({workflow.userAnnotations.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {workflow.userAnnotations.map((annotation, index) => (
                    <div key={annotation.id} className="bg-slate-700 p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">Comment {index + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-300">{annotation.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  General Analysis Context (Optional)
                </label>
                <Textarea
                  value={workflow.analysisContext}
                  onChange={(e) => workflow.setAnalysisContext(e.target.value)}
                  placeholder="Add any general context about what you'd like analyzed..."
                  className="bg-slate-700 border-slate-600"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              Back
            </Button>
            <Button
              onClick={handleSubmitForAnalysis}
              disabled={workflow.userAnnotations.length === 0 && !workflow.analysisContext.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Submit for Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comment dialog */}
      {showCommentDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">
                {editingId ? 'Edit Comment' : 'Add Comment'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What would you like analyzed in this area?"
                className="bg-slate-700 border-slate-600"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCommentDialog(false)}
                  className="border-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveComment}
                  disabled={!commentText.trim()}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {editingId ? 'Update' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
