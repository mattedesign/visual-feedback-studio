import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, X, Plus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export const EnhancedImageUpload = ({ 
  value = [], 
  onChange, 
  maxFiles = 5, 
  maxSize = 10 * 1024 * 1024,
  className 
}: EnhancedImageUploadProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...value, ...acceptedFiles].slice(0, maxFiles);
    onChange(newFiles);

    // Simulate loading for new images
    acceptedFiles.forEach(file => {
      const fileUrl = URL.createObjectURL(file);
      setLoadingImages(prev => new Set([...prev, fileUrl]));
      
      // Simulate image processing time
      setTimeout(() => {
        setLoadingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileUrl);
          return newSet;
        });
        setLoadedImages(prev => new Set([...prev, fileUrl]));
        
        // Remove success indicator after 2 seconds
        setTimeout(() => {
          setLoadedImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(fileUrl);
            return newSet;
          });
        }, 2000);
      }, 800 + Math.random() * 400); // Random delay between 800-1200ms
    });
  }, [value, onChange, maxFiles]);

  const removeImage = (indexToRemove: number) => {
    const newFiles = value.filter((_, index) => index !== indexToRemove);
    onChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tiff']
    },
    maxFiles: maxFiles - value.length,
    maxSize,
    multiple: true
  });

  const canUploadMore = value.length < maxFiles;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Zone - Only show when no images */}
      {value.length === 0 && (
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer",
            "hover:border-primary/50 hover:bg-accent/30",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            isDragActive && "border-primary bg-primary/10 scale-[1.02]",
            isDragReject && "border-destructive bg-destructive/10",
            !isDragActive && !isDragReject && "border-border"
          )}
        >
          <input {...getInputProps()} />
          
          <div className="p-8 text-center">
            <div className="relative mb-4">
              <div className={cn(
                "mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300",
                isDragActive && "bg-primary/20 scale-110"
              )}>
                <Camera className={cn(
                  "w-8 h-8 text-primary transition-all duration-300",
                  isDragActive && "scale-110"
                )} />
              </div>
              
              {isDragActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-primary border-dashed animate-spin" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-medium text-foreground mb-2">
              {isDragActive ? 'Drop your images here' : 'Drag and drop images, code or Browse'}
            </h3>
            
            <p className="text-xs text-muted-foreground">
              Supports PNG, JPG, WebP, SVG • Max 10MB each • Up to {maxFiles} images
            </p>
          </div>
        </div>
      )}

      {/* Horizontal Image Display with Add Button */}
      {value.length > 0 && (
        <div className="border-2 border-dashed border-border rounded-xl p-6">
          <div className="flex items-center gap-4 overflow-x-auto">
            {/* Display uploaded images */}
            {value.map((file, index) => {
              const imageUrl = URL.createObjectURL(file);
              const isLoading = loadingImages.has(imageUrl);
              const isLoaded = loadedImages.has(imageUrl);
              
              return (
                <div key={index} className="flex-shrink-0 group relative">
                  <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted border relative">
                    <img
                      src={imageUrl}
                      alt={`Upload ${index + 1}`}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-300",
                        isLoading && "opacity-50 blur-sm"
                      )}
                    />
                    
                    {/* Loading Overlay */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <div className="bg-background rounded-full p-2 shadow-sm">
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        </div>
                      </div>
                    )}
                    
                    {/* Success Indicator */}
                    {isLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
                        <div className="bg-green-500 text-white rounded-full p-2 shadow-lg animate-scale-in">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className={cn(
                        "absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1",
                        "opacity-0 group-hover:opacity-100 transition-all duration-200",
                        "hover:scale-110 hover:bg-destructive/90",
                        "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-destructive/20"
                      )}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add More Button - Only show if can upload more */}
            {canUploadMore && (
              <div
                {...getRootProps()}
                className="flex-shrink-0 w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all duration-200"
              >
                <input {...getInputProps()} />
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Image count and limit info */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>{value.length}/{maxFiles} images uploaded</span>
            <span>Max 10MB each</span>
          </div>
        </div>
      )}

      {/* Upload Limit Notice */}
      {value.length >= maxFiles && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-3">
            <p className="text-sm text-warning-foreground text-center flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Maximum of {maxFiles} images reached. Remove an image to upload more.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};