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
  BarChart3
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
  const [activeTab, setActiveTab] = useState('insights');

  const insights = analysisData?.annotations || [];
  const insightsByCategory = insights.reduce((acc: any, insight: any) => {
    const category = insight.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(insight);
    return acc;
  }, {});

  return (
    <div className="h-full bg-background">
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

      <div className="flex-1 p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              UX Insights
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Research
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Business Impact
            </TabsTrigger>
            <TabsTrigger value="strategic" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Strategic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="mt-6 space-y-6">
            <div className="grid gap-6">
              {Object.entries(insightsByCategory).map(([category, categoryInsights]: [string, any]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      {category}
                      <Badge variant="secondary">{categoryInsights.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryInsights.map((insight: any, index: number) => (
                        <div key={index} className="p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium">{insight.title || 'UX Insight'}</h4>
                              <p className="text-muted-foreground mt-1">
                                {insight.description || insight.content}
                              </p>
                              {insight.impact && (
                                <div className="mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    Impact: {insight.impact}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="research" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Research Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Research citations and sources will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Business Impact Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {strategistAnalysis ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2">Strategic Recommendations</h4>
                      <p className="text-muted-foreground">{strategistAnalysis.summary}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Business impact analysis will be displayed here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="strategic" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Strategic Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {strategistAnalysis ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Executive Summary</h4>
                      <p className="text-muted-foreground">{strategistAnalysis.summary}</p>
                    </div>
                    
                    {strategistAnalysis.recommendations && (
                      <div>
                        <h4 className="font-medium mb-3">Key Recommendations</h4>
                        <div className="space-y-3">
                          {strategistAnalysis.recommendations.map((rec: any, index: number) => (
                            <div key={index} className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-sm">{typeof rec === 'string' ? rec : rec.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Strategic analysis will be displayed here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};