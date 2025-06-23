
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { X, MessageSquare, Sparkles, Images } from 'lucide-react';

interface MultiImageAnnotateStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const MultiImageAnnotateStep = ({ workflow }: MultiImageAnnotateStepProps) => {
  const [activeImageUrl, setActiveImageUrl] = useState(workflow.selectedImages[0] || '');
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentImageAnnotations = workflow.imageAnnotations.find(
    ia => ia.imageUrl === activeImageUrl
  )?.annotations || [];

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
            Add comments to each image. Click anywhere on an image to add specific feedback points.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Image tabs and viewer */}
            <div className="lg:col-span-3">
              <Tabs value={activeImageUrl} onValueChange={setActiveImageUrl}>
                <TabsList className="grid w-full mb-4" style={{ gridTemplateColumns: `repeat(${workflow.selectedImages.length}, 1fr)` }}>
                  {workflow.selectedImages.map((imageUrl, index) => {
                    const imageAnnotations = workflow.imageAnnotations.find(ia => ia.imageUrl === imageUrl);
                    const annotationCount = imageAnnotations?.annotations.length || 0;
                    
                    return (
                      <TabsTrigger 
                        key={imageUrl} 
                        value={imageUrl}
                        className="flex items-center gap-2"
                      >
                        Image {index + 1}
                        {annotationCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {annotationCount}
                          </Badge>
                        )}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {workflow.selectedImages.map((imageUrl) => (
                  <TabsContent key={imageUrl} value={imageUrl}>
                    <div className="relative bg-white rounded-lg p-4">
                      <img
                        src={imageUrl}
                        alt="Selected design"
                        className="w-full h-auto cursor-crosshair rounded"
                        onClick={handleImageClick}
                      />
                      
                      {/* Annotations for this image */}
                      {workflow.imageAnnotations
                        .find(ia => ia.imageUrl === imageUrl)
                        ?.annotations.map((annotation) => (
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
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">
                  Analysis Summary
                </h3>
                <div className="space-y-2">
                  <div className="bg-slate-700 p-3 rounded">
                    <div className="text-sm font-medium">Selected Images</div>
                    <div className="text-2xl font-bold text-blue-500">{workflow.selectedImages.length}</div>
                  </div>
                  <div className="bg-slate-700 p-3 rounded">
                    <div className="text-sm font-medium">Total Comments</div>
                    <div className="text-2xl font-bold text-green-500">{totalAnnotations}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">
                  Comments on Current Image ({currentImageAnnotations.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentImageAnnotations.map((annotation, index) => (
                    <div key={annotation.id} className="bg-slate-700 p-2 rounded text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium">#{index + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                          className="h-4 w-4 p-0 text-slate-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-slate-300 text-xs line-clamp-2">{annotation.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  General Analysis Context
                </label>
                <Textarea
                  value={workflow.analysisContext}
                  onChange={(e) => workflow.setAnalysisContext(e.target.value)}
                  placeholder="Add context for comparative analysis across all images..."
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
              disabled={totalAnnotations === 0 && !workflow.analysisContext.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze {workflow.selectedImages.length} Image{workflow.selectedImages.length > 1 ? 's' : ''}
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
