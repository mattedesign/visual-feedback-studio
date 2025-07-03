import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, MessageSquare, X, Image as ImageIcon } from 'lucide-react';
import { SimplifiedContextInput } from './SimplifiedContextInput';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useUploadLogic } from '@/hooks/useUploadLogic';
import { UploadTestHelper } from './UploadTestHelper';

interface FigmaInspiredUploadInterfaceProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const FigmaInspiredUploadInterface: React.FC<FigmaInspiredUploadInterfaceProps> = ({
  workflow
}) => {
  const [activeTab, setActiveTab] = useState('files');
  const [isDragOver, setIsDragOver] = useState(false);
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
          const objectUrl = URL.createObjectURL(file);
          setTimeout(() => {
            handleUploadComplete(objectUrl);
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
          const objectUrl = URL.createObjectURL(file);
          setTimeout(() => {
            handleUploadComplete(objectUrl);
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

  const canAnalyze = workflow.selectedImages.length > 0 && workflow.analysisContext.trim().length > 0;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-bold">Start Your Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Upload your design files and add context to get AI-powered insights
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="files" className="flex items-center gap-2">
              <File className="w-4 h-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="annotations" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Annotations
            </TabsTrigger>
            <TabsTrigger value="context" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Add Context
            </TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files" className="mt-6 space-y-6">
            {/* Test Helper */}
            <UploadTestHelper />
            
            {/* Drag and Drop Area */}
            <Card>
              <CardContent className="p-8">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
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
                  
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${
                    isDragOver ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  
                  <h3 className="text-lg font-semibold mb-2">
                    {isDragOver ? 'Drop files here!' : 'Upload Design Files'}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your images here, or click to browse
                  </p>
                  
                  <p className="text-sm text-muted-foreground">
                    Supports PNG, JPG, SVG, WebP • Up to 5 files
                  </p>
                  
                  {isProcessing && (
                    <p className="text-sm text-primary mt-2">Processing upload...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files Preview */}
            {workflow.selectedImages.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">
                    Uploaded Files ({workflow.selectedImages.length}/5)
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {workflow.selectedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Uploaded file ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          Image {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Annotations Tab */}
          <TabsContent value="annotations" className="mt-6">
            <Card>
              <CardContent className="p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Annotations Preview</h3>
                <p className="text-muted-foreground">
                  Upload files and start analysis to see annotations here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add Context Tab */}
          <TabsContent value="context" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Analysis Context</h3>
                <SimplifiedContextInput 
                  analysisContext={workflow.analysisContext}
                  onAnalysisContextChange={workflow.setAnalysisContext}
                  onAnalyze={async () => {
                    if (canAnalyze) {
                      workflow.goToStep('analyzing');
                    }
                  }}
                  canAnalyze={canAnalyze}
                  isAnalyzing={workflow.isAnalyzing}
                  uploadedImageCount={workflow.selectedImages.length}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Action Bar */}
      <div className="border-t border-border p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {workflow.selectedImages.length > 0 && (
              <span>{workflow.selectedImages.length} file(s) uploaded</span>
            )}
          </div>
          
          <Button
            onClick={() => {
              if (canAnalyze) {
                workflow.goToStep('analyzing');
              }
            }}
            disabled={!canAnalyze || workflow.isAnalyzing}
            size="lg"
          >
            {workflow.isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </div>
      </div>
    </div>
  );
};