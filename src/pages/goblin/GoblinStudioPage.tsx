import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudioLayout } from '@/components/goblin/studio/StudioLayout';
import { StudioHeader } from '@/components/goblin/studio/StudioHeader';
import { ChatInterface } from '@/components/goblin/studio/ChatInterface';
import { MainCanvas } from '@/components/goblin/studio/MainCanvas';
import { PropertiesPanel } from '@/components/goblin/studio/PropertiesPanel';
import { useStudioSession } from '@/hooks/goblin/useStudioSession';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type GoblinPersonaType = 'strategic' | 'mirror' | 'mad' | 'exec' | 'clarity';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  message_type: 'text' | 'annotation' | 'insight';
  created_at: string;
  annotation_data?: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    feedback_type: string;
    description: string;
  };
}

export default function GoblinStudioPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use the unified studio session hook
  const {
    session,
    images,
    isLoading: sessionLoading,
    uploadImage,
    uploadMultipleImages,
    getOrCreateSession,
    resetSession
  } = useStudioSession();
  
  // UI state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('UX Analysis - 7/15/2025');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to UX Analysis Studio!\n\nI'm here to help you analyze your UI designs, wireframes, and prototypes. Upload up to 5 images to get started, or ask me what would you like to analyze today?",
      message_type: 'text',
      created_at: new Date().toISOString()
    }
  ]);

  const handleNewSession = () => {
    resetSession();
    setSelectedImageIndex(null);
    setAnnotations([]);
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: "Welcome to UX Analysis Studio!\n\nI'm here to help you analyze your UI designs, wireframes, and prototypes. Upload up to 5 images to get started, or ask me what would you like to analyze today?",
      message_type: 'text',
      created_at: new Date().toISOString()
    }]);
    setSessionTitle(`UX Analysis - ${new Date().toLocaleDateString()}`);
  };

  const handleSaveSession = () => {
    toast.success('Session saved successfully');
  };

  const handleShareSession = () => {
    toast.success('Session shared successfully');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleImageUpload = async (file: File) => {
    // Ensure we have a session before uploading
    await getOrCreateSession(sessionTitle);
    
    // Use the hook's upload function
    const uploadedImage = await uploadImage(file);
    
    if (uploadedImage && images.length === 1) {
      // Set the first uploaded image as selected
      setSelectedImageIndex(0);
    }
  };

  const handleBatchImageUpload = async (files: File[]) => {
    // Ensure we have a session before uploading
    await getOrCreateSession(sessionTitle);
    
    // Use the hook's batch upload function
    const uploadedImages = await uploadMultipleImages(files);
    
    if (uploadedImages.length > 0 && selectedImageIndex === null) {
      // Set the first uploaded image as selected
      setSelectedImageIndex(0);
    }
  };

  const handleImageSelect = (index: number | null) => {
    setSelectedImageIndex(index);
  };

  const handleAnnotationCreate = (imageIndex: number, area: { x: number; y: number; width: number; height: number }, annotationData?: { label: string; feedback_type: string; description: string }) => {
    const annotation = {
      id: Date.now().toString(),
      imageIndex,
      ...area,
      ...annotationData
    };
    setAnnotations(prev => [...prev, annotation]);
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      message_type: 'text',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsAnalyzing(true);

    try {
      // Ensure we have a session
      const currentSession = await getOrCreateSession(sessionTitle);
      if (!currentSession) {
        throw new Error('Failed to create or get session');
      }
      
      console.log('✅ Using session:', currentSession.id);

      console.log('🚀 Sending message to chat analyzer...', {
        sessionId: currentSession.id,
        messageLength: content.length,
        imagesCount: images.length
      });

      // Use the optimized v2 analyzer for better performance and error handling
      const analyzerFunction = images.length > 2 ? 'goblin-chat-analyzer-v2' : 'goblin-chat-analyzer';
      console.log(`📡 Using analyzer: ${analyzerFunction}`);
      
      const { data, error } = await supabase.functions.invoke(analyzerFunction, {
        body: {
          message: content,
          sessionId: currentSession.id,
          images: images.map(img => ({
            url: img.file_path, // Use file_path as primary URL
            file_path: img.file_path,
            name: img.file_name,
            id: img.id
          })),
          persona: 'clarity'
        }
      });

      if (error) {
        console.error('❌ Chat analysis error:', error);
        // Check if it's a network error vs application error
        if (error.message?.includes('fetch')) {
          throw new Error('Network error: Please check your internet connection and try again.');
        } else if (error.message?.includes('timeout')) {
          throw new Error('The analysis is taking longer than expected. Please try again with fewer images.');
        } else {
          throw new Error(`Chat analysis failed: ${error.message || 'Unknown error'}`);
        }
      }

      if (!data) {
        console.error('❌ No response data received');
        throw new Error('No response received from the analysis service. Please try again.');
      }

      if (!data.success) {
        console.error('❌ Analysis returned error:', data);
        const errorMsg = data?.error || data?.details || 'Analysis failed for unknown reason';
        throw new Error(`Analysis error: ${errorMsg}`);
      }

      console.log('✅ Chat analysis response received:', {
        responseType: data.response?.type,
        contentLength: data.response?.content?.length,
        hasAnnotation: !!data.response?.annotation,
        processingTime: data.processing_time_ms
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response?.content || "I've analyzed your request but couldn't generate a proper response. Please try again.",
        message_type: data.response?.type || 'text',
        created_at: new Date().toISOString(),
        annotation_data: data.response?.annotation
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Handle annotation if present
      if (data.response?.annotation && selectedImageIndex !== null) {
        handleAnnotationCreate(selectedImageIndex, data.response.annotation, {
          label: data.response.annotation.label,
          feedback_type: data.response.annotation.feedback_type,
          description: data.response.annotation.description
        });
      }

    } catch (error) {
      console.error('💥 Failed to get chat response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check your internet connection.`,
        message_type: 'text',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCanvasStateChange = (state: any) => {
    // Handle canvas state changes
  };

  return (
    <StudioLayout
      header={
        <StudioHeader
          sessionTitle={sessionTitle}
          onNewSession={handleNewSession}
          onSaveSession={handleSaveSession}
          onShareSession={handleShareSession}
          onSettings={handleSettings}
        />
      }
      chatPanel={
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          onImageUpload={handleImageUpload}
          onBatchImageUpload={handleBatchImageUpload}
          isLoading={isAnalyzing || sessionLoading}
          sessionTitle={sessionTitle}
          imageCount={images.length}
          annotationCount={annotations.length}
        />
      }
      mainCanvas={
        <MainCanvas
          images={images as any}
          selectedImageIndex={selectedImageIndex}
          annotations={annotations}
          onImageSelect={handleImageSelect}
          onAnnotationCreate={handleAnnotationCreate}
          onCanvasStateChange={handleCanvasStateChange}
          onImageUpload={handleImageUpload}
          onBatchImageUpload={handleBatchImageUpload}
          annotationMode={false}
        />
      }
      propertiesPanel={
        <PropertiesPanel
          selectedImage={selectedImageIndex !== null ? (images[selectedImageIndex] as any) : null}
          insights={[]}
          annotations={[]}
          onAnnotationUpdate={() => {}}
          onAnnotationDelete={() => {}}
          sessionInfo={{
            title: sessionTitle,
            status: 'active',
            imageCount: images.length
          }}
          allImages={images as any}
          allAnnotations={annotations}
        />
      }
    />
  );
}