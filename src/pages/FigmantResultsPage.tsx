import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, AlertTriangle, RefreshCw, Grid, FileText, ChevronLeft, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { getFigmantResults, getFigmantSession } from '@/services/figmantAnalysisService';
import { FigmantSessionService } from '@/services/figmantSessionService';
import { FigmantImageGrid } from '@/components/analysis/figmant/FigmantImageGrid';
import { FigmantImageDetail } from '@/components/analysis/figmant/FigmantImageDetail';
import { ResultsContent } from '@/components/analysis/results/ResultsContent';
import { ResultsChat } from '@/components/analysis/results/ResultsChat';
import { AnalysisResults as EnhancedAnalysisResults } from '@/components/analysis/AnalysisResults';
import { EnhancedFigmaAnalysisLayout } from '@/components/analysis/figma/EnhancedFigmaAnalysisLayout';
import { VisualPrototypeOverlay } from '@/components/prototypes/VisualPrototypeOverlay';
import { ComprehensivePrototypeViewer } from '@/components/prototypes/ComprehensivePrototypeViewer';
import { usePrototypeGeneration } from '@/hooks/usePrototypeGeneration';
import { PrototypeStorageService } from '@/services/prototypes/prototypeStorageService';
import type { VisualPrototype } from '@/types/analysis';

