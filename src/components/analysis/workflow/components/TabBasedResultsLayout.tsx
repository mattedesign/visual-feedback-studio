import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Search, 
  TrendingUp, 
  Download, 
  Share2,
  Eye,
  Target,
  Lightbulb,
  BarChart3,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TabBasedResultsLayoutProps {
  analysisData: any;
  strategistAnalysis?: any;
  userChallenge?: string;
}

export const TabBasedResultsLayout: React.FC<TabBasedResultsLayoutProps> = ({
  analysisData,
  strategistAnalysis,
  userChallenge
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const insights = analysisData?.annotations || [];
  const images = analysisData?.images || [];
  const insightsByCategory = insights.reduce((acc: any, insight: any) => {
    const category = insight.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(insight);
    return acc;
  }, {});

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analysis Results</h1>
            <p className="text-muted-foreground mt-1">
              {userChallenge || 'UX Analysis Complete'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tabs */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="h-full">
              <TabsList className="grid w-full grid-rows-2 h-auto">
                <TabsTrigger value="summary" className="flex items-center gap-2 w-full justify-start">
                  <Eye className="w-4 h-4" />
                  Summary
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2 w-full justify-start">
                  <Target className="w-4 h-4" />
                  UX Insights
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Center - Image Viewer */}
        <div className="flex-1 flex flex-col bg-muted/20">
          {/* Image Navigation */}
          {images.length > 0 && (
            <div className="border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Image {currentImageIndex + 1} of {images.length}
                </span>
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={prevImage}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={nextImage}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Image Display */}
          <div className="flex-1 flex items-center justify-center p-8">
            {images.length > 0 ? (
              <div className="relative max-w-full max-h-full">
                <img
                  src={images[currentImageIndex]}
                  alt={`Analysis image ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    console.log('🔍 FIX 3: Image failed to load:', images[currentImageIndex]);
                    console.log('🔍 Full image URL:', images[currentImageIndex]);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ FIX 3: Image loaded successfully:', images[currentImageIndex].substring(0, 50) + '...');
                  }}
                />
                
                {/* ✅ FIX 2: Annotations panel removed as requested */}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                <p>No images available for this analysis</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Content based on active tab */}
        <div className="w-96 border-l border-border flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Overview</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Insights</span>
                          <span className="font-semibold">{insights.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Images Analyzed</span>
                          <span className="font-semibold">{images.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Categories</span>
                          <span className="font-semibold">{Object.keys(insightsByCategory).length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <h3 className="font-semibold mb-3">UX Insights</h3>
                {Object.entries(insightsByCategory).map(([category, categoryInsights]: [string, any]) => (
                  <Card key={category}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {category}
                        <Badge variant="secondary" className="text-xs">{categoryInsights.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {categoryInsights.map((insight: any, index: number) => (
                          <div key={index} className="p-3 bg-muted/30 rounded-lg">
                            <h4 className="font-medium text-sm mb-1">{insight.title || 'UX Insight'}</h4>
                            <p className="text-xs text-muted-foreground">
                              {insight.description || insight.content}
                            </p>
                            {insight.impact && (
                              <Badge variant="outline" className="text-xs mt-2">
                                Impact: {insight.impact}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};