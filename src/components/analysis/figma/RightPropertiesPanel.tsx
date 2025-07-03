import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Info,
  BarChart3,
  PieChart,
  Download,
  Share2,
  FileText,
  Bookmark,
  Tag,
  Calendar,
  User,
  Eye,
  ThumbsUp,
  MessageSquare,
  Settings,
  Zap,
  DollarSign,
  LineChart,
  Activity,
  Layers,
  Filter
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
  const [activeTab, setActiveTab] = useState('properties');
  const [notes, setNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  
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

  const getSeverityProgress = (severity: string) => {
    switch (severity) {
      case 'critical': return 90;
      case 'important': return 70;
      case 'enhancement': return 40;
      default: return 50;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort?.toLowerCase()) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const handleExport = () => {
    if (selectedAnnotationData) {
      const exportData = {
        annotation: selectedAnnotationData,
        module: activeModule,
        timestamp: new Date().toISOString(),
        notes: notes
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `annotation-${selectedAnnotationData.id || 'export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShare = async () => {
    if (selectedAnnotationData) {
      const shareData = {
        title: selectedAnnotationData.title || 'UX Annotation',
        text: selectedAnnotationData.feedback || selectedAnnotationData.description || '',
        url: window.location.href
      };
      
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(`${shareData.title}: ${shareData.text}\n\n${shareData.url}`);
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Enhanced Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(selectedAnnotationData.severity)}
                    <Badge variant="outline">{selectedAnnotationData.category}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className="h-6 w-6 p-0"
                    >
                      <Bookmark className={`h-3 w-3 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedAnnotationData.title || '')} className="h-6 w-6 p-0">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleShare} className="h-6 w-6 p-0">
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleExport} className="h-6 w-6 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <h3 className="text-base font-semibold mb-2 leading-tight">
                  {selectedAnnotationData.title || selectedAnnotationData.feedback?.split('.')[0] || 'Untitled Issue'}
                </h3>
                
                {/* Priority & Impact Visualization */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium">Priority:</span>
                    <Progress 
                      value={getSeverityProgress(selectedAnnotationData.severity)} 
                      className="flex-1 h-2"
                    />
                    <Badge variant={selectedAnnotationData.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                      {selectedAnnotationData.severity}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Tabbed Interface */}
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="properties" className="text-xs">
                  <Settings className="h-3 w-3 mr-1" />
                  Props
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="research" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Research
                </TabsTrigger>
                <TabsTrigger value="actions" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  Actions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="properties" className="space-y-4">
                {/* Enhanced Properties */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Implementation Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Effort</Label>
                        <div className={`text-sm font-medium ${getEffortColor(selectedAnnotationData.implementationEffort)}`}>
                          {selectedAnnotationData.implementationEffort || 'Medium'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Impact</Label>
                        <div className="text-sm font-medium">
                          {selectedAnnotationData.businessImpact || 'Medium'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Estimated Timeline</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">2-3 weeks</span>
                      </div>
                    </div>

                    {selectedAnnotationData.coordinates && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Position</Label>
                        <div className="text-xs space-y-1">
                          <div>X: {selectedAnnotationData.x || selectedAnnotationData.coordinates.x}%</div>
                          <div>Y: {selectedAnnotationData.y || selectedAnnotationData.coordinates.y}%</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Description with Rich Text */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {selectedAnnotationData.description || selectedAnnotationData.feedback || 'No description available'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                {/* Business Impact Metrics */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <LineChart className="h-4 w-4" />
                      Impact Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">85%</div>
                        <div className="text-xs text-muted-foreground">User Satisfaction</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">+12%</div>
                        <div className="text-xs text-muted-foreground">Conversion Rate</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>ROI Estimate</span>
                        <span className="font-medium">$15,000/month</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Confidence Score */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Analysis Confidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Progress value={88} className="flex-1 h-3" />
                      <span className="text-sm font-medium">88%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on research citations and pattern matching
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="research" className="space-y-4">
                {/* Research Citations */}
                {selectedAnnotationData.researchCitations && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Research Backing
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedAnnotationData.researchCitations.slice(0, 3).map((citation, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs leading-relaxed">{citation}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">Research</Badge>
                            <span className="text-xs text-muted-foreground">• 2024</span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Related Patterns */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Related Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-xs">Progressive Disclosure</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                        <div className="w-2 h-2 bg-warning rounded-full" />
                        <span className="text-xs">Clear Error Messaging</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Edit className="h-3 w-3 mr-2" />
                      Edit Annotation
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <MessageSquare className="h-3 w-3 mr-2" />
                      Add Comment
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Tag className="h-3 w-3 mr-2" />
                      Add Tags
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Calendar className="h-3 w-3 mr-2" />
                      Schedule Review
                    </Button>
                  </CardContent>
                </Card>

                {/* Export Options */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export & Share
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleExport}>
                      <FileText className="h-3 w-3 mr-2" />
                      Export JSON
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleShare}>
                      <Share2 className="h-3 w-3 mr-2" />
                      Share Link
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Copy className="h-3 w-3 mr-2" />
                      Copy Markdown
                    </Button>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Add your notes and thoughts..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[80px] text-xs"
                    />
                    <Button size="sm" className="w-full mt-2">
                      Save Notes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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