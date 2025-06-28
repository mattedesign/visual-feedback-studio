
import { useState } from 'react';
import { Upload, Plus, Link, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUploadLogic } from '@/hooks/useUploadLogic';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface SidebarUploadProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  collapsed: boolean;
}

export const SidebarUpload = ({ workflow, collapsed }: SidebarUploadProps) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    console.log('Sidebar upload completed:', imageUrl);
    workflow.addUploadedFile(imageUrl);
    
    // If this is the first image, select it immediately
    if (workflow.uploadedFiles.length === 0) {
      workflow.selectImage(imageUrl);
    }
    
    // If we're in annotate step, switch to the new image
    if (workflow.currentStep === 'annotate') {
      workflow.setActiveImage(imageUrl);
    }
  };

  const { isProcessing, handleFileUpload, handleUrlSubmit } = useUploadLogic(handleImageUpload);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
    // Reset input
    event.target.value = '';
  };

  const handleUrlSubmitClick = () => {
    if (urlValue.trim()) {
      handleUrlSubmit(urlValue.trim());
      setUrlValue('');
      setShowUrlInput(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('image/')) {
      handleFileUpload(files[0]);
    }
  };

  if (collapsed) {
    return (
      <div className="p-2">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full h-10 p-0"
            disabled={isProcessing}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200 dark:border-slate-600">
      {/* Drag and Drop Zone */}
      <div
        className={`mb-3 p-3 border-2 border-dashed rounded-lg transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Drop images here
          </p>
        </div>
      </div>

      {/* Upload Buttons */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isProcessing}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isProcessing ? 'Uploading...' : 'Add Image'}
          </Button>
        </div>

        {!showUrlInput ? (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setShowUrlInput(true)}
            disabled={isProcessing}
          >
            <Link className="w-4 h-4 mr-2" />
            Add from URL
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Input
                type="url"
                placeholder="Enter image URL..."
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                className="text-sm"
                disabled={isProcessing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUrlSubmitClick();
                  }
                }}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlValue('');
                }}
                className="p-1 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Button
              size="sm"
              onClick={handleUrlSubmitClick}
              disabled={!urlValue.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Adding...' : 'Add URL'}
            </Button>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 text-center">
          Processing upload...
        </div>
      )}
    </div>
  );
};
