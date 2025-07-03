
import { useState, useRef } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadLogic } from '@/hooks/useUploadLogic';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface SidebarUploadProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  collapsed: boolean;
}

export const SidebarUpload = ({ workflow, collapsed }: SidebarUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragAreaFileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 HIDE UPLOAD ON RESULTS STEP
  const isResultsStep = workflow.currentStep === 'results';

  // Don't render upload section if on results step
  if (isResultsStep) {
    return null;
  }

  // Enhanced file upload handler with proper validation
  const handleUploadComplete = (imageUrl: string) => {
    console.log('🔥 UPLOAD COMPLETE - SINGLE HANDLER:', imageUrl);
    
    // Add to workflow using the simplified interface
    workflow.addUploadedFile(imageUrl);
    
    // Handle navigation - stay on upload step to allow adding context
    console.log('🔥 IMAGE ADDED - STAYING ON UPLOAD FOR CONTEXT');
  };

  const { isProcessing, handleFileUpload } = useUploadLogic(handleUploadComplete);

  // Enhanced file validation function
  const isValidImageFile = (file: File): boolean => {
    // Check MIME type first
    const validMimeTypes = [
      'image/png',
      'image/jpeg', 
      'image/jpg',
      'image/gif',
      'image/webp',
      'image/svg+xml', // ✅ Explicitly include SVG MIME type
      'image/bmp',
      'image/tiff'
    ];
    
    if (validMimeTypes.includes(file.type)) {
      return true;
    }
    
    // Fallback: check file extension for SVG files (some browsers don't set MIME type correctly)
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
    
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleMultipleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Process multiple files with validation
      Array.from(files).forEach((file, index) => {
        if (isValidImageFile(file)) {
          const objectUrl = URL.createObjectURL(file);
          setTimeout(() => {
            handleUploadComplete(objectUrl);
          }, index * 100);
        } else {
          console.warn('Invalid file type:', file.name, file.type);
        }
      });
    }
    // Reset input
    event.target.value = '';
  };

  const handleDragAreaFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file, index) => {
        if (isValidImageFile(file)) {
          const objectUrl = URL.createObjectURL(file);
          setTimeout(() => {
            handleUploadComplete(objectUrl);
          }, index * 100);
        } else {
          console.warn('Invalid file type:', file.name, file.type);
        }
      });
    }
    // Reset input
    event.target.value = '';
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
      Array.from(files).forEach((file, index) => {
        if (isValidImageFile(file)) {
          const objectUrl = URL.createObjectURL(file);
          setTimeout(() => {
            handleUploadComplete(objectUrl);
          }, index * 100);
        } else {
          console.warn('Invalid file type:', file.name, file.type);
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
            accept="image/*,.svg"
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

  const canUploadMore = workflow.selectedImages.length < 5;

  return (
    <div className="p-4">
      {/* Hidden file input for drag area */}
      <input
        ref={dragAreaFileInputRef}
        type="file"
        accept="image/*,.svg"
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
              : 'Drop images here or click to select (PNG, JPG, SVG, WebP - up to 5)'
            }
          </p>
        </div>
      </div>

      {/* Upload limit indicator */}
      {workflow.selectedImages.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {workflow.selectedImages.length}/5 images uploaded
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
