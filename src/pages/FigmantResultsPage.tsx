
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Download, Share2, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { getFigmantResults, getFigmantSession } from '@/services/figmantAnalysisService';
import { FigmantImageGrid } from '@/components/analysis/figmant/FigmantImageGrid';
import { FigmantImageDetail } from '@/components/analysis/figmant/FigmantImageDetail';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AnalysisIssue {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  solution?: string;
  impact?: string;
}

interface FigmantImage {
  id: string;
  url: string;
  original_name: string;
  order_number: number;
}

const FigmantResultsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid');
  const [selectedImage, setSelectedImage] = useState<FigmantImage | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadAnalysisResults();
    }
  }, [sessionId]);

  const loadAnalysisResults = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const [results, session] = await Promise.all([
        getFigmantResults(sessionId),
        getFigmantSession(sessionId)
      ]);
      setAnalysisData(results);
      setSessionData(session);
    } catch (error) {
      console.error('Failed to load analysis results:', error);
      toast.error('Failed to load analysis results');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 animate-spin mx-auto mb-4 text-[#22757C]" />
          <h2 className="text-lg font-semibold mb-2">Loading Analysis Results</h2>
          <p className="text-muted-foreground">Please wait while we load your design analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysisData || !sessionData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold mb-2">Analysis Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested analysis could not be found.</p>
          <Button onClick={() => navigate('/analyze')}>
            Start New Analysis
          </Button>
        </div>
      </div>
    );
  }

  const handleImageSelect = (image: FigmantImage) => {
    setSelectedImage(image);
    setCurrentView('detail');
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
    setSelectedImage(null);
  };

  // Show grid or detail view based on current state
  if (currentView === 'detail' && selectedImage) {
    return (
      <FigmantImageDetail 
        image={selectedImage}
        analysisData={analysisData}
        onBack={handleBackToGrid}
      />
    );
  }

  // Show grid view
  if (sessionData?.images?.length > 0) {
    return (
      <div className="h-full">
        <FigmantImageGrid 
          images={sessionData.images}
          onImageSelect={handleImageSelect}
          analysisData={analysisData}
        />
      </div>
    );
  }

  // Parse Claude analysis data
  const claudeAnalysis = analysisData.claude_analysis || {};
  const issues: AnalysisIssue[] = [];

  // Extract issues from different parts of the analysis
  if (claudeAnalysis.criticalIssues) {
    issues.push(...claudeAnalysis.criticalIssues.map((issue: any) => ({
      title: issue.title || issue.issue || 'Critical Issue',
      description: issue.description || issue.impact || 'Critical issue identified',
      severity: 'critical' as const,
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
  const overallScore = Math.max(0, 100 - (severityBreakdown.critical * 20 + severityBreakdown.high * 10 + severityBreakdown.medium * 5 + severityBreakdown.low * 2));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#E2E2E2]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-[#121212]">Analysis Results</h1>
            <p className="text-sm text-[#7B7B7B]">
              Completed {new Date(analysisData.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Score Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#22757C]" />
                Overall UX Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-3xl font-bold text-[#22757C]">{overallScore}/100</div>
                <div className="flex-1">
                  <Progress value={overallScore} className="h-3" />
                  <div className="flex justify-between text-sm text-[#7B7B7B] mt-2">
                    <span>Poor</span>
                    <span>Good</span>
                    <span>Excellent</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#7B7B7B]">Issues Found</div>
                  <div className="text-2xl font-bold">{totalIssues}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues Breakdown */}
          <div className="grid grid-cols-4 gap-4">
            {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
              <Card key={severity}>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getSeverityIcon(severity)}
                  </div>
                  <div className="text-2xl font-bold">{severityBreakdown[severity] || 0}</div>
                  <div className="text-sm text-[#7B7B7B] capitalize">{severity}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Issues List */}
          <Card>
            <CardHeader>
              <CardTitle>Design Issues & Recommendations</CardTitle>
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
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(issue.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-[#121212]">{issue.title}</h4>
                          <Badge className={`text-xs ${getSeverityColor(issue.severity)}`}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {issue.category}
                          </Badge>
                        </div>
                        <p className="text-[#7B7B7B] mb-3">{issue.description}</p>
                        {issue.solution && (
                          <div className="bg-[#22757C]/10 rounded-lg p-3">
                            <h5 className="font-medium text-[#121212] mb-1">Recommended Solution:</h5>
                            <p className="text-sm text-[#7B7B7B]">{issue.solution}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Analysis Summary */}
          {claudeAnalysis.executiveSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#7B7B7B]">{claudeAnalysis.executiveSummary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FigmantResultsPage;
