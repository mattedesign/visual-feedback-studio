
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

  // Enhanced Figmant sidebar layout for results view
  if (currentView === 'results') {
    return (
      <div className="figmant-layout h-full">
        {/* Enhanced Figmant Sidebar with Tabs */}
        <div className="figmant-sidebar transition-all duration-300">
          <div className="h-full flex flex-col rounded-lg">
            {/* Header */}
            <div className="p-4" style={{borderBottom: '1px solid var(--Stroke-01, #ECECEC)'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FigmantLogo size={40} />
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex bg-muted rounded-lg p-1 mt-4">
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
            
            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'menu' ? (
                <div className="h-full">
                  <FigmantSidebar />
                </div>
              ) : (
                <div className="h-full">
                  <ResultsChat 
                    analysisData={analysisData}
                    sessionId={sessionData?.id || sessionId!}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="figmant-main">
          <ResultsContent 
            analysisData={analysisData}
            sessionData={sessionData}
          />
        </div>
      </div>
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

  // Fallback: Show results even without images using the enhanced sidebar layout
  if (analysisData) {
    return (
      <div className="figmant-layout h-full">
        {/* Enhanced Figmant Sidebar with Tabs */}
        <div className="figmant-sidebar transition-all duration-300">
          <div className="h-full flex flex-col rounded-lg">
            {/* Header */}
            <div className="p-4" style={{borderBottom: '1px solid var(--Stroke-01, #ECECEC)'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FigmantLogo size={40} />
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex bg-muted rounded-lg p-1 mt-4">
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
            
            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'menu' ? (
                <div className="h-full">
                  <FigmantSidebar />
                </div>
              ) : (
                <div className="h-full">
                  <ResultsChat 
                    analysisData={analysisData}
                    sessionId={sessionData?.id || sessionId!}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="figmant-main">
          <ResultsContent 
            analysisData={analysisData}
            sessionData={sessionData}
          />
        </div>
      </div>
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
