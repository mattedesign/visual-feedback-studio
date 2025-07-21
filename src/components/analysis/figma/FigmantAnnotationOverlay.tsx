// Phase 3.1: Enhanced Annotation Overlay System for Figmant
// Confidence-based styling, severity color coding, and interactive issue selection

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Info, 
  Eye, 
  EyeOff,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Clock,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced interfaces for Phase 3.1
interface EnhancedFigmantAnnotation {
  id: string;
  title: string;
  description: string;
  category: 'accessibility' | 'usability' | 'visual' | 'content' | 'performance' | 'conversion';
  severity: 'critical' | 'warning' | 'improvement';
  confidence: number; // 0.0 - 1.0
  impact_scope: 'user-trust' | 'task-completion' | 'conversion' | 'readability' | 'performance' | 'aesthetic';
  
  // Enhanced positioning with percentage-based coordinates
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
  
  // Pattern violation indicators
  violated_patterns?: string[];
  pattern_coverage?: {
    followed: string[];
    violated: string[];
    coverage_score: number;
  };
  
  // Business impact data for visualization
  business_impact?: {
    roi_score: number;
    priority_level: 'critical' | 'high' | 'medium' | 'low';
    quick_win: boolean;
    implementation_effort: 'minutes' | 'hours' | 'days';
  };
  
  // Implementation guidance
  implementation?: {
    effort: 'minutes' | 'hours' | 'days';
    code_snippet?: string;
    design_guidance?: string;
  };
  
  // Confidence metadata
  confidence_metadata?: {
    detection_method: string;
    validation_source: string;
    research_backing: boolean;
  };
}

interface FigmantAnnotationOverlayProps {
  imageUrl: string;
  annotations: EnhancedFigmantAnnotation[];
  selectedAnnotation: string | null;
  onAnnotationSelect: (annotationId: string | null) => void;
  showAnnotations: boolean;
  viewMode?: 'canvas' | 'grid';
  
  // Enhanced filtering options for Phase 3.1
  confidenceThreshold?: number;
  severityFilter?: ('critical' | 'warning' | 'improvement')[];
  categoryFilter?: string[];
  showPatternViolations?: boolean;
  showQuickWins?: boolean;
}

