
import { useState } from 'react';
import { toast } from 'sonner';
import { createAnalysis } from '@/services/analysisService';
import { saveUrlUpload } from '@/services/urlUploadService';
import { captureWebsiteScreenshot, validateUrl } from '@/services/screenshotService';

export const useUrlUpload = (onImageUpload: (imageUrl: string) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUrlSubmit = async (url: string) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing website URL:', url);
      
      // Validate URL format
      if (!validateUrl(url)) {
        toast.error('Please enter a valid URL (must start with http:// or https://)');
        setIsProcessing(false);
        return;
      }
      
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

      // Show progress message
      toast.info('Capturing website screenshot...');

      // Capture screenshot with corrected delay parameter (2 seconds, not 2000ms)
      const screenshotUrl = await captureWebsiteScreenshot(url, {
        fullPage: true,
        viewportWidth: 1200,
        viewportHeight: 800,
        delay: 2 // 2 seconds delay for page loading
      });

      if (!screenshotUrl) {
        toast.error('Failed to capture website screenshot');
        setIsProcessing(false);
        return;
      }

      // Pass the screenshot URL to the workflow
      onImageUpload(screenshotUrl);
      toast.success('Website screenshot captured successfully!');
    } catch (error) {
      console.error('Error processing website URL:', error);
      toast.error('Failed to process website URL');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleUrlSubmit,
  };
};
