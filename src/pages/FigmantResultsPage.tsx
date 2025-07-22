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
  const [rightPanelTab, setRightPanelTab] = useState<'annotations' | 'ideas'>('annotations');
  const [prototypes, setPrototypes] = useState<VisualPrototype[]>([]);
  const [selectedPrototype, setSelectedPrototype] = useState<VisualPrototype | null>(null);
  const [showPrototypeViewer, setShowPrototypeViewer] = useState(false);
  const [prototypeViewMode, setPrototypeViewMode] = useState<'list' | 'overlay'>('list');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'chat'>('menu');

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

  // Handle image selection - switch to detail view
  const handleImageSelect = (image: FigmantImage) => {
    setSelectedImage(image);
    setViewMode('detail');
    setCurrentView('detail');
    setRightPanelTab('annotations'); // Default to annotations tab
  };

  // Handle back to gallery
  const handleBackToGallery = () => {
    setSelectedImage(null);
    setViewMode('gallery');
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

  // Three-panel layout: Left (existing sidebar) + Middle (gallery/detail) + Right (context)
  return (
    <>
      <div className="h-full flex">
        {/* Middle Panel - Gallery or Single Image Detail */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'gallery' ? (
            // Gallery View
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">Image Gallery</h1>
                <p className="text-muted-foreground">
                  Select an image to view detailed analysis and recommendations
                </p>
              </div>
              
              {sessionData?.images?.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 max-w-4xl">
                  {sessionData.images.map((image, index) => {
                    const imageNames = [
                      'Create Account2 1',
                      'Create Account',
                      'Dashboard Overview',
                      'Settings Panel'
                    ];
                    
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
                                        <span class="text-2xl">${index === 0 ? '📊' : index === 1 ? '👤' : index === 2 ? '📈' : '⚙️'}</span>
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
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-xs text-muted-foreground">Analyzed</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No images found for this session</p>
                </div>
              )}
            </div>
          ) : (
            // Single Image Detail View with Annotations
            <div className="p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToGallery}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Gallery
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    {selectedImage ? getImageTitle(selectedImage) : 'Image Detail'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Detailed analysis with annotations
                  </p>
                </div>
              </div>
              
              {selectedImage && (
                <div className="bg-muted/20 rounded-lg p-6 h-[calc(100%-120px)] flex items-center justify-center">
                  <div className="relative max-w-full max-h-full">
                    <img 
                      src={getImageUrl(selectedImage.file_path)}
                      alt={getImageTitle(selectedImage)}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-96 h-64 bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg flex items-center justify-center">
                            <div class="text-center p-6">
                              <div class="w-16 h-16 bg-white/30 rounded-xl mb-3 mx-auto flex items-center justify-center">
                                <span class="text-2xl">🎨</span>
                              </div>
                              <h3 class="font-semibold text-gray-800">${getImageTitle(selectedImage)}</h3>
                            </div>
                          </div>
                        `;
                      }}
                    />
                    
                    {/* Sample Annotation Hotspots */}
                    <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 border-2 border-white rounded-full shadow-lg animate-pulse cursor-pointer" 
                         title="Critical issue: Password field accessibility"></div>
                    <div className="absolute top-20 right-8 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full shadow-lg animate-pulse cursor-pointer"
                         title="Warning: CTA button contrast"></div>
                    <div className="absolute bottom-16 left-1/3 w-3 h-3 bg-blue-500 border-2 border-white rounded-full shadow-lg animate-pulse cursor-pointer"
                         title="Improvement: Layout optimization"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right Panel - Context Recommendations */}
        <div 
          className="flex flex-col items-center self-stretch overflow-hidden"
          style={{
            display: 'flex',
            maxWidth: '240px',
            flexDirection: 'column',
            alignItems: 'center',
            alignSelf: 'stretch',
            border: '1px solid #E2E2E2',
            background: '#FCFCFC',
            clipPath: 'inset(0 round 20px)',
            WebkitClipPath: 'inset(0 round 20px)',
            borderRadius: '20px'
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-border w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground">
                  {selectedImage ? 'Figmant Analysis' : 'Analysis Results'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedImage ? 'Detailed Analysis' : '5 insights found'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/figmant')}
                className="p-1 h-8 w-8"
                title="Collapse panel"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedImage && (
              <div className="flex bg-muted rounded-lg p-1 gap-1 mb-4">
                <Button 
                  variant={rightPanelTab === 'annotations' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setRightPanelTab('annotations')}
                >
                  Annotations
                </Button>
                <Button 
                  variant={rightPanelTab === 'ideas' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setRightPanelTab('ideas')}
                >
                  Ideas
                </Button>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 w-full">
            {!selectedImage ? (
              // Summary view
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Insights</span>
                      <span className="text-foreground font-semibold">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Images</span>
                      <span className="text-foreground">{sessionData?.images?.length || 2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground">Recently</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Categories</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">All</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Accessibility</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Usability</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Visual</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground">Content</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">1</span>
                    </div>
                  </div>
                </div>
                
                {/* Prototype Generation Section */}
                {prototypes.length === 0 && !isGenerating && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Generate Visual Prototypes</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Transform your top recommendations into interactive visual prototypes with working code. 
                      We'll select 2-3 high-impact improvements and create comprehensive implementation examples.
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={handleGeneratePrototypes}
                      disabled={isGenerating}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Prototypes
                    </Button>
                  </div>
                )}

                {/* Prototype Generation Progress */}
                {isGenerating && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Generating Visual Prototypes</h3>
                    <p className="text-sm text-muted-foreground mb-3">{progress.message}</p>
                    {progress.currentPrototype && progress.totalPrototypes && (
                      <div className="mb-3">
                        <Progress 
                          value={(progress.currentPrototype / progress.totalPrototypes) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Prototype {progress.currentPrototype} of {progress.totalPrototypes}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Prototype Generation Error */}
                {prototypeError && (
                  <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                    <h3 className="font-semibold text-red-800">Prototype Generation Failed</h3>
                    <p className="text-sm text-red-600 mt-1">{prototypeError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetPrototypeState}
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {/* Generated Prototypes Summary */}
                {prototypes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Visual Prototypes</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {prototypes.length} interactive prototypes generated
                    </p>
                    <div className="space-y-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full bg-[#22c4a8] hover:bg-[#1ba896] text-white"
                        onClick={handleViewPrototypes}
                      >
                        View Prototypes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={togglePrototypeView}
                      >
                        {prototypeViewMode === 'overlay' ? 'List View' : 'Overlay View'}
                      </Button>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Actions</h3>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Grid className="w-4 h-4 mr-2" />
                      Share Analysis
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Image-specific view with Annotations/Ideas tabs
              <div className="space-y-4">
                {rightPanelTab === 'annotations' ? (
                  // Annotations Tab
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Image Annotations</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Click on the colored dots to see detailed analysis for each area
                      </p>
                    </div>
                    
                    {/* Annotation List */}
                    <div className="space-y-3">
                      <div className="border border-red-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm">Password field accessibility</h4>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">critical</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Replace dots with asterisks or add character counter for better accessibility compliance.
                            </p>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">accessibility</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0 mt-1"></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm">CTA button contrast</h4>
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">warning</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Use brand primary color with higher contrast ratio to meet WCAG standards.
                            </p>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">usability</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm">Layout optimization</h4>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">improvement</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Reduce illustration size or use responsive 50/50 split for better mobile experience.
                            </p>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">visual</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Ideas Tab
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Improvement Ideas</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Actionable suggestions to enhance this interface
                      </p>
                    </div>
                    
                    {/* Ideas List */}
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">Add progress indicator</h4>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">high impact</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Show users where they are in the signup process to reduce abandonment.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>💡 Effort: Low</span>
                          <span>•</span>
                          <span>📈 Impact: High</span>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">Social login options</h4>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">medium impact</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Add Google/Apple sign-in to reduce friction and increase conversions.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>💡 Effort: Medium</span>
                          <span>•</span>
                          <span>📈 Impact: Medium</span>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">Real-time validation</h4>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">high impact</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Validate email format and password strength in real-time for better UX.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>💡 Effort: Medium</span>
                          <span>•</span>
                          <span>📈 Impact: High</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Implementation Plan
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Prototype Viewer Modal */}
      {showPrototypeViewer && selectedPrototype && (
        <ComprehensivePrototypeViewer
          prototype={selectedPrototype}
          isOpen={showPrototypeViewer}
          onClose={closePrototypeViewer}
        />
      )}
      
      {/* Prototype Overlay */}
      {prototypeViewMode === 'overlay' && prototypes.length > 0 && sessionData?.images?.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/50">
          <div className="absolute inset-4 bg-white rounded-lg">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Visual Prototypes Overlay</h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={togglePrototypeView}
                  >
                    Switch to List View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setPrototypeViewMode('list')}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <VisualPrototypeOverlay
                  originalImageUrl={getImageUrl(sessionData.images[0].file_path)}
                  prototypes={prototypes}
                  onPrototypeSelect={handlePrototypeSelect}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FigmantResultsPage;