export const FigmantAnnotationOverlay: React.FC<FigmantAnnotationOverlayProps> = ({
  imageUrl,
  annotations,
  selectedAnnotation,
  onAnnotationSelect,
  showAnnotations,
  viewMode = 'canvas',
  confidenceThreshold = 0.5,
  severityFilter = ['critical', 'warning', 'improvement'],
  categoryFilter = [],
  showPatternViolations = true,
  showQuickWins = false
}) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  const [annotationFilters, setAnnotationFilters] = useState({
    showAll: true,
    showCritical: true,
    showWarning: true,
    showImprovement: true,
    confidenceMode: false
  });
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Filter annotations based on confidence, severity, and other criteria
  const filteredAnnotations = annotations.filter(annotation => {
    // Confidence threshold filter
    if (annotation.confidence < confidenceThreshold) return false;
    
    // Severity filter
    if (!severityFilter.includes(annotation.severity)) return false;
    
    // Category filter
    if (categoryFilter.length > 0 && !categoryFilter.includes(annotation.category)) return false;
    
    // Quick wins filter
    if (showQuickWins && !annotation.business_impact?.quick_win) return false;
    
    return true;
  });

  // Enhanced severity styling with confidence-based opacity and effects
  const getSeverityConfig = (annotation: EnhancedFigmantAnnotation) => {
    const confidence = annotation.confidence;
    const hasPatternViolations = annotation.violated_patterns && annotation.violated_patterns.length > 0;
    
    const baseConfig = {
      critical: {
        color: 'hsl(var(--destructive))',
        bgColor: 'hsl(var(--destructive) / 0.1)',
        borderColor: 'border-destructive',
        shadowColor: 'shadow-destructive/50',
        icon: XCircle,
        glowIntensity: confidence * 20,
        pulseSpeed: confidence > 0.8 ? 'animate-pulse' : ''
      },
      warning: {
        color: 'hsl(var(--warning))',
        bgColor: 'hsl(var(--warning) / 0.1)',
        borderColor: 'border-warning',
        shadowColor: 'shadow-warning/50',
        icon: AlertTriangle,
        glowIntensity: confidence * 15,
        pulseSpeed: confidence > 0.8 ? 'animate-pulse' : ''
      },
      improvement: {
        color: 'hsl(var(--primary))',
        bgColor: 'hsl(var(--primary) / 0.1)',
        borderColor: 'border-primary',
        shadowColor: 'shadow-primary/50',
        icon: TrendingUp,
        glowIntensity: confidence * 10,
        pulseSpeed: ''
      }
    };

    const config = baseConfig[annotation.severity];
    
    // Add pattern violation indicator
    if (hasPatternViolations && showPatternViolations) {
      config.borderColor += ' border-dashed';
      config.pulseSpeed = 'animate-pulse';
    }
    
    return config;
  };

  // Get confidence-based styling
  const getConfidenceIndicator = (confidence: number) => {
    if (confidence >= 0.9) return { color: 'text-green-500', icon: Star, label: 'High Confidence' };
    if (confidence >= 0.7) return { color: 'text-blue-500', icon: CheckCircle, label: 'Medium Confidence' };
    if (confidence >= 0.5) return { color: 'text-yellow-500', icon: Eye, label: 'Moderate Confidence' };
    return { color: 'text-gray-500', icon: Info, label: 'Low Confidence' };
  };

  // Get business impact styling
  const getBusinessImpactConfig = (annotation: EnhancedFigmantAnnotation) => {
    const roi = annotation.business_impact?.roi_score || 0;
    const isQuickWin = annotation.business_impact?.quick_win;
    const effort = annotation.business_impact?.implementation_effort;
    
    return {
      roiColor: roi >= 8 ? 'text-green-500' : roi >= 5 ? 'text-blue-500' : 'text-gray-500',
      quickWinBadge: isQuickWin,
      effortIcon: effort === 'minutes' ? Zap : effort === 'hours' ? Clock : Target,
      priorityLevel: annotation.business_impact?.priority_level || 'medium'
    };
  };

  if (!showAnnotations || viewMode !== 'canvas') {
    return (
      <div className="relative w-full">
        <img 
          src={imageUrl} 
          alt="Design Analysis" 
          className="w-full rounded-lg max-w-full h-auto shadow-sm border" 
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative w-full" ref={overlayRef}>
        {/* Enhanced Filter Controls */}
        <div className="absolute top-4 left-4 z-40 flex flex-wrap gap-2">
          <Card className="bg-background/95 backdrop-blur-sm border-border/50">
            <CardContent className="p-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Confidence:</span>
                <Progress value={confidenceThreshold * 100} className="w-16 h-2" />
                <span className="text-xs font-mono">{Math.round(confidenceThreshold * 100)}%</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAnnotationFilters(prev => ({ ...prev, confidenceMode: !prev.confidenceMode }))}
                  className="h-6 px-2"
                >
                  {annotationFilters.confidenceMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {showPatternViolations && (
            <Badge variant="outline" className="bg-background/95 backdrop-blur-sm">
              <Shield className="w-3 h-3 mr-1" />
              Pattern Violations: {filteredAnnotations.filter(a => a.violated_patterns?.length).length}
            </Badge>
          )}
        </div>

        {/* Main Image */}
        <img 
          src={imageUrl} 
          alt="Design Analysis" 
          className="w-full rounded-lg max-w-full h-auto shadow-sm border" 
        />
        
        {/* Enhanced Annotation Overlays */}
        {filteredAnnotations.map((annotation, index) => {
          const isSelected = selectedAnnotation === annotation.id;
          const isHovered = hoveredAnnotation === annotation.id;
          const severityConfig = getSeverityConfig(annotation);
          const confidenceConfig = getConfidenceIndicator(annotation.confidence);
          const businessConfig = getBusinessImpactConfig(annotation);
          
          // Use percentage-based positioning for responsive design
          const x = annotation.element.location.xPercent;
          const y = annotation.element.location.yPercent;
          const width = annotation.element.location.widthPercent;
          const height = annotation.element.location.heightPercent;
          
          const AnnotationIcon = severityConfig.icon;
          const ConfidenceIcon = confidenceConfig.icon;
          const EffortIcon = businessConfig.effortIcon;
          
          return (
            <div key={annotation.id}>
              {/* Main Annotation Marker */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "absolute rounded-lg cursor-pointer transition-all duration-300 group",
                      "hover:scale-110 active:scale-95 touch-manipulation",
                      isSelected ? 'z-30' : 'z-10',
                      isHovered ? 'z-25' : '',
                      severityConfig.borderColor,
                      severityConfig.shadowColor,
                      severityConfig.pulseSpeed
                    )}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${Math.max(width, 3)}%`, // Minimum 3% width
                      height: `${Math.max(height, 3)}%`, // Minimum 3% height
                      minWidth: '48px', // Enhanced touch target
                      minHeight: '48px', // Enhanced touch target
                      border: `3px solid ${severityConfig.color}`,
                      backgroundColor: isSelected ? severityConfig.bgColor : 'transparent',
                      boxShadow: isSelected || isHovered ? 
                        `0 0 ${severityConfig.glowIntensity}px ${severityConfig.color}40, 0 4px 20px rgba(0,0,0,0.1)` : 
                        undefined,
                      opacity: annotationFilters.confidenceMode ? annotation.confidence : 1
                    }}
                    onClick={() => onAnnotationSelect(isSelected ? null : annotation.id)}
                    onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                    onMouseLeave={() => setHoveredAnnotation(null)}
                  >
                    {/* Enhanced Annotation Number with Confidence Ring */}
                    <div className="absolute -top-4 -left-4 relative">
                      <div
                        className="rounded-full text-white font-bold flex items-center justify-center transition-all duration-300 group-hover:scale-110 w-8 h-8 text-sm shadow-lg"
                        style={{ backgroundColor: severityConfig.color }}
                      >
                        {index + 1}
                      </div>
                      
                      {/* Confidence Ring */}
                      <div 
                        className="absolute inset-0 rounded-full border-2 border-white/30"
                        style={{
                          borderLeftColor: 'white',
                          borderTopColor: 'white',
                          borderWidth: `${annotation.confidence * 3}px`,
                          transform: `rotate(${annotation.confidence * 360}deg)`
                        }}
                      />
                    </div>
                    
                    {/* Severity Icon */}
                    <div className="absolute top-1 right-1">
                      <AnnotationIcon 
                        className="w-4 h-4 text-white drop-shadow-sm" 
                        style={{ color: severityConfig.color }}
                      />
                    </div>
                    
                    {/* Pattern Violation Indicator */}
                    {annotation.violated_patterns && annotation.violated_patterns.length > 0 && showPatternViolations && (
                      <div className="absolute -bottom-2 -right-2">
                        <Badge variant="destructive" className="text-xs px-1 py-0">
                          <Shield className="w-3 h-3" />
                        </Badge>
                      </div>
                    )}
                    
                    {/* Quick Win Indicator */}
                    {annotation.business_impact?.quick_win && (
                      <div className="absolute -top-2 -right-2">
                        <Badge variant="default" className="text-xs px-1 py-0 bg-green-500">
                          <Zap className="w-3 h-3" />
                        </Badge>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                
                <TooltipContent side="top" className="max-w-xs">
                  <div className="text-sm space-y-1">
                    <div className="font-semibold">{annotation.title}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <ConfidenceIcon className={cn("w-3 h-3", confidenceConfig.color)} />
                      <span>{Math.round(annotation.confidence * 100)}% confidence</span>
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {annotation.description.substring(0, 100)}...
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
              
              {/* Enhanced Detail Panel for Selected Annotation */}
              {isSelected && (
                <Card className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-80 max-w-sm z-40 animate-fade-in shadow-2xl border-2"
                      style={{
                        left: `${Math.min(Math.max(x, 10), 90)}%`,
                        top: `${y + Math.max(height, 3) + 2}%`,
                        borderColor: severityConfig.color
                      }}>
                  <CardContent className="p-4">
                    {/* Header with Confidence and Business Impact */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-card-foreground mb-1">
                          {annotation.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {annotation.category}
                          </Badge>
                          <Badge 
                            variant={annotation.severity === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs capitalize"
                          >
                            {annotation.severity}
                          </Badge>
                          {annotation.business_impact?.quick_win && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              <Zap className="w-3 h-3 mr-1" />
                              Quick Win
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Close Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAnnotationSelect(null)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                    
                    {/* Confidence and ROI Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <ConfidenceIcon className={cn("w-3 h-3", confidenceConfig.color)} />
                          <span className="text-xs text-muted-foreground">Confidence</span>
                        </div>
                        <Progress value={annotation.confidence * 100} className="h-2" />
                        <span className="text-xs font-mono">{Math.round(annotation.confidence * 100)}%</span>
                      </div>
                      
                      {annotation.business_impact && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <TrendingUp className={cn("w-3 h-3", businessConfig.roiColor)} />
                            <span className="text-xs text-muted-foreground">ROI Score</span>
                          </div>
                          <Progress value={(annotation.business_impact.roi_score / 10) * 100} className="h-2" />
                          <span className="text-xs font-mono">{annotation.business_impact.roi_score}/10</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Description */}
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {annotation.description}
                      </p>
                    </div>
                    
                    {/* Pattern Violations */}
                    {annotation.violated_patterns && annotation.violated_patterns.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Shield className="w-3 h-3 text-destructive" />
                          <span className="text-xs font-medium text-destructive">Pattern Violations</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {annotation.violated_patterns.map((pattern, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Implementation Details */}
                    {annotation.implementation && (
                      <div className="mb-3 p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center gap-1 mb-1">
                          <EffortIcon className="w-3 h-3" />
                          <span className="text-xs font-medium">Implementation</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Effort: {annotation.implementation.effort} • Priority: {businessConfig.priorityLevel}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1 text-xs">
                        Apply Fix
                      </Button>
                    </div>
                  </CardContent>
                  
                  {/* Arrow pointing to annotation */}
                  <div 
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent"
                    style={{ borderBottomColor: severityConfig.color }}
                  />
                </Card>
              )}
            </div>
          );
        })}
        
        {/* Enhanced Summary Stats */}
        <Card className="absolute bottom-4 right-4 bg-background/95 backdrop-blur-sm border-border/50">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div className="font-medium">Analysis Summary</div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-destructive" />
                  {filteredAnnotations.filter(a => a.severity === 'critical').length}
                </span>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-warning" />
                  {filteredAnnotations.filter(a => a.severity === 'warning').length}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  {filteredAnnotations.filter(a => a.severity === 'improvement').length}
                </span>
              </div>
              <div className="text-muted-foreground">
                Avg Confidence: {Math.round((filteredAnnotations.reduce((sum, a) => sum + a.confidence, 0) / filteredAnnotations.length || 0) * 100)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};