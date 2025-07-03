import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronRight,
  Copy,
  ExternalLink,
  Edit,
  Star,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface RightPropertiesPanelProps {
  selectedAnnotation: string | null;
  activeModule: 'ux-insights' | 'research' | 'business-impact';
  analysisData: any;
  strategistAnalysis?: any;
  onCollapse: () => void;
}

export const RightPropertiesPanel: React.FC<RightPropertiesPanelProps> = ({
  selectedAnnotation,
  activeModule,
  analysisData,
  strategistAnalysis,
  onCollapse
}) => {
  const annotations = analysisData?.annotations || [];
  const selectedAnnotationData = selectedAnnotation 
    ? annotations.find(a => a.id === selectedAnnotation) || annotations[parseInt(selectedAnnotation)]
    : null;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'important': return <Star className="h-4 w-4 text-warning" />;
      case 'enhancement': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col border-l border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Properties</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {selectedAnnotationData ? (
            <div className="space-y-6">
              {/* Selected Annotation Details */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {getSeverityIcon(selectedAnnotationData.severity)}
                  <Badge variant="outline">{selectedAnnotationData.category}</Badge>
                  <Badge variant={selectedAnnotationData.severity === 'critical' ? 'destructive' : 'secondary'}>
                    {selectedAnnotationData.severity}
                  </Badge>
                </div>
                
                <h3 className="text-base font-semibold mb-2">
                  {selectedAnnotationData.title || selectedAnnotationData.feedback?.split('.')[0] || 'Untitled Issue'}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedAnnotationData.description || selectedAnnotationData.feedback || 'No description available'}
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              {/* Annotation Properties */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Implementation
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Effort:</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedAnnotationData.implementationEffort || 'Medium'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Impact:</span>
                      <Badge variant="outline" className="text-xs">
                        {selectedAnnotationData.businessImpact || 'Medium'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedAnnotationData.coordinates && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Position</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>X: {selectedAnnotationData.x || selectedAnnotationData.coordinates.x}</div>
                      <div>Y: {selectedAnnotationData.y || selectedAnnotationData.coordinates.y}</div>
                    </div>
                  </div>
                )}
                
                {selectedAnnotationData.researchCitations && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Research Backing</h4>
                    <div className="space-y-2">
                      {selectedAnnotationData.researchCitations.slice(0, 3).map((citation, index) => (
                        <Card key={index} className="p-2">
                          <p className="text-xs line-clamp-2">{citation}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Module Overview */}
              {activeModule === 'ux-insights' && (
                <div>
                  <h3 className="text-sm font-medium mb-3">UX Insights Overview</h3>
                  <div className="space-y-3">
                    <Card className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Total Issues</span>
                        <Badge variant="outline">{annotations.length}</Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>Critical: {annotations.filter(a => a.severity === 'critical').length}</div>
                        <div>Important: {annotations.filter(a => a.severity === 'important').length}</div>
                        <div>Enhancement: {annotations.filter(a => a.severity === 'enhancement').length}</div>
                      </div>
                    </Card>
                    
                    <div className="text-sm text-muted-foreground">
                      Select an annotation from the canvas to view detailed properties and take actions.
                    </div>
                  </div>
                </div>
              )}
              
              {activeModule === 'research' && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Research Overview</h3>
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Sources</span>
                      <Badge variant="outline">{analysisData?.research_citations?.length || 0}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Research sources and citations that back the analysis insights.
                    </p>
                  </Card>
                </div>
              )}
              
              {activeModule === 'business-impact' && strategistAnalysis && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Business Impact Overview</h3>
                  <div className="space-y-3">
                    <Card className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Recommendations</span>
                        <Badge variant="outline">
                          {strategistAnalysis.expertRecommendations?.length || 0}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>Avg. Confidence: {strategistAnalysis.confidenceAssessment ? 
                          Math.round(strategistAnalysis.confidenceAssessment.overallConfidence * 100) : 0}%</div>
                      </div>
                    </Card>
                    
                    {strategistAnalysis.abTestHypothesis && (
                      <Card className="p-3">
                        <h4 className="text-sm font-medium mb-2">A/B Test Hypothesis</h4>
                        <p className="text-xs text-muted-foreground">
                          {strategistAnalysis.abTestHypothesis}
                        </p>
                      </Card>
                    )}
                    
                    {strategistAnalysis.successMetrics && (
                      <Card className="p-3">
                        <h4 className="text-sm font-medium mb-2">Success Metrics</h4>
                        <div className="space-y-1">
                          {strategistAnalysis.successMetrics.slice(0, 4).map((metric, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              • {metric}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              )}
              
              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <Copy className="h-3 w-3 mr-2" />
                    Export Analysis
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Share Results
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <Edit className="h-3 w-3 mr-2" />
                    Add Notes
                  </Button>
                </div>
              </div>
              
              {/* Notes Section */}
              <div>
                <h4 className="text-sm font-medium mb-3">Notes</h4>
                <Textarea 
                  placeholder="Add your notes here..."
                  className="min-h-[80px] text-xs"
                />
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};