import { useState, useCallback, useEffect } from 'react';
import { createGoblinSession, uploadGoblinImage } from '@/services/goblin/index';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface StudioImage {
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

export interface StudioSession {
  id: string;
  title: string;
  persona_type: string;
  analysis_mode: string;
  status: string;
  created_at: string;
}

export const useStudioSession = () => {
  const { user } = useAuth();
  const [session, setSession] = useState<StudioSession | null>(null);
  const [images, setImages] = useState<StudioImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createSession = useCallback(async (title: string) => {
    if (!user) {
      toast.error('Please log in to create a session');
      return null;
    }

    try {
      setIsLoading(true);
      const newSession = await createGoblinSession({
        title,
        persona_type: 'clarity',
        analysis_mode: 'single',
        goal_description: 'Interactive chat analysis',
        confidence_level: 2
      });

      setSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const uploadImage = useCallback(async (file: File): Promise<StudioImage | null> => {
    if (!session) {
      console.error('❌ No session available for image upload');
      toast.error('No active session. Please try again.');
      return null;
    }

    if (images.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return null;
    }

    try {
      setIsLoading(true);
      console.log('📸 Uploading image to session:', session.id);
      const uploadedImage = await uploadGoblinImage(session.id, file, images.length);
      
      const newImage: StudioImage = {
        id: uploadedImage.id,
        file_name: uploadedImage.file_name,
        file_path: uploadedImage.file_path,
        image_index: images.length,
        url: uploadedImage.file_path,
        file_size: uploadedImage.file_size
      };

      setImages(prev => [...prev, newImage]);
      toast.success('Image uploaded successfully');
      return newImage;
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, images.length]);

  const uploadMultipleImages = useCallback(async (files: File[]): Promise<StudioImage[]> => {
    if (!session) {
      console.error('❌ No session available for batch image upload');
      toast.error('No active session. Please try again.');
      return [];
    }

    const remainingSlots = 5 - images.length;
    const filesToUpload = files.slice(0, remainingSlots);
    
    if (filesToUpload.length === 0) {
      toast.error('No slots available for new images');
      return [];
    }

    try {
      setIsLoading(true);
      console.log('📸 Uploading batch images to session:', session.id);
      const newImages: StudioImage[] = [];
      
      for (let i = 0; i < filesToUpload.length; i++) {
        const uploadedImage = await uploadGoblinImage(session.id, filesToUpload[i], images.length + i);
        newImages.push({
          id: uploadedImage.id,
          file_name: uploadedImage.file_name,
          file_path: uploadedImage.file_path,
          image_index: images.length + i,
          url: uploadedImage.file_path,
          file_size: uploadedImage.file_size
        });
      }

      setImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} images uploaded successfully`);
      return newImages;
    } catch (error) {
      console.error('Batch image upload failed:', error);
      toast.error('Failed to upload images');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [session, images.length]);

  const removeImage = useCallback((imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  }, []);

  const getOrCreateSession = useCallback(async (title?: string) => {
    if (session) {
      return session;
    }

    const sessionTitle = title || `UX Analysis - ${new Date().toLocaleDateString()}`;
    return await createSession(sessionTitle);
  }, [session, createSession]);

  const resetSession = useCallback(() => {
    setSession(null);
    setImages([]);
  }, []);

  return {
    session,
    images,
    isLoading,
    createSession,
    uploadImage,
    uploadMultipleImages,
    removeImage,
    getOrCreateSession,
    resetSession,
    setSession,
    setImages
  };
};