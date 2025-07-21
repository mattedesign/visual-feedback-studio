
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Sparkles, AlertTriangle, CheckCircle, Info, Image as ImageIcon, ZoomIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisIssue {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  solution?: string;
  impact?: string;
}

interface SessionImage {
  id: string;
  file_name: string;
  file_path: string;
  upload_order: number;
}

interface ResultsContentProps {
  analysisData: any;
  sessionData: any;
}

export const ResultsContent = ({ analysisData, sessionData }: ResultsContentProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'summary' | 'ideas'>('summary');
  const [images, setImages] = useState<SessionImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch session images
  useEffect(() => {
    const fetchImages = async () => {
      if (!sessionData?.id) return;

      try {
        const { data, error } = await supabase
          .from('figmant_session_images')
          .select('id, file_name, file_path, upload_order')
          .eq('session_id', sessionData.id)
          .order('upload_order', { ascending: true });

        if (error) {
          console.error('Error fetching images:', error);
          return;
        }

        console.log('📸 Loaded session images:', data);
        setImages(data || []);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, [sessionData?.id]);

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

    // NEW: Handle ux_analysis wrapper structure
    let analysisContent = claudeAnalysis;
    if (claudeAnalysis.ux_analysis) {
      console.log('🔍 Found ux_analysis wrapper, extracting content');
      analysisContent = claudeAnalysis.ux_analysis;
    }

    // Extract overall score from analysisContent - handle multiple formats
    if (typeof analysisContent.overallScore === 'number') {
      overallScore = analysisContent.overallScore;
    } else if (typeof analysisContent.overall_score === 'number') {
      overallScore = analysisContent.overall_score;
    } else if (typeof analysisContent.score === 'number') {
      overallScore = analysisContent.score;
    } else if (analysisContent.overall_score && typeof analysisContent.overall_score === 'object') {
      // Handle fractional score format like "5/10", "7/10"
      const scoreObj = analysisContent.overall_score;
      const scoreValues: number[] = [];
      
      for (const key in scoreObj) {
        const scoreValue = scoreObj[key];
        if (typeof scoreValue === 'string' && scoreValue.includes('/')) {
          const [numerator, denominator] = scoreValue.split('/').map(Number);
          if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
            // Convert to 0-100 scale
            scoreValues.push((numerator / denominator) * 100);
          }
        }
      }
      
      if (scoreValues.length > 0) {
        // Calculate average of all scores
        overallScore = Math.round(scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length);
      }
    }

    // Extract executive summary from analysisContent - handle both string and object formats
    if (typeof analysisContent.executiveSummary === 'string') {
      executiveSummary = analysisContent.executiveSummary;
    } else if (typeof analysisContent.executive_summary === 'string') {
      executiveSummary = analysisContent.executive_summary;
    } else if (typeof analysisContent.summary === 'string') {
      executiveSummary = analysisContent.summary;
    } else if (analysisContent.summary && typeof analysisContent.summary === 'object') {
      // Handle summary object structure with strengths, next_steps, critical_issues
      const summaryParts = [];
      
      if (analysisContent.summary.strengths && Array.isArray(analysisContent.summary.strengths)) {
        summaryParts.push(`Strengths: ${analysisContent.summary.strengths.join(', ')}`);
      }
      
      if (analysisContent.summary.critical_issues && Array.isArray(analysisContent.summary.critical_issues)) {
        summaryParts.push(`Critical Issues: ${analysisContent.summary.critical_issues.join(', ')}`);
      }
      
      if (analysisContent.summary.next_steps && Array.isArray(analysisContent.summary.next_steps)) {
        summaryParts.push(`Next Steps: ${analysisContent.summary.next_steps.join(', ')}`);
      }
      
      executiveSummary = summaryParts.join(' | ');
    } else if (analysisContent.overall_score && typeof analysisContent.overall_score === 'object') {
      // Create executive summary from individual score breakdown when no summary exists
      const scoreBreakdown = [];
      for (const [category, score] of Object.entries(analysisContent.overall_score)) {
        if (typeof score === 'string' && score.includes('/')) {
          scoreBreakdown.push(`${category.replace('_', ' ')}: ${score}`);
        }
      }
      if (scoreBreakdown.length > 0) {
        executiveSummary = `Score Breakdown: ${scoreBreakdown.join(', ')}`;
      }
    }

    // NEW: Extract issues from ux_analysis structure - handle nested category structures
    const categoryTypes = [
      'accessibility_concerns', 'usability_issues', 'conversion_optimization',
      'design_consistency', 'mobile_responsiveness', 'visual_hierarchy'
    ];

    for (const categoryType of categoryTypes) {
      const categoryData = analysisContent[categoryType];
      if (categoryData && typeof categoryData === 'object') {
        // Handle nested structure like accessibility_concerns.critical_issues
        const severityLevels = ['critical_issues', 'high_issues', 'medium_issues', 'low_issues'];
        
        for (const severityLevel of severityLevels) {
          const severityArray = categoryData[severityLevel];
          if (Array.isArray(severityArray)) {
            const severity = severityLevel.replace('_issues', '') as 'critical' | 'high' | 'medium' | 'low';
            
            severityArray.forEach((item: any) => {
              const title = typeof item.issue === 'string' ? item.issue : 
                           typeof item.title === 'string' ? item.title : 
                           `${categoryType.replace('_', ' ')} Issue`;
              
              const description = typeof item.recommendation === 'string' ? item.recommendation :
                                 typeof item.description === 'string' ? item.description :
                                 typeof item.user_impact === 'string' ? item.user_impact :
                                 'No description available';
              
              const solution = typeof item.recommendation === 'string' ? item.recommendation :
                              typeof item.solution === 'string' ? item.solution :
                              undefined;
              
              const impact = typeof item.user_impact === 'string' ? item.user_impact :
                            typeof item.impact === 'string' ? item.impact :
                            undefined;

              issues.push({
                title,
                description,
                severity,
                category: categoryType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                solution,
                impact
              });
            });
          }
        }
        
        // Also handle direct arrays (fallback for flat structure)
        if (Array.isArray(categoryData)) {
          categoryData.forEach((item: any) => {
            const title = typeof item.issue === 'string' ? item.issue : 
                         typeof item.title === 'string' ? item.title : 
                         `${categoryType.replace('_', ' ')} Issue`;
            
            const description = typeof item.recommendation === 'string' ? item.recommendation :
                               typeof item.description === 'string' ? item.description :
                               'No description available';

            issues.push({
              title,
              description,
              severity: (item.severity || 'medium').toLowerCase() as 'critical' | 'high' | 'medium' | 'low',
              category: categoryType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
              solution: item.solution || item.recommendation,
              impact: item.impact || item.user_impact
            });
          });
        }
      }
    }

    // Extract issues from traditional sources as fallback
    const issuesSources = [
      analysisContent.critical_recommendations,
      analysisContent.criticalIssues,
      analysisContent.critical_issues,
      analysisContent.recommendations,
      analysisContent.issues,
      analysisContent.findings,
      analysisContent.annotations
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
        if (analysisContent[category] && Array.isArray(analysisContent[category])) {
          analysisContent[category].forEach((item: any) => {
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

    console.log('🔍 Extracted issues:', {
      total: issues.length,
      categories: [...new Set(issues.map(i => i.category))],
      severities: issues.reduce((acc, i) => {
        acc[i.severity] = (acc[i.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

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
  
  // CRITICAL FIX: Prevent false perfect scores when analysis fails
  let finalScore: number;
  let analysisStatus: 'completed' | 'failed' | 'partial' = 'completed';
  
  if (overallScore > 0) {
    // Analysis completed successfully and generated a score
    finalScore = overallScore;
  } else if (issues.length > 0) {
    // Analysis found issues but no overall score - calculate from issues
    finalScore = Math.max(0, 100 - (
      (severityBreakdown.critical || 0) * 20 + 
      (severityBreakdown.high || 0) * 10 + 
      (severityBreakdown.medium || 0) * 5 + 
      (severityBreakdown.low || 0) * 2
    ));
    analysisStatus = 'partial';
  } else if (analysisData?.claude_analysis && Object.keys(analysisData.claude_analysis).length > 0) {
    // Analysis data exists but no issues extracted - likely a parsing problem
    finalScore = 0; // Don't show a false perfect score
    analysisStatus = 'failed';
  } else {
    // No analysis data at all
    finalScore = 0;
    analysisStatus = 'failed';
  }

  // Debug logging
  console.log('📊 Results Content Debug:', {
    analysisData,
    claudeAnalysis: analysisData?.claude_analysis,
    parsedIssues: issues.length,
    overallScore,
    finalScore,
    analysisStatus,
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

            {/* Analyzed Images */}
            {images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium text-[#121212] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Analyzed Images ({images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image, index) => {
                      const imageUrl = supabase.storage
                        .from('analysis-images')
                        .getPublicUrl(image.file_path).data.publicUrl;
                      
                      return (
                        <div key={image.id} className="group relative">
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-[#E2E2E2]">
                            <img
                              src={imageUrl}
                              alt={image.file_name}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                              onError={(e) => {
                                console.error('Failed to load image:', imageUrl);
                                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy="0.3em" font-family="sans-serif" font-size="12" fill="%23666">Image not found</text></svg>';
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() => setSelectedImage(imageUrl)}
                              >
                                <ZoomIn className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium text-[#121212] truncate">{image.file_name}</p>
                            <p className="text-xs text-[#7B7B7B]">Image {index + 1}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium text-[#121212]">Analysis Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Analysis Status Warning */}
                {analysisStatus === 'failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-red-900">Analysis Failed</span>
                    </div>
                    <p className="text-sm text-red-700">
                      The analysis could not be completed successfully. Please try uploading your design again or contact support if the issue persists.
                    </p>
                  </div>
                )}
                
                {analysisStatus === 'partial' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-yellow-900">Partial Analysis</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Some recommendations were generated, but the overall scoring may be incomplete.
                    </p>
                  </div>
                )}
                
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

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size view"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
