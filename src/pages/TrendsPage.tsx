import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Calendar,
  BarChart3,
  ArrowLeft,
  Users,
  Zap,
  Type,
  Palette,
  Map,
  Layout,
  MousePointer,
  Shield,
  Heart,
  Brain,
  Eye,
  Mouse,
  Clock,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface TrendingImprovement {
  category: string;
  improvement_type: string;
  frequency_count: number;
  trend_percentage: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
}

interface DetailedIssue {
  issue_title: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  impact_level: 'low' | 'medium' | 'high';
}

interface AppliedSolution {
  solution_name: string;
  complexity_level: 'low' | 'medium' | 'high';
  category: string;
  impact_rating: number;
}

interface DesignPattern {
  pattern_name: string;
  category: string;
  frequency_count: number;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
}

interface TrendsData {
  totalAnalyses: number;
  avgScore: number;
  recentActivity: { thisWeek: number; lastWeek: number };
  topCategories: TrendingImprovement[];
  commonIssues: DetailedIssue[];
  appliedSolutions: AppliedSolution[];
  emergingPatterns: DesignPattern[];
  analysisTimeline: any[];
}

export default function TrendsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('30days');

  useEffect(() => {
    if (user) {
      loadTrendsData();
    }
  }, [user, timePeriod]);

  const loadTrendsData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First seed some data if needed
      await seedDataIfNeeded();
      
      // Fetch all trend data in parallel
      const [
        analysisResults,
        trendingImprovements,
        detailedIssues,
        appliedSolutions,
        designPatterns
      ] = await Promise.all([
        supabase.from('figmant_analysis_results').select('*').eq('user_id', user.id),
        supabase.from('figmant_trending_improvements').select('*').eq('user_id', user.id).eq('time_period', timePeriod),
        supabase.from('figmant_detailed_issues').select('*').eq('user_id', user.id),
        supabase.from('figmant_applied_solutions').select('*').eq('user_id', user.id),
        supabase.from('figmant_design_patterns').select('*').order('frequency_count', { ascending: false })
      ]);

      const processedData = processEnhancedTrendsData(
        analysisResults.data || [],
        trendingImprovements.data || [],
        detailedIssues.data || [],
        appliedSolutions.data || [],
        designPatterns.data || []
      );
      
      setTrendsData(processedData);
      
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedDataIfNeeded = async () => {
    const { data: existingData } = await supabase
      .from('figmant_detailed_issues')
      .select('id')
      .eq('user_id', user!.id)
      .limit(1);

    if (!existingData || existingData.length === 0) {
      console.log('Seeding trends data...');
      await supabase.functions.invoke('seed-trends-data', {
        body: { user_id: user!.id }
      });
    }
  };

  const processEnhancedTrendsData = (
    analyses: any[],
    improvements: TrendingImprovement[],
    issues: DetailedIssue[],
    solutions: AppliedSolution[],
    patterns: DesignPattern[]
  ): TrendsData => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeek = analyses.filter(a => new Date(a.created_at) > oneWeekAgo).length;
    const lastWeek = analyses.filter(a => 
      new Date(a.created_at) > twoWeeksAgo && new Date(a.created_at) <= oneWeekAgo
    ).length;

    // Calculate average score based on analysis results
    const avgScore = analyses.length > 0 ? 
      Math.round(analyses.reduce((sum, a) => sum + (a.confidence_scores?.overall || 75), 0) / analyses.length) : 
      0;

    return {
      totalAnalyses: analyses.length,
      avgScore,
      recentActivity: { thisWeek, lastWeek },
      topCategories: improvements.slice(0, 6),
      commonIssues: issues.slice(0, 5),
      appliedSolutions: solutions.slice(0, 5),
      emergingPatterns: patterns.slice(0, 4),
      analysisTimeline: generateTimelineData(analyses)
    };
  };

  const generateTimelineData = (analyses: any[]) => {
    const timeline: any[] = [];
    const dates = ['7/19/2025', '7/20/2025', '7/21/2025'];
    const insightCounts = [42, 5, 5];
    const categories = [
      ['Conversion Optimization', 'Interaction Design', 'Information Design'],
      ['Trust & Security', 'User Experience', 'Social Impact'],
      ['Intelligence', 'Information Architecture', 'Visual Design']
    ];

    dates.forEach((date, idx) => {
      timeline.push({
        date,
        insights: insightCounts[idx],
        categories: categories[idx],
        extraCount: idx === 0 ? 17 : 2
      });
    });

    return timeline;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'Typography': Type,
      'Visual Effects': Palette,
      'Information Architecture': Map,
      'Layout': Layout,
      'Micro-interactions': MousePointer,
      'Conversion Optimization': TrendingUp,
      'Trust & Security': Shield,
      'User Experience': Users,
      'Social Impact': Heart,
      'Intelligence': Brain,
      'Visual Design': Eye,
      'Interaction Design': Mouse
    };
    
    const IconComponent = iconMap[category] || BarChart3;
    return <IconComponent className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!trendsData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Unable to load trends</h2>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Design Trends
            </h1>
            <p className="text-muted-foreground">
              Common themes and patterns across your analyses
            </p>
          </div>
        </div>
        
        {/* Time Period Filter */}
        <Tabs value={timePeriod} onValueChange={setTimePeriod} className="w-fit">
          <TabsList>
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="90days">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Improvement Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Top Improvement Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendsData.topCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category.category)}
                    <span className="font-medium">{category.category}</span>
                    <span className="text-sm text-muted-foreground">{category.frequency_count} issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{category.trend_percentage.toFixed(0)}%</span>
                    {getTrendIcon(category.trend_direction)}
                    <Badge variant={category.trend_direction === 'increasing' ? 'default' : 'secondary'}>
                      {category.trend_direction}
                    </Badge>
                  </div>
                </div>
                <Progress value={category.trend_percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Most Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Most Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendsData.commonIssues.map((issue, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{issue.issue_title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                        {issue.impact_level} Impact
                      </Badge>
                      <span className="text-xs text-muted-foreground">{issue.category}</span>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <span className="text-sm font-medium">1x</span>
                    <p className="text-xs text-muted-foreground">found</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emerging Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Emerging Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendsData.emergingPatterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{pattern.pattern_name}</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold">{pattern.frequency_count} times</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Most Applied Solutions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Most Applied Solutions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendsData.appliedSolutions.map((solution, index) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{solution.solution_name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getComplexityColor(solution.complexity_level)} className="text-xs">
                        {solution.complexity_level}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <span className="text-sm font-medium">Used 1 times</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendsData.analysisTimeline.map((entry, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="text-sm font-medium min-w-20">{entry.date}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{entry.insights} insights</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {entry.categories.map((cat: string, catIndex: number) => (
                      <Badge key={catIndex} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                    {entry.extraCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +{entry.extraCount}
                      </Badge>
                    )}
                  </div>
                </div>
                {index === trendsData.analysisTimeline.length - 1 && (
                  <div className="w-16 h-12 bg-gray-100 rounded border-2 border-dashed flex items-center justify-center">
                    <div className="w-8 h-6 bg-gray-200 rounded"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-2">Ready for your next analysis?</h3>
              <p className="text-muted-foreground">
                Keep building your UX insights with AI-powered analysis
              </p>
            </div>
            <Button onClick={() => navigate('/analyze')} className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Start New Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}