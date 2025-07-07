import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ✅ Tab components
import DetailedModeView from '@/components/goblin/DetailedModeView';
import ClarityChat from '@/components/goblin/ClarityChat';
import SummaryView from '@/components/goblin/SummaryView';
import { GoblinNavigation } from '@/components/goblin/GoblinNavigation';

const GoblinResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [results, setResults] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'clarity'>('summary');

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from('goblin_analysis_results')
          .select(`*, goblin_analysis_sessions (*)`)
          .eq('session_id', sessionId)
          .single();

        if (error) throw error;
        setResults(data);

        const { data: imageData, error: imageError } = await supabase
          .from('goblin_analysis_images')
          .select('*')
          .eq('session_id', sessionId)
          .order('upload_order');

        if (imageError) throw imageError;
        setImages(imageData);
      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  // Extract session and persona data early for use in handlers
  const session = results?.goblin_analysis_sessions;
  const personaData = results?.persona_feedback?.[session?.persona_type] || {};

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
    <div className="p-6 max-w-7xl mx-auto">
      <GoblinNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        annotationCount={annotationCount}
      />

      {activeTab === 'summary' && (
        <SummaryView
          results={results}
          session={session}
          personaData={personaData}
          onExport={handleExport}
          onCopyLink={handleCopyLink}
          copied={copied}
        />
      )}

      {activeTab === 'detailed' && (
        <DetailedModeView
          images={images}
          session={session}
          results={results}
          showAnnotations={showAnnotations}
          currentImageIndex={currentImageIndex}
          setCurrentImageIndex={setCurrentImageIndex}
          setShowAnnotations={setShowAnnotations}
        />
      )}

      {activeTab === 'clarity' && (
        <ClarityChat
          session={session}
          personaData={personaData}
        />
      )}
    </div>
  );
};

export default GoblinResults;
