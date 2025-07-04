import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Download, 
  Share2, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronLeft,
  BarChart3,
  FileText,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  Brain
} from 'lucide-react';
import { StrategistOutput } from '@/services/ai/claudeUXStrategistEngine';

interface AnalysisData {
  annotations: Array<{
    id: string;
    title: string;
    feedback: string;
    severity: string;
    category: string;
  }>;
  images?: string[];
  totalAnnotations?: number;
  processingTime?: number;
  knowledgeSourcesUsed?: number;
  aiModel?: string;
  createdAt?: string;
}

interface EnhancedFigmaAnalysisLayoutProps {
  analysisData: AnalysisData;
  strategistAnalysis?: StrategistOutput | null;
  userChallenge?: string;
  onBack?: () => void;
}

export const EnhancedFigmaAnalysisLayout: React.FC<EnhancedFigmaAnalysisLayoutProps> = ({
  analysisData,
  strategistAnalysis,
  userChallenge,
  onBack,
}) => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(analysisData.annotations.map(a => a.category)))];
  
  const filteredAnnotations = analysisData.annotations.filter(annotation => 
    activeFilter === 'all' || annotation.category === activeFilter
  );

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Navigation & Analysis Info */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <div className="h-full border-r border-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="mb-3 w-full justify-start"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">UX Analysis</h2>
                </div>
                {userChallenge && (
                  <p className="text-sm text-muted-foreground">{userChallenge}</p>
                )}
              </div>
            </div>

            {/* Analysis Overview */}
            <div className="p-4 space-y-4 flex-1 overflow-auto">
              <div>
                <h3 className="font-medium mb-3">Overview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Insights</span>
                    <span className="font-medium">{analysisData.totalAnnotations || analysisData.annotations.length}</span>
                  </div>
                  {analysisData.images && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Images</span>
                      <span className="font-medium">{analysisData.images.length}</span>
                    </div>
                  )}
                  {analysisData.knowledgeSourcesUsed && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Research Sources</span>
                      <span className="font-medium text-primary">{analysisData.knowledgeSourcesUsed}</span>
                    </div>
                  )}
                  {analysisData.processingTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing Time</span>
                      <span className="font-medium">{Math.round(analysisData.processingTime / 1000)}s</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(analysisData.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const count = category === 'all' 
                      ? analysisData.annotations.length 
                      : analysisData.annotations.filter(a => a.category === category).length;
                    
                    return (
                      <Button
                        key={category}
                        variant={activeFilter === category ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveFilter(category)}
                        className="w-full justify-between text-left"
                      >
                        <span className="capitalize">{category}</span>
                        <span className="text-xs">{count}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <h3 className="font-medium">Actions</h3>
                <div className="space-y-1">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Analysis
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Center Panel - Main Analysis View - Full Width */}
        <ResizablePanel defaultSize={75} minSize={60}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-semibold">Analysis Results</h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredAnnotations.length} insights found
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {strategistAnalysis && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">UX Strategist Insights</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enhanced analysis with business impact and strategic recommendations
                  </p>
                </div>
              )}
            </div>

            {/* Content Area - Top Aligned */}
            <div className="flex-1 overflow-auto p-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAnnotations.map((annotation) => (
                    <Card
                      key={annotation.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAnnotation === annotation.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedAnnotation(annotation.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm font-medium leading-5">
                            {annotation.title}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getSeverityColor(annotation.severity)}`}
                          >
                            {annotation.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-2">
                          {annotation.feedback.substring(0, 100)}...
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {annotation.category}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAnnotations.map((annotation) => (
                    <Card
                      key={annotation.id}
                      className={`cursor-pointer transition-all hover:shadow-sm ${
                        selectedAnnotation === annotation.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedAnnotation(annotation.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm mb-1">{annotation.title}</h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              {annotation.feedback.substring(0, 150)}...
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {annotation.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getSeverityColor(annotation.severity)}`}
                              >
                                {annotation.severity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};