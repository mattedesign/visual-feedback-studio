
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
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
  Calendar,
  BarChart3,
  FileText,
  Users,
  Copy
} from 'lucide-react';
import { useBusinessMetrics } from '../../../hooks/useBusinessMetrics';
import { businessImpactService, BusinessImpactData } from '@/services/businessImpactService';
import { executiveReportService, ExecutiveReportData } from '@/services/executiveReportService';
import { SharingModal } from './SharingModal';
import { DetailedBreakdownPage } from './DetailedBreakdownPage';

interface BusinessImpactDashboardProps {
  analysisData: any;
}

export const BusinessImpactDashboard: React.FC<BusinessImpactDashboardProps> = ({ 
  analysisData 
}) => {
  const { businessMetrics, enhanced, original } = useBusinessMetrics(analysisData);
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

  // Safety check for enhanced data
  if (!enhanced || !businessMetrics) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="mb-4">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Loading Business Impact Data</h3>
            <p className="text-sm">Calculating business metrics from analysis results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract data with proper fallbacks
  const enhancedContext = original?.enhancedContext || {};
  const siteName = original?.siteName || original?.analysisContext || 'Website Analysis';
  const { impactScore, revenueEstimate, implementationTimeline, competitivePosition, prioritizedRecommendations } = businessMetrics;
  
  // Prepare data for executive report
  const executiveReportData: ExecutiveReportData = {
    siteName,
    impactScore,
    revenueEstimate,
    implementationTimeline,
    competitivePosition,
    prioritizedRecommendations,
    knowledgeSourcesUsed: enhancedContext?.knowledgeSourcesUsed || 23,
    analysisId: analysisData.id || 'temp_analysis',
    analysisDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    totalAnnotations: original?.annotations?.length || 0,
    criticalIssues: original?.annotations?.filter((a: any) => a?.severity === 'critical').length || 0,
    researchSources: enhancedContext?.knowledgeSourcesUsed || 23
  };

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

  // Simple, working button handlers
  const handleGenerateExecutiveReport = async () => {
    try {
      await executiveReportService.copyExecutiveSummaryToClipboard(executiveReportData);
      toast.success('Executive summary copied to clipboard!', {
        description: 'Paste into your document or email to share insights.',
        duration: 4000,
      });
    } catch (error) {
      console.error('Failed to copy executive summary:', error);
      toast.error('Failed to copy executive summary', {
        description: 'Please try again or check your browser permissions.',
      });
    }
  };

  const handleShareWithTeam = async () => {
    try {
      const shareableUrl = executiveReportService.generateShareableUrl(executiveReportData.analysisId);
      await navigator.clipboard.writeText(shareableUrl);
      toast.success('Shareable link copied to clipboard!', {
        description: 'Anyone with this link can view the analysis results.',
        duration: 4000,
      });
    } catch (error) {
      console.error('Failed to copy shareable link:', error);
      toast.error('Failed to generate shareable link', {
        description: 'Please try again or check your browser permissions.',
      });
    }
  };

  const handleDownloadResearchCitations = async () => {
    try {
      await executiveReportService.downloadResearchCitations(executiveReportData);
      toast.success('Research citations downloaded!', {
        description: 'Bibliography file saved to your downloads folder.',
        duration: 4000,
      });
    } catch (error) {
      console.error('Failed to download research citations:', error);
      toast.error('Failed to download research citations', {
        description: 'Please try again or check your browser permissions.',
      });
    }
  };

  const handleViewDetails = () => {
    setShowDetailedBreakdown(true);
  };

  const handleImplementFirst = async () => {
    try {
      await businessImpactService.generateImplementationChecklist(prioritizedRecommendations.quickWins);
      toast.success('Implementation checklist generated!', {
        description: 'Step-by-step action items have been downloaded.'
      });
    } catch (error) {
      toast.error('Failed to generate implementation checklist');
    }
  };

  const handlePlanForNextQuarter = async () => {
    try {
      await businessImpactService.generateProjectPlan(prioritizedRecommendations.majorProjects);
      toast.success('Project planning guide generated!', {
        description: 'Quarterly project plan has been downloaded.'
      });
    } catch (error) {
      toast.error('Failed to generate project plan');
    }
  };

  // Show detailed breakdown if requested
  if (showDetailedBreakdown) {
    return (
      <DetailedBreakdownPage
        data={executiveReportData}
        onBack={() => setShowDetailedBreakdown(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {siteName}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Business Impact Analysis
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Analysis backed by {enhancedContext?.knowledgeSourcesUsed || 23} research sources
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleGenerateExecutiveReport}
              >
                <Copy className="w-4 h-4" />
                Copy Summary
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleShareWithTeam}
              >
                <Share2 className="w-4 h-4" />
                Share Link
              </Button>
              <Button 
                className="flex items-center gap-2"
                onClick={handleViewDetails}
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
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleImplementFirst}
                  >
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handlePlanForNextQuarter}
                  >
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
                onClick={handleViewDetails}
              >
                <Eye className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">View Detailed Analysis</div>
                  <div className="text-xs text-gray-500">Visual annotations & research</div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 py-6"
                onClick={handleGenerateExecutiveReport}
              >
                <Copy className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Copy Executive Summary</div>
                  <div className="text-xs text-gray-500">Formatted text to clipboard</div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 py-6"
                onClick={handleDownloadResearchCitations}
              >
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Download Citations</div>
                  <div className="text-xs text-gray-500">Research bibliography (.txt)</div>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sharing Modal */}
        <SharingModal
          isOpen={isSharingModalOpen}
          onClose={() => setIsSharingModalOpen(false)}
          analysisId={executiveReportData.analysisId}
          siteName={siteName}
        />
      </div>
    </div>
  );
};
