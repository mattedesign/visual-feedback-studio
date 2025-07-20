
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

  // Enhanced Claude analysis parsing
  const parseClaudeAnalysis = (claudeAnalysis: any) => {
    console.log('🔍 Parsing Claude analysis:', claudeAnalysis);
    
    if (!claudeAnalysis) {
      return { issues: [], overallScore: 0, executiveSummary: '' };
    }

    const issues: AnalysisIssue[] = [];
    let overallScore = 0;
    let executiveSummary = '';

    // Handle different possible structures
    if (typeof claudeAnalysis === 'string') {
      try {
        const parsed = JSON.parse(claudeAnalysis);
        return parseClaudeAnalysis(parsed);
      } catch (e) {
        console.warn('Failed to parse Claude analysis string:', e);
        return { issues: [], overallScore: 0, executiveSummary: claudeAnalysis };
      }
    }

    // Extract overall score
    if (claudeAnalysis.overallScore) {
      overallScore = claudeAnalysis.overallScore;
    } else if (claudeAnalysis.overall_score) {
      overallScore = claudeAnalysis.overall_score;
    } else if (claudeAnalysis.score) {
      overallScore = claudeAnalysis.score;
    }

    // Extract executive summary
    if (claudeAnalysis.executiveSummary) {
      executiveSummary = claudeAnalysis.executiveSummary;
    } else if (claudeAnalysis.executive_summary) {
      executiveSummary = claudeAnalysis.executive_summary;
    } else if (claudeAnalysis.summary) {
      executiveSummary = claudeAnalysis.summary;
    }

    // Extract issues from various possible structures
    const issuesSources = [
      claudeAnalysis.critical_recommendations,
      claudeAnalysis.criticalIssues,
      claudeAnalysis.critical_issues,
      claudeAnalysis.recommendations,
      claudeAnalysis.issues,
      claudeAnalysis.findings,
      claudeAnalysis.annotations
    ];

    for (const source of issuesSources) {
      if (Array.isArray(source)) {
        source.forEach((item: any) => {
          issues.push({
            title: item.title || item.issue || item.name || 'Issue',
            description: item.description || item.recommendation || item.impact || item.feedback || 'No description available',
            severity: (item.severity || item.priority || 'medium').toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
            category: item.category || item.type || 'General',
            solution: item.solution || item.fix || item.recommendation,
            impact: item.impact || item.effect
          });
        });
      }
    }

    // If we still don't have issues, try to extract from other structures
    if (issues.length === 0) {
      // Check if there are category-based groupings
      const possibleCategories = ['usability', 'accessibility', 'performance', 'design', 'content'];
      
      for (const category of possibleCategories) {
        if (claudeAnalysis[category] && Array.isArray(claudeAnalysis[category])) {
          claudeAnalysis[category].forEach((item: any) => {
            issues.push({
              title: item.title || item.issue || `${category} Issue`,
              description: item.description || item.recommendation || 'No description available',
              severity: (item.severity || 'medium').toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
              category: category,
              solution: item.solution,
              impact: item.impact
            });
          });
        }
      }
    }

    return { issues, overallScore, executiveSummary };
  };

  // Parse the analysis data
  const { issues, overallScore, executiveSummary } = parseClaudeAnalysis(analysisData?.claude_analysis);

  // Calculate severity breakdown
  const severityBreakdown = issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalIssues = issues.length;
  const finalScore = overallScore || Math.max(0, 100 - (
    (severityBreakdown.critical || 0) * 20 + 
    (severityBreakdown.high || 0) * 10 + 
    (severityBreakdown.medium || 0) * 5 + 
    (severityBreakdown.low || 0) * 2
  ));

  // Debug logging
  console.log('📊 Results Content Debug:', {
    analysisData,
    claudeAnalysis: analysisData?.claude_analysis,
    parsedIssues: issues.length,
    overallScore: finalScore,
    severityBreakdown
  });

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-[#E2E2E2]">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/figmant')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-[#121212] mb-1">
            {sessionData?.title || 'Design Analysis Results'}
          </h1>
          <p className="text-sm text-[#7B7B7B]">
            {totalIssues} Annotations • Overall Score: {Math.round(finalScore)}/100
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
            {/* Executive Summary */}
            {executiveSummary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium text-[#121212]">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#7B7B7B]">{executiveSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Analysis Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium text-[#121212]">Analysis Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#7B7B7B]">Overall Score</span>
                  <span className="font-semibold text-[#121212]">{Math.round(finalScore)}/100</span>
                </div>
                <Progress value={finalScore} className="w-full" />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7B7B7B]">Critical Issues</span>
                    <span className="font-semibold text-red-600">{severityBreakdown.critical || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7B7B7B]">High Priority</span>
                    <span className="font-semibold text-orange-600">{severityBreakdown.high || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7B7B7B]">Medium Priority</span>
                    <span className="font-semibold text-yellow-600">{severityBreakdown.medium || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7B7B7B]">Low Priority</span>
                    <span className="font-semibold text-blue-600">{severityBreakdown.low || 0}</span>
                  </div>
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
                              <Badge variant="outline" className={`text-xs ${getSeverityColor(issue.severity)}`}>
                                {issue.severity.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-[#7B7B7B] mb-2">{issue.category}</p>
                          <p className="text-xs text-[#7B7B7B] mb-2">{issue.description}</p>
                          {issue.solution && (
                            <div className="bg-blue-50 rounded p-2 mt-2">
                              <p className="text-xs font-medium text-blue-900 mb-1">Recommended Solution:</p>
                              <p className="text-xs text-blue-700">{issue.solution}</p>
                            </div>
                          )}
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
                <p className="text-sm text-[#7B7B7B] mb-4">
                  Here are some creative solutions and innovative approaches to improve your design based on the analysis.
                </p>
                
                {issues.filter(issue => issue.solution).map((issue, index) => (
                  <div key={index} className="border border-[#E2E2E2] rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-[#121212] text-sm mb-2">{issue.title}</h4>
                    <p className="text-xs text-[#7B7B7B] mb-2">{issue.solution}</p>
                    {issue.impact && (
                      <Badge variant="outline" className="text-xs">
                        Impact: {issue.impact}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
