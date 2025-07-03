import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface Annotation {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
  category: 'ux' | 'visual' | 'accessibility' | 'performance' | 'content';
}

interface FullScreenAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentImageIndex: number;
  onImageChange: (index: number) => void;
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const FullScreenAnnotationModal: React.FC<FullScreenAnnotationModalProps> = ({
  isOpen,
  onClose,
  images,
  currentImageIndex,
  onImageChange,
  workflow
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [newAnnotation, setNewAnnotation] = useState<{ x: number; y: number } | null>(null);
  const [annotationForm, setAnnotationForm] = useState({
    title: '',
    description: '',
    category: 'ux' as const
  });
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentImage = images[currentImageIndex];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current || selectedAnnotation) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - pan.x) / zoom) / rect.width * 100;
    const y = ((e.clientY - rect.top - pan.y) / zoom) / rect.height * 100;
    
    setNewAnnotation({ x, y });
  };

  const handleAnnotationSubmit = () => {
    if (!newAnnotation || !annotationForm.title.trim()) return;
    
    const annotation: Annotation = {
      id: Date.now().toString(),
      x: newAnnotation.x,
      y: newAnnotation.y,
      title: annotationForm.title,
      description: annotationForm.description,
      category: annotationForm.category
    };
    
    setAnnotations(prev => [...prev, annotation]);
    setNewAnnotation(null);
    setAnnotationForm({ title: '', description: '', category: 'ux' });
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const nextImage = () => {
    if (currentImageIndex < images.length - 1) {
      onImageChange(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      onImageChange(currentImageIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
          <h2 className="font-semibold">Annotation Mode</h2>
          <Badge variant="secondary">
            {currentImageIndex + 1} of {images.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {images.length > 1 && (
            <>
              <Button variant="outline" size="sm" onClick={prevImage} disabled={currentImageIndex === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextImage} disabled={currentImageIndex === images.length - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-mono min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(4, zoom + 0.25))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetView}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40 relative">
          <div
            ref={canvasRef}
            className="w-full h-full flex items-center justify-center cursor-crosshair"
            onClick={handleCanvasClick}
          >
            <div
              className="relative bg-white rounded-lg shadow-2xl border border-border/50"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-out',
              }}
            >
              <img
                src={currentImage}
                alt={`Design ${currentImageIndex + 1}`}
                className="max-w-[80vw] max-h-[80vh] object-contain rounded-lg"
                draggable={false}
              />

              {/* Existing Annotations */}
              {annotations.map((annotation, index) => (
                <div
                  key={annotation.id}
                  className="absolute w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-4 -translate-y-4 hover:scale-125 transition-transform flex items-center justify-center"
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAnnotation(annotation);
                  }}
                >
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
              ))}

              {/* New Annotation Marker */}
              {newAnnotation && (
                <div
                  className="absolute w-8 h-8 bg-accent rounded-full border-2 border-white shadow-lg transform -translate-x-4 -translate-y-4 animate-pulse"
                  style={{
                    left: `${newAnnotation.x}%`,
                    top: `${newAnnotation.y}%`,
                  }}
                >
                  <Plus className="w-4 h-4 text-white m-2" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-border bg-background flex flex-col">
          {/* Annotations List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Annotations</h3>
              <Badge variant="secondary">{annotations.length}</Badge>
            </div>
            
            {annotations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click on the image to add annotations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {annotations.map((annotation, index) => (
                  <div
                    key={annotation.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnnotation?.id === annotation.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedAnnotation(annotation)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{annotation.title}</h4>
                        {annotation.description && (
                          <p className="text-xs text-muted-foreground mt-1">{annotation.description}</p>
                        )}
                        <Badge variant="outline" className="mt-2 text-xs">
                          {annotation.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Annotation Form */}
          {newAnnotation && (
            <div className="border-t border-border p-4 bg-muted/50">
              <h4 className="font-medium mb-3">Add Annotation</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Annotation title"
                  value={annotationForm.title}
                  onChange={(e) => setAnnotationForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  placeholder="Description (optional)"
                  value={annotationForm.description}
                  onChange={(e) => setAnnotationForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <select
                  value={annotationForm.category}
                  onChange={(e) => setAnnotationForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="ux">UX Issue</option>
                  <option value="visual">Visual Design</option>
                  <option value="accessibility">Accessibility</option>
                  <option value="performance">Performance</option>
                  <option value="content">Content</option>
                </select>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAnnotationSubmit}
                    disabled={!annotationForm.title.trim()}
                    size="sm"
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setNewAnnotation(null)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Selected Annotation Details */}
          {selectedAnnotation && !newAnnotation && (
            <div className="border-t border-border p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Annotation Details</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAnnotation(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium">{selectedAnnotation.title}</h5>
                {selectedAnnotation.description && (
                  <p className="text-sm text-muted-foreground">{selectedAnnotation.description}</p>
                )}
                <Badge variant="outline">{selectedAnnotation.category}</Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
