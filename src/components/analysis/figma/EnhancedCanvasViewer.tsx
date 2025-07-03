import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface EnhancedCanvasViewerProps {
  images: string[];
  currentImageIndex: number;
  onImageChange: (index: number) => void;
  annotations: any[];
  onAnnotationClick: (annotation: any) => void;
  onCanvasClick: (x: number, y: number) => void;
}

export const EnhancedCanvasViewer: React.FC<EnhancedCanvasViewerProps> = ({
  images,
  currentImageIndex,
  onImageChange,
  annotations,
  onAnnotationClick,
  onCanvasClick
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentImageIndex];

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - pan.x) / zoom) / rect.width * 100;
    const y = ((e.clientY - rect.top - pan.y) / zoom) / rect.height * 100;
    
    onCanvasClick(x, y);
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

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/10">
      {/* Canvas Controls */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {images.length > 0 ? `${currentImageIndex + 1} / ${images.length}` : 'No images'}
          </span>
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
        </div>

        <div className="flex items-center gap-2">
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

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative bg-gradient-to-br from-muted/20 to-muted/40">
        {currentImage ? (
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
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />

              {/* Annotation Markers */}
              {annotations.map((annotation, index) => (
                <div
                  key={index}
                  className="absolute w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-3 -translate-y-3 hover:scale-125 transition-transform flex items-center justify-center"
                  style={{
                    left: `${annotation.x || Math.random() * 80 + 10}%`,
                    top: `${annotation.y || Math.random() * 80 + 10}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnnotationClick(annotation);
                  }}
                >
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="w-32 h-32 bg-muted/50 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium mb-2">Upload designs to get started</h3>
              <p className="text-sm">
                Upload your design files to the left panel to begin analysis
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};