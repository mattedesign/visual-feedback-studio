import React, { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnhancedCanvasViewer } from './EnhancedCanvasViewer';
import { AnnotationSystem } from './AnnotationSystem';
import { EnhancedFileThumbnails } from './EnhancedFileThumbnails';
import { toast } from 'sonner';
import { 
  Upload, 
  Filter, 
  ArrowUpDown, 
  Users, 
  Mic, 
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Camera,
  ArrowLeft,
  ArrowRight,
  Eye,
  X,
  Send,
  Sparkles
} from 'lucide-react';

interface CenteredAnalysisInterfaceProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  category: 'ux' | 'visual' | 'accessibility' | 'performance' | 'content';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  comments: Comment[];
  createdAt: Date;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

export const CenteredAnalysisInterface: React.FC<CenteredAnalysisInterfaceProps> = ({
  workflow
}) => {
  const [analysisMessage, setAnalysisMessage] = useState(workflow.analysisContext || '');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnnotationMode, setIsAnnotationMode] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);

  const { handleFileUpload } = useFileUpload((imageUrl: string) => {
    console.log('🔥 CENTERED INTERFACE - UPLOAD COMPLETE:', imageUrl);
    workflow.addUploadedFile(imageUrl);
  }, workflow.currentAnalysis?.id);

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
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        handleFileUpload(file);
      });
    }
  };

  const handleStartAnalysis = () => {
    if (!analysisMessage.trim()) {
      toast.error('Please describe what you want me to analyze');
      return;
    }
    
    if (workflow.selectedImages.length === 0) {
      toast.error('Please upload at least one image to analyze');
      return;
    }
    
    console.log('🚀 Starting analysis with context:', {
      contextLength: analysisMessage.length,
      imageCount: workflow.selectedImages.length
    });
    
    workflow.setAnalysisContext(analysisMessage);
    workflow.goToStep('analyzing');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartAnalysis();
    }
  };

  const canAnalyze = workflow.selectedImages.length > 0 && analysisMessage.trim().length > 0;

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
    setIsAnnotationMode(true);
    setSelectedAnnotation(null);
    setPendingPosition(null);
  };

  const handleFileRemove = (index: number) => {
    const newImages = [...workflow.selectedImages];
    newImages.splice(index, 1);
    workflow.selectImages(newImages);
    
    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0);
      setIsAnnotationMode(false);
    }
  };

  const handleFilesAdd = (newFiles: string[]) => {
    newFiles.forEach((file) => {
      workflow.addUploadedFile(file);
    });
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (selectedAnnotation) {
      setSelectedAnnotation(null);
    } else {
      setPendingPosition({ x, y });
    }
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setPendingPosition(null);
  };

  const handleAnnotationCreate = (annotationData: Omit<Annotation, 'id' | 'createdAt'>) => {
    const newAnnotation: Annotation = {
      ...annotationData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  };

  const handleAnnotationUpdate = (id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, ...updates } : ann
    ));
  };

  const handleBackToUpload = () => {
    setIsAnnotationMode(false);
    setSelectedAnnotation(null);
    setPendingPosition(null);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {isAnnotationMode && (
            <Button variant="ghost" size="sm" onClick={handleBackToUpload} className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-xl font-semibold">
            {isAnnotationMode ? `Annotating Design ${currentImageIndex + 1}` : 'Analysis Name'}
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tabs and Controls */}
        <div className="border-b border-border bg-background">
          <div className="flex items-center justify-between px-6 py-3">
            <Tabs defaultValue="files" className="flex-1">
              <TabsList className="bg-muted">
                <TabsTrigger value="files" className="px-6">Files</TabsTrigger>
                <TabsTrigger value="annotations" className="px-6">Annotations</TabsTrigger>
                <TabsTrigger value="context" className="px-6">Add Context</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                Group by
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {!isAnnotationMode ? (
          <div className="flex-1 flex items-center justify-center p-12">
            {workflow.selectedImages.length === 0 ? (
              <div 
                className={`w-full max-w-2xl border-2 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer ${
                  isDragOver 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  multiple
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            Array.from(files).forEach(file => handleFileUpload(file));
          }
        }}
                  className="hidden"
                />
                
                <div className="w-16 h-16 bg-muted/50 rounded-xl mx-auto mb-6 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                
                <h3 className="text-lg font-medium mb-2">Upload your designs</h3>
                <p className="text-muted-foreground">
                  Drop your design files here or click to browse
                </p>
              </div>
            ) : (
              <div className="w-full max-w-4xl">
                {/* Image Thumbnails Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {workflow.selectedImages.map((image, index) => (
                    <div key={index} className="group relative">
                      <div 
                        className="aspect-video bg-muted/50 rounded-xl overflow-hidden border border-border hover:border-primary/50 cursor-pointer transition-all hover:shadow-lg"
                        onClick={() => handleImageSelect(index)}
                      >
                        <img
                          src={image}
                          alt={`Design ${index + 1}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white rounded-full p-2 shadow-lg">
                              <Eye className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileRemove(index);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      
                      {/* Image Number */}
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                  
                  {/* Add More Button */}
                  <div
                    className={`aspect-video border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                      isDragOver 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload-add')?.click()}
                  >
                    <input
                      id="file-upload-add"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          Array.from(files).forEach(file => handleFileUpload(file));
                        }
                      }}
                      className="hidden"
                    />
                    <div className="text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Add more</p>
                    </div>
                  </div>
                </div>
                
                {/* Upload Summary */}
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">
                    {workflow.selectedImages.length} design{workflow.selectedImages.length !== 1 ? 's' : ''} ready for analysis
                  </h3>
                  <p className="text-muted-foreground">
                    Click on any image to add annotations, or start your analysis below
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Split-Screen Annotation Layout */
          <div className="flex-1 flex">
            {/* Left Panel - File Thumbnails */}
            <EnhancedFileThumbnails
              files={workflow.selectedImages}
              currentFileIndex={currentImageIndex}
              onFileSelect={handleImageSelect}
              onFileRemove={handleFileRemove}
              onFilesAdd={handleFilesAdd}
              maxFiles={10}
            />

            {/* Main Canvas Area */}
            <EnhancedCanvasViewer
              images={workflow.selectedImages}
              currentImageIndex={currentImageIndex}
              onImageChange={setCurrentImageIndex}
              annotations={annotations}
              onAnnotationClick={handleAnnotationClick}
              onCanvasClick={handleCanvasClick}
            />

            {/* Right Panel - Annotations */}
            <AnnotationSystem
              annotations={annotations}
              selectedAnnotation={selectedAnnotation}
              onAnnotationSelect={setSelectedAnnotation}
              onAnnotationCreate={handleAnnotationCreate}
              onAnnotationUpdate={handleAnnotationUpdate}
              pendingPosition={pendingPosition}
              onCancelPending={() => setPendingPosition(null)}
            />
          </div>
        )}

        {/* Bottom Analysis Context Area - More Prominent */}
        <div className="border-t border-border bg-background p-6">
          <div className="max-w-4xl mx-auto">
            {/* Required Analysis Context */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                What would you like me to analyze? <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  value={analysisMessage}
                  onChange={(e) => setAnalysisMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe what you want me to analyze (e.g., 'Visual hierarchy and user flow', 'Mobile responsiveness', 'Overall UX improvements')"
                  className="flex-1 h-12 text-base pr-12"
                  disabled={workflow.isAnalyzing}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              {!analysisMessage.trim() && workflow.selectedImages.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Please describe what you'd like me to analyze about your design
                </p>
              )}
            </div>
            
            {/* Quick Suggestions */}
            {workflow.selectedImages.length > 0 && !analysisMessage.trim() && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Quick suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Visual hierarchy and layout',
                    'User experience improvements', 
                    'Mobile responsiveness',
                    'Accessibility review',
                    'Conversion optimization'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setAnalysisMessage(suggestion)}
                      className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Bottom Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Camera className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{workflow.selectedImages.length} image{workflow.selectedImages.length !== 1 ? 's' : ''}</span>
                  {analysisMessage.trim() && <span>• Context provided</span>}
                </div>
                <Button 
                  onClick={handleStartAnalysis}
                  disabled={!canAnalyze || workflow.isAnalyzing}
                  className="px-8 min-w-[100px]"
                >
                  {workflow.isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};