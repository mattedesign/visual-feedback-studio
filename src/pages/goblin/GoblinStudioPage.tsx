import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudioLayout } from '@/components/goblin/studio/StudioLayout';
import { StudioHeader } from '@/components/goblin/studio/StudioHeader';
import { ChatInterface } from '@/components/goblin/studio/ChatInterface';
import { MainCanvas } from '@/components/goblin/studio/MainCanvas';
import { PropertiesPanel } from '@/components/goblin/studio/PropertiesPanel';
import { createGoblinSession, uploadGoblinImage, startGoblinAnalysis } from '@/services/goblin/index';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type GoblinPersonaType = 'strategic' | 'mirror' | 'mad' | 'exec' | 'clarity';

// Simplified interface for studio page
interface StudioImage {
  id: string;
  file_name: string;
  file_path: string;
  image_index: number;
  file_size?: number;
  processing_status?: string;
  signedUrl?: string;
  url?: string;
  canvas_position?: {
    x: number;
    y: number;
    zoom: number;
    rotation: number;
  };
}

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
  
  // Session state
  const [sessionTitle, setSessionTitle] = useState('UX Analysis - 7/15/2025');
  const [images, setImages] = useState<StudioImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
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
    setImages([]);
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
    if (images.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    try {
      // Create a session if we don't have one
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const session = await createGoblinSession({
          title: sessionTitle,
          persona_type: 'clarity',
          analysis_mode: 'single',
          goal_description: 'Interactive chat analysis',
          confidence_level: 2
        });
        currentSessionId = session.id;
        setSessionId(currentSessionId);
      }

      // Upload to Supabase storage and get the storage URL
      const uploadedImage = await uploadGoblinImage(currentSessionId, file, images.length);
      
      const newImage: StudioImage = {
        id: uploadedImage.id,
        file_name: uploadedImage.file_name,
        file_path: uploadedImage.file_path, // This is now the storage URL
        image_index: images.length,
        url: uploadedImage.file_path // Use storage URL
      };

      setImages(prev => [...prev, newImage]);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleBatchImageUpload = async (files: File[]) => {
    const remainingSlots = 5 - images.length;
    const filesToUpload = files.slice(0, remainingSlots);
    
    try {
      // Create a session if we don't have one
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const session = await createGoblinSession({
          title: sessionTitle,
          persona_type: 'clarity',
          analysis_mode: 'single',
          goal_description: 'Interactive chat analysis',
          confidence_level: 2
        });
        currentSessionId = session.id;
        setSessionId(currentSessionId);
      }

      // Upload each file to storage and create image objects
      const newImages: StudioImage[] = [];
      for (let i = 0; i < filesToUpload.length; i++) {
        const uploadedImage = await uploadGoblinImage(currentSessionId, filesToUpload[i], images.length + i);
        newImages.push({
          id: uploadedImage.id,
          file_name: uploadedImage.file_name,
          file_path: uploadedImage.file_path,
          image_index: images.length + i,
          url: uploadedImage.file_path
        });
      }

      setImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} images uploaded successfully`);
    } catch (error) {
      console.error('Batch image upload failed:', error);
      toast.error('Failed to upload images');
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
      // Create a session if we don't have one
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        console.log('🔄 Creating new session...');
        const session = await createGoblinSession({
          title: sessionTitle,
          persona_type: 'clarity',
          analysis_mode: 'single',
          goal_description: 'Interactive chat analysis',
          confidence_level: 2
        });
        currentSessionId = session.id;
        setSessionId(currentSessionId);
        console.log('✅ Session created:', currentSessionId);
      }

      console.log('🚀 Sending message to chat analyzer...', {
        sessionId: currentSessionId,
        messageLength: content.length,
        imagesCount: images.length
      });

      // Call the goblin chat analyzer with improved payload
      const { data, error } = await supabase.functions.invoke('goblin-chat-analyzer', {
        body: {
          message: content,
          sessionId: currentSessionId,
          images: images.map(img => ({
            url: img.url || img.file_path,
            file_path: img.file_path,
            name: img.file_name,
            id: img.id
          })),
          persona: 'clarity'
        }
      });

      if (error) {
        console.error('❌ Chat analysis error:', error);
        throw new Error(`Chat analysis failed: ${error.message}`);
      }

      if (!data || !data.success) {
        console.error('❌ Unexpected response format:', data);
        throw new Error(data?.error || 'Unexpected response from chat analyzer');
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
          isLoading={isAnalyzing}
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