
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Images, Sparkles } from 'lucide-react';
import { ImageNavigationBar } from './components/ImageNavigationBar';
import { ImageViewer } from './components/ImageViewer';
import { AnalysisSidebar } from './components/AnalysisSidebar';
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

  const currentImageAnnotations = workflow.imageAnnotations.find(
    ia => ia.imageUrl === activeImageUrl
  )?.annotations || [];

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
    const annotation = currentImageAnnotations.find(ann => ann.id === id);
    if (annotation) {
      setCurrentPosition({ x: annotation.x, y: annotation.y });
      setCommentText(annotation.comment);
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
    workflow.goToStep('analyzing');
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
                annotations={currentImageAnnotations}
                showFloatingHint={showFloatingHint}
                onImageClick={handleImageClick}
                onEditAnnotation={handleEditAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
              />
            </div>

            {/* Enhanced sidebar */}
            <AnalysisSidebar
              selectedImagesCount={workflow.selectedImages.length}
              totalAnnotations={totalAnnotations}
              currentImageAnnotations={currentImageAnnotations}
              currentImageIndex={currentImageIndex}
              analysisContext={workflow.analysisContext}
              isComparative={isComparative}
              onAnalysisContextChange={workflow.setAnalysisContext}
              onDeleteAnnotation={handleDeleteAnnotation}
            />
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
