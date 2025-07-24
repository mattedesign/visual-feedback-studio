import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface TrendsSummary {
  totalAnalyses: number;
  recentInsights: number;
  topIssueCategory: string;
  improvement: string;
}

export function TrendsWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trends, setTrends] = useState<TrendsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrendsSummary();
    }
  }, [user]);

  const loadTrendsSummary = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch recent analysis results
      const { data: analysisResults, error } = await supabase
        .from('figmant_analysis_results')
        .select('id, created_at, claude_analysis, severity_breakdown')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching trends summary:', error);
        return;
      }

      if (!analysisResults || analysisResults.length === 0) {
        setTrends({
          totalAnalyses: 0,
          recentInsights: 0,
          topIssueCategory: 'No data yet',
          improvement: 'Start analyzing'
        });
        return;
      }

      // Process data for summary
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentAnalyses = analysisResults.filter(
        result => new Date(result.created_at) > oneWeekAgo
      );

      // Extract most common issue category
      const categories: Record<string, number> = {};
      let totalInsights = 0;

      analysisResults.forEach(result => {
        if (result.claude_analysis?.analysis?.issues) {
          const issues = result.claude_analysis.analysis.issues;
          totalInsights += issues.length;
          
          issues.forEach((issue: any) => {
            const category = issue.category || 'UX Issues';
            categories[category] = (categories[category] || 0) + 1;
          });
        }
      });

      const topCategory = Object.entries(categories)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'General UX';

      // Simple improvement metric
      const improvement = recentAnalyses.length > 0 ? 'Active' : 'Needs attention';

      setTrends({
        totalAnalyses: analysisResults.length,
        recentInsights: totalInsights,
        topIssueCategory: topCategory,
        improvement
      });
      
    } catch (error) {
      console.error('Error loading trends summary:', error);
      setTrends({
        totalAnalyses: 0,
        recentInsights: 0,
        topIssueCategory: 'Error loading',
        improvement: 'Retry'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    navigate('/trends');
  };

  if (loading) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Trends</CardTitle>
            <p className="text-sm text-muted-foreground">
              {trends?.recentInsights || 0} new insights found
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Top Focus:</span>
            <span className="font-medium">{trends?.topIssueCategory}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-medium ${
              trends?.improvement === 'Active' ? 'text-green-600' : 'text-orange-600'
            }`}>
              {trends?.improvement}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}