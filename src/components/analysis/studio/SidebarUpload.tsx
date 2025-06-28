
import { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragAreaFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (imageUrl: string) => {
    console.log('Sidebar upload completed:', imageUrl);
    workflow.addUploadedFile(imageUrl);
    
    // If this is the first image, select it immediately and go to annotate
    if (workflow.uploadedFiles.length === 0) {
      workflow.selectImage(imageUrl);
      workflow.goToStep('annotate');
    }
    
    // If we're in annotate step, switch to the new image
    if (workflow.currentStep === 'annotate') {
      workflow.setActiveImage(imageUrl);
    }
  };

  const { isProcessing, handleFileUpload, handleUrlSubmit } = useUploadLogic(handleImageUpload);

  const handleMultipleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Process multiple files
      Array.from(files).forEach((file, index) => {
        // Add a small delay between uploads to prevent race conditions
        setTimeout(() => {
          handleFileUpload(file);
        }, index * 100);
      });
    }
    // Reset input
    event.target.value = '';
  };

  const handleDragAreaFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Process multiple files
      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          setTimeout(() => {
            handleFileUpload(file);
          }, index * 100);
        }
      });
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
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the drag area completely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Process multiple dropped files
      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          setTimeout(() => {
            handleFileUpload(file);
          }, index * 100);
        }
      });
    }
  };

  const handleDragAreaClick = () => {
    if (!isProcessing && canUploadMore) {
      dragAreaFileInputRef.current?.click();
    }
  };

  if (collapsed) {
    return (
      <div className="p-2">
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultipleFileInputChange}
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

  const canUploadMore = workflow.uploadedFiles.length < 5;

  return (
    <div className="p-4 border-b border-gray-200 dark:border-slate-600">
      {/* Hidden file input for drag area */}
      <input
        ref={dragAreaFileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleDragAreaFileInputChange}
        className="hidden"
        disabled={isProcessing || !canUploadMore}
      />

      {/* Drag and Drop Zone */}
      <div
        className={`mb-3 p-3 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-lg'
            : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800/50'
        } ${
          (!canUploadMore || isProcessing) 
            ? 'opacity-50 cursor-not-allowed' 
            : 'active:scale-[0.98]'
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDragAreaClick}
      >
        <div className="text-center">
          <Upload className={`w-5 h-5 mx-auto mb-1 transition-colors ${
            isDragOver 
              ? 'text-blue-500' 
              : 'text-gray-400'
          }`} />
          <p className={`text-xs transition-colors ${
            isDragOver 
              ? 'text-blue-600 dark:text-blue-400 font-medium' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {isDragOver 
              ? 'Drop images here!' 
              : 'Drop images here or click to select (up to 5)'
            }
          </p>
        </div>
      </div>

      {/* Upload Buttons */}
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultipleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing || !canUploadMore}
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isProcessing || !canUploadMore}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isProcessing ? 'Uploading...' : 'Upload Images'}
          </Button>
        </div>

        {!showUrlInput ? (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => setShowUrlInput(true)}
            disabled={isProcessing || !canUploadMore}
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
              disabled={!urlValue.trim() || isProcessing || !canUploadMore}
              className="w-full"
            >
              {isProcessing ? 'Adding...' : 'Add URL'}
            </Button>
          </div>
        )}
      </div>

      {/* Upload limit indicator */}
      {workflow.uploadedFiles.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {workflow.uploadedFiles.length}/5 images uploaded
          {!canUploadMore && " (limit reached)"}
        </div>
      )}

      {isProcessing && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 text-center">
          Processing upload...
        </div>
      )}
    </div>
  );
};
