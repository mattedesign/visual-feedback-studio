
import { useState } from 'react';
import { toast } from 'sonner';
import { createAnalysis } from '@/services/analysisService';
import { saveUrlUpload } from '@/services/urlUploadService';

export const useUrlUpload = (onImageUpload: (imageUrl: string) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUrlSubmit = async (url: string) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing website URL:', url);
      
      // Create analysis first
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      // Save URL upload
      const savedUrl = await saveUrlUpload(url, 'website', analysisId);
      if (!savedUrl) {
        setIsProcessing(false);
        return;
      }

      // For demo purposes, we'll use a placeholder image
      // In a real implementation, you'd capture a screenshot of the website
      onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
      toast.success('Website URL saved successfully!');
    } catch (error) {
      console.error('Error saving website URL:', error);
      toast.error('Failed to save website URL');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFigmaSubmit = async (figmaUrl: string) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing Figma URL:', figmaUrl);
      
      // Create analysis first
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      // Save Figma URL
      const savedUrl = await saveUrlUpload(figmaUrl, 'figma', analysisId);
      if (!savedUrl) {
        setIsProcessing(false);
        return;
      }

      // For demo purposes, we'll use a placeholder image
      // In a real implementation, you'd use Figma's API to get the design
      onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
      toast.success('Figma URL saved successfully!');
    } catch (error) {
      console.error('Error saving Figma URL:', error);
      toast.error('Failed to save Figma URL');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleUrlSubmit,
    handleFigmaSubmit,
  };
};
