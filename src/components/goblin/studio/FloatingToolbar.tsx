import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Grid,
  Image as ImageIcon,
  MousePointer,
  Target
} from 'lucide-react';

interface FloatingToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  annotationMode: boolean;
  onAnnotationModeChange: (enabled: boolean) => void;
  isGridView: boolean;
  hasImages: boolean;
  onToggleView: () => void;
}

export function FloatingToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
  annotationMode,
  onAnnotationModeChange,
  isGridView,
  hasImages,
  onToggleView
}: FloatingToolbarProps) {
  if (!hasImages) return null;

  return (
    <Card className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 p-2 shadow-lg">
      <div className="flex items-center gap-1">
        {/* View Toggle */}
        <Button
          variant={isGridView ? "default" : "outline"}
          size="sm"
          onClick={onToggleView}
          className="flex items-center gap-1"
        >
          {isGridView ? (
            <>
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Single</span>
            </>
          ) : (
            <>
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Grid</span>
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="h-4 w-px bg-border mx-1" />

        {/* Zoom Controls - Only show in single image view */}
        {!isGridView && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomOut}
              disabled={zoom <= 0.2}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <div className="px-2 text-sm font-mono min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomIn}
              disabled={zoom >= 5}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              title="Reset zoom and position"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* Divider */}
            <div className="h-4 w-px bg-border mx-1" />

            {/* Annotation Mode Toggle */}
            <Button
              variant={annotationMode ? "default" : "outline"}
              size="sm"
              onClick={() => onAnnotationModeChange(!annotationMode)}
              className="flex items-center gap-1"
            >
              {annotationMode ? (
                <Target className="w-4 h-4" />
              ) : (
                <MousePointer className="w-4 h-4" />
              )}
              <span className="hidden sm:inline text-xs">
                {annotationMode ? 'Annotate' : 'Select'}
              </span>
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}