import React, { useState, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Settings, Share2 } from 'lucide-react';

// Lazy load heavy components for better performance
const EnhancedCanvasViewer = lazy(() => import('./EnhancedCanvasViewer').then(m => ({ default: m.EnhancedCanvasViewer })));
const AnnotationSystem = lazy(() => import('./AnnotationSystem').then(m => ({ default: m.AnnotationSystem })));
const EnhancedFileThumbnails = lazy(() => import('./EnhancedFileThumbnails').then(m => ({ default: m.EnhancedFileThumbnails })));

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

const EnhancedFigmaInterfaceComponent: React.FC<EnhancedFigmaInterfaceProps> = ({
  workflow
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [analysisMessage, setAnalysisMessage] = useState(workflow.analysisContext || '');

  // Memoized event handlers for better performance
  const handleImageSelect = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setSelectedAnnotation(null);
    setPendingPosition(null);
  }, []);

  const handleFileRemove = useCallback((index: number) => {
    const newImages = [...workflow.selectedImages];
    newImages.splice(index, 1);
    workflow.selectImages(newImages);
    
    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0);
    }
  }, [workflow, currentImageIndex]);

  const handleFilesAdd = useCallback((newFiles: string[]) => {
    newFiles.forEach((file) => {
      workflow.addUploadedFile(file);
    });
  }, [workflow]);

  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (selectedAnnotation) {
      setSelectedAnnotation(null);
    } else {
      setPendingPosition({ x, y });
    }
  }, [selectedAnnotation]);

  const handleAnnotationClick = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setPendingPosition(null);
  }, []);

  const handleAnnotationCreate = useCallback((annotationData: Omit<Annotation, 'id' | 'createdAt'>) => {
    const newAnnotation: Annotation = {
      ...annotationData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setAnnotations(prev => [...prev, newAnnotation]);
  }, []);

  const handleAnnotationUpdate = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, ...updates } : ann
    ));
  }, []);

  const handleStartAnalysis = useCallback(() => {
    if (!analysisMessage.trim() || workflow.selectedImages.length === 0) return;
    
    workflow.setAnalysisContext(analysisMessage);
    workflow.goToStep('analyzing');
  }, [analysisMessage, workflow]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartAnalysis();
    }
  }, [handleStartAnalysis]);

  // Memoized computed values
  const canAnalyze = useMemo(() => 
    workflow.selectedImages.length > 0 && analysisMessage.trim().length > 0,
    [workflow.selectedImages.length, analysisMessage]
  );

  const statusInfo = useMemo(() => ({
    designCount: workflow.selectedImages.length,
    annotationCount: annotations.length,
    hasDesigns: workflow.selectedImages.length > 0
  }), [workflow.selectedImages.length, annotations.length]);

  const placeholderText = useMemo(() => 
    statusInfo.hasDesigns 
      ? "Describe what you'd like to analyze about these designs..."
      : "Upload designs first, then describe your analysis goals...",
    [statusInfo.hasDesigns]
  );

  // Loading fallback component
  const ComponentLoader = () => (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="h-full flex bg-background">
      {/* Left Panel - File Thumbnails */}
      <Suspense fallback={<ComponentLoader />}>
        <EnhancedFileThumbnails
          files={workflow.selectedImages}
          currentFileIndex={currentImageIndex}
          onFileSelect={handleImageSelect}
          onFileRemove={handleFileRemove}
          onFilesAdd={handleFilesAdd}
          maxFiles={5}
        />
      </Suspense>

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
          <Suspense fallback={<ComponentLoader />}>
            <EnhancedCanvasViewer
              images={workflow.selectedImages}
              currentImageIndex={currentImageIndex}
              onImageChange={setCurrentImageIndex}
              annotations={annotations}
              onAnnotationClick={handleAnnotationClick}
              onCanvasClick={handleCanvasClick}
            />
          </Suspense>

          {/* Right Panel - Annotations */}
          <Suspense fallback={<ComponentLoader />}>
            <AnnotationSystem
              annotations={annotations}
              selectedAnnotation={selectedAnnotation}
              onAnnotationSelect={setSelectedAnnotation}
              onAnnotationCreate={handleAnnotationCreate}
              onAnnotationUpdate={handleAnnotationUpdate}
              pendingPosition={pendingPosition}
              onCancelPending={() => setPendingPosition(null)}
            />
          </Suspense>
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
                  placeholder={placeholderText}
                  className="min-h-[3rem] text-base"
                  disabled={!statusInfo.hasDesigns || workflow.isAnalyzing}
                />
                
                {statusInfo.hasDesigns && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{statusInfo.designCount} design{statusInfo.designCount !== 1 ? 's' : ''} ready</span>
                    </div>
                    <span>•</span>
                    <span>{statusInfo.annotationCount} annotation{statusInfo.annotationCount !== 1 ? 's' : ''}</span>
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

// Export memoized component for performance optimization
export const EnhancedFigmaInterface = memo(EnhancedFigmaInterfaceComponent);