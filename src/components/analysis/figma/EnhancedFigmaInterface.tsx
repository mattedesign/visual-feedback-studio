import React, { useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { EnhancedCanvasViewer } from './EnhancedCanvasViewer';
import { AnnotationSystem } from './AnnotationSystem';
import { EnhancedFileThumbnails } from './EnhancedFileThumbnails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Settings, Share2 } from 'lucide-react';

interface EnhancedFigmaInterfaceProps {
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

export const EnhancedFigmaInterface: React.FC<EnhancedFigmaInterfaceProps> = ({
  workflow
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState(workflow.analysisContext || '');

  const handleImageSelect = (index: number) => {
    setCurrentImageIndex(index);
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

  const handleStartAnalysis = () => {
    if (!analysisMessage.trim() || workflow.selectedImages.length === 0) return;
    
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

  return (
    <div className="h-full flex bg-background">
      {/* Left Panel - File Thumbnails */}
      <EnhancedFileThumbnails
        files={workflow.selectedImages}
        currentFileIndex={currentImageIndex}
        onFileSelect={handleImageSelect}
        onFileRemove={handleFileRemove}
        onFilesAdd={handleFilesAdd}
        maxFiles={5}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold">UX Analysis Studio</h1>
            <p className="text-sm text-muted-foreground">
              Professional design analysis and feedback
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex">
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

        {/* Bottom Analysis Bar */}
        <div className="border-t border-border bg-background/95 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={analysisMessage}
                  onChange={(e) => setAnalysisMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    workflow.selectedImages.length > 0 
                      ? "Describe what you'd like to analyze about these designs..."
                      : "Upload designs first, then describe your analysis goals..."
                  }
                  className="min-h-[3rem] text-base"
                  disabled={workflow.selectedImages.length === 0 || workflow.isAnalyzing}
                />
                
                {workflow.selectedImages.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{workflow.selectedImages.length} design{workflow.selectedImages.length !== 1 ? 's' : ''} ready</span>
                    </div>
                    <span>•</span>
                    <span>{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>AI-powered analysis with 272+ UX research studies</span>
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleStartAnalysis}
                disabled={!canAnalyze || workflow.isAnalyzing}
                size="lg"
                className="px-8"
              >
                {workflow.isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Analyze Design
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};