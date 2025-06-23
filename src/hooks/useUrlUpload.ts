
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

  const handleFigmaSubmit = async (figmaUrl: string) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing Figma URL:', figmaUrl);
      
      // Validate Figma URL format
      if (!figmaUrl.includes('figma.com')) {
        toast.error('Please enter a valid Figma URL');
        setIsProcessing(false);
        return;
      }
      
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

      // Show enhanced progress message with longer expected time for Figma
      toast.info('Capturing Figma design screenshot... This may take up to 60 seconds due to advanced processing.', {
        duration: 5000,
      });

      // Use enhanced Screenshot One capture for Figma with optimized settings
      const screenshotUrl = await captureWebsiteScreenshot(figmaUrl, {
        fullPage: true,
        viewportWidth: 1200,
        viewportHeight: 800,
        delay: 12 // 12 seconds delay for Figma to load completely with enhanced processing
      });

      if (!screenshotUrl) {
        toast.error('Failed to capture Figma design screenshot. Please ensure your Figma file is publicly accessible and try again.');
        setIsProcessing(false);
        return;
      }

      // Pass the screenshot URL to the workflow
      onImageUpload(screenshotUrl);
      toast.success('Figma design screenshot captured successfully!');
    } catch (error) {
      console.error('Error processing Figma URL:', error);
      
      // Enhanced error messaging for Figma-specific issues
      let errorMessage = 'Failed to process Figma URL. Please ensure your Figma file is publicly accessible.';
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Figma capture timed out. The design may be too complex or have restricted access.';
      } else if (error.message.includes('bot detection') || error.message.includes('host_returned_error')) {
        errorMessage = 'Unable to access the Figma design. Please check that the link is public and accessible.';
      }
      
      toast.error(errorMessage);
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
