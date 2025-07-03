import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InteractiveCanvas } from './InteractiveCanvas';
import { 
  Menu, 
  ZoomIn, 
  ZoomOut, 
  Search,
  Download,
  Share,
  Settings,
  Maximize2,
  Eye,
  AlertTriangle,
  Star,
  CheckCircle,
  BookOpen,
  TrendingUp,
  Layers
} from 'lucide-react';

interface CenterCanvasAreaProps {
  activeModule: 'ux-insights' | 'research' | 'business-impact';
  selectedAnnotation: string | null;
  onAnnotationSelect: (annotationId: string | null) => void;
  analysisData: any;
  strategistAnalysis?: any;
  userChallenge?: string;
  leftPanelCollapsed: boolean;
  onToggleLeftPanel: () => void;
}

export const CenterCanvasArea: React.FC<CenterCanvasAreaProps> = ({
  activeModule,
  selectedAnnotation,
  onAnnotationSelect,
  analysisData,
  strategistAnalysis,
  userChallenge,
  leftPanelCollapsed,
  onToggleLeftPanel
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState<'grid' | 'canvas'>('grid');

  const annotations = analysisData?.annotations || [];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'important': return <Star className="h-4 w-4 text-warning" />;
      case 'enhancement': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-destructive';
      case 'important': return 'border-warning';
      case 'enhancement': return 'border-success';
      default: return 'border-muted';
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-border p-4 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          {leftPanelCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleLeftPanel}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          
          <h1 className="text-xl font-semibold">
            {activeModule === 'ux-insights' && 'UX Insights Dashboard'}
            {activeModule === 'research' && 'Research & Citations'}
            {activeModule === 'business-impact' && 'Strategic Business Impact'}
          </h1>
          
          {userChallenge && (
            <Badge variant="outline" className="max-w-xs truncate">
              {userChallenge}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
              disabled={zoomLevel <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[4rem] text-center">
              {zoomLevel}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
              disabled={zoomLevel >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-1 mr-4">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'canvas' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('canvas')}
              className="text-xs"
            >
              <Layers className="h-3 w-3 mr-1" />
              Canvas
            </Button>
          </div>
          
          <Button variant="ghost" size="sm">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeModule === 'ux-insights' && viewMode === 'canvas' ? (
          <InteractiveCanvas
            analysisData={analysisData}
            selectedAnnotation={selectedAnnotation}
            onAnnotationSelect={onAnnotationSelect}
            activeModule={activeModule}
          />
        ) : (
          <ScrollArea className="h-full">
            <div className="p-6" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}>
              {activeModule === 'ux-insights' && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            Critical Issues
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-destructive">
                            {annotations.filter(a => a.severity === 'critical').length}
                          </div>
                          <p className="text-xs text-muted-foreground">Require immediate attention</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Star className="h-4 w-4 text-warning" />
                            Important Items
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-warning">
                            {annotations.filter(a => a.severity === 'important').length}
                          </div>
                          <p className="text-xs text-muted-foreground">Should be addressed soon</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-success" />
                            Enhancements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-success">
                            {annotations.filter(a => a.severity === 'enhancement').length}
                          </div>
                          <p className="text-xs text-muted-foreground">Nice to have improvements</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Annotations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {annotations.map((annotation, index) => (
                        <Card 
                          key={annotation.id || index}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedAnnotation === annotation.id ? 'ring-2 ring-primary' : ''
                          } ${getSeverityColor(annotation.severity)}`}
                          onClick={() => onAnnotationSelect(annotation.id || index.toString())}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getSeverityIcon(annotation.severity)}
                                <Badge variant="outline" className="text-xs">
                                  {annotation.category}
                                </Badge>
                              </div>
                              <Badge 
                                variant={annotation.severity === 'critical' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {annotation.severity}
                              </Badge>
                            </div>
                            <CardTitle className="text-sm line-clamp-2">
                              {annotation.title || annotation.feedback?.split('.')[0] || 'Untitled Issue'}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                              {annotation.description || annotation.feedback || 'No description available'}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline">{annotation.implementationEffort || 'Medium'}</Badge>
                              <Badge variant="outline">{annotation.businessImpact || 'Medium'}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
              )}
              
              {activeModule === 'research' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Research & Citations</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Research backing and citations will be displayed here when available.
                    This module integrates with academic sources and industry research.
                  </p>
                </div>
              </div>
            )}
            
            {activeModule === 'business-impact' && (
              <div className="space-y-6">
                {strategistAnalysis ? (
                  <div className="space-y-6">
                    {/* Strategic Diagnosis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Strategic Diagnosis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {strategistAnalysis.diagnosis}
                        </p>
                      </CardContent>
                    </Card>
                    
                    {/* Expert Recommendations */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Expert Recommendations</h3>
                      <div className="grid gap-4">
                        {strategistAnalysis.expertRecommendations?.map((rec, index) => (
                          <Card key={index}>
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-base">{rec.title}</CardTitle>
                                <Badge variant="outline">
                                  {Math.round(rec.confidence * 100)}% confidence
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm">{rec.recommendation}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{rec.implementationEffort}</Badge>
                                <Badge variant="outline">{rec.timeline}</Badge>
                                <Badge variant="outline">{rec.expectedImpact}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                <strong>Reasoning:</strong> {rec.reasoning}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <strong>Source:</strong> {rec.source}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Business Impact Analysis</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Strategic business impact analysis will be displayed here.
                      Enable the UX Strategist mode to see detailed business recommendations.
                    </p>
                  </div>
                )}
              </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};