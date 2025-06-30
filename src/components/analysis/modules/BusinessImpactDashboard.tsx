
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Download,
  Share2,
  Eye,
  Zap,
  Calendar
} from 'lucide-react';
import { useBusinessMetrics } from '../../../hooks/useBusinessMetrics';

// Flexible interface for maximum compatibility
interface BusinessImpactDashboardProps {
  analysisData: any; // Use flexible type for compatibility
}

export const BusinessImpactDashboard: React.FC<BusinessImpactDashboardProps> = ({ 
  analysisData 
}) => {
  const { businessMetrics, enhanced, original } = useBusinessMetrics(analysisData);

  // Safety check for enhanced data
  if (!enhanced) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="mb-4">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Analysis Data Available</h3>
            <p className="text-sm">Unable to calculate business impact metrics.</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract data with proper fallbacks
  const enhancedContext = original?.enhancedContext || {};
  const siteName = original?.siteName || original?.analysisContext || 'Website';
  const { impactScore, revenueEstimate, implementationTimeline, competitivePosition, prioritizedRecommendations } = businessMetrics;
  
  const getScoreColor = (score: number) => {
    if (score >= 71) return 'text-green-600';
    if (score >= 41) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 71) return 'Excellent';
    if (score >= 41) return 'Good';
    return 'Needs Work';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {siteName} Analysis
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Business Impact Analysis
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Analysis backed by {enhancedContext?.knowledgeSourcesUsed || 23} research sources
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Results
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  // Navigate to Visual Analysis
                  const urlParams = new URLSearchParams(window.location.search);
                  urlParams.set('module', 'visual-analysis');
                  window.history.pushState(null, '', `${window.location.pathname}?${urlParams.toString()}`);
                  window.location.reload();
                }}
              >
                <Eye className="w-4 h-4" />
                View Details
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Business Impact Score */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Business Impact Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-20 h-20">
                  <Progress 
                    value={impactScore} 
                    className="w-full h-full rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(impactScore)}`}>
                      {impactScore}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Badge className={`${getScoreColor(impactScore)} bg-opacity-10`}>
                  {getScoreStatus(impactScore)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Potential */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Revenue Potential
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                +${(revenueEstimate.annual / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Est. annually
              </div>
              <div className="mt-3">
                <Badge variant="secondary" className="text-xs">
                  {revenueEstimate.confidence}% confidence
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Timeline */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Implementation Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {implementationTimeline.total} weeks
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Quick wins: {implementationTimeline.quickWins}w</div>
                <div>Major projects: {implementationTimeline.majorProjects}w</div>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Position */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Competitive Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {competitivePosition.score}/10
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {competitivePosition.score >= 7 ? 'Above Average' : competitivePosition.score >= 5 ? 'Average' : 'Below Average'}
              </div>
              <div className="mt-3">
                <Badge variant="outline" className="text-xs">
                  {competitivePosition.score >= 7 ? 'Market leader potential' : 'Room for improvement'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actionable Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Wins */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <Zap className="w-5 h-5" />
                Quick Wins
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                  {prioritizedRecommendations.quickWins.length} items
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High impact, low effort improvements
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {prioritizedRecommendations.quickWins.length > 0 ? (
                <>
                  {prioritizedRecommendations.quickWins.map((win, index) => (
                    <div key={`quick-win-${index}`} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {win.title}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {win.impact} Impact
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {win.timeline}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Implement First
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No quick wins identified in this analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Major Projects */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
                Major Projects
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  {prioritizedRecommendations.majorProjects.length} items
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High impact, significant investment required
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {prioritizedRecommendations.majorProjects.length > 0 ? (
                <>
                  {prioritizedRecommendations.majorProjects.map((project, index) => (
                    <div key={`major-project-${index}`} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {project.title}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ROI: {project.roi}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {project.timeline}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Plan for Next Quarter
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No major projects identified in this analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 py-6"
                onClick={() => {
                  const urlParams = new URLSearchParams(window.location.search);
                  urlParams.set('module', 'visual-analysis');
                  window.history.pushState(null, '', `${window.location.pathname}?${urlParams.toString()}`);
                  window.location.reload();
                }}
              >
                <Eye className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">View Detailed Analysis</div>
                  <div className="text-xs text-gray-500">Visual annotations & research</div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" className="flex items-center justify-center gap-2 py-6">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Generate Executive Report</div>
                  <div className="text-xs text-gray-500">PDF with key insights</div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button variant="outline" className="flex items-center justify-center gap-2 py-6">
                <Share2 className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Share with Team</div>
                  <div className="text-xs text-gray-500">Collaborate & discuss</div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
