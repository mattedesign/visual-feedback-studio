import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { useImageLoader } from '@/hooks/goblin/useImageLoader';
// ✅ REMOVED: parseNestedJson import as per Nuclear Fix

// ✅ Tab components
import DetailedModeView from '@/components/goblin/DetailedModeView';
import ClarityChat from '@/components/goblin/ClarityChat';
import SummaryView from '@/components/goblin/SummaryView';
import { NavigationProvider } from '@/contexts/NavigationContext';

// ✅ Maturity components
import { MaturityScoreDashboard } from '@/components/goblin/maturity/MaturityScoreDashboard';
import { ImprovementRoadmap } from '@/components/goblin/maturity/ImprovementRoadmap';
import { AchievementShowcase } from '@/components/goblin/maturity/AchievementShowcase';

// Type definition for persona data
interface PersonaData {
  analysis?: string;
  recommendations?: string[];
  biggestGripe?: string;
  whatMakesGoblinHappy?: string;
  goblinWisdom?: string;
  goblinPrediction?: string;
  wildCard?: string;
  experiments?: string[];
  // Strategic persona specific fields
  businessImpact?: string;
  implementation?: string;
  visualStrategy?: string[];
  competitiveVisualEdge?: string[];
  metrics?: string[];
  // Mirror persona specific fields
  insights?: string;
  reflection?: string;
  visualReflections?: string[];
  emotionalImpact?: string;
  userStory?: string;
  empathyGaps?: string[];
  // Mad scientist persona specific fields
  hypothesis?: string;
  madScience?: string;
  weirdFindings?: string;
  crazyIdeas?: string[];
  labNotes?: string;
  // Executive persona specific fields
  executiveSummary?: string;
  businessRisks?: string[];
  roiImpact?: string;
  stakeholderConcerns?: string;
  strategicRecommendations?: string[];
  competitiveImplications?: string;
}

const GoblinResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'maturity' | 'clarity'>('summary');
  const [chatFeedbackAnchors, setChatFeedbackAnchors] = useState<{[messageId: string]: any[]}>({});
  const [totalImages, setTotalImages] = useState(0);

  // Function to extract maximum screen number from analysis text
  const extractMaxScreenNumber = (analysisData: any): number => {
    if (!analysisData) return 0;
    
    let maxScreenNumber = 0;
    const screenRegex = /\b(?:screen|Screen)\s+(\d+)\b/gi;
    
    // Search through all text content in the analysis data
    const searchInObject = (obj: any) => {
      if (typeof obj === 'string') {
        let match;
        while ((match = screenRegex.exec(obj)) !== null) {
          const screenNumber = parseInt(match[1], 10);
          if (screenNumber > maxScreenNumber) {
            maxScreenNumber = screenNumber;
          }
        }
        // Reset regex lastIndex for next search
        screenRegex.lastIndex = 0;
      } else if (obj && typeof obj === 'object') {
        Object.values(obj).forEach(value => searchInObject(value));
      }
    };
    
    searchInObject(analysisData);
    return maxScreenNumber;
  };

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

  // Helper function to clean JSON markdown blocks from strings
  const cleanMarkdownJson = (text: string): string => {
    if (typeof text !== 'string') return text;
    
    // Remove JSON markdown code blocks: ```json\n{...}\n```
    let cleaned = text.replace(/```json\s*\n?({[\s\S]*?})\s*\n?```/g, (match, jsonContent) => {
      try {
        const parsed = JSON.parse(jsonContent);
        // If the JSON contains an "analysis" field, return just that value
        if (parsed.analysis) {
          return parsed.analysis;
        }
        // Otherwise return the whole JSON content as string
        return jsonContent;
      } catch (e) {
        // If parsing fails, return the content without the markdown wrapper
        return jsonContent;
      }
    });
    
    // Also handle plain markdown code blocks: ```\n...\n```
    cleaned = cleaned.replace(/```\s*\n?([\s\S]*?)\s*\n?```/g, '$1');
    
    return cleaned.trim();
  };

  // Simplified approach: extract persona data from results.persona_feedback
  const extractPersonaData = (data: any, personaType: string, fallbackSummary: string): PersonaData => {
    console.log('🔍 Extracting persona data for:', personaType, data);
    
    if (!data) {
      console.warn('⚠️ No data provided, using fallback');
      return { analysis: fallbackSummary };
    }

    // Direct persona type access or use data as-is
    const personaData = data[personaType] || data;
    
    // If it's a string, treat as analysis and clean markdown
    if (typeof personaData === 'string') {
      console.log('✅ Using string data as analysis, cleaning markdown');
      const cleanedAnalysis = cleanMarkdownJson(personaData);
      return { analysis: cleanedAnalysis };
    }

    // If it's an object, clean any string fields that might contain markdown
    if (typeof personaData === 'object' && personaData !== null) {
      const cleanedData = { ...personaData };
      
      // Clean common fields that might contain markdown
      const fieldsToClean = ['analysis', 'biggestGripe', 'goblinWisdom', 'goblinPrediction', 'whatMakesGoblinHappy'];
      
      fieldsToClean.forEach(field => {
        if (typeof cleanedData[field] === 'string') {
          cleanedData[field] = cleanMarkdownJson(cleanedData[field]);
        }
      });
      
      // Clean recommendations array if it exists
      if (Array.isArray(cleanedData.recommendations)) {
        cleanedData.recommendations = cleanedData.recommendations.map((rec: any) => {
          if (typeof rec === 'string') {
            return cleanMarkdownJson(rec);
          }
          if (typeof rec === 'object' && rec !== null) {
            const cleanedRec = { ...rec };
            Object.keys(cleanedRec).forEach(key => {
              if (typeof cleanedRec[key] === 'string') {
                cleanedRec[key] = cleanMarkdownJson(cleanedRec[key]);
              }
            });
            return cleanedRec;
          }
          return rec;
        });
      }
      
      console.log('✅ Using cleaned object data');
      return cleanedData;
    }

    // Use the data as-is
    console.log('✅ Using persona data as-is');
    return personaData || { analysis: fallbackSummary };
  };
  
  // Parse the persona feedback correctly with proper typing
  let personaData: PersonaData = {
    analysis: '',
    recommendations: [],
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

  if (rawPersonaData) {
    personaData = extractPersonaData(rawPersonaData, session?.persona_type, results?.synthesis_summary);
    console.log('✅ Successfully extracted persona data');
  } else {
    // Complete fallback
    personaData = extractPersonaData(null, session?.persona_type, results?.synthesis_summary);
    console.log('⚠️ FALLBACK: No valid persona data found, using defaults');
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

  // Extract total images count from analysis data and update navigation context
  useEffect(() => {
    if (results && personaData) {
      const extractedScreenCount = extractMaxScreenNumber(results);
      const finalImageCount = Math.max(extractedScreenCount, images.length);
      console.log('🖼️ Setting total images:', {
        extractedFromAnalysis: extractedScreenCount,
        actualImagesLoaded: images.length,
        finalCount: finalImageCount
      });
      setTotalImages(finalImageCount);
    }
  }, [results, personaData, images.length]);

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

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Analysis...</h2>
          <p className="text-muted-foreground mb-4">The goblin is examining your design with supernatural intensity...</p>
          
          <div className="bg-gray-100 rounded-full h-2 mb-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-1000 animate-pulse"></div>
          </div>
          <p className="text-xs text-muted-foreground">
            Processing images and running analysis pipeline...
          </p>
        </div>
      </div>
    );
  }

  // Enhanced no results state
  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">🧙‍♂️❓</div>
          <h2 className="text-xl font-semibold mb-2">No Analysis Found</h2>
          <p className="text-muted-foreground mb-4">
            The goblin couldn't find any analysis results for this session.
          </p>
          
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md"
            >
              Refresh Results
            </button>
            
            <button 
              onClick={() => window.location.href = '/goblin'} 
              className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md"
            >
              Start New Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading state for images
  const isImagesLoading = imagesLoading && images.length === 0;
  
  // Show image error with retry option
  const showImageError = imageError && !isImagesLoading;

  // Get annotation count for badge
  const annotationCount = results?.annotations?.length || 0;

  return (
    <NavigationProvider 
      onTabChange={setActiveTab} 
      onImageChange={setCurrentImageIndex}
      initialTotalImages={totalImages}
    >
      <div className="min-h-screen bg-white">
        <div className="flex flex-col items-start flex-1 self-stretch rounded-[20px] max-w-7xl mx-auto px-8 py-6">
          
           <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'summary' | 'detailed' | 'maturity' | 'clarity')}>
            <TabsList className="sticky top-0 z-10 flex w-auto items-center gap-4 rounded-xl border border-gray-200 bg-gray-100 p-1 backdrop-blur-sm" style={{ boxShadow: '0px 1px 1.9px 0px rgba(50, 50, 50, 0.10) inset' }}>
              <TabsTrigger 
                value="summary" 
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-[0px_1.25px_3px_0px_rgba(50,50,50,0.10),0px_1.25px_1px_0px_#FFF_inset]"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger 
                value="detailed" 
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-[0px_1.25px_3px_0px_rgba(50,50,50,0.10),0px_1.25px_1px_0px_#FFF_inset]"
              >
                Detailed ({annotationCount})
              </TabsTrigger>
              <TabsTrigger 
                value="maturity" 
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-[0px_1.25px_3px_0px_rgba(50,50,50,0.10),0px_1.25px_1px_0px_#FFF_inset]"
              >
                <Trophy className="w-4 h-4" />
                Maturity Score
              </TabsTrigger>
              <TabsTrigger 
                value="clarity" 
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-[0px_1.25px_3px_0px_rgba(50,50,50,0.10),0px_1.25px_1px_0px_#FFF_inset]"
              >
                Clarity Chat
              </TabsTrigger>
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

          <TabsContent value="maturity" className="mt-8">
            <div className="space-y-6">
              <MaturityScoreDashboard />
              <ImprovementRoadmap />
              <AchievementShowcase />
              
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 text-center">
                <h3 className="font-semibold mb-2">Ready to improve your score?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload a revised design to see your progress
                </p>
                <Button onClick={() => navigate('/goblin')}>
                  Run New Analysis
                </Button>
              </Card>
            </div>
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
    </NavigationProvider>
  );
};

export default GoblinResults;