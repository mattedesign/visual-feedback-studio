
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useImageLoader } from '@/hooks/goblin/useImageLoader';

// ✅ Tab components
import DetailedModeView from '@/components/goblin/DetailedModeView';
import ClarityChat from '@/components/goblin/ClarityChat';
import SummaryView from '@/components/goblin/SummaryView';
import { ImageLoadingDebug } from '@/components/goblin/debug/ImageLoadingDebug';

// Type definition for persona data
interface PersonaData {
  analysis?: string;
  recommendations?: string | string[];
  biggestGripe?: string;
  whatMakesGoblinHappy?: string;
  goblinWisdom?: string;
  goblinPrediction?: string;
  wildCard?: string;
  experiments?: string | string[];
  // Strategic persona specific fields
  businessImpact?: string;
  implementation?: string;
  visualStrategy?: string[];
  competitiveVisualEdge?: string[];
  metrics?: string[];
}

const GoblinResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Use the robust image loader hook
  const { 
    images, 
    loading: imagesLoading, 
    error: imageError, 
    retry: retryImages,
    hasAccessibleImages,
    accessibilityReport
  } = useImageLoader({ sessionId, autoLoad: true });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'clarity'>('summary');
  const [chatFeedbackAnchors, setChatFeedbackAnchors] = useState<{[messageId: string]: any[]}>({});

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionId) return;

      try {
        console.log('🔍 Loading results for session:', sessionId);
        
        // Fix: Handle multiple results by getting the most recent one
        const { data, error } = await supabase
          .from('goblin_analysis_results')
          .select(`*, goblin_analysis_sessions (*)`)
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        console.log('📊 Query response:', { data, error });
        
        if (error) {
          console.error('❌ Database error:', error);
          throw error;
        }
        
        // Get the first (most recent) result
        const latestResult = data?.[0] || null;
        
        console.log('🎯 Latest result:', latestResult);
        console.log('🧠 Persona feedback:', latestResult?.persona_feedback);
        console.log('📝 Synthesis summary:', latestResult?.synthesis_summary);
        
        if (!latestResult) {
          throw new Error('No results found for this session');
        }
        
        setResults(latestResult);
        
        // Images are now handled by useImageLoader hook
      } catch (error) {
        console.error('Failed to load results:', error);
        toast.error('Failed to load analysis results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  // Extract session and persona data early for use in handlers
  const session = results?.goblin_analysis_sessions;
  
  // 🔍 DEBUG: Enhanced logging for data extraction debugging
  console.log('🔍 GOBLIN RESULTS - DATA EXTRACTION DEBUG:', {
    hasResults: !!results,
    hasSession: !!session,
    personaType: session?.persona_type,
    hasPersonaFeedback: !!results?.persona_feedback,
    personaFeedbackKeys: results?.persona_feedback ? Object.keys(results.persona_feedback) : [],
    fullPersonaFeedback: results?.persona_feedback,
    hasSynthesis: !!results?.synthesis_summary,
    sessionId: sessionId
  });
  
  // Additional detailed logging for debugging
  if (results?.persona_feedback) {
    console.log('📊 DETAILED PERSONA FEEDBACK ANALYSIS:', {
      personaFeedbackType: typeof results.persona_feedback,
      personaFeedbackStringified: JSON.stringify(results.persona_feedback, null, 2),
      personaFeedbackKeys: Object.keys(results.persona_feedback),
      firstValueType: results.persona_feedback[Object.keys(results.persona_feedback)[0]] ? typeof results.persona_feedback[Object.keys(results.persona_feedback)[0]] : 'none',
      firstValuePreview: results.persona_feedback[Object.keys(results.persona_feedback)[0]] ? JSON.stringify(results.persona_feedback[Object.keys(results.persona_feedback)[0]]).substring(0, 200) : 'none'
    });
  }
  
  // Enhanced persona data extraction with comprehensive debugging
  let rawPersonaData = null;
  
  console.log('🔍 PERSONA DATA EXTRACTION - Starting extraction:', {
    hasPersonaFeedback: !!results?.persona_feedback,
    personaType: session?.persona_type,
    personaFeedbackStructure: results?.persona_feedback ? Object.keys(results.persona_feedback) : [],
    fullPersonaFeedback: results?.persona_feedback
  });
  
  // Strategy 1: Try direct persona type access
  if (results?.persona_feedback && session?.persona_type) {
    rawPersonaData = results.persona_feedback[session.persona_type];
    console.log('🎯 Strategy 1 - Direct access for persona:', session.persona_type, {
      found: !!rawPersonaData,
      dataType: typeof rawPersonaData,
      dataKeys: rawPersonaData && typeof rawPersonaData === 'object' ? Object.keys(rawPersonaData) : [],
      rawData: rawPersonaData
    });
  }
  
  // Strategy 2: If Strategy 1 failed, try first available persona data
  if (!rawPersonaData && results?.persona_feedback) {
    const availablePersonas = Object.keys(results.persona_feedback);
    if (availablePersonas.length > 0) {
      const firstPersona = availablePersonas[0];
      rawPersonaData = results.persona_feedback[firstPersona];
      console.log('🎯 Strategy 2 - Using first available persona:', firstPersona, {
        found: !!rawPersonaData,
        dataType: typeof rawPersonaData,
        dataKeys: rawPersonaData && typeof rawPersonaData === 'object' ? Object.keys(rawPersonaData) : [],
        rawData: rawPersonaData
      });
    }
  }
  
  // Strategy 3: Direct analysis property fallback
  if (!rawPersonaData && results?.persona_feedback) {
    rawPersonaData = results.persona_feedback;
    console.log('🎯 Strategy 3 - Using direct persona_feedback:', {
      found: !!rawPersonaData,
      dataType: typeof rawPersonaData,
      dataKeys: rawPersonaData && typeof rawPersonaData === 'object' ? Object.keys(rawPersonaData) : [],
      rawData: rawPersonaData
    });
  }
  
  console.log('🔍 Final rawPersonaData extraction result:', {
    found: !!rawPersonaData,
    dataType: typeof rawPersonaData,
    isObject: rawPersonaData && typeof rawPersonaData === 'object',
    keys: rawPersonaData && typeof rawPersonaData === 'object' ? Object.keys(rawPersonaData) : [],
    sample: rawPersonaData
  });
  
  // Parse the persona feedback correctly with proper typing
  let personaData: PersonaData = {
    analysis: '',
    recommendations: '',
    biggestGripe: '',
    whatMakesGoblinHappy: '',
    goblinWisdom: '',
    goblinPrediction: ''
  };
  
  console.log('🔍 DEBUGGING RAW PERSONA DATA:', {
    rawPersonaDataType: typeof rawPersonaData,
    rawPersonaDataValue: rawPersonaData,
    isString: typeof rawPersonaData === 'string',
    stringLength: typeof rawPersonaData === 'string' ? rawPersonaData.length : 'N/A',
    stringPreview: typeof rawPersonaData === 'string' ? rawPersonaData.substring(0, 100) : 'N/A'
  });

  if (typeof rawPersonaData === 'string') {
    // Try to parse JSON string first
    try {
      const parsed = JSON.parse(rawPersonaData);
      if (parsed && typeof parsed === 'object') {
        personaData = {
          analysis: parsed.analysis || rawPersonaData,
          recommendations: parsed.recommendations || '',
          biggestGripe: parsed.biggestGripe || '',
          whatMakesGoblinHappy: parsed.whatMakesGoblinHappy || '',
          goblinWisdom: parsed.goblinWisdom || '',
          goblinPrediction: parsed.goblinPrediction || '',
          businessImpact: parsed.businessImpact || '',
          implementation: parsed.implementation || '',
          visualStrategy: parsed.visualStrategy || [],
          competitiveVisualEdge: parsed.competitiveVisualEdge || [],
          metrics: parsed.metrics || []
        };
        console.log('✅ PARSED JSON STRING: Successfully extracted structured data', {
          analysisLength: personaData.analysis?.length,
          hasOtherFields: !!(personaData.biggestGripe || personaData.goblinWisdom)
        });
      } else {
        throw new Error('Not a valid object');
      }
    } catch (parseError) {
      console.log('⚠️ JSON PARSE FAILED:', parseError.message, 'Raw data:', rawPersonaData.substring(0, 200));
      
      // Check if it contains JSON-like structure and extract the analysis value
      const jsonMatch = rawPersonaData.match(/"analysis":\s*"([^"]+)"/);
      if (jsonMatch && jsonMatch[1]) {
        console.log('✅ EXTRACTED ANALYSIS FROM JSON STRING');
        personaData = { 
          ...personaData,
          analysis: jsonMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
        };
      } else {
        // If it's just a plain string, use it as the analysis
        personaData = { 
          ...personaData,
          analysis: rawPersonaData || results?.synthesis_summary || 'Analysis completed'
        };
        console.log('✅ PLAIN STRING: Using raw string as analysis');
      }
    }
  } else if (rawPersonaData && typeof rawPersonaData === 'object') {
    // Check if the object has a nested analysis string that might be JSON
    let analysisValue = rawPersonaData.analysis;
    let nestedRecommendations = rawPersonaData.recommendations || [];
    let nestedBusinessImpact = '';
    let nestedImplementation = '';
    let nestedVisualStrategy = [];
    let nestedCompetitiveVisualEdge = [];
    
    if (typeof analysisValue === 'string' && analysisValue.includes('"analysis":')) {
      console.log('🔍 Found nested JSON in analysis field, trying to parse...');
      console.log('🔍 Raw analysis value:', analysisValue.substring(0, 200) + '...');
      try {
        const parsed = JSON.parse(analysisValue);
        console.log('🔍 Parsed nested JSON:', parsed);
        console.log('🔍 Parsed recommendations:', parsed.recommendations);
        
        analysisValue = parsed.analysis || analysisValue;
        // Extract all nested fields for strategic persona
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          nestedRecommendations = parsed.recommendations;
          console.log('✅ Extracted nested recommendations:', nestedRecommendations);
        }
        if (parsed.businessImpact) {
          nestedBusinessImpact = parsed.businessImpact;
        }
        if (parsed.implementation) {
          nestedImplementation = parsed.implementation;
        }
        if (parsed.visualStrategy && Array.isArray(parsed.visualStrategy)) {
          nestedVisualStrategy = parsed.visualStrategy;
        }
        if (parsed.competitiveVisualEdge && Array.isArray(parsed.competitiveVisualEdge)) {
          nestedCompetitiveVisualEdge = parsed.competitiveVisualEdge;
        }
        console.log('✅ Successfully parsed nested JSON, extracted analysis and strategic fields');
      } catch (nestedParseError) {
        console.log('⚠️ Failed to parse nested JSON, using as-is:', nestedParseError.message);
      }
    }
    
    // Enhanced object property extraction with detailed logging
    const extractedAnalysis = analysisValue || results?.synthesis_summary || 'Analysis completed';
    const extractedRecommendations = nestedRecommendations.length > 0 ? nestedRecommendations : (Array.isArray(rawPersonaData.recommendations) && rawPersonaData.recommendations.length > 0 ? rawPersonaData.recommendations : []);
    const extractedBiggestGripe = rawPersonaData.biggestGripe || rawPersonaData.wildCard || '';
    const extractedWhatMakesGoblinHappy = rawPersonaData.whatMakesGoblinHappy || 
                                         (Array.isArray(rawPersonaData.experiments) ? rawPersonaData.experiments.join(", ") : rawPersonaData.experiments) || '';
    const extractedGoblinWisdom = rawPersonaData.goblinWisdom || '';
    const extractedGoblinPrediction = rawPersonaData.goblinPrediction || '';
    
    // Extract strategic persona specific fields
    const extractedBusinessImpact = nestedBusinessImpact || rawPersonaData.businessImpact || '';
    const extractedImplementation = nestedImplementation || rawPersonaData.implementation || '';
    const extractedVisualStrategy = nestedVisualStrategy.length > 0 ? nestedVisualStrategy : (rawPersonaData.visualStrategy || []);
    const extractedCompetitiveVisualEdge = nestedCompetitiveVisualEdge.length > 0 ? nestedCompetitiveVisualEdge : (rawPersonaData.competitiveVisualEdge || []);
    const extractedMetrics = rawPersonaData.metrics || [];
    
    personaData = {
      analysis: extractedAnalysis,
      recommendations: extractedRecommendations,
      biggestGripe: extractedBiggestGripe,
      whatMakesGoblinHappy: extractedWhatMakesGoblinHappy,
      goblinWisdom: extractedGoblinWisdom,
      goblinPrediction: extractedGoblinPrediction,
      businessImpact: extractedBusinessImpact,
      implementation: extractedImplementation,
      visualStrategy: extractedVisualStrategy,
      competitiveVisualEdge: extractedCompetitiveVisualEdge,
      metrics: extractedMetrics
    };
    
    console.log('✅ OBJECT FORMAT: Extracted persona data successfully');
  } else {
    // Fallback to synthesis summary
    personaData = {
      ...personaData,
      analysis: results?.synthesis_summary || 'Analysis completed'
    };
    console.log('⚠️ FALLBACK: Using synthesis_summary as analysis');
  }
  
  console.log('🎉 FINAL PERSONA DATA:', {
    hasAnalysis: !!personaData.analysis,
    analysisLength: personaData.analysis?.length || 0,
    hasBiggestGripe: !!personaData.biggestGripe,
    hasGoblinWisdom: !!personaData.goblinWisdom,
    hasGoblinPrediction: !!personaData.goblinPrediction,
    recommendationsCount: Array.isArray(personaData.recommendations) ? personaData.recommendations.length : 0,
    recommendations: personaData.recommendations
  });

  const handleExport = () => {
    if (!results || !session || !personaData) return;
    const exportData = {
      session: session.title,
      date: new Date().toISOString(),
      persona: session.persona_type,
      analysis: personaData.analysis,
      recommendations: personaData.recommendations,
      gripeLevel: results.goblin_gripe_level,
      biggestGripe: personaData.biggestGripe,
      whatMakesGoblinHappy: personaData.whatMakesGoblinHappy,
      goblinWisdom: personaData.goblinWisdom,
      goblinPrediction: personaData.goblinPrediction,
      priorityMatrix: results.priority_matrix,
      synthesissSummary: results.synthesis_summary
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `goblin-analysis-${session.id}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Analysis exported! 📥');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied! Share your goblin wisdom! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleChatFeedbackUpdate = (messageId: string, feedbackType: string, data: any) => {
    setChatFeedbackAnchors(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), { type: feedbackType, data, timestamp: new Date() }]
    }));
    
    // If user clicked "Add to Detailed", switch to detailed tab
    if (feedbackType === 'anchor') {
      setActiveTab('detailed');
    }
  };

  const getGripeEmoji = (level: string) => {
    switch(level) {
      case 'low': return '😤';
      case 'medium': return '🤬';
      case 'rage-cranked': return '🌋';
      default: return '👾';
    }
  };

  if (loading) return <div className="p-6 text-center">Loading analysis results...</div>;
  if (!results) return <div className="p-6 text-center">No results found.</div>;
  
  // Show loading state for images
  const isImagesLoading = imagesLoading && images.length === 0;
  
  // Show image error with retry option
  const showImageError = imageError && !isImagesLoading;

  // Get annotation count for badge
  const annotationCount = results?.annotations?.length || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-start flex-1 self-stretch rounded-[20px] max-w-7xl mx-auto px-8 py-6">
        {/* Image Loading Debug Component */}
        <div className="w-full mb-6">
          <ImageLoadingDebug
            images={images}
            loading={imagesLoading}
            error={imageError}
            retryCount={accessibilityReport?.total || 0}
            accessibilityReport={accessibilityReport}
            onRetry={retryImages}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'summary' | 'detailed' | 'clarity')}>
          <TabsList className="sticky top-0 z-10 grid w-full grid-cols-3 bg-muted border-0 p-1 backdrop-blur-sm">
            <TabsTrigger value="summary" className="text-sm font-medium">Summary</TabsTrigger>
            <TabsTrigger value="detailed" className="text-sm font-medium">Detailed ({annotationCount})</TabsTrigger>
            <TabsTrigger value="clarity" className="text-sm font-medium">Clarity Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-8">
            <SummaryView
              results={results}
              session={session}
              personaData={personaData}
              onExport={handleExport}
              onCopyLink={handleCopyLink}
              copied={copied}
              chatFeedbackAnchors={chatFeedbackAnchors}
            />
          </TabsContent>

          <TabsContent value="detailed" className="mt-8">
            {isImagesLoading && (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <div className="animate-spin mr-3 h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                Loading images... ({accessibilityReport.total > 0 ? `${accessibilityReport.total} found` : 'searching'})
              </div>
            )}
            
            {showImageError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-800 font-medium">Failed to load images</p>
                    <p className="text-red-600 text-sm mt-1">{imageError}</p>
                    {accessibilityReport.total > 0 && (
                      <p className="text-red-600 text-xs mt-1">
                        Found {accessibilityReport.total} images, {accessibilityReport.accessible} accessible
                      </p>
                    )}
                  </div>
                  <button
                    onClick={retryImages}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            {!hasAccessibleImages && images.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-medium">Image accessibility issues detected</p>
                <p className="text-yellow-600 text-sm mt-1">
                  {accessibilityReport.inaccessible} of {accessibilityReport.total} images cannot be displayed properly.
                </p>
              </div>
            )}
            
            <DetailedModeView
              images={images}
              session={session}
              results={results}
              showAnnotations={showAnnotations}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              setShowAnnotations={setShowAnnotations}
              chatFeedbackAnchors={chatFeedbackAnchors}
            />
          </TabsContent>

          <TabsContent value="clarity" className="mt-8">
            <ClarityChat
              session={session}
              personaData={personaData}
              onFeedbackUpdate={handleChatFeedbackUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GoblinResults;
