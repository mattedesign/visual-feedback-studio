import React, { useState, useEffect } from 'react';
import { EnhancedAnalysisIssue } from '@/types/analysis';

interface FigmantAnnotationOverlayProps {
  imageUrl: string;
  annotations: any[];
  selectedAnnotation: string | null;
  onAnnotationSelect: (annotationId: string) => void;
  showAnnotations: boolean;
  viewMode?: 'canvas' | 'grid';
}

export const FigmantAnnotationOverlay: React.FC<FigmantAnnotationOverlayProps> = ({
  imageUrl,
  annotations,
  selectedAnnotation,
  onAnnotationSelect,
  showAnnotations,
  viewMode = 'canvas'
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);
  
  const getSeverityColor = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'hsl(var(--destructive))';
      case 'important': return 'hsl(var(--warning))';
      case 'enhancement': return 'hsl(var(--primary))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const getSeverityBorderStyle = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'border-destructive shadow-destructive/50';
      case 'important': return 'border-warning shadow-warning/50';
      case 'enhancement': return 'border-primary shadow-primary/50';
      default: return 'border-muted-foreground shadow-muted/50';
    }
  };
  
  if (!showAnnotations || viewMode !== 'canvas') {
    return (
      <div className="relative w-full">
        <img 
          src={imageUrl} 
          alt="Design" 
          className="w-full rounded-lg max-w-full h-auto shadow-sm border" 
        />
      </div>
    );
  }
  
  return (
    <div className="relative w-full">
      <img 
        src={imageUrl} 
        alt="Design" 
        className="w-full rounded-lg max-w-full h-auto shadow-sm border" 
      />
      
      {annotations.map((annotation, index) => {
        // Handle different coordinate formats from figmant
        const x = annotation.x || annotation.coordinates?.x || (Math.random() * 80) + 10;
        const y = annotation.y || annotation.coordinates?.y || (Math.random() * 80) + 10;
        const isSelected = selectedAnnotation === annotation.id;
        
        return (
          <div
            key={annotation.id || `annotation-${index}`}
            className={`absolute rounded-lg cursor-pointer transition-all duration-200 ${
              isSelected ? 'z-20' : 'z-10'
            } hover:border-4 active:scale-95 touch-manipulation ${
              getSeverityBorderStyle(annotation.severity)
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: '40px',
              height: '40px',
              minWidth: '44px', // Touch target
              minHeight: '44px', // Touch target
              border: `2px solid ${getSeverityColor(annotation.severity)}`,
              backgroundColor: isSelected ? `${getSeverityColor(annotation.severity)}15` : 'transparent',
              boxShadow: isSelected ? `0 0 20px ${getSeverityColor(annotation.severity)}40` : undefined,
            }}
            onClick={() => onAnnotationSelect(annotation.id || `annotation-${index}`)}
          >
            {/* Annotation Number Badge */}
            <div
              className="absolute -top-3 -left-3 rounded-full text-white font-bold flex items-center justify-center animate-pulse cursor-pointer touch-manipulation hover:scale-110 transition-transform duration-200 w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-sm shadow-lg"
              style={{ backgroundColor: getSeverityColor(annotation.severity) }}
            >
              {index + 1}
            </div>
            
            {/* Severity Indicator */}
            <div 
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background"
              style={{ backgroundColor: getSeverityColor(annotation.severity) }}
            />
            
            {/* Hover/Selected State Content */}
            {isSelected && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-card border rounded-lg shadow-lg p-3 min-w-60 max-w-80 z-30 animate-fade-in">
                <div className="text-sm">
                  <div className="font-semibold text-card-foreground mb-1">
                    {annotation.title || 'UX Issue'}
                  </div>
                  <div className="text-muted-foreground text-xs mb-2">
                    {annotation.category && (
                      <span className="inline-block bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs mr-2">
                        {annotation.category}
                      </span>
                    )}
                    <span className="capitalize">{annotation.severity || 'medium'}</span>
                  </div>
                  <div className="text-xs">
                    {annotation.feedback?.substring(0, 120) || 'No description available'}
                    {annotation.feedback?.length > 120 && '...'}
                  </div>
                </div>
                {/* Arrow pointing to annotation */}
                <div 
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-card"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};