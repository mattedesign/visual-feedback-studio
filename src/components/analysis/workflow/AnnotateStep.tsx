
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { X, MessageSquare, Lightbulb, AlertCircle } from 'lucide-react';
import { MultiImageAnnotateStep } from './MultiImageAnnotateStep';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnalysisValidator } from './components/AnalysisValidator';

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

  // Get annotations for the current selected image
  const currentImageAnnotations = workflow.selectedImageUrl 
    ? (workflow.userAnnotations[workflow.selectedImageUrl] || [])
    : [];

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
    const annotation = currentImageAnnotations.find(ann => ann.id === id);
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ✅ FIXED: Analysis Context Input */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            Analysis Context
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Describe what you want analyzed about this design (required for AI analysis)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={workflow.analysisContext}
            onChange={(e) => workflow.setAnalysisContext(e.target.value)}
            placeholder="Example: Analyze the user onboarding flow for conversion optimization. Focus on clarity of navigation, form completion barriers, and mobile usability issues."
            className="min-h-24 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
            maxLength={2000}
          />
          
          <div className="flex justify-between items-center text-sm">
            <span className={`${workflow.analysisContext.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
              {workflow.analysisContext.length}/2000 characters 
              {workflow.analysisContext.length < 10 && ' (minimum 10)'}
            </span>
            
            {workflow.analysisContext.length >= 10 && (
              <span className="text-green-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Ready for analysis
              </span>
            )}
          </div>
          
          {workflow.analysisContext.length < 10 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                Please provide more detailed context (at least 10 characters) to ensure high-quality analysis results.
              </AlertDescription>
            </Alert>
          )}
          
          {/* ✅ FIXED: Real-time validation feedback */}
          <AnalysisValidator
            images={workflow.selectedImages}
            analysisContext={workflow.analysisContext}
            analysisId={workflow.currentAnalysis?.id}
          />
          
          <div className="flex justify-center">
            <Button
              onClick={workflow.goToNextStep}
              disabled={workflow.analysisContext.length < 10 || workflow.selectedImages.length === 0 || !workflow.currentAnalysis?.id}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Start Analysis ({workflow.selectedImages.length} image{workflow.selectedImages.length !== 1 ? 's' : ''})
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-gray-900 dark:text-white">Add Specific Comments (Optional)</CardTitle>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Click anywhere on the image to add specific comments about areas you'd like analyzed.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image viewer */}
            <div className="lg:col-span-2">
              <div className="relative bg-white rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600">
                <img
                  src={workflow.selectedImageUrl!}
                  alt="Selected design"
                  className="w-full h-auto cursor-crosshair rounded"
                  onClick={handleImageClick}
                />
                
                {/* User annotations */}
                {currentImageAnnotations.map((annotation) => (
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
                    
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{annotation.comment}</p>
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
                          className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
                <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Your Comments ({currentImageAnnotations.length})</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentImageAnnotations.map((annotation, index) => (
                    <div key={annotation.id} className="bg-gray-50 dark:bg-slate-700 p-3 rounded border border-gray-200 dark:border-slate-600">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Comment {index + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{annotation.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment dialog */}
      {showCommentDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                {editingId ? 'Edit Comment' : 'Add Comment'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="What would you like analyzed in this area?"
                className="text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowCommentDialog(false)}
                  className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
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
