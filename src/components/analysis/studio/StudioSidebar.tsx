
import { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useImageSelection } from '@/hooks/analysis/useImageSelection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileImage, 
  CheckCircle, 
  Eye, 
  MessageSquare, 
  Brain, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface StudioSidebarProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  collapsed: boolean;
  onToggle: () => void;
}

export const StudioSidebar = ({ workflow, collapsed, onToggle }: StudioSidebarProps) => {
  const [showUploadDetails, setShowUploadDetails] = useState(false);
  const { selectImage, isImageActive, getImageStyle } = useImageSelection(workflow.activeImageUrl);

  const handleImageSelect = (imageUrl: string) => {
    console.log('🎯 StudioSidebar: Image selected for highlighting:', imageUrl);
    selectImage(imageUrl);
    workflow.setActiveImageUrl(imageUrl);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'upload': return Upload;
      case 'review': return Eye;
      case 'annotate': return MessageSquare;
      case 'analyzing': return Brain;
      case 'results': return BarChart3;
      default: return Upload;
    }
  };

  const getStepStatus = (step: string) => {
    const steps = ['upload', 'review', 'annotate', 'analyzing', 'results'];
    const currentIndex = steps.indexOf(workflow.currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepProgress = () => {
    const steps = ['upload', 'review', 'annotate', 'analyzing', 'results'];
    const currentIndex = steps.indexOf(workflow.currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  if (collapsed) {
    return (
      <div className="w-16 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex-1 p-2 space-y-2">
          {workflow.uploadedFiles.map((imageUrl, index) => (
            <div
              key={imageUrl}
              className={`aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200 overflow-hidden ${getImageStyle(imageUrl)}`}
              onClick={() => handleImageSelect(imageUrl)}
            >
              <img
                src={imageUrl}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis Studio</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {Math.round(getStepProgress())}%
            </span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Workflow Steps</h3>
          <div className="space-y-2">
            {[
              { id: 'upload', label: 'Upload Images', count: workflow.uploadedFiles.length },
              { id: 'review', label: 'Review & Select', count: workflow.selectedImages.length },
              { id: 'annotate', label: 'Add Context', count: workflow.getTotalUserAnnotationsCount() },
              { id: 'analyzing', label: 'AI Analysis', count: 0 },
              { id: 'results', label: 'View Results', count: workflow.aiAnnotations.length }
            ].map((step) => {
              const Icon = getStepIcon(step.id);
              const status = getStepStatus(step.id);
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                    status === 'active' 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                      : status === 'completed'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    status === 'active' 
                      ? 'bg-blue-600 text-white' 
                      : status === 'completed'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{step.label}</div>
                    {step.count > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {step.count} {step.id === 'upload' ? 'files' : step.id === 'annotate' ? 'annotations' : 'items'}
                      </div>
                    )}
                  </div>
                  {step.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {step.count}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Uploaded Images */}
        {workflow.uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Images ({workflow.uploadedFiles.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadDetails(!showUploadDetails)}
                className="text-xs"
              >
                {showUploadDetails ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {workflow.uploadedFiles.map((imageUrl, index) => (
                <Card 
                  key={imageUrl} 
                  className={`cursor-pointer transition-all duration-200 border-2 overflow-hidden ${getImageStyle(imageUrl)}`}
                  onClick={() => handleImageSelect(imageUrl)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square relative">
                      <img
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Active indicator */}
                      {isImageActive(imageUrl) && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                      )}
                      
                      {/* Selection indicator */}
                      {workflow.selectedImages.includes(imageUrl) && (
                        <div className="absolute top-2 left-2">
                          <CheckCircle className="w-4 h-4 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                      
                      {/* Image number */}
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                    
                    {showUploadDetails && (
                      <div className="p-2 border-t border-gray-200 dark:border-slate-700">
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          Image {index + 1}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            <FileImage className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {workflow.selectedImages.includes(imageUrl) ? 'Selected' : 'Available'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => workflow.goToStep('upload')}
              className="w-full justify-start"
            >
              <Upload className="w-4 h-4 mr-2" />
              Add More Images
            </Button>
            
            {workflow.uploadedFiles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => workflow.resetWorkflow()}
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
