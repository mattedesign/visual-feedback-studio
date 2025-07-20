import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalysisIssue {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  solution?: string;
  impact?: string;
}

interface ResultsContentProps {
  analysisData: any;
  sessionData: any;
}

export const ResultsContent = ({ analysisData, sessionData }: ResultsContentProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'summary' | 'ideas'>('summary');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Parse Claude analysis data
  const claudeAnalysis = analysisData?.claude_analysis || {};
  const issues: AnalysisIssue[] = [];

  // Extract issues from different parts of the analysis
  if (claudeAnalysis.critical_recommendations) {
    issues.push(...claudeAnalysis.critical_recommendations.map((issue: any) => ({
      title: issue.issue || issue.title || 'Critical Issue',
      description: issue.recommendation || issue.description || issue.impact || 'Critical issue identified',
      severity: 'critical' as const,
      category: issue.category || 'Critical',
      solution: issue.solution || issue.recommendation,
      impact: issue.impact
    })));
  }

  if (claudeAnalysis.criticalIssues) {
    issues.push(...claudeAnalysis.criticalIssues.map((issue: any) => ({
      title: issue.title || issue.issue || 'Critical Issue',
      description: issue.description || issue.impact || 'Critical issue identified',
      severity: issue.severity?.toLowerCase() || 'critical' as const,
      category: issue.category || 'Critical',
      solution: issue.solution,
      impact: issue.impact
    })));
  }

  if (claudeAnalysis.recommendations) {
    issues.push(...claudeAnalysis.recommendations.map((rec: any) => ({
      title: rec.title || 'Recommendation',
      description: rec.description || 'Improvement recommendation',
      severity: (rec.effort === 'Low' ? 'low' : rec.effort === 'High' ? 'high' : 'medium') as 'critical' | 'high' | 'medium' | 'low',
      category: rec.category || 'Improvement',
      solution: rec.solution,
      impact: rec.impact
    })));
  }

  // Calculate severity breakdown
  const severityBreakdown = issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalIssues = issues.length;
  const overallScore = claudeAnalysis.overallScore || Math.max(0, 100 - (severityBreakdown.critical * 20 + severityBreakdown.high * 10 + severityBreakdown.medium * 5 + severityBreakdown.low * 2));

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-[#E2E2E2]">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Grid
          </Button>
        </div>
        
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-[#121212] mb-1">
            Form Type Of Project (Selecting) (Hover)
          </h1>
          <p className="text-sm text-[#7B7B7B]">
            {totalIssues} Annotations • Overall Score: {overallScore}/100
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'summary' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('summary')}
            className={`${
              activeTab === 'summary' 
                ? 'bg-white text-[#121212] shadow-sm border border-[#E2E2E2]' 
                : 'text-[#7B7B7B] hover:text-[#121212]'
            }`}
          >
            Summary
          </Button>
          <Button
            variant={activeTab === 'ideas' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('ideas')}
            className={`${
              activeTab === 'ideas' 
                ? 'bg-white text-[#121212] shadow-sm border border-[#E2E2E2]' 
                : 'text-[#7B7B7B] hover:text-[#121212]'
            }`}
          >
            Ideas
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'summary' ? (
          <div className="space-y-6">
            {/* Analysis Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium text-[#121212]">Analysis Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7B7B7B]">Overall Score</span>
                  <span className="font-semibold text-[#121212]">{overallScore}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7B7B7B]">Critical Issues</span>
                  <span className="font-semibold text-red-600">{severityBreakdown.critical || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7B7B7B]">Recommendations</span>
                  <span className="font-semibold text-blue-600">{severityBreakdown.medium + severityBreakdown.low || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7B7B7B]">Accessibility Issues</span>
                  <span className="font-semibold text-orange-600">{severityBreakdown.high || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* All Annotations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium text-[#121212]">
                  All Annotations ({totalIssues})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {issues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Great Work!</h3>
                    <p className="text-[#7B7B7B]">No major issues found in your design.</p>
                  </div>
                ) : (
                  issues.map((issue, index) => (
                    <div key={index} className="border border-[#E2E2E2] rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#22757C] text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-[#121212] text-sm">{issue.title}</h4>
                            <div className="flex items-center gap-1">
                              {getSeverityIcon(issue.severity)}
                            </div>
                          </div>
                          <p className="text-sm text-[#7B7B7B] mb-2">{issue.category}</p>
                          <p className="text-xs text-[#7B7B7B]">{issue.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ideas Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium text-[#121212]">Improvement Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#7B7B7B]">
                  Here you can explore creative solutions and innovative approaches to improve your design.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};