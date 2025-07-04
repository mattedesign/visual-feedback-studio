
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Images, Sparkles } from 'lucide-react';
import { ImageNavigationBar } from './components/ImageNavigationBar';
import { ImageViewer } from './components/ImageViewer';
import { CommentDialog } from './components/CommentDialog';

interface MultiImageAnnotateStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const MultiImageAnnotateStep = ({ workflow }: MultiImageAnnotateStepProps) => {
  const [activeImageUrl, setActiveImageUrl] = useState(workflow.selectedImages[0] || '');
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFloatingHint, setShowFloatingHint] = useState(true);
  const [isComparative, setIsComparative] = useState(false);

  // ✅ FIXED: Get user comments for the current active image
  const currentImageComments = workflow.userComments.find(
    ic => ic.imageUrl === activeImageUrl
  )?.comments || [];

  const currentImageIndex = workflow.selectedImages.indexOf(activeImageUrl);
  const canGoNext = currentImageIndex < workflow.selectedImages.length - 1;
  const canGoPrev = currentImageIndex > 0;

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCurrentPosition({ x, y });
    setShowCommentDialog(true);
    setCommentText('');
    setEditingId(null);
    setShowFloatingHint(false);
  };

  const handleSaveComment = () => {
    if (!currentPosition || !commentText.trim() || !activeImageUrl) return;

    if (editingId) {
      workflow.updateUserAnnotation(activeImageUrl, editingId, commentText);
    } else {
      workflow.addUserAnnotation(activeImageUrl, {
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
    const comment = currentImageComments.find(c => c.id === id);
    if (comment) {
      setCurrentPosition({ x: comment.x, y: comment.y });
      setCommentText(comment.comment);
      setEditingId(id);
      setShowCommentDialog(true);
    }
  };

  const handleDeleteAnnotation = (id: string) => {
    workflow.removeUserAnnotation(activeImageUrl, id);
  };

  const handleNextImage = () => {
    if (canGoNext) {
      setActiveImageUrl(workflow.selectedImages[currentImageIndex + 1]);
    }
  };

  const handlePrevImage = () => {
    if (canGoPrev) {
      setActiveImageUrl(workflow.selectedImages[currentImageIndex - 1]);
    }
  };

  const handleSubmitForAnalysis = () => {
    workflow.startAnalysis();
  };

  const handleBack = () => {
    if (workflow.uploadedFiles.length > 1) {
      workflow.goToStep('review');
    } else {
      workflow.goToStep('upload');
    }
  };

  const totalAnnotations = workflow.getTotalAnnotationsCount();

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Images className="w-6 h-6" />
            Multi-Image Analysis Setup
          </CardTitle>
          <p className="text-slate-400 text-center">
            Click anywhere on an image to add specific feedback points. Switch between images to compare and annotate.
          </p>
          
          {/* Analysis Type Toggle */}
          <div className="flex justify-center mt-4">
            <div className="bg-slate-700 p-1 rounded-lg flex">
              <Button
                variant={!isComparative ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsComparative(false)}
                className="text-xs"
              >
                Individual Analysis
              </Button>
              <Button
                variant={isComparative ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsComparative(true)}
                className="text-xs"
              >
                Comparative Analysis
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Image viewer with improved navigation */}
            <div className="lg:col-span-3">
              <ImageNavigationBar
                selectedImages={workflow.selectedImages}
                activeImageUrl={activeImageUrl}
                imageAnnotations={workflow.imageAnnotations}
                currentImageIndex={currentImageIndex}
                onImageSelect={setActiveImageUrl}
                onPrevImage={handlePrevImage}
                onNextImage={handleNextImage}
                canGoPrev={canGoPrev}
                canGoNext={canGoNext}
              />
              
              <ImageViewer
                imageUrl={activeImageUrl}
                annotations={currentImageComments}
                showFloatingHint={showFloatingHint}
                onImageClick={handleImageClick}
                onEditAnnotation={handleEditAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
              />
            </div>

            {/* Simplified sidebar - no complex annotation panel */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3 text-slate-200">
                  Analysis Summary
                </h3>
                <div className="space-y-2">
                  <div className="bg-slate-700 p-3 rounded">
                    <div className="text-sm font-medium text-slate-300">Selected Images</div>
                    <div className="text-2xl font-bold text-blue-400">{workflow.selectedImages.length}</div>
                  </div>
                  <div className="bg-slate-700 p-3 rounded">
                    <div className="text-sm font-medium text-slate-300">Total Comments</div>
                    <div className="text-2xl font-bold text-green-400">{totalAnnotations}</div>
                  </div>
                  <div className="bg-slate-700 p-3 rounded">
                    <div className="text-sm font-medium text-slate-300">Current Image</div>
                    <div className="text-lg font-bold text-purple-400">{currentImageComments.length} comments</div>
                  </div>
                </div>
              </div>

              {/* Analysis context input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">
                  {isComparative ? 'Comparative Analysis Context' : 'Analysis Context'}
                </label>
                <textarea
                  value={workflow.analysisContext}
                  onChange={(e) => workflow.setAnalysisContext(e.target.value)}
                  placeholder={
                    isComparative 
                      ? "Describe what you want to compare across these images..."
                      : "Add context to guide the AI analysis..."
                  }
                  className="w-full bg-slate-700 border-slate-600 text-slate-200 placeholder:text-slate-400 rounded-md p-3 text-sm"
                  rows={4}
                />
                <div className="text-xs text-slate-400 mt-1">
                  This context will guide the AI analysis for better insights.
                </div>
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
              disabled={totalAnnotations === 0 && !workflow.analysisContext.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isComparative ? 'Compare & Analyze' : 'Analyze'} {workflow.selectedImages.length} Image{workflow.selectedImages.length > 1 ? 's' : ''}
            </Button>
          </div>
        </CardContent>
      </Card>

      <CommentDialog
        show={showCommentDialog}
        commentText={commentText}
        editingId={editingId}
        currentImageIndex={currentImageIndex}
        currentPosition={currentPosition}
        onCommentTextChange={setCommentText}
        onSave={handleSaveComment}
        onCancel={() => setShowCommentDialog(false)}
      />
    </div>
  );
};