import { FigmantSidebar } from '@/components/layout/FigmantSidebar';
import { FigmantLogo } from '@/components/ui/figmant-logo';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { VisualMentorSummary } from '@/components/analysis/VisualMentorSummary';

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
  const [viewMode, setViewMode] = useState<'visual' | 'detailed'>('visual');
  const [currentView, setCurrentView] = useState<'gallery' | 'detail'>('gallery');
  const [rightPanelTab, setRightPanelTab] = useState<'annotations' | 'ideas'>('annotations');
  const [prototypes, setPrototypes] = useState<VisualPrototype[]>([]);
  const [selectedPrototype, setSelectedPrototype] = useState<VisualPrototype | null>(null);
  const [showPrototypeViewer, setShowPrototypeViewer] = useState(false);
  const [prototypeViewMode, setPrototypeViewMode] = useState<'list' | 'overlay'>('list');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'chat'>('menu');
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  // Add prototype generation hook
  const { 
    isGenerating, 
    progress, 
    error: prototypeError, 
    generatePrototypes, 
    resetState: resetPrototypeState
  } = usePrototypeGeneration();

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

  // Load prototypes when analysis data is available
  useEffect(() => {
    const loadPrototypes = async () => {
      // Get the actual analysis result ID from the session
      let currentAnalysisId = analysisData?.id;
      
      if (!currentAnalysisId && sessionId) {
        // Look up analysis result ID using session ID
        try {
          const { data, error } = await supabase
            .from('figmant_analysis_results')
            .select('id')
            .eq('session_id', sessionId)
            .single();
          
          if (data && !error) {
            currentAnalysisId = data.id;
          }
        } catch (error) {
          console.log('No analysis result found for session:', sessionId);
          return;
        }
      }
      
      if (currentAnalysisId && !isGenerating) {
        try {
          console.log('🎨 Loading prototypes for analysis:', currentAnalysisId);
          const loadedPrototypes = await PrototypeStorageService.getPrototypesByAnalysisId(currentAnalysisId);
          setPrototypes(loadedPrototypes);
          console.log(`✅ Loaded ${loadedPrototypes.length} prototypes`);
        } catch (error) {
          console.error('❌ Failed to load prototypes:', error);
        }
      }
    };
    loadPrototypes();
  }, [analysisData?.id, sessionId, isGenerating]);

  // Handle prototype generation
  const handleGeneratePrototypes = async () => {
    // Get the actual analysis result ID from the session
    let currentAnalysisId = analysisData?.id;
    
    if (!currentAnalysisId && sessionId) {
      // Look up analysis result ID using session ID
      try {
        const { data, error } = await supabase
          .from('figmant_analysis_results')
          .select('id')
          .eq('session_id', sessionId)
          .single();
        
        if (error || !data) {
          toast.error('No analysis found for this session');
          return;
        }
        
        currentAnalysisId = data.id;
      } catch (error) {
        console.error('Failed to lookup analysis ID:', error);
        toast.error('Failed to find analysis data');
        return;
      }
    }
    
    if (!currentAnalysisId) {
      toast.error('No analysis ID available for prototype generation');
      return;
    }

    try {
      toast.info('Starting prototype generation...');
      await generatePrototypes(currentAnalysisId);
      // Reload prototypes after generation
      const loadedPrototypes = await PrototypeStorageService.getPrototypesByAnalysisId(currentAnalysisId);
      setPrototypes(loadedPrototypes);
      toast.success(`Generated ${loadedPrototypes.length} visual prototypes!`);
    } catch (error) {
      console.error('❌ Failed to generate prototypes:', error);
      toast.error(`Failed to generate prototypes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle prototype selection
  const handlePrototypeSelect = (prototype: VisualPrototype) => {
    setSelectedPrototype(prototype);
    setShowPrototypeViewer(true);
  };

  // Close prototype viewer
  const closePrototypeViewer = () => {
    setShowPrototypeViewer(false);
    setSelectedPrototype(null);
  };

  // Toggle prototype view mode
  const togglePrototypeView = () => {
    setPrototypeViewMode(current => current === 'list' ? 'overlay' : 'list');
  };

  // Handle view prototypes button click
  const handleViewPrototypes = () => {
    if (prototypes.length > 0) {
      if (sessionData?.images?.length > 0) {
        // Switch to prototype overlay view
        setPrototypeViewMode('overlay');
      }
    } else {
      toast.error('No prototypes available to view');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Loading data for ID:', sessionId);
        
        // Try both methods to find the session
        let session = null;
        let analysis = null;
        let actualSessionId = sessionId;

        // First, determine if the ID is a session ID or analysis result ID
        // Check if it's an analysis result ID first
        try {
          const { data: analysisCheck, error: analysisCheckError } = await supabase
            .from('figmant_analysis_results')
            .select('id, session_id')
            .eq('id', sessionId)
            .single();
          
          if (analysisCheck && !analysisCheckError) {
            console.log('📊 ID is an analysis result ID, getting session ID:', analysisCheck.session_id);
            actualSessionId = analysisCheck.session_id;
          }
        } catch (error) {
          console.log('🔍 ID is not an analysis result ID, treating as session ID');
        }

        // Method 1: Direct session lookup using the actual session ID
        try {
          session = await getFigmantSession(actualSessionId);
          console.log('📊 Direct session lookup result:', session);
        } catch (directError) {
          console.warn('❌ Direct session lookup failed:', directError);
        }

        // Method 2: Get analysis results using actual session ID
        try {
          analysis = await getFigmantResults(actualSessionId);
          console.log('📊 Analysis results lookup:', analysis);
          
          // If we have analysis data but no session data, try to construct it from the analysis
          if (analysis && !session) {
            // The getFigmantResults includes session data, but let's get images separately
            const { data: images, error: imagesError } = await supabase
              .from('figmant_session_images')
              .select('*')
              .eq('session_id', actualSessionId)
              .order('upload_order');
            
            if (!imagesError && images) {
              session = {
                id: actualSessionId,
                images: images,
                ...analysis.session // This comes from the join in getFigmantResults
              };
            }
          }
        } catch (analysisError) {
          console.warn('❌ Analysis lookup failed:', analysisError);
        }

        if (session) {
          setSessionData(session);
          console.log('✅ Session data set:', session);
        }

        if (analysis) {
          setAnalysisData(analysis);
          console.log('✅ Analysis data set:', analysis);
        }

        if (!session && !analysis) {
          console.warn('❌ No data found for ID:', sessionId);
          setDebugInfo({
            requestedSessionId: sessionId,
            actualSessionId: actualSessionId,
            matchType: 'none',
            error: 'No session or analysis data found'
          });
        }

      } catch (error) {
        console.error('❌ Error loading data:', error);
        toast.error('Failed to load analysis results');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sessionId]);

  // Handle image selection - no longer used in new structure
  const handleImageSelect = (image: FigmantImage) => {
    setSelectedImage(image);
    setCurrentView('detail');
    setRightPanelTab('annotations'); // Default to annotations tab
  };

  // Handle back to gallery - no longer used in new structure  
  const handleBackToGallery = () => {
    setSelectedImage(null);
    setCurrentView('gallery');
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

  // Main render - use existing FigmantLayout structure with three panels
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Design Analysis Results
          </h1>
          
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'visual' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100'
              }`}
            >
              🎨 Visual Ideas
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'detailed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100'
              }`}
            >
              📊 Detailed Analysis
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {viewMode === 'visual' ? (
          // Visual mentor view - default
          <VisualMentorSummary 
            mentorData={analysisData?.enhanced_context?.mentor_summary}
            userImage={sessionData?.images?.[0]?.file_path}
          />
        ) : (
          // Existing detailed analysis view - need to transform data to match interface
          <div className="space-y-6">
            <EnhancedAnalysisResults 
              images={sessionData?.images?.map(img => ({
                url: getImageUrl(img.file_path),
                fileName: img.file_name,
                id: img.id
              })) || []}
              issues={analysisData?.issues || []}
            />
            
            {/* Pattern Discovery Section for Detailed View */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Discover More Patterns</h2>
              <p className="text-gray-600 mb-4">
                Explore our library of proven UI patterns from successful companies
              </p>
              {/* Could add PatternSearch component here if needed */}
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 flex gap-3">
        <button className="px-4 py-2 bg-white rounded-lg shadow-lg 
                         hover:shadow-xl transition-shadow">
          💬 Ask Follow-up
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                         shadow-lg hover:shadow-xl transition-shadow">
          🎨 See More Ideas
        </button>
      </div>
    </div>
  );
};

export default FigmantResultsPage;