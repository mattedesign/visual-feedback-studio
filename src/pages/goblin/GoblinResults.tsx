import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useImageLoader } from '@/hooks/goblin/useImageLoader';

// Studio Layout Components
import { StudioLayout } from '@/components/goblin/studio/StudioLayout';
import { StudioHeader } from '@/components/goblin/studio/StudioHeader';
import { ChatSidebar } from '@/components/goblin/studio/ChatSidebar';
import { MainCanvas } from '@/components/goblin/studio/MainCanvas';
import { PropertiesPanel } from '@/components/goblin/studio/PropertiesPanel';
import { FloatingToolbar } from '@/components/goblin/studio/FloatingToolbar';

// Type definitions matching the studio structure
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  message_type: string;
  created_at: string;
  referenced_images?: number[];
}

interface AnalysisImage {
  id: string;
  file_name: string;
  file_path: string;
  image_index: number;
  file_size?: number;
  dimensions?: { width: number; height: number };
  processing_status: string;
  screen_type?: string;
  signedUrl?: string;
  canvas_position: {
    x: number;
    y: number;
    zoom: number;
    rotation: number;
  };
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  feedback_type?: string;
  description?: string;
  created_at: string;
  image_id: string;
}

interface Insight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  priority: string;
  confidence_score: number;
}

interface PersonaData {
  analysis?: string;
  recommendations?: string[];
  biggestGripe?: string;
  whatMakesGoblinHappy?: string;
  goblinWisdom?: string;
  goblinPrediction?: string;
  wildCard?: string;
  experiments?: string[];
  issues?: Array<{
    id: string;
    type: string;
    description: string;
    impact: string;
    suggested_fix: string;
  }>;
  top_fix_summary?: string[];
  businessImpact?: string;
  implementation?: string;
  visualStrategy?: string[];
  competitiveVisualEdge?: string[];
  metrics?: string[];
  insights?: string;
  reflection?: string;
  visualReflections?: string[];
  emotionalImpact?: string;
  userStory?: string;
  empathyGaps?: string[];
  hypothesis?: string;
  madScience?: string;
  weirdFindings?: string;
  crazyIdeas?: string[];
  labNotes?: string;
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
  
  // Studio state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  
  // Use the robust image loader hook
  const { 
    images: rawImages, 
    loading: imagesLoading, 
    error: imageError, 
    retry: retryImages,
    hasAccessibleImages,
    accessibilityReport
  } = useImageLoader({ sessionId, autoLoad: true });

  // Transform raw images to studio format
  const images: AnalysisImage[] = rawImages.map((img, index) => ({
    id: img.id,
    file_name: img.fileName,
    file_path: img.filePath,
    image_index: index,
    file_size: img.fileSize,
    processing_status: img.uploadOrder !== undefined ? 'uploaded' : 'processing',
    screen_type: img.screenType,
    signedUrl: img.signedUrl,
    canvas_position: { x: 0, y: 0, zoom: 1.0, rotation: 0 }
  }));

