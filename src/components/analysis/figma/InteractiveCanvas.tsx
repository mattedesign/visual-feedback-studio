import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditableAnnotation } from './EditableAnnotation';
import { 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Save,
  AlertTriangle
} from 'lucide-react';

interface InteractiveCanvasProps {
  analysisData: any;
  selectedAnnotation: string | null;
  onAnnotationSelect: (annotationId: string | null) => void;
  activeModule: 'ux-insights' | 'research' | 'business-impact';
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  analysisData,
  selectedAnnotation,
  onAnnotationSelect,
  activeModule
}) => {
  const [annotations, setAnnotations] = useState(analysisData?.annotations || []);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Update annotations when analysisData changes
  useEffect(() => {
    if (analysisData?.annotations) {
      // Add position data if missing
      const annotationsWithPositions = analysisData.annotations.map((ann, index) => ({
        ...ann,
        x: ann.x ?? (20 + (index * 15) % 60),
        y: ann.y ?? (20 + (index * 10) % 60),
        imageIndex: ann.imageIndex ?? 0
      }));
      setAnnotations(annotationsWithPositions);
    }
  }, [analysisData]);

  const images = analysisData?.images || [];
  const currentImage = images[selectedImageIndex];

  // Filter annotations for current image
  const currentImageAnnotations = annotations.filter(
    ann => (ann.imageIndex ?? 0) === selectedImageIndex
  );

  const handleAnnotationUpdate = useCallback((id: string, updates: any) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, ...updates } : ann
    ));
    setHasUnsavedChanges(true);
    console.log('🎨 Annotation updated:', { id, updates });
  }, []);

  const handleAnnotationMove = useCallback((id: string, newPosition: { x: number; y: number }) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, ...newPosition } : ann
    ));
    setHasUnsavedChanges(true);
    console.log('🎨 Annotation moved:', { id, newPosition });
  }, []);

  const handleStartEdit = useCallback((id: string) => {
    setEditingAnnotation(id);
    onAnnotationSelect(id);
  }, [onAnnotationSelect]);

  const handleStopEdit = useCallback(() => {
    setEditingAnnotation(null);
  }, []);

  const handleSaveChanges = useCallback(async () => {
    // In a real implementation, this would save to the database
    console.log('💾 Saving annotation changes:', annotations);
    setHasUnsavedChanges(false);
    // TODO: Implement actual save to Supabase
  }, [annotations]);

  const handleResetChanges = useCallback(() => {
    if (analysisData?.annotations) {
      setAnnotations(analysisData.annotations);
      setHasUnsavedChanges(false);
      setEditingAnnotation(null);
    }
  }, [analysisData]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Deselect annotation when clicking on empty canvas
    if (e.target === e.currentTarget) {
      onAnnotationSelect(null);
      setEditingAnnotation(null);
    }
  }, [onAnnotationSelect]);

  if (!currentImage) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Images Available
            </h3>
            <p className="text-muted-foreground">
              Upload images to see them analyzed with interactive annotations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Canvas Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <h3 className="font-medium">Interactive Canvas</h3>
          <Badge variant="outline">
            {currentImageAnnotations.length} annotations
          </Badge>
          
          {images.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Image:</span>
              <select
                value={selectedImageIndex}
                onChange={(e) => setSelectedImageIndex(parseInt(e.target.value))}
                className="text-sm bg-background border rounded px-2 py-1"
              >
                {images.map((_, index) => (
                  <option key={index} value={index}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="text-xs"
          >
            {showAnnotations ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
            {showAnnotations ? 'Hide' : 'Show'} Annotations
          </Button>
          
          {hasUnsavedChanges && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetChanges}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSaveChanges}
                className="text-xs"
              >
                <Save className="h-3 w-3 mr-1" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-full mx-auto">
          <div 
            ref={canvasRef}
            className="relative inline-block annotation-canvas bg-white rounded-lg shadow-lg border border-border"
            onClick={handleCanvasClick}
          >
            {/* Main Image */}
            <img
              src={currentImage}
              alt={`Analysis image ${selectedImageIndex + 1}`}
              className="max-w-full h-auto block"
              style={{ maxHeight: '70vh' }}
              onError={(e) => {
                console.error('Failed to load image:', currentImage);
                e.currentTarget.style.display = 'none';
              }}
            />
            
            {/* Interactive Annotations */}
            {showAnnotations && currentImageAnnotations.map((annotation, index) => (
              <EditableAnnotation
                key={annotation.id || `annotation-${index}`}
                annotation={annotation}
                isSelected={selectedAnnotation === annotation.id}
                isEditing={editingAnnotation === annotation.id}
                position={{ x: annotation.x || 50, y: annotation.y || 50 }}
                onUpdate={handleAnnotationUpdate}
                onSelect={onAnnotationSelect}
                onStartEdit={handleStartEdit}
                onStopEdit={handleStopEdit}
                onMove={handleAnnotationMove}
                index={index}
                
              />
            ))}
            
            {/* Overlay Instructions */}
            {currentImageAnnotations.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Card className="bg-background/90 border-dashed border-muted-foreground">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No annotations found for this image
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          {/* Canvas Info */}
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>
              💡 <strong>Tip:</strong> Double-click annotations to edit, drag to move, 
              click to select. Changes are saved automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};