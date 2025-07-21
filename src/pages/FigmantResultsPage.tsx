
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFigmantResults, getFigmantSession } from '@/services/figmantAnalysisService';
import { FigmantSessionService } from '@/services/figmantSessionService';
import { FigmantImageGrid } from '@/components/analysis/figmant/FigmantImageGrid';
import { FigmantImageDetail } from '@/components/analysis/figmant/FigmantImageDetail';
import { ResultsContent } from '@/components/analysis/results/ResultsContent';
import { ResultsChat } from '@/components/analysis/results/ResultsChat';
import { AnalysisResults as EnhancedAnalysisResults } from '@/components/analysis/AnalysisResults';
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
  const [currentView, setCurrentView] = useState<'grid' | 'detail' | 'results'>('grid');
  const [selectedImage, setSelectedImage] = useState<FigmantImage | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'chat'>('menu');

  // Utility function to transform Figmant data to enhanced format
  const transformToEnhancedFormat = (analysisData: any, sessionData: any) => {
    console.log('🔄 Transforming Figmant data to enhanced format:', { analysisData, sessionData });
    
    if (!analysisData?.claude_analysis) {
      console.warn('❌ No Claude analysis data to transform');
      return null;
    }

    const claudeAnalysis = analysisData.claude_analysis;
    const issues: any[] = [];
    const suggestions: any[] = [];
    let overallScore = 45; // Default from your session data

    // Extract overall score
    if (claudeAnalysis.overall_score) {
      overallScore = claudeAnalysis.overall_score;
    }

    // Transform Claude analysis issues to enhanced format
    if (claudeAnalysis.issues && Array.isArray(claudeAnalysis.issues)) {
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
      });
    }

    // Transform suggestions if present
    if (claudeAnalysis.suggestions && Array.isArray(claudeAnalysis.suggestions)) {
      console.log('📝 Found suggestions in Claude analysis:', claudeAnalysis.suggestions);
      claudeAnalysis.suggestions.forEach((suggestion: any, index: number) => {
        suggestions.push({
          id: suggestion.id || `suggestion-${index}`,
          title: suggestion.title || suggestion.recommendation || 'Design Suggestion',
          description: suggestion.description || suggestion.details || 'Improvement suggestion',
          impact: suggestion.impact || 'High',
          effort: suggestion.effort || 'Medium',
          category: suggestion.category || 'enhancement'
        });
      });
    } else {
      console.log('ℹ️ No suggestions found in Claude analysis. Available keys:', Object.keys(claudeAnalysis));
      // Try alternative suggestion sources
      if (claudeAnalysis.recommendations && Array.isArray(claudeAnalysis.recommendations)) {
        console.log('📝 Found recommendations, converting to suggestions:', claudeAnalysis.recommendations);
        claudeAnalysis.recommendations.forEach((rec: any, index: number) => {
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
    }

    // Create image URLs from session data
    const images = (sessionData?.images || []).map((img: any) => ({
      id: img.id || img.file_name,
      url: `https://mxxtvtwcoplfajvazpav.supabase.co/storage/v1/object/public/analysis-images/${img.file_path}`,
      fileName: img.file_name || `Image ${img.upload_order || 1}`
    }));

    const transformedData = {
      sessionId: sessionData?.id || '',
      images,
      issues,
      suggestions,
      overallScore,
      analysisMetadata: {
        completedAt: analysisData.created_at,
        totalIssues: issues.length,
        confidenceLevel: 'high',
        screenType: analysisData.google_vision_summary?.screen_type_detected || 'checkout'
      }
    };

    console.log('✅ Transformed data:', transformedData);
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

  // Check if we should use enhanced UI
  const shouldUseEnhancedUI = (data: any) => {
    return data && (
      (data.issues && Array.isArray(data.issues)) ||
      (data.claude_analysis && data.claude_analysis.issues && Array.isArray(data.claude_analysis.issues))
    );
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

      console.log('📊 Loaded results:', { 
        hasResults: !!results, 
        hasSession: !!session,
        resultKeys: results ? Object.keys(results) : [],
        sessionImageCount: session?.images?.length || 0
      });

      setAnalysisData(results);
      setSessionData(session || foundSession);
      
      // If we have analysis data, show results view by default and activate chat tab
      if (results && (session?.images?.length > 0 || foundSession)) {
        setCurrentView('results');
        setActiveTab('chat'); // Default to chat tab when analysis results are available
        if (session?.images?.length > 0) {
          setSelectedImage(session.images[0]);
        }
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

  const handleImageSelect = (image: FigmantImage) => {
    setSelectedImage(image);
    setCurrentView('results');
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
    setSelectedImage(null);
  };

  // Results view - check if we should use enhanced UI
  if (currentView === 'results') {
    // Check if we should use enhanced UI
    if (shouldUseEnhancedUI(analysisData)) {
      const enhancedData = transformToEnhancedFormat(analysisData, sessionData);
      if (enhancedData) {
        console.log('🎨 Using Enhanced Analysis Results component');
        
        return (
          <EnhancedAnalysisResults 
            images={enhancedData.images}
            issues={enhancedData.issues}
            suggestions={enhancedData.suggestions}
            analysisMetadata={enhancedData.analysisMetadata}
            onBack={() => navigate('/analyze')}
          />
        );
      }
    }
    
    // Fallback to basic results
    console.log('📊 Using basic ResultsContent component');
    return (
      <ResultsContent 
        analysisData={analysisData}
        sessionData={sessionData}
      />
    );
  }

  // Show detail view
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

  // Fallback: Show results even without images
  if (analysisData) {
    // Try enhanced UI first
    if (shouldUseEnhancedUI(analysisData)) {
      const enhancedData = transformToEnhancedFormat(analysisData, sessionData);
      if (enhancedData) {
        console.log('🎨 Using Enhanced Analysis Results component (fallback)');
        return (
          <EnhancedAnalysisResults 
            images={enhancedData.images}
            issues={enhancedData.issues}
            suggestions={enhancedData.suggestions}
            analysisMetadata={enhancedData.analysisMetadata}
            onBack={() => navigate('/analyze')}
          />
        );
      }
    }
    
    // Basic fallback
    return (
      <ResultsContent 
        analysisData={analysisData}
        sessionData={sessionData}
      />
    );
  }

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
};

export default FigmantResultsPage;
