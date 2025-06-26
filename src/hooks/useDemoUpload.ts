
import { useState } from 'react';

export const useDemoUpload = (onImageUpload: (imageUrl: string) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDemoUpload = async () => {
    setIsProcessing(true);
    
    try {
      console.log('Using demo design image - this will proceed immediately');
      
      // Use the demo image from public folder
      const demoImageUrl = '/lovable-uploads/21223d81-f4f7-4209-8d6a-f2f8f703d1d1.png';
      
      // Verify the demo image exists
      const response = await fetch(demoImageUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Demo image not accessible');
      }
      
      console.log('Demo image verified and ready - proceeding to analysis');
      
      // For demo, we want to proceed immediately to analysis
      onImageUpload(demoImageUrl);
      
      console.log('Demo design loaded successfully - no toast notification');
      
    } catch (error) {
      console.error('Error loading demo design:', error);
      // Log error but don't show toast
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleDemoUpload,
  };
};
