import React, { useState, useCallback } from 'react';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { PlusCircle, Play, ArrowLeft, Layers, MessageSquare, Lightbulb } from 'lucide-react';
import { UserCommentMarker } from '@/components/viewer/UserCommentMarker';
import { UserComment } from '@/types/userComment';

interface FigmaAnnotateLayoutProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const FigmaAnnotateLayout: React.FC<FigmaAnnotateLayoutProps> = ({ workflow }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Get current image and its annotations
  const currentImageUrl = workflow.selectedImages[selectedImageIndex];
  const currentImageComments = workflow.userComments.find(
    ic => ic.imageUrl === currentImageUrl
  )?.comments || [];

  // Handle image click for annotation
  const handleImageClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentPosition({ x, y });
    setShowCommentDialog(true);
    setCommentText('');
    setEditingId(null);
  }, []);

  // Save annotation
  const handleSaveComment = useCallback(() => {
    if (!currentPosition || !commentText.trim() || !currentImageUrl) return;

    if (editingId) {
      workflow.updateUserAnnotation(currentImageUrl, editingId, commentText);
    } else {
      workflow.addUserAnnotation(currentImageUrl, {
        x: currentPosition.x,
        y: currentPosition.y,
        comment: commentText
      });
    }

    setShowCommentDialog(false);
    setCommentText('');
    setCurrentPosition(null);
    setEditingId(null);
  }, [currentPosition, commentText, currentImageUrl, editingId, workflow]);

  // Edit annotation
  const handleEditAnnotation = useCallback((id: string) => {
    const comment = currentImageComments.find(c => c.id === id);
    if (comment) {
      setCurrentPosition({ x: comment.x, y: comment.y });
      setCommentText(comment.comment);
      setEditingId(id);
      setShowCommentDialog(true);
    }
  }, [currentImageComments]);

  // Delete annotation
  const handleDeleteAnnotation = useCallback((id: string) => {
    workflow.removeUserAnnotation(currentImageUrl, id);
  }, [currentImageUrl, workflow]);

  // Start analysis
  const handleStartAnalysis = useCallback(() => {
    workflow.startAnalysis();
  }, [workflow]);

  const totalAnnotations = workflow.getTotalAnnotationsCount();
  const canProceed = workflow.analysisContext.trim().length > 0 || totalAnnotations > 0;

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => workflow.goToStep('upload')}
            className="text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-semibold">Annotate Design</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-400">
            {totalAnnotations} annotation{totalAnnotations !== 1 ? 's' : ''} added
          </div>
          <Button
            onClick={handleStartAnalysis}
            disabled={!canProceed}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Analyze Design{workflow.selectedImages.length > 1 ? 's' : ''}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left sidebar - Image thumbnails */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-slate-800 border-r border-slate-700 p-4">
              <h3 className="font-medium text-slate-200 mb-3">Images ({workflow.selectedImages.length})</h3>
              <div className="space-y-2">
                {workflow.selectedImages.map((image, index) => (
                  <div
                    key={image}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-blue-500'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`Design ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                    <div className="absolute bottom-1 right-1 bg-slate-900/80 text-xs px-1.5 py-0.5 rounded">
                      {workflow.userComments.find(ic => ic.imageUrl === image)?.comments.length || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Center canvas area */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full flex flex-col">
              {/* Canvas header */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-200">
                    Design {selectedImageIndex + 1} of {workflow.selectedImages.length}
                  </h3>
                  <div className="text-sm text-slate-400">
                    Click anywhere to add feedback
                  </div>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 p-4 overflow-auto">
                <div className="relative inline-block bg-white rounded-lg">
                  <img
                    src={currentImageUrl}
                    alt={`Design ${selectedImageIndex + 1}`}
                    className="max-w-full h-auto cursor-crosshair rounded-lg"
                    onClick={handleImageClick}
                  />
                  
                  {/* Annotations overlay */}
                  {currentImageComments.map((comment, index) => (
                    <UserCommentMarker
                      key={comment.id}
                      comment={comment}
                      isActive={false}
                      onClick={() => {}}
                      onEdit={handleEditAnnotation}
                      onDelete={handleDeleteAnnotation}
                      commentIndex={index}
                    />
                  ))}

                  {/* Add annotation hint */}
                  {currentImageComments.length === 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="bg-blue-500/90 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
                        <div className="flex items-center gap-2">
                          <PlusCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Click anywhere to add feedback</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right panel - Context and comments */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            <div className="h-full bg-slate-800 border-l border-slate-700 p-4 flex flex-col">
              {/* Analysis context */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-medium text-slate-200">Analysis Context</h3>
                </div>
                <Textarea
                  value={workflow.analysisContext}
                  onChange={(e) => workflow.setAnalysisContext(e.target.value)}
                  placeholder="What should I analyze about this design?"
                  className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 min-h-20"
                />
                <div className="text-xs text-slate-400 mt-1">
                  Provide context to guide AI analysis
                </div>
              </div>

              {/* Comments list */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  <h3 className="font-medium text-slate-200">
                    Comments ({currentImageComments.length})
                  </h3>
                </div>
                
                {currentImageComments.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentImageComments.map((comment, index) => (
                      <Card key={comment.id} className="bg-slate-700 border-slate-600 p-3">
                        <div className="text-sm text-slate-300 mb-1">
                          Comment {index + 1}
                        </div>
                        <div className="text-xs text-slate-400 mb-2">
                          Position: {comment.x.toFixed(1)}%, {comment.y.toFixed(1)}%
                        </div>
                        <div className="text-sm text-slate-200">
                          {comment.comment}
                        </div>
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditAnnotation(comment.id)}
                            className="text-xs h-6 px-2 text-slate-400 hover:text-slate-200"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAnnotation(comment.id)}
                            className="text-xs h-6 px-2 text-red-400 hover:text-red-300"
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 text-center py-8">
                    No comments yet.<br />
                    Click on the image to add feedback.
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Comment dialog */}
      {showCommentDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 w-96">
            <h3 className="font-medium text-slate-200 mb-4">
              {editingId ? 'Edit Comment' : 'Add Comment'}
            </h3>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Describe what needs attention here..."
              className="bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 mb-4"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowCommentDialog(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveComment}
                disabled={!commentText.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Add'} Comment
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};