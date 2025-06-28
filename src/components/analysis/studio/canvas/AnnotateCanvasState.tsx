
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Button } from '@/components/ui/button';
import { Monitor, Tablet, Smartphone, Plus, MessageCircle } from 'lucide-react';

interface AnnotateCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

export const AnnotateCanvasState = ({ workflow, selectedDevice }: AnnotateCanvasStateProps) => {
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState({ x: 0, y: 0, comment: '', imageUrl: '' });

  // Get the currently active image
  const currentImageUrl = workflow.activeImageUrl || workflow.selectedImages[0];
  
  const handleImageClick = (event: React.MouseEvent, imageUrl: string) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    setCurrentAnnotation({ x, y, comment: '', imageUrl });
    setShowAnnotationModal(true);
  };

  const saveAnnotation = () => {
    if (currentAnnotation.comment.trim()) {
      workflow.addUserAnnotation(currentAnnotation.imageUrl, {
        x: currentAnnotation.x,
        y: currentAnnotation.y,
        comment: currentAnnotation.comment
      });
      setShowAnnotationModal(false);
      setCurrentAnnotation({ x: 0, y: 0, comment: '', imageUrl: '' });
    }
  };

  const getUserAnnotationsForImage = (imageUrl: string) => {
    const imageAnnotations = workflow.imageAnnotations.find(ia => ia.imageUrl === imageUrl);
    return imageAnnotations?.annotations || [];
  };

  const deviceIcon = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone
  }[selectedDevice];

  const DeviceIcon = deviceIcon;

  if (!currentImageUrl) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No image selected for annotation</p>
        </div>
      </div>
    );
  }

  const userAnnotations = getUserAnnotationsForImage(currentImageUrl);
  const currentImageIndex = workflow.uploadedFiles.indexOf(currentImageUrl);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Annotate Image {currentImageIndex + 1}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <DeviceIcon className="w-4 h-4" />
            <span className="capitalize">{selectedDevice} view</span>
          </div>
          {workflow.uploadedFiles.length > 1 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentImageIndex + 1} of {workflow.uploadedFiles.length}
            </div>
          )}
        </div>
      </div>

      <div className="relative inline-block max-w-full">
        <img
          src={currentImageUrl}
          alt="Design for annotation"
          onClick={(e) => handleImageClick(e, currentImageUrl)}
          className="max-w-full h-auto cursor-crosshair rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
          style={{ maxHeight: '70vh' }}
        />
        
        {/* User Annotations */}
        {userAnnotations.map((annotation, index) => (
          <div
            key={annotation.id}
            className="absolute w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform"
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`
            }}
            title={annotation.comment}
          >
            <span className="text-white text-xs font-bold">{index + 1}</span>
          </div>
        ))}
      </div>

      {userAnnotations.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Your Annotations ({userAnnotations.length}):
          </h4>
          <div className="space-y-2">
            {userAnnotations.map((annotation, index) => (
              <div key={annotation.id} className="flex items-start space-x-2 text-sm">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">{index + 1}</span>
                </div>
                <span className="text-gray-700 dark:text-gray-300">{annotation.comment}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {userAnnotations.length === 0 && (
        <div className="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-lg">
          <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">
            Click anywhere on the image to add your first annotation
          </p>
        </div>
      )}

      {workflow.uploadedFiles.length > 1 && (
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 Switch between images using the sidebar to annotate each one separately
          </p>
        </div>
      )}

      {/* Annotation Modal */}
      {showAnnotationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-700 rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Annotation</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comment
              </label>
              <textarea
                value={currentAnnotation.comment}
                onChange={(e) => setCurrentAnnotation(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Describe what needs attention at this location..."
                className="w-full h-24 p-3 border border-gray-300 dark:border-slate-500 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-slate-600 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Position: {currentAnnotation.x.toFixed(1)}%, {currentAnnotation.y.toFixed(1)}%
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAnnotationModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveAnnotation}
                  disabled={!currentAnnotation.comment.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Annotation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
