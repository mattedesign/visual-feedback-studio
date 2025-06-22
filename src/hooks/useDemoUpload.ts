
import { useState } from 'react';
import { toast } from 'sonner';
import { createAnalysis } from '@/services/analysisService';
import { saveUrlUpload } from '@/services/urlUploadService';

export const useDemoUpload = (onImageUpload: (imageUrl: string) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDemoUpload = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Loading demo design');
      
      // Create analysis for demo
      const analysisId = await createAnalysis();
      if (!analysisId) {
        setIsProcessing(false);
        return;
      }

      // Save as a demo URL upload
      await saveUrlUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71', 'url', analysisId);
      
      onImageUpload('https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop');
      toast.success('Demo design loaded successfully!');
    } catch (error) {
      console.error('Error loading demo:', error);
      toast.error('Failed to load demo design');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleDemoUpload,
  };
};
