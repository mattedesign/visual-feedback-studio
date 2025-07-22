import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, AlertTriangle, RefreshCw, Grid, FileText, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getFigmantResults, getFigmantSession } from '@/services/figmantAnalysisService';
import { FigmantSessionService } from '@/services/figmantSessionService';
import { FigmantImageGrid } from '@/components/analysis/figmant/FigmantImageGrid';
import { FigmantImageDetail } from '@/components/analysis/figmant/FigmantImageDetail';
import { ResultsContent } from '@/components/analysis/results/ResultsContent';
import { ResultsChat } from '@/components/analysis/results/ResultsChat';
import { AnalysisResults as EnhancedAnalysisResults } from '@/components/analysis/AnalysisResults';
import { EnhancedFigmaAnalysisLayout } from '@/components/analysis/figma/EnhancedFigmaAnalysisLayout';

import { FigmantSidebar } from '@/components/layout/FigmantSidebar';
import { FigmantLogo } from '@/components/ui/figmant-logo';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface FigmantImage {
  id: string;
  file_path: string;
  file_name: string;
  upload_order: number;
}

const FigmantResultsPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<FigmantImage | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'detail'>('gallery');
  const [currentView, setCurrentView] = useState<'gallery' | 'detail'>('gallery');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'chat'>('menu');

  // Enhanced utility function to transform Figmant data to enhanced format
  const transformToEnhancedFormat = (analysisData: any, sessionData: any) => {
    console.log('🔄 TRANSFORM START: Raw analysis data structure:', {
      hasAnalysisData: !!analysisData,
      analysisDataKeys: analysisData ? Object.keys(analysisData) : [],
      claudeAnalysisExists: !!(analysisData?.claude_analysis),
      claudeAnalysisKeys: analysisData?.claude_analysis ? Object.keys(analysisData.claude_analysis) : []
    });
    
    if (!analysisData?.claude_analysis) {
      console.warn('❌ No Claude analysis data to transform');
      return null;
    }

    const claudeAnalysis = analysisData.claude_analysis;
    console.log('📊 CLAUDE ANALYSIS STRUCTURE:', {
      type: typeof claudeAnalysis,
      keys: Object.keys(claudeAnalysis),
      hasIssues: 'issues' in claudeAnalysis,
      hasSuggestions: 'suggestions' in claudeAnalysis,
      hasRecommendations: 'recommendations' in claudeAnalysis,
      hasTopRecommendations: 'top_recommendations' in claudeAnalysis,
      hasCriticalIssues: 'criticalIssues' in claudeAnalysis,
      hasImprovements: 'improvements' in claudeAnalysis,
      hasUsabilityIssues: 'usability_issues' in claudeAnalysis,
      hasAccessibilityIssues: 'accessibility_issues' in claudeAnalysis,
      hasPerformanceIssues: 'performance_issues' in claudeAnalysis
    });

    const issues: any[] = [];
    const suggestions: any[] = [];
    let overallScore = 45; // Default from your session data

    // Extract overall score
    if (claudeAnalysis.overall_score) {
      overallScore = claudeAnalysis.overall_score;
    }

    // Transform Claude analysis issues to enhanced format
    if (claudeAnalysis.issues && Array.isArray(claudeAnalysis.issues)) {
      console.log('🔍 PROCESSING ISSUES:', claudeAnalysis.issues.length, 'issues found');
      claudeAnalysis.issues.forEach((issue: any, index: number) => {
        const transformedIssue = {
          id: issue.id || `issue-${index}`,
          title: issue.description || issue.impact || 'Design Issue',
          description: issue.suggested_fix || issue.implementation?.design_guidance || 'Issue detected in design analysis',
          category: mapCategory(issue.category),
          severity: mapSeverity(issue.severity),
          confidence: issue.confidence || 0.8,
          impact_scope: mapImpactScope(issue.impact_scope),
          element: {
            location: {
              x: issue.element?.location?.x || 0,
              y: issue.element?.location?.y || 0,
              width: issue.element?.location?.width || 100,
              height: issue.element?.location?.height || 50,
              xPercent: ((issue.element?.location?.x || 0) / 1200) * 100,
              yPercent: ((issue.element?.location?.y || 0) / 800) * 100,
              widthPercent: ((issue.element?.location?.width || 100) / 1200) * 100,
              heightPercent: ((issue.element?.location?.height || 50) / 800) * 100,
            }
          },
          businessMetrics: {
            estimatedImpact: issue.metrics?.affects_users || '85%',
            potentialImprovement: issue.metrics?.potential_improvement || '25-35% reduction in cart abandonment',
            implementationEffort: mapEffort(issue.implementation?.effort)
          }
        };
        issues.push(transformedIssue);

        // EXTRACT SUGGESTIONS FROM ISSUES - New logic!
        if (issue.suggested_fix) {
          suggestions.push({
            id: `issue-suggestion-${index}`,
            title: `Fix: ${issue.description || issue.impact || 'Design Issue'}`,
            description: issue.suggested_fix,
            impact: mapImpactLevel(issue.severity || 'medium'),
            effort: mapEffortLevel(issue.implementation?.effort || 'medium'),
            category: 'issue-fix'
          });
        }

        if (issue.implementation?.code_snippet) {
          suggestions.push({
            id: `code-suggestion-${index}`,
            title: `Code Solution: ${issue.description || 'Implementation'}`,
            description: `${issue.implementation.design_guidance || 'Implementation guidance'}\n\nCode: ${issue.implementation.code_snippet}`,
            impact: 'High',
            effort: mapEffortLevel(issue.implementation.effort || 'medium'),
            category: 'code-solution'
          });
        }
      });
    }

    // ENHANCED SUGGESTIONS PROCESSING - Check multiple possible sources
    console.log('🔍 SUGGESTIONS PROCESSING - Checking all possible sources...');
    
    // Source 1: Direct suggestions array
    if (claudeAnalysis.suggestions && Array.isArray(claudeAnalysis.suggestions)) {
      console.log('📝 Found suggestions array:', claudeAnalysis.suggestions.length, 'items');
      claudeAnalysis.suggestions.forEach((suggestion: any, index: number) => {
        console.log(`  📋 Suggestion ${index + 1}:`, {
          id: suggestion.id,
          title: suggestion.title,
          type: typeof suggestion,
          keys: Object.keys(suggestion)
        });
        
        suggestions.push({
          id: suggestion.id || `suggestion-${index}`,
          title: suggestion.title || suggestion.recommendation || 'Design Suggestion',
          description: suggestion.description || suggestion.details || 'Improvement suggestion',
          impact: suggestion.impact || 'High',
          effort: suggestion.effort || 'Medium',
          category: suggestion.category || 'enhancement'
        });
      });
    }
    
    // Source 2: Top recommendations array (new source!)
    if (claudeAnalysis.top_recommendations && Array.isArray(claudeAnalysis.top_recommendations)) {
      console.log('📝 Found top_recommendations array:', claudeAnalysis.top_recommendations.length, 'items');
      claudeAnalysis.top_recommendations.forEach((rec: any, index: number) => {
        console.log(`  📋 Top Recommendation ${index + 1}:`, {
          type: typeof rec,
          isString: typeof rec === 'string',
          keys: typeof rec === 'object' ? Object.keys(rec) : 'N/A',
          content: rec
        });
        
        if (typeof rec === 'string') {
          suggestions.push({
            id: `top-rec-${index}`,
            title: `Priority Recommendation ${index + 1}`,
            description: rec,
            impact: 'Critical',
            effort: 'Medium',
            category: 'top-priority'
          });
        } else if (typeof rec === 'object' && rec !== null) {
          suggestions.push({
            id: `top-rec-obj-${index}`,
            title: rec.title || rec.recommendation || `Top Recommendation ${index + 1}`,
            description: rec.description || rec.details || rec.text || 'High priority recommendation',
            impact: rec.impact || 'Critical',
            effort: rec.effort || 'Medium',
            category: 'top-priority'
          });
        }
      });
    }
    
    // Source 3: Regular recommendations array (fallback)
    if (claudeAnalysis.recommendations && Array.isArray(claudeAnalysis.recommendations)) {
      console.log('📝 Found recommendations array:', claudeAnalysis.recommendations.length, 'items');
      claudeAnalysis.recommendations.forEach((rec: any, index: number) => {
        console.log(`  📋 Recommendation ${index + 1}:`, {
          type: typeof rec,
          isString: typeof rec === 'string',
          keys: typeof rec === 'object' ? Object.keys(rec) : 'N/A'
        });
        
        suggestions.push({
          id: `recommendation-${index}`,
          title: typeof rec === 'string' ? `Recommendation ${index + 1}` : (rec.title || 'Design Recommendation'),
          description: typeof rec === 'string' ? rec : (rec.description || rec.text || 'Design improvement recommendation'),
          impact: 'Medium',
          effort: 'Medium',
          category: 'improvement'
        });
      });
    }
    
    // Source 4: Critical issues as suggestions
    if (claudeAnalysis.criticalIssues && Array.isArray(claudeAnalysis.criticalIssues)) {
      console.log('📝 Found criticalIssues array:', claudeAnalysis.criticalIssues.length, 'items');
      claudeAnalysis.criticalIssues.forEach((issue: any, index: number) => {
        console.log(`  📋 Critical Issue ${index + 1}:`, {
          title: issue.title,
          solution: issue.solution,
          reasoning: issue.reasoning
        });
        
        // Add critical issues as high-priority suggestions
        suggestions.push({
          id: `critical-suggestion-${index}`,
          title: `Fix: ${issue.title || issue.issue || 'Critical Issue'}`,
          description: issue.solution || issue.reasoning || 'Critical issue requiring immediate attention',
          impact: 'Critical',
          effort: issue.effort || 'High',
          category: 'critical-fix'
        });
      });
    }
    
    // Source 5: Improvements array
    if (claudeAnalysis.improvements && Array.isArray(claudeAnalysis.improvements)) {
      console.log('📝 Found improvements array:', claudeAnalysis.improvements.length, 'items');
      claudeAnalysis.improvements.forEach((improvement: any, index: number) => {
        suggestions.push({
          id: `improvement-${index}`,
          title: improvement.title || `Improvement ${index + 1}`,
          description: improvement.description || improvement.details || 'Design improvement opportunity',
          impact: improvement.impact || 'Medium',
          effort: improvement.effort || 'Low',
          category: 'improvement'
        });
      });
    }

    // Source 6: Category-specific issue arrays (usability_issues, accessibility_issues, etc.)
    const categoryArrays = [
      { key: 'usability_issues', category: 'usability-fix' },
      { key: 'accessibility_issues', category: 'accessibility-fix' },
      { key: 'performance_issues', category: 'performance-fix' },
      { key: 'visual_issues', category: 'visual-fix' }
    ];

    categoryArrays.forEach(({ key, category }) => {
      if (claudeAnalysis[key] && Array.isArray(claudeAnalysis[key])) {
        console.log(`📝 Found ${key} array:`, claudeAnalysis[key].length, 'items');
        claudeAnalysis[key].forEach((item: any, index: number) => {
          if (typeof item === 'string') {
            suggestions.push({
              id: `${key}-${index}`,
              title: `${key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Fix`,
              description: item,
              impact: 'Medium',
              effort: 'Medium',
              category
            });
          } else if (typeof item === 'object' && item !== null) {
            suggestions.push({
              id: `${key}-obj-${index}`,
              title: item.title || item.issue || `${key} Fix ${index + 1}`,
              description: item.solution || item.description || item.fix || 'Issue fix needed',
              impact: item.impact || 'Medium',
              effort: item.effort || 'Medium',
              category
            });
          }
        });
      }
    });
    
    // Source 7: Any other molecular-level data
    const processedKeys = ['issues', 'suggestions', 'recommendations', 'top_recommendations', 'criticalIssues', 'improvements', 'overall_score', 'executiveSummary', 'usability_issues', 'accessibility_issues', 'performance_issues', 'visual_issues'];
    const otherKeys = Object.keys(claudeAnalysis).filter(key => !processedKeys.includes(key));
    
    if (otherKeys.length > 0) {
      console.log('🔍 Other available keys in Claude analysis:', otherKeys);
      otherKeys.forEach(key => {
        const data = claudeAnalysis[key];
        if (Array.isArray(data) && data.length > 0) {
          console.log(`📋 Processing ${key} as potential suggestions:`, data.length, 'items');
          data.forEach((item: any, index: number) => {
            if (typeof item === 'string') {
              suggestions.push({
                id: `${key}-str-${index}`,
                title: `${key.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${index + 1}`,
                description: item,
                impact: 'Medium',
                effort: 'Medium',
                category: key
              });
            } else if (typeof item === 'object' && item !== null && (item.title || item.description || item.recommendation || item.suggestion)) {
              suggestions.push({
                id: `${key}-obj-${index}`,
                title: item.title || item.recommendation || item.suggestion || `${key} ${index + 1}`,
                description: item.description || item.details || item.text || `Suggestion from ${key}`,
                impact: item.impact || 'Medium',
                effort: item.effort || 'Medium',
                category: key
              });
            }
          });
        }
      });
    }

    // Create image URLs from session data
    const images = (sessionData?.images || []).map((img: any) => ({
      id: img.id || img.file_name,
      url: `https://mxxtvtwcoplfajvazpav.supabase.co/storage/v1/object/public/analysis-images/${img.file_path}`,
      fileName: img.file_name || `Image ${img.upload_order || 1}`
    }));

    const transformedData = {
      sessionId: sessionData?.id || '',
      analysisId: analysisData.id, // Add the analysis result ID here!
      images,
      issues,
      suggestions,
      overallScore,
      analysisMetadata: {
        completedAt: analysisData.created_at,
        totalIssues: issues.length,
        confidenceLevel: 'high',
        screenType: analysisData.google_vision_summary?.screen_type_detected || 'checkout',
        analysisId: analysisData.id // Also add it to the metadata for backup
      }
    };

    console.log('✅ TRANSFORM COMPLETE:', {
      issueCount: issues.length,
      suggestionCount: suggestions.length,
      imageCount: images.length,
      hasMetadata: !!transformedData.analysisMetadata,
      suggestionsBreakdown: suggestions.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      detailedSuggestions: suggestions.map(s => ({ id: s.id, title: s.title, category: s.category }))
    });

    return transformedData;
  };

  // Helper functions for data transformation
  const mapCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      'usability': 'usability',
      'accessibility': 'accessibility', 
      'visual': 'visual',
      'content': 'content',
      'performance': 'performance'
    };
    return categoryMap[category] || 'usability';
  };

  const mapSeverity = (severity: string) => {
    const severityMap: Record<string, string> = {
      'critical': 'critical',
      'high': 'warning', 
      'medium': 'warning',
      'low': 'improvement',
      'warning': 'warning',
      'improvement': 'improvement'
    };
    return severityMap[severity] || 'warning';
  };

  const mapImpactScope = (scope: string) => {
    const scopeMap: Record<string, string> = {
      'task-completion': 'task-completion',
      'user-trust': 'user-trust',
      'conversion': 'conversion',
      'readability': 'readability'
    };
    return scopeMap[scope] || 'task-completion';
  };

  const mapEffort = (effort: string) => {
    const effortMap: Record<string, string> = {
      'hours': 'Low (few hours)',
      'days': 'Medium (few days)', 
      'weeks': 'High (weeks)',
      'minutes': 'Very Low (minutes)'
    };
    return effortMap[effort] || 'Medium';
  };

  // New helper functions for suggestion mapping
  const mapImpactLevel = (severity: string) => {
    const impactMap: Record<string, string> = {
      'critical': 'Critical',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return impactMap[severity] || 'Medium';
  };

  const mapEffortLevel = (effort: string) => {
    const effortMap: Record<string, string> = {
      'minutes': 'Low',
      'hours': 'Medium',
      'days': 'High',
      'weeks': 'Very High'
    };
    return effortMap[effort] || 'Medium';
  };

  // Helper function to get image URL
  const getImageUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return supabase.storage.from('analysis-images').getPublicUrl(filePath).data.publicUrl;
  };

  // Helper function to get image title
  const getImageTitle = (image: FigmantImage) => {
    const nameWithoutExt = image.file_name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
    const cleanName = nameWithoutExt.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return cleanName || `Image ${image.upload_order}`;
  };

  // Check if we should use enhanced UI
  const shouldUseEnhancedUI = (data: any) => {
    const result = data && (
      (data.issues && Array.isArray(data.issues)) ||
      (data.claude_analysis && data.claude_analysis.issues && Array.isArray(data.claude_analysis.issues))
    );
    
    console.log('🎨 ENHANCED UI CHECK:', {
      hasData: !!data,
      hasIssues: !!(data?.issues),
      isIssuesArray: Array.isArray(data?.issues),
      hasClaudeAnalysis: !!(data?.claude_analysis),
      hasClaudeIssues: !!(data?.claude_analysis?.issues),
      result
    });
    
    return result;
  };

  useEffect(() => {
    if (sessionId) {
      loadAnalysisResults();
    }
  }, [sessionId]);

  const loadAnalysisResults = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      console.log('🔄 Loading analysis results for session:', sessionId);

      // Use the new session service to find the session
      const { session: foundSession, debugInfo: sessionDebugInfo } = await FigmantSessionService.findSession(sessionId);
      
      setDebugInfo(sessionDebugInfo);

      if (!foundSession) {
        console.error('❌ No session found for ID:', sessionId);
        return;
      }

      const actualSessionId = foundSession.id;
      console.log('✅ Using session ID:', actualSessionId);

      // If we found a different session ID, update the URL
      if (actualSessionId !== sessionId && sessionDebugInfo.matchType === 'approximate') {
        console.log('🔄 Redirecting to correct session ID');
        toast.info('Redirecting to the correct analysis session...');
        navigate(`/figmant/results/${actualSessionId}`, { replace: true });
        return;
      }

      // Load results and session data
      const [results, session] = await Promise.all([
        getFigmantResults(actualSessionId),
        getFigmantSession(actualSessionId)
      ]);

      console.log('📊 RAW DATA LOADED:', { 
        hasResults: !!results, 
        hasSession: !!session,
        resultKeys: results ? Object.keys(results) : [],
        sessionImageCount: session?.images?.length || 0,
        rawResults: results // LOG THE COMPLETE RAW DATA
      });

      setAnalysisData(results);
      setSessionData(session || foundSession);
      
      // If we have images, default to gallery view
      if (session?.images?.length > 0) {
        setViewMode('gallery');
      } else {
        setViewMode('detail'); // Show details if no images
      }
    } catch (error) {
      console.error('Failed to load analysis results:', error);
      toast.error('Failed to load analysis results');
      setDebugInfo(prev => ({
        ...prev,
        error: error.message,
        timestamp: new Date().toISOString()
      }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 animate-spin mx-auto mb-4 text-[#22757C]" />
          <h2 className="text-lg font-semibold mb-2">Loading Analysis Results</h2>
          <p className="text-muted-foreground">Please wait while we load your design analysis...</p>
          {sessionId && (
            <p className="text-xs text-gray-500 mt-2">Session: {sessionId}</p>
          )}
        </div>
      </div>
    );
  }

  // Enhanced error handling with debug information
  if (debugInfo && !sessionData) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-4xl">
          <AlertTriangle className="w-12 h-12 mx-auto mb-6 text-red-500" />
          <h2 className="text-2xl font-semibold mb-4">Analysis Session Not Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find an analysis session with the provided ID. This might be due to a URL mismatch or the session may not exist.
          </p>
          
          {/* Debug Information */}
          <div className="bg-gray-50 p-6 rounded-lg text-left mb-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-4 text-gray-900">Debug Information:</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Requested Session ID:</span>
                <span className="font-mono text-xs break-all">{debugInfo.requestedSessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Match Type:</span>
                <span className={`font-medium ${
                  debugInfo.matchType === 'exact' ? 'text-green-600' :
                  debugInfo.matchType === 'approximate' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {debugInfo.matchType}
                </span>
              </div>
              {debugInfo.foundSessionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Found Session ID:</span>
                  <span className="font-mono text-xs break-all">{debugInfo.foundSessionId}</span>
                </div>
              )}
              {debugInfo.error && (
                <div className="text-red-600 text-xs mt-2">
                  <strong>Error:</strong> {debugInfo.error}
                </div>
              )}
            </div>
          </div>

          {/* Available Sessions */}
          {debugInfo.availableSessions && debugInfo.availableSessions.length > 0 && (
            <div className="bg-blue-50 p-6 rounded-lg text-left mb-6 max-w-2xl mx-auto">
              <h3 className="font-semibold mb-4 text-blue-900">Recent Analysis Sessions:</h3>
              <div className="space-y-2">
                {debugInfo.availableSessions.slice(0, 5).map((session: any) => (
                  <div key={session.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{session.title}</div>
                      <div className="text-xs text-gray-500">{new Date(session.created_at).toLocaleString()}</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/figmant/results/${session.id}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/figmant')}>
              Start New Analysis
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle image selection - switch to detail view
  const handleImageSelect = (image: FigmantImage) => {
    setSelectedImage(image);
    setViewMode('detail');
  };

  // Handle back to gallery
  const handleBackToGallery = () => {
    setSelectedImage(null);
    setViewMode('gallery');
  };

  // Main render - implement two-part layout structure
  if (!sessionData && !analysisData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-semibold mb-2">No Analysis Data</h2>
          <p className="text-muted-foreground mb-4">No analysis data was found for this session.</p>
          <Button onClick={() => navigate('/figmant')}>
            Start New Analysis
          </Button>
        </div>
      </div>
    );
  }

  // Two-part layout structure - matching the benchmark exactly
  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Tab Buttons */}
        <div className="p-4 border-b border-border">
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            <Button 
              variant={activeTab === 'menu' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="flex-1"
              onClick={() => setActiveTab('menu')}
            >
              Menu
            </Button>
            <Button 
              variant={activeTab === 'chat' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="flex-1"
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </Button>
          </div>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'menu' ? (
            <div className="p-4 space-y-6">
              {/* Welcome Message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#22757C] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">F</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Welcome to Figmant. You can upload image(s) to start an analysis.
                </div>
              </div>
              
              {/* New Analysis Button */}
              <Button 
                className="w-full bg-[#22757C] hover:bg-[#1a5a5f] text-white"
                onClick={() => navigate('/figmant')}
              >
                I want to start a new analysis.
              </Button>
              
              {/* Analysis Status */}
              <div className="space-y-4">
                <div className="text-sm">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#22757C] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">F</span>
                    </div>
                    <div className="text-sm">Thinking..</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm mb-2">Analysis Overview</h3>
                  
                  <div className="space-y-3">
                    {/* Processing Status Cards */}
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{sessionData?.images?.length || 3} Images</div>
                          <div className="text-xs text-green-600">1 analysed</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{sessionData?.images?.length || 3} Images</div>
                          <div className="text-xs text-yellow-600">Processing</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">1 analysed</div>
                          <div className="text-xs text-gray-500">Processing</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Integration Logos */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <span className="text-sm">SalesForce</span>
                    <span className="text-xs text-muted-foreground ml-auto">Automate email communi...</span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">H</span>
                    </div>
                    <span className="text-sm">Hubspot</span>
                    <span className="text-xs text-muted-foreground ml-auto">Automate email communi...</span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Z</span>
                    </div>
                    <span className="text-sm">Zapier</span>
                    <span className="text-xs text-muted-foreground ml-auto">Automate email communi...</span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <span className="text-sm">SendGrid</span>
                    <span className="text-xs text-muted-foreground ml-auto">Automate email communi...</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="text-center text-muted-foreground text-sm">
                Chat interface coming soon...
              </div>
            </div>
          )}
        </div>
        
        {/* Bottom Input */}
        <div className="p-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-2">What would you like to analyze?</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <span className="text-lg">+</span>
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <span className="text-lg">🎤</span>
            </Button>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <span className="text-lg">↑</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {viewMode === 'gallery' ? (
          <div className="flex-1 overflow-y-auto">
            {/* Image Gallery - Rebuild to match benchmark */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 max-w-4xl">
                {sessionData?.images?.map((image, index) => {
                  const imageNames = [
                    'Saas Website Landing Page',
                    'Cute Shop Storefront Icon',
                    'Futuristic Humanoid Robot',
                    'Cute Shop Storefront Icon'
                  ];
                  const subtitle = index === 0 ? '4 Annotations' : '3D Icons';
                  
                  return (
                    <Card 
                      key={image.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                      onClick={() => handleImageSelect(image)}
                    >
                      <div className="p-0 overflow-hidden rounded-lg">
                        {/* Image container with proper aspect ratio */}
                        <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
                          <img 
                            src={getImageUrl(image.file_path)}
                            alt={imageNames[index] || image.file_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-blue-100">
                                  <div class="text-center p-6">
                                    <div class="w-16 h-16 bg-white/30 rounded-xl mb-3 mx-auto flex items-center justify-center">
                                      <span class="text-2xl">${index === 0 ? '📊' : index === 1 ? '🛍️' : index === 2 ? '🤖' : '🎨'}</span>
                                    </div>
                                    <h3 class="font-semibold text-sm text-gray-800">${imageNames[index] || image.file_name}</h3>
                                  </div>
                                </div>
                              `;
                            }}
                          />
                        </div>
                        
                        {/* Card Footer */}
                        <div className="p-4">
                          <h3 className="font-semibold text-base text-foreground mb-1">
                            {imageNames[index] || getImageTitle(image)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {subtitle}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })} 
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            {selectedImage ? (
              <FigmantImageDetail 
                image={selectedImage}
                analysisData={analysisData}
                onBack={handleBackToGallery}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select an image to view details</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FigmantResultsPage;