  useEffect(() => {
    const loadResults = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from('goblin_analysis_results')
          .select(`
            *,
            goblin_analysis_sessions (
              *
            )
          `)
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        
        const latestResult = data?.[0] || null;
        if (!latestResult) throw new Error('No results found for this session');
        
        setResults(latestResult);
        
        // Initialize with welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: 'Welcome to Goblin UX Studio! 🎨\n\nI\'ve loaded your analysis session. You can:\n• View images in the center canvas\n• Ask me questions about your designs\n• Create annotations by enabling annotation mode\n• Switch between grid and single image views\n\nWhat would you like to explore first?',
          message_type: 'text',
          created_at: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
        
      } catch (error) {
        console.error('Failed to load results:', error);
        toast.error('Failed to load analysis results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [sessionId]);

  // Extract persona data from results
  const session = results?.goblin_analysis_sessions;
  const personaData: PersonaData = results?.persona_feedback 
    ? (results.persona_feedback[session?.persona_type] || results.persona_feedback)
    : {};

  // Generate insights from persona data
  useEffect(() => {
    if (personaData && Object.keys(personaData).length > 0 && insights.length === 0) {
      const generatedInsights: Insight[] = [];

      if (personaData.biggestGripe) {
        generatedInsights.push({
          id: 'gripe',
          insight_type: 'usability',
          title: 'Primary Usability Concern',
          description: personaData.biggestGripe,
          priority: 'high',
          confidence_score: 0.9
        });
      }

      if (personaData.goblinWisdom) {
        generatedInsights.push({
          id: 'wisdom',
          insight_type: 'general',
          title: 'Goblin Wisdom',
          description: personaData.goblinWisdom,
          priority: 'medium',
          confidence_score: 0.85
        });
      }

      if (generatedInsights.length > 0) {
        setInsights(generatedInsights);
      }
    }
  }, [personaData, insights.length]);

  const handleSendMessage = async (content: string) => {
    if (!session) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      message_type: 'text',
      created_at: new Date().toISOString(),
      referenced_images: selectedImageIndex !== null ? [selectedImageIndex] : []
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let aiResponse = '';
      
      if (images.length === 0) {
        aiResponse = 'I see your analysis session is loaded, but no images are currently visible. This might be due to processing or access issues.';
      } else if (selectedImageIndex !== null) {
        const selectedImage = images[selectedImageIndex];
        aiResponse = `I'm analyzing "${selectedImage.file_name}" for you. Based on the Goblin analysis, here are some key insights from your session.`;
      } else {
        aiResponse = `I can see your ${images.length} uploaded images in grid view. The Goblin has analyzed your designs. Click on any image to dive deeper!`;
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        message_type: 'text',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const uploadMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Image upload in the studio view is coming soon! For now, you can upload images through the main Goblin analysis flow.',
      message_type: 'text',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, uploadMessage]);
  };

  const handleBatchImageUpload = async (files: File[]) => {
    handleImageUpload(files[0]);
  };

  const handleCanvasStateChange = useCallback((canvasState: any) => {
    if (canvasState.zoom) {
      setZoom(canvasState.zoom);
    }
  }, []);

  const handleAnnotationCreate = (imageIndex: number, area: { x: number; y: number; width: number; height: number }, annotationData?: { label: string; feedback_type: string; description: string }) => {
    if (selectedImageIndex !== null) {
      const selectedImage = images[selectedImageIndex];
      const newAnnotation: Annotation = {
        id: crypto.randomUUID(),
        ...area,
        label: annotationData?.label || `Area ${annotations.filter(a => a.image_id === selectedImage.id).length + 1}`,
        feedback_type: annotationData?.feedback_type || '',
        description: annotationData?.description || '',
        created_at: new Date().toISOString(),
        image_id: selectedImage.id
      };
      
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  };

  const handleAnnotationUpdate = (annotationId: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(annotation => 
      annotation.id === annotationId ? { ...annotation, ...updates } : annotation
    ));
  };

  const handleAnnotationDelete = (annotationId: string) => {
    setAnnotations(prev => prev.filter(annotation => annotation.id !== annotationId));
  };

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.2, 5.0);
    setZoom(newZoom);
    handleCanvasStateChange({ zoom: newZoom });
  }, [zoom, handleCanvasStateChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
    handleCanvasStateChange({ zoom: newZoom });
  }, [zoom, handleCanvasStateChange]);

  const handleReset = useCallback(() => {
    setZoom(1.0);
    handleCanvasStateChange({ zoom: 1.0, rotation: 0, panPosition: { x: 0, y: 0 } });
  }, [handleCanvasStateChange]);

  const handleToggleView = useCallback(() => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex(null);
    } else if (images.length > 0) {
      setSelectedImageIndex(0);
    }
  }, [selectedImageIndex, images.length]);

  const selectedImageAnnotations = selectedImageIndex !== null && images[selectedImageIndex] 
    ? annotations.filter(a => a.image_id === images[selectedImageIndex].id)
    : [];

  const isGridView = selectedImageIndex === null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-card border border-border shadow-sm flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Loading Goblin Studio
          </h1>
          <p className="text-muted-foreground">
            Preparing your analysis workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-background">
      <FloatingToolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        annotationMode={annotationMode}
        onAnnotationModeChange={setAnnotationMode}
        isGridView={isGridView}
        hasImages={images.length > 0}
        onToggleView={handleToggleView}
      />

      <StudioLayout
        header={
          <StudioHeader
            sessionTitle={session?.title || 'Goblin Analysis Session'}
            onNewSession={() => navigate('/goblin')}
            onSaveSession={() => toast.success('Session saved!')}
            onShareSession={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Session link copied to clipboard!');
            }}
            onSettings={() => toast.info('Settings coming soon!')}
          />
        }
        chatPanel={
          <ChatSidebar
            messages={messages}
            onSendMessage={handleSendMessage}
            onUploadImage={handleImageUpload}
            isLoading={isLoading}
          />
        }
        mainCanvas={
          <MainCanvas
            images={images}
            selectedImageIndex={selectedImageIndex}
            onImageSelect={setSelectedImageIndex}
            onAnnotationCreate={handleAnnotationCreate}
            onCanvasStateChange={handleCanvasStateChange}
            annotationMode={annotationMode}
            onImageUpload={handleImageUpload}
            onBatchImageUpload={handleBatchImageUpload}
            annotations={annotations}
          />
        }
        propertiesPanel={
          <PropertiesPanel
            selectedImage={selectedImageIndex !== null ? images[selectedImageIndex] : null}
            insights={insights}
            annotations={selectedImageAnnotations}
            onAnnotationUpdate={handleAnnotationUpdate}
            onAnnotationDelete={handleAnnotationDelete}
            sessionInfo={{
              title: session?.title || 'Analysis Session',
              status: session?.status || 'active',
              imageCount: images.length
            }}
            allImages={images}
            allAnnotations={annotations}
          />
        }
      />
    </div>
  );
};

export default GoblinResults;