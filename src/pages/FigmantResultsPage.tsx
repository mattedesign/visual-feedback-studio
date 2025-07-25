import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, AlertTriangle, RefreshCw, Grid, FileText, ChevronLeft, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { getFigmantResults, getFigmantSession, startFigmantAnalysis } from '@/services/figmantAnalysisService';
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
import { UserContextForm } from '@/components/analysis/UserContextForm';
import { HolisticPrototypeViewer } from '@/components/prototypes/HolisticPrototypeViewer';
import { PrototypeGenerationStatus } from '@/components/prototypes/PrototypeGenerationStatus';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useAnalysisState } from '@/hooks/analysis/useAnalysisState';

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
  const [userContext, setUserContext] = useState<any>(null);
  const [showContextForm, setShowContextForm] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  
  // Get auto-start state from analysis state hook
  const { autoStartState, setAutoStartState } = useAnalysisState();

  // Feature flags
  const isHolisticEnabled = useFeatureFlag('holistic-ai-prototypes');

  // Add prototype generation hook
  const { 
    isGenerating, 
    progress, 
    error: prototypeError, 
    generatePrototypes, 
    resetState: resetPrototypeState
  } = usePrototypeGeneration();

  // Add visual prototypes generation trigger
  const triggerVisualPrototypeGeneration = async (analysisId: string) => {
    try {
      console.log('🎨 Triggering visual prototype generation for:', analysisId);
      await generatePrototypes(analysisId);
      console.log('✅ Visual prototype generation completed');
    } catch (error) {
      console.error('❌ Visual prototype generation failed:', error);
    }
  };

  // Helper function to get image URL
  const getImageUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return supabase.storage.from('analysis-images').getPublicUrl(filePath).data.publicUrl;
  };

  // Transform analysis data to extract issues and suggestions
  const transformAnalysisData = (analysis: any) => {
    console.log('🔧 Transforming analysis data:', analysis);
    
    const claudeAnalysis = analysis?.claude_analysis;
    const enhancedIssues: any[] = [];
    const enhancedSuggestions: any[] = [];
    
    console.log('🔍 Claude Analysis Structure Check:', {
      hasClaudeAnalysis: !!claudeAnalysis,
      claudeAnalysisKeys: claudeAnalysis ? Object.keys(claudeAnalysis) : 'none',
      claudeAnalysisType: typeof claudeAnalysis,
      fullAnalysisKeys: analysis ? Object.keys(analysis) : 'none',
      claudeAnalysisString: typeof claudeAnalysis === 'string' ? claudeAnalysis.substring(0, 200) : 'not string'
    });

    // Handle case where claude_analysis might be a JSON string
    let parsedClaudeAnalysis = claudeAnalysis;
    if (typeof claudeAnalysis === 'string') {
      try {
        parsedClaudeAnalysis = JSON.parse(claudeAnalysis);
        console.log('✅ Successfully parsed claude_analysis from string');
      } catch (e) {
        console.error('❌ Failed to parse claude_analysis string:', e);
        parsedClaudeAnalysis = null;
      }
    }

    console.log('🔍 Final Analysis Structure:', {
      hasIssues: !!parsedClaudeAnalysis?.issues,
      issuesIsArray: Array.isArray(parsedClaudeAnalysis?.issues),
      issuesLength: parsedClaudeAnalysis?.issues?.length || 0,
      hasAnnotations: !!parsedClaudeAnalysis?.annotations,
      annotationsLength: parsedClaudeAnalysis?.annotations?.length || 0,
      hasAnalysisIssues: !!parsedClaudeAnalysis?.analysis_issues,
      analysisIssuesLength: parsedClaudeAnalysis?.analysis_issues?.length || 0
    });
    
    // Handle multiple possible formats for issues
    let issuesToProcess: any[] = [];
    
    // Try different possible paths for issues
    if (parsedClaudeAnalysis?.issues && Array.isArray(parsedClaudeAnalysis.issues)) {
      issuesToProcess = parsedClaudeAnalysis.issues;
      console.log('🔍 Using issues array:', issuesToProcess.length, 'items');
    } else if (parsedClaudeAnalysis?.annotations && Array.isArray(parsedClaudeAnalysis.annotations)) {
      issuesToProcess = parsedClaudeAnalysis.annotations;
      console.log('🔍 Using annotations array:', issuesToProcess.length, 'items');
    } else if (parsedClaudeAnalysis?.analysis_issues && Array.isArray(parsedClaudeAnalysis.analysis_issues)) {
      issuesToProcess = parsedClaudeAnalysis.analysis_issues;
      console.log('🔍 Using analysis_issues array:', issuesToProcess.length, 'items');
    } else {
      console.warn('❌ No valid issues array found in analysis data');
    }

    if (issuesToProcess.length > 0) {
      console.log('🔍 Processing issues:', issuesToProcess.length, 'items');
      issuesToProcess.forEach((issue: any, index: number) => {
        // Add as issue
        enhancedIssues.push({
          id: issue.id || `issue-${index}`,
          title: issue.description || 'Analysis Suggestion',
          description: issue.suggested_fix || issue.impact || 'Improvement opportunity identified',
          category: issue.category?.toLowerCase() || 'usability',
          severity: issue.severity || 'improvement',
          confidence: issue.confidence || 0.8,
          impact_scope: 'task-completion',
          element: {
            location: {
              x: Math.random() * 800,
              y: Math.random() * 600,
              width: 100,
              height: 50,
              xPercent: Math.random() * 80 + 10,
              yPercent: Math.random() * 70 + 10,
              widthPercent: 15,
              heightPercent: 8
            }
          },
          implementation: {
            effort: issue.level === 'suggestion' ? 'hours' : 'days',
            rationale: issue.impact || 'Improvement opportunity',
            design_guidance: issue.suggested_fix || 'Apply suggested improvements'
          },
          business_impact: {
            roi_score: issue.severity === 'critical' ? 9 : issue.severity === 'warning' ? 7 : 5,
            priority_level: issue.severity,
            quick_win: issue.level === 'suggestion'
          }
        });
        
        // Add as suggestion too
        enhancedSuggestions.push({
          id: `suggestion-${index}`,
          title: issue.description || 'Improvement Suggestion',
          description: issue.suggested_fix || issue.impact || 'Consider this improvement',
          impact: issue.severity === 'critical' ? 'High' : issue.severity === 'warning' ? 'Medium' : 'Low',
          effort: issue.level === 'suggestion' ? 'Low' : 'Medium',
          category: 'improvement'
        });
      });
    }
    
    // Handle mentor analysis alternatives as suggestions
    if (parsedClaudeAnalysis?.mentor_analysis?.visual_alternatives && Array.isArray(parsedClaudeAnalysis.mentor_analysis.visual_alternatives)) {
      console.log('🔍 Processing visual alternatives:', parsedClaudeAnalysis.mentor_analysis.visual_alternatives.length, 'items');
      parsedClaudeAnalysis.mentor_analysis.visual_alternatives.forEach((alt: any, index: number) => {
        // Map company names to existing visual reference IDs in the pattern library
        const getVisualReference = (company: string, title: string) => {
          const companyLower = company.toLowerCase();
          const titleLower = title.toLowerCase();
          
          // Map to existing patterns in the library
          if (companyLower.includes('stripe')) return 'stripe-cta';
          if (companyLower.includes('spotify')) return 'spotify-cta';
          if (companyLower.includes('airbnb')) return 'airbnb-cta';
          if (companyLower.includes('apple')) return 'apple-cta';
          if (companyLower.includes('figma')) return 'figma-card';
          if (companyLower.includes('trello')) return 'trello-card';
          if (companyLower.includes('typeform')) return 'typeform-form';
          if (companyLower.includes('google')) return 'google-form';
          if (companyLower.includes('vercel')) return 'vercel-nav';
          if (companyLower.includes('arc')) return 'arc-nav';
          
          // Fallback to related patterns based on context
          if (titleLower.includes('grid') || titleLower.includes('visual')) return 'figma-card';
          if (titleLower.includes('progressive') || titleLower.includes('step')) return 'typeform-form';
          if (titleLower.includes('preview') || titleLower.includes('interaction')) return 'trello-card';
          if (titleLower.includes('skip') || titleLower.includes('navigation')) return 'vercel-nav';
          
          // Final fallback to most versatile pattern
          return 'figma-card';
        };
        
        enhancedSuggestions.push({
          id: `alternative-${index}`,
          title: alt.title || 'Visual Alternative',
          description: alt.description || 'Alternative design approach',
          impact: 'High',
          effort: 'Medium',
          category: 'design-pattern',
          company_example: alt.company_example,
          why_it_works: alt.why_it_works,
          visual_reference: getVisualReference(alt.company_example || '', alt.title || '')
        });
      });
    }
    
    console.log('🔧 Transformation complete:', {
      issuesCount: enhancedIssues.length,
      suggestionsCount: enhancedSuggestions.length
    });
    
    // Also add visual_reference to the mentor analysis visual alternatives for VisualMentorSummary
    const enhancedMentorAnalysis = { ...claudeAnalysis?.mentor_analysis };
    if (enhancedMentorAnalysis?.visual_alternatives) {
      enhancedMentorAnalysis.visual_alternatives = enhancedMentorAnalysis.visual_alternatives.map((alt: any, index: number) => {
        const getVisualReference = (company: string, title: string) => {
          const companyLower = company.toLowerCase();
          const titleLower = title.toLowerCase();
          
          if (companyLower.includes('stripe')) return 'stripe-cta';
          if (companyLower.includes('spotify')) return 'spotify-cta';
          if (companyLower.includes('airbnb')) return 'airbnb-cta';
          if (companyLower.includes('apple')) return 'apple-cta';
          if (companyLower.includes('figma')) return 'figma-card';
          if (companyLower.includes('trello')) return 'trello-card';
          if (companyLower.includes('typeform')) return 'typeform-form';
          if (companyLower.includes('google')) return 'google-form';
          if (companyLower.includes('vercel')) return 'vercel-nav';
          if (companyLower.includes('arc')) return 'arc-nav';
          
          if (titleLower.includes('grid') || titleLower.includes('visual')) return 'figma-card';
          if (titleLower.includes('progressive') || titleLower.includes('step')) return 'typeform-form';
          if (titleLower.includes('preview') || titleLower.includes('interaction')) return 'trello-card';
          if (titleLower.includes('skip') || titleLower.includes('navigation')) return 'vercel-nav';
          
          return 'figma-card';
        };
        
        return {
          ...alt,
          visual_reference: getVisualReference(alt.company_example || '', alt.title || '')
        };
      });
    }
    
    return {
      id: analysis.id, // Preserve the analysis ID
      ...analysis,
      issues: enhancedIssues,
      suggestions: enhancedSuggestions,
      enhanced_context: {
        ...analysis.enhanced_context,
        mentor_summary: enhancedMentorAnalysis
      }
    };
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
            .maybeSingle();
          
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
          .maybeSingle();
        
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
            .maybeSingle();
          
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
          // Transform the analysis data to extract issues and suggestions
          const transformedAnalysis = transformAnalysisData(analysis);
          setAnalysisData(transformedAnalysis);
          console.log('✅ Analysis data set:', transformedAnalysis);
        }

        // Check for existing user context
        if (actualSessionId) {
          try {
            const { data: contextData, error: contextError } = await supabase
              .from('figmant_user_contexts')
              .select('*')
              .eq('session_id', actualSessionId)
              .maybeSingle();

            if (contextData && !contextError) {
              setUserContext(contextData);
              console.log('✅ User context found:', contextData);
            } else if (isHolisticEnabled && !contextData && !analysis) {
              // Only show context form if no analysis exists yet
              // This prevents showing context form for completed analyses
              setShowContextForm(true);
              console.log('💡 Holistic feature enabled - showing context form for new analysis');
            }
          } catch (error) {
            console.warn('Failed to load user context:', error);
          }
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

  // Auto-start analysis effect - runs unconditionally
  useEffect(() => {
    const handleAutoStart = async () => {
      // Only proceed if we have session data and the state is idle
      if (autoStartState !== 'idle') return;
      if (!sessionData || analysisData || sessionData.status !== 'draft' || !sessionData?.images?.length) return;
      if (!sessionId) return;

      try {
        setAutoStartState('starting');
        toast.info('Starting analysis automatically...');
        
        console.log('🚀 Auto-starting figmant analysis for session:', sessionId);
        
        const analysisResult = await startFigmantAnalysis(sessionId);
        console.log('✅ Auto-analysis started successfully:', analysisResult);
        
        // Start polling for analysis completion
        let attempts = 0;
        const maxAttempts = 60; // 60 seconds total
        const pollInterval = 1000; // 1 second intervals
        
        const pollForAnalysis = async (): Promise<void> => {
          attempts++;
          console.log(`🔍 Auto-start polling attempt ${attempts}/${maxAttempts} for analysis results...`);
          
          try {
            const { data, error } = await supabase
              .from('figmant_analysis_results')
              .select('id')
              .eq('session_id', sessionId)
              .maybeSingle();
            
            if (error) {
              console.error('❌ Error fetching analysis results:', error);
              if (attempts < maxAttempts) {
                setTimeout(pollForAnalysis, pollInterval);
                return;
              } else {
                throw new Error(`Database error: ${error.message}`);
              }
            }
            
            if (data?.id) {
              console.log('✅ Auto-start analysis result found with ID:', data.id);
              
              // Reload the full analysis data
              try {
                const fullAnalysisData = await getFigmantResults(sessionId);
                if (fullAnalysisData) {
                  const transformedData = transformAnalysisData(fullAnalysisData);
                  setAnalysisData(transformedData);
                  console.log('✅ Auto-start analysis data set:', transformedData);
                  setAutoStartState('idle'); // Reset state for future runs
                  toast.success('Analysis completed successfully!');
                  
                  // Trigger visual prototype generation for auto-started analyses
                  try {
                    console.log('🎨 Auto-starting visual prototype generation...');
                    await triggerVisualPrototypeGeneration(data.id);
                    console.log('✅ Visual prototypes generated automatically');
                  } catch (prototypeError) {
                    console.error('❌ Auto visual prototype generation failed:', prototypeError);
                    // Don't fail the analysis flow
                  }
                }
              } catch (fetchError) {
                console.error('❌ Error fetching full analysis data:', fetchError);
                toast.error('Failed to load analysis results');
                setAutoStartState('idle');
              }
              
              return; // Exit polling loop
            } else if (attempts < maxAttempts) {
              // Continue polling
              setTimeout(pollForAnalysis, pollInterval);
            } else {
              throw new Error('Analysis timeout: No results found after 60 seconds');
            }
          } catch (pollError) {
            if (attempts < maxAttempts && !pollError.message.includes('timeout')) {
              // Continue polling for non-timeout errors
              setTimeout(pollForAnalysis, pollInterval);
            } else {
              console.error('❌ Auto-start polling failed:', pollError);
              toast.error('Analysis timed out or failed');
              setAutoStartState('idle');
            }
          }
        };
        
        // Start polling
        pollForAnalysis();
        
      } catch (error) {
        console.error('❌ Failed to auto-start analysis:', error);
        toast.error('Failed to start analysis: ' + (error instanceof Error ? error.message : 'Unknown error'));
        setAutoStartState('idle'); // Reset to allow retry
      }
    };

    handleAutoStart();
  }, [sessionData, analysisData, autoStartState, sessionId]);

  // Handle context form completion
  const handleContextComplete = async (contextId: string) => {
    console.log('📝 Context completed with ID:', contextId);
    setShowContextForm(false);
    setUserContext({ id: contextId }); // Set basic context data
    
    // Start the analysis process with proper error handling
    try {
      toast.success('Context saved! Starting analysis...');
      
      if (!sessionId) {
        throw new Error('No session ID available');
      }

      console.log('🚀 Starting figmant analysis for session:', sessionId);
      
      // Start the regular analysis with better error handling
      console.log('📞 About to call startFigmantAnalysis...');
      try {
      const analysisResult = await startFigmantAnalysis(sessionId, userContext?.id);
      console.log('✅ Analysis started successfully with context:', analysisResult);
      } catch (analysisError) {
        console.error('❌ startFigmantAnalysis failed:', analysisError);
        throw new Error(`Analysis startup failed: ${analysisError.message}`);
      }
      
      // Use proper polling instead of arbitrary timeout
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds total
      const pollInterval = 1000; // 1 second intervals
      
      const pollForAnalysis = async (): Promise<void> => {
        attempts++;
        console.log(`🔍 Polling attempt ${attempts}/${maxAttempts} for analysis results...`);
        
        try {
          const { data, error } = await supabase
            .from('figmant_analysis_results')
            .select('id')
            .eq('session_id', sessionId)
            .maybeSingle(); // Use maybeSingle to avoid 406 errors
          
          if (error) {
            console.error('❌ Error fetching analysis results:', error);
            if (attempts < maxAttempts) {
              setTimeout(pollForAnalysis, pollInterval);
              return;
            } else {
              throw new Error(`Database error: ${error.message}`);
            }
          }
          
          if (data?.id) {
            console.log('✅ Analysis result found with ID:', data.id);
            
            // Set the analysis data immediately to show the viewer
            try {
              const fullAnalysisData = await getFigmantResults(sessionId);
              if (fullAnalysisData) {
                const transformedData = transformAnalysisData(fullAnalysisData);
                setAnalysisData(transformedData);
                console.log('✅ Analysis data set with ID:', transformedData.id);
              }
            } catch (fetchError) {
              console.error('❌ Error fetching full analysis data:', fetchError);
            }
            
            toast.info('Analysis complete! Generating holistic analysis...');
            
            // Generate holistic analysis automatically
            const { data: holisticData, error: holisticError } = await supabase.functions.invoke('generate-holistic-prototypes', {
              body: { 
                analysisId: data.id, 
                contextId: contextId
              }
            });
            
            if (holisticError) {
              console.error('Failed to generate holistic analysis:', holisticError);
              toast.error('Failed to generate holistic analysis: ' + holisticError.message);
            } else {
              console.log('✅ Holistic analysis generated successfully');
              toast.success('Holistic analysis generated successfully!');
              
              // Also trigger visual prototype generation
              try {
                console.log('🎨 Triggering visual prototype generation...');
                await triggerVisualPrototypeGeneration(data.id);
                toast.success('Visual prototypes generated successfully!');
              } catch (prototypeError) {
                console.error('❌ Visual prototype generation failed:', prototypeError);
                // Don't fail the entire flow if visual prototypes fail
                toast.warning('Holistic analysis completed, but visual prototypes failed to generate');
              }
            }
            
            return; // Exit polling loop
          } else if (attempts < maxAttempts) {
            // Continue polling
            setTimeout(pollForAnalysis, pollInterval);
          } else {
            throw new Error('Analysis timeout: No results found after 30 seconds');
          }
        } catch (pollError) {
          if (attempts < maxAttempts && !pollError.message.includes('timeout')) {
            // Continue polling for non-timeout errors
            setTimeout(pollForAnalysis, pollInterval);
          } else {
            throw pollError;
          }
        }
      };
      
      // Start polling
      pollForAnalysis();
      
    } catch (error) {
      console.error('❌ Error in analysis workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Analysis failed: ' + errorMessage);
      
      // Update session status to failed
      if (sessionId) {
        try {
          await supabase
            .from('figmant_analysis_sessions')
            .update({ status: 'failed' })
            .eq('id', sessionId);
        } catch (statusError) {
          console.error('Failed to update session status:', statusError);
        }
      }
    }
  };

  // Handle context form skip
  const handleContextSkip = () => {
    setShowContextForm(false);
    toast.info('Context skipped. Proceeding with standard analysis.');
  };

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

  // Show auto-start loading state
  if (autoStartState === 'starting') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 animate-spin mx-auto mb-4 text-[#22757C]" />
          <h2 className="text-lg font-semibold mb-2">Starting Analysis</h2>
          <p className="text-muted-foreground">Your images have been uploaded. Analysis is starting automatically...</p>
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

  // Show context form if we need user context and don't have analysis yet
  if (showContextForm && sessionId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserContextForm
          sessionId={sessionId}
          onComplete={handleContextComplete}
          onSkip={handleContextSkip}
        />
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
          <div className="flex gap-4 items-center">
            {/* Feature Flag Toggle */}
            {isHolisticEnabled && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-xs font-medium text-green-700">✨ Holistic AI</span>
                <span className="text-xs text-green-600">Enabled</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'visual' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100'
                }`}
              >
                {isHolisticEnabled ? '🧠 AI Prototypes' : '🎨 Visual Ideas'}
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
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {viewMode === 'visual' ? (
          // Visual Ideas view - always use Holistic approach
          <>
            {!analysisData?.id ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading analysis results...</p>
                </div>
              </div>
            ) : (
              <>
                {console.log('🚀 Rendering HolisticPrototypeViewer with:', { 
                  analysisId: analysisData?.id, 
                  contextId: userContext?.id, 
                  hasOriginalImage: !!sessionData?.images?.[0]?.file_path 
                })}
                <HolisticPrototypeViewer
                  analysisId={analysisData.id}
                  contextId={userContext?.id}
                  originalImage={sessionData?.images?.[0]?.file_path ? getImageUrl(sessionData.images[0].file_path) : undefined}
                />
              </>
            )}
          </>
        ) : (
          // Detailed analysis view with gallery and sidebar layout
          <>
            {console.log('📊 Detailed Analysis Debug:', {
              analysisData: analysisData,
              hasAnalysisData: !!analysisData,
              issuesCount: analysisData?.issues?.length || 0,
              suggestionsCount: analysisData?.suggestions?.length || 0,
              claudeAnalysis: analysisData?.claude_analysis,
              rawIssues: analysisData?.claude_analysis?.issues
            })}
            <EnhancedAnalysisResults 
              images={sessionData?.images?.map(img => ({
                url: getImageUrl(img.file_path),
                fileName: img.file_name,
                id: img.id
              })) || []}
              issues={analysisData?.issues || []}
              suggestions={analysisData?.suggestions || []}
              analysisMetadata={{
                ...analysisData?.enhanced_context,
                analysisId: analysisData?.id
              }}
              analysisId={analysisData?.id}
              onBack={() => window.history.back()}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default FigmantResultsPage;