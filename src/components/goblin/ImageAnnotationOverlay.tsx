
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnnotationOverlayProps {
  imageUrl: string;
  issues: any[];
  selectedIssue: string | null;
  onSelectIssue: (issueId: string | null) => void;
  showAnnotations: boolean;
}

export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({
  imageUrl,
  issues,
  selectedIssue,
  onSelectIssue,
  showAnnotations
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'hsl(var(--destructive))';
      case 'warning':
        return 'hsl(var(--warning))';
      case 'improvement':
        return 'hsl(var(--primary))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <div className="relative inline-block">
      <img
        src={imageUrl}
        alt="Design Analysis"
        className="w-full h-auto rounded-lg shadow-lg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {showAnnotations && (
        <div className="absolute inset-0">
          {issues.map((issue, index) => {
            const location = issue.element?.location;
            if (!location) return null;

            const isSelected = selectedIssue === issue.id;
            
            return (
              <div
                key={issue.id}
                className={cn(
                  "absolute cursor-pointer transition-all duration-200",
                  isSelected && "z-10"
                )}
                style={{
                  left: `${location.xPercent}%`,
                  top: `${location.yPercent}%`,
                  width: `${location.widthPercent}%`,
                  height: `${location.heightPercent}%`,
                }}
                onClick={() => onSelectIssue(isSelected ? null : issue.id)}
              >
                {/* Issue Marker */}
                <div
                  className={cn(
                    "absolute -top-3 -left-3 w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold transition-all duration-200",
                    isSelected && "scale-125 shadow-xl"
                  )}
                  style={{
                    backgroundColor: getSeverityColor(issue.severity)
                  }}
                >
                  {index + 1}
                </div>

                {/* Bounding Box */}
                <div
                  className={cn(
                    "w-full h-full border-2 border-dashed transition-all duration-200",
                    isSelected ? "border-primary bg-primary/10" : "border-current opacity-70 hover:opacity-100"
                  )}
                  style={{
                    borderColor: isSelected ? 'hsl(var(--primary))' : getSeverityColor(issue.severity)
                  }}
                />

                {/* Tooltip on Hover */}
                {isSelected && (
                  <div className="absolute bottom-full left-0 mb-2 z-20">
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-64 max-w-80">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ color: getSeverityColor(issue.severity) }}
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{issue.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {issue.description}
                      </p>
                      {issue.business_impact?.quick_win && (
                        <Badge variant="default" className="text-xs mt-2 bg-green-600">
                          Quick Win
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
