import React, { useState, useEffect } from 'react';
import { EnhancedAnalysisIssue } from '@/types/analysis';

interface AnnotationOverlayProps {
  imageUrl: string;
  issues: EnhancedAnalysisIssue[];
  selectedIssue: string | null;
  onSelectIssue: (issueId: string) => void;
  showAnnotations: boolean;
}

export function AnnotationOverlay({
  imageUrl,
  issues,
  selectedIssue,
  onSelectIssue,
  showAnnotations
}: AnnotationOverlayProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);
  
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'hsl(var(--destructive))';
      case 'warning': return 'hsl(var(--warning))';
      case 'improvement': return 'hsl(var(--primary))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };
  
  if (!showAnnotations) {
    return (
      <div className="relative w-full">
        <img src={imageUrl} alt="Design" className="w-full rounded-lg" />
      </div>
    );
  }
  
  return (
    <div className="relative w-full">
      <img src={imageUrl} alt="Design" className="w-full rounded-lg" />
      
      {issues.map((issue, index) => {
        const location = issue.element.location;
        const isSelected = selectedIssue === issue.id;
        
        return (
          <div
            key={issue.id}
            className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              isSelected ? 'z-20' : 'z-10'
            }`}
            style={{
              left: `${location.xPercent}%`,
              top: `${location.yPercent}%`,
              width: `${location.widthPercent}%`,
              height: `${location.heightPercent}%`,
              borderColor: getSeverityColor(issue.severity),
              backgroundColor: isSelected ? `${getSeverityColor(issue.severity)}10` : 'transparent',
            }}
            onClick={() => onSelectIssue(issue.id)}
          >
            <div
              className="absolute -top-3 -left-3 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center animate-pulse"
              style={{ backgroundColor: getSeverityColor(issue.severity) }}
            >
              {index + 1}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AnnotationOverlay;