import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { logImageDebugInfo } from '@/utils/imageDebugUtils';

// ✅ Tab components
import DetailedModeView from '@/components/goblin/DetailedModeView';
import ClarityChat from '@/components/goblin/ClarityChat';
import SummaryView from '@/components/goblin/SummaryView';

const GoblinResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [results, setResults] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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

        // ✅ USE HYDRATION: Call edge function instead of direct database query
        const { data: imageResponse, error: imageError } = await supabase.functions.invoke('get-images-by-session', {
          body: { sessionId }
        });

        if (imageError) throw imageError;
        
        const images = imageResponse?.validImages || [];
        
        // ✅ HYDRATION DEBUGGING: Add requested console.log
        console.log("🧠 Hydration response", images);
        console.log('🎯 GoblinResults - Hydrated images:', images.length);
        console.log('🧙‍♂️ Goblin magic summary:', imageResponse?.summary);
        
        // Enhanced debug logging
        if (images && images.length > 0) {
          logImageDebugInfo(images, 'GoblinResults - Hydrated Images');
        }
        
        setImages(images);
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
  // Fix: Handle both string and object formats for persona feedback
  const rawPersonaData = results?.persona_feedback?.[session?.persona_type];
  
  // Parse the persona feedback correctly
  let personaData = {};
  if (typeof rawPersonaData === 'string') {
    // If it's just a string, use it as the analysis
    personaData = { 
      analysis: rawPersonaData || results?.synthesis_summary || 'Analysis completed'
    };
  } else if (rawPersonaData) {
    // If it's an object, use it as-is
    personaData = rawPersonaData;
  } else {
    // Fallback to synthesis summary
    personaData = {
      analysis: results?.synthesis_summary || 'Analysis completed'
    };
  }

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

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!results) return <div className="p-6 text-center">No results found.</div>;

  // Get annotation count for badge
  const annotationCount = results?.annotations?.length || 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col items-start flex-1 self-stretch rounded-[20px] max-w-7xl mx-auto px-8 py-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'summary' | 'detailed' | 'clarity')}>
          <TabsList className="grid w-full grid-cols-3 bg-muted border-0 p-1">
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