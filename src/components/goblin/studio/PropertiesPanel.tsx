import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Image as ImageIcon, 
  MessageSquare, 
  Target, 
  AlertCircle, 
  CheckCircle,
  Eye,
  Palette,
  Accessibility
} from 'lucide-react';

interface AnalysisImage {
  id: string;
  file_name: string;
  file_path: string;
  image_index: number;
  file_size?: number;
  processing_status: string;
}

interface Insight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  priority: string;
  confidence_score: number;
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  feedback_type?: string;
  description?: string;
  image_id: string;
}

interface SessionInfo {
  title: string;
  status: string;
  imageCount: number;
}

interface PropertiesPanelProps {
  selectedImage: AnalysisImage | null;
  insights: Insight[];
  annotations: Annotation[];
  onAnnotationUpdate: (annotationId: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete: (annotationId: string) => void;
  sessionInfo: SessionInfo;
  allImages: AnalysisImage[];
  allAnnotations: Annotation[];
}

export function PropertiesPanel({
  selectedImage,
  insights,
  annotations,
  onAnnotationUpdate,
  onAnnotationDelete,
  sessionInfo,
  allImages,
  allAnnotations
}: PropertiesPanelProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'usability': return <Target className="w-4 h-4" />;
      case 'visual_design': return <Palette className="w-4 h-4" />;
      case 'accessibility': return <Accessibility className="w-4 h-4" />;
      case 'content': return <MessageSquare className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium text-foreground">Properties</h3>
        <p className="text-sm text-muted-foreground">
          Analysis overview and summary
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <div className="font-medium text-foreground">{sessionInfo.title}</div>
                <div className="text-muted-foreground">
                  {sessionInfo.imageCount} images • {allAnnotations.length} annotations
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {sessionInfo.status}
                </Badge>
                {sessionInfo.imageCount === 5 && (
                  <Badge variant="outline" className="text-xs">
                    Maximum reached
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Image Details */}
          {selectedImage && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Image Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-foreground truncate">
                    {selectedImage.file_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(selectedImage.file_size)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="flex items-center gap-1 mt-1">
                      {selectedImage.processing_status === 'uploaded' ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-yellow-500" />
                      )}
                      <span className="text-foreground capitalize">
                        {selectedImage.processing_status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Index:</span>
                    <div className="text-foreground mt-1">
                      {selectedImage.image_index + 1} of {allImages.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Insights ({insights.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={insight.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {getInsightIcon(insight.insight_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground">
                            {insight.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {insight.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getPriorityColor(insight.priority) as any}
                          className="text-xs"
                        >
                          {insight.priority} priority
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(insight.confidence_score * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Annotations */}
          {annotations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Annotations ({annotations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {annotations.map((annotation, index) => (
                  <div key={annotation.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">
                        {annotation.label || `Annotation ${index + 1}`}
                      </div>
                      {annotation.feedback_type && (
                        <Badge variant="outline" className="text-xs">
                          {annotation.feedback_type}
                        </Badge>
                      )}
                      {annotation.description && (
                        <div className="text-xs text-muted-foreground">
                          {annotation.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Position: {Math.round(annotation.x)}%, {Math.round(annotation.y)}% • 
                        Size: {Math.round(annotation.width)} × {Math.round(annotation.height)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Analysis Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Images</div>
                  <div className="font-medium">{allImages.length}/5</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Annotations</div>
                  <div className="font-medium">{allAnnotations.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Insights</div>
                  <div className="font-medium">{insights.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Processing</div>
                  <div className="font-medium">
                    {allImages.filter(img => img.processing_status === 'uploaded').length} Complete
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}