// Phase 6: Advanced Analytics Dashboard - Pipeline Health Monitoring
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  BarChart3, 
  Brain, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface AnalyticsMetrics {
  pipelineHealth: {
    overallHealth: number;
    analysisQuality: number;
    processingSpeed: number;
    errorRate: number;
  };
  modelPerformance: {
    claude: { successRate: number; avgProcessingTime: number; confidence: number };
    gpt4o: { successRate: number; avgProcessingTime: number; confidence: number };
    perplexity: { successRate: number; avgProcessingTime: number; confidence: number };
    googleVision: { successRate: number; avgProcessingTime: number; confidence: number };
  };
  userBehavior: {
    analysisCompletionRate: number;
    averageAnnotationsPerSession: number;
    interfacePreference: 'figma' | 'traditional';
    satisfactionScore: number;
  };
  businessImpact: {
    improvementTracking: Array<{
      metric: string;
      baseline: number;
      current: number;
      improvement: number;
    }>;
    roiRealized: number;
    implementationSuccess: number;
  };
}

export const AnalyticsHealthDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  
  // Feature flag check
  const analyticsEnabled = useFeatureFlag('advanced-analytics-dashboard');
  
  useEffect(() => {
    if (analyticsEnabled) {
      loadAnalyticsData();
    }
  }, [analyticsEnabled, selectedTimeframe]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would fetch from analytics service
      const mockMetrics: AnalyticsMetrics = {
        pipelineHealth: {
          overallHealth: 94,
          analysisQuality: 87,
          processingSpeed: 92,
          errorRate: 2.3
        },
        modelPerformance: {
          claude: { successRate: 98, avgProcessingTime: 12.4, confidence: 0.89 },
          gpt4o: { successRate: 85, avgProcessingTime: 8.7, confidence: 0.82 },
          perplexity: { successRate: 92, avgProcessingTime: 15.3, confidence: 0.78 },
          googleVision: { successRate: 96, avgProcessingTime: 3.2, confidence: 0.85 }
        },
        userBehavior: {
          analysisCompletionRate: 89,
          averageAnnotationsPerSession: 7.3,
          interfacePreference: 'figma',
          satisfactionScore: 4.6
        },
        businessImpact: {
          improvementTracking: [
            { metric: 'User Satisfaction', baseline: 3.2, current: 4.6, improvement: 43.8 },
            { metric: 'Task Completion Rate', baseline: 67, current: 89, improvement: 32.8 },
            { metric: 'Analysis Quality Score', baseline: 72, current: 87, improvement: 20.8 }
          ],
          roiRealized: 1.7,
          implementationSuccess: 84
        }
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!analyticsEnabled) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground">
          Advanced analytics dashboard is not enabled.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default" className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge variant="destructive">Needs Attention</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor pipeline health, model performance, and business impact
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-muted p-1">
            {(['24h', '7d', '30d'] as const).map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>
          
          <Button onClick={loadAnalyticsData} size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pipeline Health</p>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.pipelineHealth.overallHealth)}`}>
                  {metrics.pipelineHealth.overallHealth}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              {getHealthBadge(metrics.pipelineHealth.overallHealth)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Analysis Quality</p>
                <p className={`text-2xl font-bold ${getHealthColor(metrics.pipelineHealth.analysisQuality)}`}>
                  {metrics.pipelineHealth.analysisQuality}%
                </p>
              </div>
              <Brain className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              {getHealthBadge(metrics.pipelineHealth.analysisQuality)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Satisfaction</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.userBehavior.satisfactionScore}/5.0
                </p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                {metrics.userBehavior.interfacePreference === 'figma' ? 'Figma UI Preferred' : 'Traditional UI'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ROI Realized</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.businessImpact.roiRealized}x
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Health</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="users">User Behavior</TabsTrigger>
          <TabsTrigger value="business">Business Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Processing Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Analysis Quality</span>
                    <span>{metrics.pipelineHealth.analysisQuality}%</span>
                  </div>
                  <Progress value={metrics.pipelineHealth.analysisQuality} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Processing Speed</span>
                    <span>{metrics.pipelineHealth.processingSpeed}%</span>
                  </div>
                  <Progress value={metrics.pipelineHealth.processingSpeed} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Error Rate</span>
                    <span className="text-red-600">{metrics.pipelineHealth.errorRate}%</span>
                  </div>
                  <Progress value={100 - metrics.pipelineHealth.errorRate} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">All systems operational</p>
                      <p className="text-xs text-muted-foreground">Last checked: 2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">Perplexity API latency increased</p>
                      <p className="text-xs text-muted-foreground">Average response time: 15.3s (+2.1s)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(metrics.modelPerformance).map(([model, performance]) => (
              <Card key={model}>
                <CardHeader>
                  <CardTitle className="capitalize">{model} Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Success Rate</span>
                      <span>{performance.successRate}%</span>
                    </div>
                    <Progress value={performance.successRate} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Confidence Score</span>
                      <span>{(performance.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={performance.confidence * 100} />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Avg Processing Time</span>
                    <span>{performance.avgProcessingTime}s</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {metrics.userBehavior.analysisCompletionRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Users completing full analysis
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {metrics.userBehavior.averageAnnotationsPerSession}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average annotations per session
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interface Preference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">
                    {metrics.userBehavior.interfacePreference === 'figma' ? 'Figma UI' : 'Traditional UI'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Most preferred interface
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Improvement Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.businessImpact.improvementTracking.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.metric}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.baseline} → {item.current}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        +{item.improvement.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">improvement</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};