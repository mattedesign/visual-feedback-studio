
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
import { BusinessAnalysisData, BusinessImpactMetrics, QuickWin, MajorProject } from '@/types/businessImpact';

interface BusinessImpactDashboardProps {
  analysisData: BusinessAnalysisData;
}

export const BusinessImpactDashboard: React.FC<BusinessImpactDashboardProps> = ({ 
  analysisData 
}) => {
  // Calculate business metrics from annotations
  const calculateBusinessMetrics = (): BusinessImpactMetrics => {
    const { annotations } = analysisData;
    
    // Calculate impact score
    const severityWeights = { critical: 30, suggested: 20, enhancement: 10 };
    const impactScore = Math.min(100, annotations.reduce((sum, ann) => {
      const weight = severityWeights[ann.severity] || 10;
      const confidence = ann.confidence || 0.8;
      return sum + (weight * confidence);
    }, 0));

    // Calculate revenue estimate
    const criticalCount = annotations.filter(a => a.severity === 'critical').length;
    const suggestedCount = annotations.filter(a => a.severity === 'suggested').length;
    const enhancementCount = annotations.filter(a => a.severity === 'enhancement').length;
    
    const baseRevenue = 10000 * 12 * 0.02 * 150; // 10k visitors/month, 2% conversion, $150 AOV
    const revenueIncrease = (criticalCount * 0.15) + (suggestedCount * 0.08) + (enhancementCount * 0.03);
    const annualRevenue = baseRevenue * revenueIncrease;

    // Calculate timeline
    const quickWinCount = annotations.filter(a => 
      a.implementationEffort === 'low' || 
      (a.feedback && /color|spacing|copy|button|text/i.test(a.feedback))
    ).length;
    const majorProjectCount = annotations.length - quickWinCount;

    return {
      impactScore: Math.round(impactScore),
      revenueEstimate: {
        annual: Math.round(annualRevenue),
        confidence: 0.75,
        assumptions: [
          '10k monthly visitors',
          '2% baseline conversion rate',
          '$150 average order value'
        ]
      },
      implementationTimeline: {
        quickWins: quickWinCount > 0 ? 2 : 0,
        majorProjects: majorProjectCount > 0 ? 6 : 0,
        total: Math.max(2, Math.ceil((quickWinCount * 0.5) + (majorProjectCount * 1.5)))
      },
      competitivePosition: {
        score: Math.min(10, Math.max(1, 10 - (criticalCount * 2) - (suggestedCount * 1))),
        strengths: ['User experience focus', 'Research-backed approach'],
        gaps: annotations.filter(a => a.severity === 'critical').map(a => a.feedback.substring(0, 50) + '...')
      }
    };
  };

  // Get quick wins
  const getQuickWins = (): QuickWin[] => {
    return analysisData.annotations
      .filter(ann => 
        ann.implementationEffort === 'low' || 
        (ann.feedback && /color|spacing|copy|button|text|font/i.test(ann.feedback))
      )
      .slice(0, 4)
      .map((ann, index) => ({
        id: ann.id,
        title: ann.feedback.substring(0, 80) + (ann.feedback.length > 80 ? '...' : ''),
        impact: ann.businessImpact || 'medium',
        effort: 'low',
        timeline: '1-2 weeks',
        category: ann.category || 'UI/UX',
        priority: index + 1
      }));
  };

  // Get major projects
  const getMajorProjects = (): MajorProject[] => {
    return analysisData.annotations
      .filter(ann => 
        ann.severity === 'critical' && 
        !(ann.feedback && /color|spacing|copy|button|text/i.test(ann.feedback))
      )
      .slice(0, 3)
      .map((ann, index) => ({
        id: ann.id,
        title: ann.feedback.substring(0, 80) + (ann.feedback.length > 80 ? '...' : ''),
        impact: 'high',
        resourceRequirements: ['Development team', 'UX designer', 'QA testing'],
        timeline: '4-8 weeks',
        roi: 4.2 + (index * 0.3),
        category: ann.category || 'Architecture'
      }));
  };

  const metrics = calculateBusinessMetrics();
  const quickWins = getQuickWins();
  const majorProjects = getMajorProjects();
  
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
                {analysisData.siteName || 'Website'} Analysis
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Business Impact Analysis
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Analysis backed by {analysisData.enhancedContext?.knowledgeSourcesUsed || 23} research sources
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
              <Button className="flex items-center gap-2">
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
                    value={metrics.impactScore} 
                    className="w-full h-full rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(metrics.impactScore)}`}>
                      {metrics.impactScore}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Badge className={`${getScoreColor(metrics.impactScore)} bg-opacity-10`}>
                  {getScoreStatus(metrics.impactScore)}
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
                +${(metrics.revenueEstimate.annual / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Est. annually
              </div>
              <div className="mt-3">
                <Badge variant="secondary" className="text-xs">
                  {Math.round(metrics.revenueEstimate.confidence * 100)}% confidence
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
                {metrics.implementationTimeline.total} weeks
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Quick wins: {metrics.implementationTimeline.quickWins}w</div>
                <div>Major projects: {metrics.implementationTimeline.majorProjects}w</div>
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
                {metrics.competitivePosition.score}/10
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Above Average
              </div>
              <div className="mt-3">
                <Badge variant="outline" className="text-xs">
                  Market leader potential
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
                  {quickWins.length} items
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High impact, low effort improvements
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickWins.map((win, index) => (
                <div key={win.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
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
                          High Impact
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
            </CardContent>
          </Card>

          {/* Major Projects */}
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
                Major Projects
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  {majorProjects.length} items
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High impact, significant investment required
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {majorProjects.map((project, index) => (
                <div key={project.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
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
                          ROI: {project.roi}x
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
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex items-center justify-center gap-2 py-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
