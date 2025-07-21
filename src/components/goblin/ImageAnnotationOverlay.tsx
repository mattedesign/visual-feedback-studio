
import React, { useState, useEffect } from 'react';

// Enhanced interface to match the new AnalysisResults component
interface EnhancedAnalysisIssue {
  id: string;
  title: string;
  description: string;
  category: 'accessibility' | 'usability' | 'visual' | 'content' | 'performance' | 'conversion';
  severity: 'critical' | 'warning' | 'improvement';
  confidence: number;
  impact_scope: 'user-trust' | 'task-completion' | 'conversion' | 'readability' | 'performance' | 'aesthetic';
  
  element: {
    location: {
      x: number;
      y: number;
      width: number;
      height: number;
      xPercent: number;
      yPercent: number;
      widthPercent: number;
      heightPercent: number;
    };
  };
  
  implementation?: {
    effort: 'minutes' | 'hours' | 'days';
    code_snippet?: string;
    design_guidance?: string;
    rationale?: string;
  };
  
  business_impact?: {
    roi_score: number;
    priority_level: 'critical' | 'high' | 'medium' | 'low';
    quick_win: boolean;
  };
}

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
        <img src={imageUrl} alt="Design" className="w-full rounded-lg max-w-full h-auto" />
      </div>
    );
  }
  
  return (
    <div className="relative w-full">
      <img src={imageUrl} alt="Design" className="w-full rounded-lg max-w-full h-auto" />
      
      {issues.map((issue, index) => {
        const location = issue.element.location;
        const isSelected = selectedIssue === issue.id;
        
        return (
          <div
            key={issue.id}
            className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              isSelected ? 'z-20' : 'z-10'
            } hover:border-4 active:scale-95 touch-manipulation ${
              isSelected ? '' : 'animate-pulse'
            }`}
            style={{
              left: `${location.xPercent}%`,
              top: `${location.yPercent}%`,
              width: `${location.widthPercent}%`,
              height: `${location.heightPercent}%`,
              minWidth: '44px',
              minHeight: '44px',
              borderColor: getSeverityColor(issue.severity),
              backgroundColor: isSelected ? `${getSeverityColor(issue.severity)}10` : 'transparent',
              boxShadow: isSelected ? `0 0 0 4px ${getSeverityColor(issue.severity)}20` : undefined
            }}
            onClick={() => onSelectIssue(issue.id)}
          >
            <div
              className="absolute -top-3 -left-3 rounded-full text-white font-bold flex items-center justify-center animate-pulse cursor-pointer touch-manipulation hover:scale-110 transition-transform duration-200 w-6 h-6 sm:w-8 sm:h-8 text-xs sm:text-sm"
              style={{ backgroundColor: getSeverityColor(issue.severity) }}
            >
              {index + 1}
            </div>
            
            {/* Quick win indicator */}
            {issue.business_impact?.quick_win && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-bounce" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AnnotationOverlay;
