import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Plus, Send, Sparkles, Zap, Brain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useUploadLogic } from '@/hooks/useUploadLogic';

interface FigmaInspiredUploadInterfaceProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const FigmaInspiredUploadInterface: React.FC<FigmaInspiredUploadInterfaceProps> = ({
  workflow
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState(workflow.analysisContext || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced file upload handler
  const handleUploadComplete = (imageUrl: string) => {
    console.log('🔥 UPLOAD COMPLETE - FIGMA INTERFACE:', imageUrl);
    workflow.addUploadedFile(imageUrl);
  };

  const { isProcessing, handleFileUpload } = useUploadLogic(handleUploadComplete);

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
          // Use the proper file upload hook instead of object URLs
          setTimeout(() => {
            handleFileUpload(file);
          }, index * 100);
        }
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file, index) => {
        if (isValidImageFile(file)) {
          // Use the proper file upload hook instead of object URLs
          setTimeout(() => {
            handleFileUpload(file);
          }, index * 100);
        }
      });
    }
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = [...workflow.selectedImages];
    newImages.splice(index, 1);
    workflow.selectImages(newImages);
  };

  const handleSendMessage = () => {
    if (!message.trim() || workflow.selectedImages.length === 0) return;
    
    workflow.setAnalysisContext(message);
    workflow.goToStep('analyzing');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const canAnalyze = workflow.selectedImages.length > 0 && message.trim().length > 0;

  return (
    <div className="h-full flex bg-background">
      {/* Left Panel - Image Grid */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Design Files</h2>
          <p className="text-sm text-muted-foreground">
            {workflow.selectedImages.length}/5 uploaded
          </p>
        </div>

        {/* Upload Area */}
        <div className="p-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-primary bg-primary/5 scale-[1.02]'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30'
            } ${
              isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isProcessing}
            />
            
            <Upload className={`w-8 h-8 mx-auto mb-2 ${
              isDragOver ? 'text-primary' : 'text-muted-foreground'
            }`} />
            
            <p className="text-sm font-medium mb-1">
              {isDragOver ? 'Drop here!' : 'Upload Files'}
            </p>
            
            <p className="text-xs text-muted-foreground">
              PNG, JPG, SVG, WebP
            </p>
            
            {isProcessing && (
              <p className="text-xs text-primary mt-2">Processing...</p>
            )}
          </div>
        </div>

        {/* Image Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {workflow.selectedImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {workflow.selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/20 transition-colors">
                    <img
                      src={image}
                      alt={`Design ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Design {index + 1}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No files uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold">Design Analysis Studio</h1>
          <p className="text-muted-foreground mt-1">
            Upload your designs and describe what you'd like to analyze
          </p>
        </div>

        {/* Canvas Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          {workflow.selectedImages.length > 0 ? (
            <div className="w-full max-w-4xl">
              {/* Preview of first image */}
              <div className="relative bg-muted/30 rounded-xl p-8 mb-6">
                <div className="aspect-video bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
                  <img
                    src={workflow.selectedImages[0]}
                    alt="Primary design"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                {workflow.selectedImages.length > 1 && (
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1 text-sm text-muted-foreground">
                      +{workflow.selectedImages.length - 1} more
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Ready State */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready for Analysis</h3>
                <p className="text-muted-foreground mb-6">
                  Your designs are uploaded. Add context below to start the AI analysis.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-md">
              {/* Empty State */}
              <div className="relative mb-6">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-full mx-auto flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
                  
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center relative z-10">
                    <Upload className="w-10 h-10 text-primary drop-shadow-lg" />
                  </div>
                  
                  <div className="absolute top-2 right-6 w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <div className="absolute bottom-4 left-4 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <Zap className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <div className="absolute top-6 left-2 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                    <Brain className="w-2 h-2 text-primary" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">Upload Your Designs</h3>
              <p className="text-muted-foreground mb-6">
                Start by uploading your design files using the panel on the left. 
                Then describe what you'd like to analyze.
              </p>
              
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  💡 Tip: Upload 2-5 images for the best analysis results
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Chat Bar */}
      <div className="absolute bottom-0 left-80 right-0 p-6 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  workflow.selectedImages.length > 0 
                    ? "Describe what you'd like to analyze about these designs..."
                    : "Upload designs first, then describe your analysis goals..."
                }
                className="min-h-[3rem] text-base resize-none"
                disabled={workflow.selectedImages.length === 0 || workflow.isAnalyzing}
              />
              
              {workflow.selectedImages.length > 0 && (
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{workflow.selectedImages.length} design{workflow.selectedImages.length !== 1 ? 's' : ''} ready</span>
                  </div>
                  <span>•</span>
                  <span>AI-powered analysis with 272+ UX research studies</span>
                </div>
              )}
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!canAnalyze || workflow.isAnalyzing}
              size="lg"
              className="px-6"
            >
              {workflow.isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};