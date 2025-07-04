import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFileUpload } from '@/hooks/useFileUpload';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';

interface FileItem {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}

interface EnhancedFileThumbnailsProps {
  files: string[];
  currentFileIndex: number;
  onFileSelect: (index: number) => void;
  onFileRemove: (index: number) => void;
  onFilesAdd: (files: string[]) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  maxFiles?: number;
}

export const EnhancedFileThumbnails: React.FC<EnhancedFileThumbnailsProps> = ({
  files,
  currentFileIndex,
  onFileSelect,
  onFileRemove,
  onFilesAdd,
  isUploading = false,
  uploadProgress = 0,
  maxFiles = 5
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleFileUpload } = useFileUpload((imageUrl: string) => {
    console.log('🔥 ENHANCED THUMBNAILS - UPLOAD COMPLETE:', imageUrl);
    onFilesAdd([imageUrl]);
  });

  const canUploadMore = files.length < maxFiles;

  // File validation
  const isValidImageFile = (file: File): boolean => {
    const validMimeTypes = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 
      'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'
    ];
    
    if (validMimeTypes.includes(file.type)) return true;
    
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canUploadMore && !isUploading) {
      setIsDragOver(true);
    }
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
    
    if (!canUploadMore || isUploading) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      Array.from(droppedFiles).forEach((file) => {
        if (isValidImageFile(file) && files.length < maxFiles) {
          // Use proper file upload instead of creating blob URLs
          handleFileUpload(file);
        }
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && canUploadMore && !isUploading) {
      Array.from(selectedFiles).forEach((file) => {
        if (isValidImageFile(file) && files.length < maxFiles) {
          // Use proper file upload instead of creating blob URLs
          handleFileUpload(file);
        }
      });
    }
    e.target.value = '';
  };

  const getFileName = (url: string, index: number) => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const filename = path.split('/').pop();
      return filename && filename !== '' ? filename : `Design ${index + 1}`;
    } catch {
      return `Design ${index + 1}`;
    }
  };

  return (
    <div className="w-80 border-r border-border bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Design Files</h2>
          <Badge variant="secondary" className="text-xs">
            {files.length}/{maxFiles}
          </Badge>
        </div>
        
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1" />
          </div>
        )}
      </div>

      {/* Upload Area */}
      {canUploadMore && (
        <div className="p-4 border-b border-border">
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30'
            } ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isUploading}
            />
            
            <Upload className={`w-6 h-6 mx-auto mb-2 ${
              isDragOver ? 'text-primary' : 'text-muted-foreground'
            }`} />
            
            <p className="text-sm font-medium mb-1">
              {isDragOver ? 'Drop here!' : 'Upload Files'}
            </p>
            
            <p className="text-xs text-muted-foreground">
              PNG, JPG, SVG, WebP up to {maxFiles - files.length} more
            </p>
          </div>
        </div>
      )}

      {/* Files Grid */}
      <div className="flex-1 overflow-y-auto">
        {files.length > 0 ? (
          <div className="p-4 space-y-3">
            {files.map((file, index) => (
              <div 
                key={index} 
                className={`group relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                  index === currentFileIndex 
                    ? 'ring-2 ring-primary border-primary shadow-md' 
                    : 'border-border hover:border-primary/50 hover:shadow-sm'
                }`}
                onClick={() => onFileSelect(index)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-muted/50 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={file}
                    alt={getFileName(file, index)}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  
                  {/* Active indicator */}
                  {index === currentFileIndex && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center">
                        <Eye className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                  
                  {/* Remove button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileRemove(index);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                {/* File info */}
                <div className="p-3">
                  <p className="text-sm font-medium truncate">
                    {getFileName(file, index)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <ImageIcon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Image</span>
                    {index === currentFileIndex && (
                      <Badge variant="secondary" className="text-xs ml-auto">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <div className="w-16 h-16 bg-muted/50 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="font-medium mb-2">No files uploaded</h3>
            <p className="text-sm">
              Upload your design files to get started with analysis
            </p>
          </div>
        )}
      </div>

      {/* Footer info */}
      {files.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{files.length} file{files.length !== 1 ? 's' : ''} uploaded</span>
            <span>Ready for analysis</span>
          </div>
        </div>
      )}
    </div>
  );
};