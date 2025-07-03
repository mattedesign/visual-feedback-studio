import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Calendar, BarChart3, Grid3X3, List, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResultsResponse } from '@/services/analysisResultsService';

interface FigmaDashboardLayoutProps {
  analyses: AnalysisResultsResponse[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: 'all' | 'completed' | 'processing';
  setFilterStatus: (status: 'all' | 'completed' | 'processing') => void;
  onNewAnalysis: () => void;
  onViewAnalysis: (id: string) => void;
}

export const FigmaDashboardLayout: React.FC<FigmaDashboardLayoutProps> = ({
  analyses,
  isLoading,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onNewAnalysis,
  onViewAnalysis,
}) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResultsResponse | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAnalysisPreview = (analysis: AnalysisResultsResponse) => {
    const context = analysis.analysis_context || 'UX Analysis';
    return context.length > 50 ? context.substring(0, 50) + '...' : context;
  };

  const getAnalysisStatus = (analysis: AnalysisResultsResponse) => {
    if (analysis.total_annotations > 0 && analysis.images?.length > 0) {
      return 'completed';
    }
    return 'processing';
  };

  const calculateImageCount = (analysis: AnalysisResultsResponse): number => {
    if (!analysis.images || !Array.isArray(analysis.images)) {
      return 0;
    }
    return analysis.images.length;
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.analysis_context?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const analysisStatus = getAnalysisStatus(analysis);
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'completed' && analysisStatus === 'completed') ||
      (filterStatus === 'processing' && analysisStatus === 'processing');
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="h-full p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Navigation & Filters */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <div className="h-full border-r border-border p-4 space-y-6">
            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Quick Actions</h3>
              <Button
                onClick={onNewAnalysis}
                className="w-full justify-start"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
              <Button
                onClick={() => navigate('/hybrid-engine-test')}
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                Test Hybrid Engine
              </Button>
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Filters</h3>
              <div className="space-y-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className="w-full justify-start"
                >
                  All Analyses ({analyses.length})
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('completed')}
                  className="w-full justify-start"
                >
                  Completed ({analyses.filter(a => getAnalysisStatus(a) === 'completed').length})
                </Button>
                <Button
                  variant={filterStatus === 'processing' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterStatus('processing')}
                  className="w-full justify-start"
                >
                  Processing ({analyses.filter(a => getAnalysisStatus(a) === 'processing').length})
                </Button>
              </div>
            </div>

            {/* View Mode */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">View</h3>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Center Panel - Main Content */}
        <ResizablePanel defaultSize={50} minSize={40}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b border-border p-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Analysis Dashboard</h1>
                  <p className="text-muted-foreground">
                    Manage and review your UX analysis history
                  </p>
                </div>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search analyses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
              {filteredAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {analyses.length === 0 ? 'No analyses yet' : 'No matching analyses'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {analyses.length === 0 
                      ? 'Start your first UX analysis to see results here'
                      : 'Try adjusting your search or filter criteria'
                    }
                  </p>
                  {analyses.length === 0 && (
                    <Button onClick={onNewAnalysis}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Analysis
                    </Button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAnalyses.map((analysis) => {
                    const analysisStatus = getAnalysisStatus(analysis);
                    const imageCount = calculateImageCount(analysis);
                    const isSelected = selectedAnalysis?.id === analysis.id;
                    
                    return (
                      <Card
                        key={analysis.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedAnalysis(analysis)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base font-medium">
                              {getAnalysisPreview(analysis)}
                            </CardTitle>
                            <Badge
                              variant={analysisStatus === 'completed' ? 'default' : 'secondary'}
                            >
                              {analysisStatus === 'completed' ? 'Complete' : 'Processing'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(analysis.created_at)}</span>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {imageCount > 0 && analysis.images && analysis.images[0] && (
                            <div className="w-full h-24 bg-muted rounded mb-3 overflow-hidden">
                              <img
                                src={analysis.images[0]}
                                alt="Analysis preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Insights</span>
                              <span className="font-medium">{analysis.total_annotations}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Images</span>
                              <span className="font-medium">{imageCount}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAnalyses.map((analysis) => {
                    const analysisStatus = getAnalysisStatus(analysis);
                    const imageCount = calculateImageCount(analysis);
                    const isSelected = selectedAnalysis?.id === analysis.id;
                    
                    return (
                      <Card
                        key={analysis.id}
                        className={`cursor-pointer transition-all hover:shadow-sm ${
                          isSelected ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedAnalysis(analysis)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{getAnalysisPreview(analysis)}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(analysis.created_at)}
                                </span>
                                <span>{analysis.total_annotations} insights</span>
                                <span>{imageCount} images</span>
                              </div>
                            </div>
                            <Badge
                              variant={analysisStatus === 'completed' ? 'default' : 'secondary'}
                            >
                              {analysisStatus === 'completed' ? 'Complete' : 'Processing'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Panel - Analysis Details */}
        <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
          <div className="h-full border-l border-border p-4">
            {selectedAnalysis ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Analysis Details</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAnalysis.analysis_context || 'UX Analysis'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Insights</span>
                        <span className="font-medium">{selectedAnalysis.total_annotations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Images Analyzed</span>
                        <span className="font-medium">{calculateImageCount(selectedAnalysis)}</span>
                      </div>
                      {selectedAnalysis.knowledge_sources_used && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Research Sources</span>
                          <span className="font-medium text-primary">{selectedAnalysis.knowledge_sources_used}</span>
                        </div>
                      )}
                      {selectedAnalysis.processing_time_ms && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Processing Time</span>
                          <span className="font-medium">{Math.round(selectedAnalysis.processing_time_ms / 1000)}s</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => onViewAnalysis(selectedAnalysis.analysis_id)}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Analysis
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-2">Select an Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Choose an analysis from the list to view its details
                </p>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};