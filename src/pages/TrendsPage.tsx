import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
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
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AnalysisTrend {
  category: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  avgSeverity: number;
}

interface CommonIssue {
  issue: string;
  frequency: number;
  severity: string;
  category: string;
}

interface TrendsData {
  totalAnalyses: number;
  avgScore: number;
  topCategories: AnalysisTrend[];
  commonIssues: CommonIssue[];
  improvementAreas: string[];
  strengths: string[];
  recentActivity: {
    thisWeek: number;
    lastWeek: number;
  };
}

export default function TrendsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trendsData, setTrendsData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrendsData();
    }
  }, [user]);

  const loadTrendsData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch analysis results for the user
      const { data: analysisResults, error } = await supabase
        .from('figmant_analysis_results')
        .select(`
          id,
          created_at,
          claude_analysis,
          severity_breakdown,
          processing_time_ms
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trends data:', error);
        return;
      }

      if (!analysisResults || analysisResults.length === 0) {
        setTrendsData({
          totalAnalyses: 0,
          avgScore: 0,
          topCategories: [],
          commonIssues: [],
          improvementAreas: ['Start your first analysis to see trends'],
          strengths: [],
          recentActivity: { thisWeek: 0, lastWeek: 0 }
        });
        return;
      }

      // Process the data to extract trends
      const processedData = processAnalysisData(analysisResults);
      setTrendsData(processedData);
      
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalysisData = (results: any[]): TrendsData => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Calculate recent activity
    const thisWeek = results.filter(r => new Date(r.created_at) > oneWeekAgo).length;
    const lastWeek = results.filter(r => 
      new Date(r.created_at) > twoWeeksAgo && new Date(r.created_at) <= oneWeekAgo
    ).length;

    // Extract issues and categories from Claude analysis
    const categories: Record<string, number> = {};
    const issues: Record<string, { count: number; severity: string; category: string }> = {};
    let totalSeverityScore = 0;
    let severityCount = 0;

    results.forEach(result => {
      if (result.claude_analysis?.analysis) {
        const analysis = result.claude_analysis.analysis;
        
        // Extract categories from analysis structure
        if (analysis.categories) {
          Object.keys(analysis.categories).forEach(category => {
            categories[category] = (categories[category] || 0) + 1;
          });
        }

        // Extract issues
        if (analysis.issues) {
          analysis.issues.forEach((issue: any) => {
            const issueText = issue.issue || issue.title || issue.description;
            if (issueText) {
              if (!issues[issueText]) {
                issues[issueText] = { 
                  count: 0, 
                  severity: issue.severity || 'medium',
                  category: issue.category || 'General'
                };
              }
              issues[issueText].count++;
            }
          });
        }

        // Calculate average severity
        if (result.severity_breakdown) {
          const breakdown = result.severity_breakdown;
          const score = (breakdown.high || 0) * 3 + (breakdown.medium || 0) * 2 + (breakdown.low || 0) * 1;
          totalSeverityScore += score;
          severityCount++;
        }
      }
    });

    // Convert to arrays and sort
    const topCategories: AnalysisTrend[] = Object.entries(categories)
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / results.length) * 100,
        trend: 'stable' as const,
        avgSeverity: 2
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const commonIssues: CommonIssue[] = Object.entries(issues)
      .map(([issue, data]) => ({
        issue,
        frequency: data.count,
        severity: data.severity,
        category: data.category
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8);

    // Determine strengths and improvement areas
    const strengths = [];
    const improvementAreas = [];
    
    if (commonIssues.length > 0) {
      // Most frequent issues become improvement areas
      improvementAreas.push(...commonIssues.slice(0, 3).map(issue => issue.issue));
      
      // Categories with fewer issues become strengths
      const lowIssueCategories = topCategories.filter(cat => cat.count < results.length * 0.3);
      if (lowIssueCategories.length > 0) {
        strengths.push(`Strong performance in ${lowIssueCategories[0].category}`);
      }
    }

    if (results.length > 5) {
      strengths.push('Consistent analysis practice');
    }

    const avgScore = severityCount > 0 ? Math.round((1 - (totalSeverityScore / (severityCount * 3))) * 100) : 75;

    return {
      totalAnalyses: results.length,
      avgScore,
      topCategories,
      commonIssues,
      improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['Continue analyzing to identify improvement areas'],
      strengths: strengths.length > 0 ? strengths : ['Building UX analysis foundation'],
      recentActivity: { thisWeek, lastWeek }
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    );
  }

  if (!trendsData) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Unable to load trends</h2>
            <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your UX Analysis Trends</h1>
            <p className="text-muted-foreground">
              Insights from {trendsData.totalAnalyses} analyses
            </p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{trendsData.totalAnalyses}</CardTitle>
                  <p className="text-sm text-muted-foreground">Total Analyses</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{trendsData.avgScore}%</CardTitle>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{trendsData.recentActivity.thisWeek}</CardTitle>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{trendsData.topCategories.length}</CardTitle>
                  <p className="text-sm text-muted-foreground">Focus Areas</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* What You're Doing Well */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                What You're Doing Well
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendsData.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))}
              {trendsData.strengths.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Complete more analyses to identify your strengths
                </p>
              )}
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendsData.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analysis Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendsData.topCategories.map((category, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{category.category}</h4>
                    {getTrendIcon(category.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{category.count} analyses</span>
                      <span>{category.percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
            {trendsData.topCategories.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No analysis categories found. Start analyzing to see your focus areas.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Most Common Issues Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendsData.commonIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{issue.issue}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                        {issue.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{issue.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{issue.frequency}</span>
                    <p className="text-xs text-muted-foreground">occurrences</p>
                  </div>
                </div>
              ))}
            </div>
            {trendsData.commonIssues.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No common issues identified yet. Continue analyzing to build your insights.
              </p>
            )}
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
    </DashboardLayout>
  );
}