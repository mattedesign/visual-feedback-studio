
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

      // Show enhanced progress message with multiple strategies info
      toast.info('Launching enhanced Figma capture system... Our AI will try multiple strategies to bypass detection.', {
        duration: 6000,
      });

      // Use enhanced Screenshot One capture for Figma with optimized settings
      const screenshotUrl = await captureWebsiteScreenshot(figmaUrl, {
        fullPage: true,
        viewportWidth: 1200,
        viewportHeight: 800,
        delay: 12 // 12 seconds delay for Figma to load completely with enhanced processing
      });

      if (!screenshotUrl) {
        toast.error('All capture strategies failed. Please ensure your Figma file is publicly accessible and try again.');
        setIsProcessing(false);
        return;
      }

      // Pass the screenshot URL to the workflow
      onImageUpload(screenshotUrl);
      toast.success('Figma design captured successfully using enhanced anti-detection system!');
    } catch (error) {
      console.error('Error processing Figma URL:', error);
      
      // Enhanced error messaging for different failure scenarios
      let errorMessage = 'Failed to capture Figma design despite trying multiple strategies.';
      
      if (error.message.includes('timeout')) {
        errorMessage = 'Capture timed out after trying all strategies. The design may be too complex or have restricted access.';
      } else if (error.message.includes('bot detection') || error.message.includes('captcha') || error.message.includes('human')) {
        errorMessage = 'Figma detected our capture attempts despite using advanced anti-detection methods. Please verify your link is public.';
      } else if (error.message.includes('403') || error.message.includes('401') || error.message.includes('host_returned_error')) {
        errorMessage = 'Unable to access the Figma design. Please check that the link is public and accessible.';
      } else if (error.message.includes('All enhanced capture strategies failed')) {
        errorMessage = 'Our advanced capture system tried multiple approaches but was unable to capture your design. This may be due to enhanced bot detection.';
      }
      
      toast.error(errorMessage, {
        duration: 8000,
      });
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
