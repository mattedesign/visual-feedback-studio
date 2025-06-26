
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Annotation } from '@/types/analysis';
import { Plus, Download, Share2, FileText, DollarSign, Target, List, Calendar } from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { BusinessImpactTab } from './tabs/BusinessImpactTab';
import { RecommendationsTab } from './tabs/RecommendationsTab';
import { AllAnnotationsTab } from './tabs/AllAnnotationsTab';
import { ImplementationTab } from './tabs/ImplementationTab';

interface OptimizedResultsLayoutProps {
  annotations: Annotation[];
  businessImpact?: {
    totalPotentialRevenue: string;
    quickWinsAvailable: number;
    criticalIssuesCount: number;
    averageROIScore: number;
    implementationRoadmap: {
      immediate: Annotation[];
      shortTerm: Annotation[];
      longTerm: Annotation[];
    };
  };
  insights?: {
    topRecommendation: string;
    quickestWin: string;
    highestImpact: string;
    competitiveAdvantage?: string;
    researchEvidence?: string;
  };
  onNewAnalysis: () => void;
  onExport?: () => void;
  onShare?: () => void;
  activeAnnotation: string | null;
  onAnnotationClick: (id: string) => void;
  getSeverityColor: (severity: string) => string;
}

export const OptimizedResultsLayout: React.FC<OptimizedResultsLayoutProps> = ({
  annotations,
  businessImpact,
  insights,
  onNewAnalysis,
  onExport,
  onShare,
  activeAnnotation,
  onAnnotationClick,
  getSeverityColor,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Default export functionality
      const dataStr = JSON.stringify({ annotations, businessImpact, insights }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `analysis-results-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality
      if (navigator.share) {
        navigator.share({
          title: 'Analysis Results',
          text: `Analysis completed with ${annotations.length} insights found`,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
              <p className="text-slate-400 text-sm">
                {annotations.length} insights found • {businessImpact?.totalPotentialRevenue || 'Revenue impact calculated'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-slate-600 hover:bg-slate-800"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-slate-600 hover:bg-slate-800"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation */}
              <div className="border-b border-slate-700">
                <TabsList className="w-full h-auto p-1 bg-transparent grid grid-cols-5 gap-1">
                  <TabsTrigger 
                    value="overview" 
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="business-impact" 
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span className="hidden sm:inline">Business Impact</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="recommendations" 
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                  >
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">Recommendations</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="annotations" 
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">All Findings</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="implementation" 
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Implementation</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <TabsContent value="overview" className="mt-0">
                  <OverviewTab 
                    annotations={annotations}
                    businessImpact={businessImpact}
                    insights={insights}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>

                <TabsContent value="business-impact" className="mt-0">
                  <BusinessImpactTab 
                    businessImpact={businessImpact}
                    annotations={annotations}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>

                <TabsContent value="recommendations" className="mt-0">
                  <RecommendationsTab 
                    annotations={annotations}
                    businessImpact={businessImpact}
                    onAnnotationClick={onAnnotationClick}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>

                <TabsContent value="annotations" className="mt-0">
                  <AllAnnotationsTab 
                    annotations={annotations}
                    activeAnnotation={activeAnnotation}
                    onAnnotationClick={onAnnotationClick}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>

                <TabsContent value="implementation" className="mt-0">
                  <ImplementationTab 
                    businessImpact={businessImpact}
                    annotations={annotations}
                    getSeverityColor={getSeverityColor}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={onNewAnalysis}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg z-20"
        size="lg"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};
