
import { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Download, Share, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Annotation } from '@/types/analysis';
import { AnnotationMarker } from './AnnotationMarker';

interface DesignViewerProps {
  imageUrl: string;
  annotations: Annotation[];
  onAreaClick: (coordinates: { x: number; y: number }) => void;
  onAnalyzeClick: () => void;
  isAnalyzing: boolean;
  activeAnnotation: string | null;
  onAnnotationClick: (id: string) => void;
}

export const DesignViewer = ({
  imageUrl,
  annotations,
  onAreaClick,
  onAnalyzeClick,
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
    <Card className="h-full bg-white border-gray-200 flex flex-col relative">
      {/* Figmant-style toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
          <span className="text-sm text-gray-600">Template Type</span>
          <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-700">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Analyze button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={onAnalyzeClick}
          disabled={isAnalyzing}
          className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze
            </>
          )}
        </Button>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600 px-2 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-8 p-0">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main viewer area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-hidden relative bg-gray-50 cursor-crosshair"
      >
        <div className="absolute inset-4 flex items-center justify-center">
          <div className="relative">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Design to analyze"
              className="max-w-full max-h-full object-contain shadow-xl rounded-lg transition-transform duration-200"
              style={{ 
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                cursor: isAnalyzing ? 'wait' : 'crosshair'
              }}
              onClick={handleImageClick}
            />
            
            {/* Annotations with sequential numbering */}
            {annotations.map((annotation, index) => (
              <AnnotationMarker
                key={annotation.id}
                annotation={annotation}
                annotationIndex={index}
                isActive={activeAnnotation === annotation.id}
                onClick={() => onAnnotationClick(annotation.id)}
                zoom={zoom}
              />
            ))}
            
            {/* Instructions */}
            {annotations.length === 0 && !isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-lg border border-gray-200 shadow-lg">
                  <p className="text-gray-700 text-center">
                    Click "Analyze" for AI insights or click anywhere on the design for specific feedback
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Analysis overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-gray-800">Generating AI insights...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
