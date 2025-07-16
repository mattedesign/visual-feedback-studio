import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Grid, Image as ImageIcon } from 'lucide-react';

interface AnalysisImage {
  id: string;
  file_name: string;
  file_path: string;
  image_index?: number;
  file_size?: number;
  processing_status?: string;
  signedUrl?: string;
  url?: string; // Alternative URL field
  canvas_position?: {
    x: number;
    y: number;
    zoom: number;
    rotation: number;
  };
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  feedback_type?: string;
  description?: string;
  image_id?: string;
}

interface MainCanvasProps {
  images: AnalysisImage[];
  selectedImageIndex: number | null;
  onImageSelect: (index: number | null) => void;
  onAnnotationCreate: (imageIndex: number, area: { x: number; y: number; width: number; height: number }, annotationData?: { label: string; feedback_type: string; description: string }) => void;
  onCanvasStateChange: (canvasState: any) => void;
  annotationMode: boolean;
  onImageUpload: (file: File) => void;
  onBatchImageUpload: (files: File[]) => void;
  annotations?: Annotation[];
}

export function MainCanvas({ 
  images, 
  selectedImageIndex, 
  onImageSelect, 
  onAnnotationCreate,
  onCanvasStateChange,
  annotationMode,
  onImageUpload,
  onBatchImageUpload,
  annotations = []
}: MainCanvasProps) {
  const [dragOver, setDragOver] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      if (files.length === 1) {
        onImageUpload(files[0]);
      } else {
        onBatchImageUpload(files);
      }
    }
  }, [onImageUpload, onBatchImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (files.length === 1) {
        onImageUpload(files[0]);
      } else {
        onBatchImageUpload(files);
      }
    }
  };

  // Annotation creation handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!annotationMode || selectedImageIndex === null) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentRect({ x, y, width: 0, height: 0 });
  }, [annotationMode, selectedImageIndex]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint || !annotationMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const x = Math.min(startPoint.x, currentX);
    const y = Math.min(startPoint.y, currentY);
    const width = Math.abs(currentX - startPoint.x);
    const height = Math.abs(currentY - startPoint.y);
    
    setCurrentRect({ x, y, width, height });
  }, [isDrawing, startPoint, annotationMode]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentRect || !annotationMode || selectedImageIndex === null) return;
    
    // Only create annotation if it has meaningful size (at least 1% width and height)
    if (currentRect.width > 1 && currentRect.height > 1) {
      onAnnotationCreate(selectedImageIndex, currentRect);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  }, [isDrawing, currentRect, annotationMode, selectedImageIndex, onAnnotationCreate]);

  // Empty state when no images
  if (images.length === 0) {
    return (
      <div 
        className={`h-full flex flex-col items-center justify-center border-2 border-dashed transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Upload Images to Begin
          </h3>
          <p className="text-muted-foreground mb-6">
            Drag and drop images here, or click to browse.
            Select multiple images to upload up to 5 at once for comparison.
          </p>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button asChild className="cursor-pointer">
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Images
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              Supported formats: PNG, JPG, GIF, WebP • Maximum 5 images • 0/5 uploaded
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Grid view when no specific image is selected
  if (selectedImageIndex === null) {
    return (
      <div className="h-full p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground">
              Images ({images.length}/5)
            </h3>
            <p className="text-sm text-muted-foreground">
              Maximum of 5 images reached
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onImageSelect(0)}
            disabled={images.length === 0}
          >
            <ImageIcon className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-[calc(100%-100px)] overflow-y-auto">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => onImageSelect(index)}
            >
              <img
                src={image.signedUrl || image.url || image.file_path || `/api/placeholder/300/300?text=${encodeURIComponent(image.file_name)}`}
                alt={image.file_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `/api/placeholder/300/300?text=${encodeURIComponent(image.file_name)}`;
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium truncate">
                  {image.file_name}
                </p>
                <p className="text-white/80 text-xs">
                  Ready
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            You've reached the maximum of 5 images. Select any image above to analyze it in detail.
          </p>
        </div>
      </div>
    );
  }

  // Single image view
  const selectedImage = images[selectedImageIndex];
  const imageAnnotations = annotations.filter(a => a.image_id === selectedImage?.id);

  return (
    <div className="h-full flex flex-col">
      {/* Image Navigation Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onImageSelect(null)}
            >
              <Grid className="w-4 h-4 mr-1" />
              Back to Grid
            </Button>
            <div className="h-4 w-px bg-border" />
            <div>
              <h3 className="font-medium text-foreground">
                {selectedImage?.file_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Image {selectedImageIndex + 1} of {images.length}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onImageSelect(Math.max(0, selectedImageIndex - 1))}
              disabled={selectedImageIndex <= 0}
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onImageSelect(Math.min(images.length - 1, selectedImageIndex + 1))}
              disabled={selectedImageIndex >= images.length - 1}
            >
              Next →
            </Button>
          </div>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="flex-1 bg-muted/20 relative overflow-hidden">
        {selectedImage ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div 
              className={`relative max-w-full max-h-full ${annotationMode ? 'cursor-crosshair' : 'cursor-default'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ userSelect: 'none' }}
            >
              <img
                src={selectedImage.signedUrl || selectedImage.url || selectedImage.file_path || `/api/placeholder/800/600?text=${encodeURIComponent(selectedImage.file_name)}`}
                alt={selectedImage.file_name}
                className="max-w-full max-h-full object-contain shadow-lg rounded-lg pointer-events-none"
                style={{ 
                  maxHeight: 'calc(100vh - 200px)',
                  maxWidth: 'calc(100vw - 700px)' // Account for sidebars
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `/api/placeholder/800/600?text=${encodeURIComponent(selectedImage.file_name)}`;
                }}
                draggable={false}
              />
              
              {/* Current drawing rectangle */}
              {isDrawing && currentRect && annotationMode && (
                <div
                  className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
                  style={{
                    left: `${currentRect.x}%`,
                    top: `${currentRect.y}%`,
                    width: `${currentRect.width}%`,
                    height: `${currentRect.height}%`
                  }}
                />
              )}
              
              {/* Existing Annotations Overlay */}
              {imageAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    width: `${annotation.width}%`,
                    height: `${annotation.height}%`
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                    {annotation.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">Image not found</p>
          </div>
        )}
      </div>
    </div>
  );
}