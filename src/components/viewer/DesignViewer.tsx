
import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Annotation } from '@/types/analysis';
import { AnnotationMarker } from './AnnotationMarker';

interface DesignViewerProps {
  imageUrl: string;
  annotations: Annotation[];
  onAreaClick: (coordinates: { x: number; y: number }) => void;
  isAnalyzing: boolean;
  activeAnnotation: string | null;
  onAnnotationClick: (id: string) => void;
}

export const DesignViewer = ({
  imageUrl,
  annotations,
  onAreaClick,
  isAnalyzing,
  activeAnnotation,
  onAnnotationClick,
}: DesignViewerProps) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isAnalyzing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAreaClick({ x, y });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <Card className="h-full bg-slate-800/50 border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Design Analysis</h3>
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-blue-400">
              <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              <span className="text-sm">Analyzing...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-400 px-2">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-slate-600 mx-2" />
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-slate-900/50 cursor-crosshair"
      >
        <div className="absolute inset-4 flex items-center justify-center">
          <div className="relative">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Design to analyze"
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                cursor: isAnalyzing ? 'wait' : 'crosshair'
              }}
              onClick={handleImageClick}
            />
            
            {/* Annotations */}
            {annotations.map((annotation) => (
              <AnnotationMarker
                key={annotation.id}
                annotation={annotation}
                isActive={activeAnnotation === annotation.id}
                onClick={() => onAnnotationClick(annotation.id)}
                zoom={zoom}
              />
            ))}
            
            {/* Click instruction */}
            {annotations.length === 0 && !isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-slate-800/90 backdrop-blur-sm px-6 py-3 rounded-lg border border-slate-600">
                  <p className="text-slate-300 text-center">
                    Click anywhere on the design to get AI feedback
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Analysis overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-slate-800/90 backdrop-blur-sm px-6 py-4 rounded-lg border border-slate-600">
              <div className="flex items-center gap-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                <span className="text-slate-200">Generating AI insights...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
