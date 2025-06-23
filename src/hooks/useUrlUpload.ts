
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

      // Capture screenshot
      const screenshotUrl = await captureWebsiteScreenshot(url, {
        fullPage: true,
        viewportWidth: 1200,
        viewportHeight: 800,
        delay: 2000 // Wait 2 seconds for page to load
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

      // For Figma, we'll use a design placeholder for now
      // In production, you'd integrate with Figma's API to get design exports
      const figmaPlaceholders = [
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&h=800&fit=crop'
      ];
      
      const randomIndex = Math.floor(Math.random() * figmaPlaceholders.length);
      onImageUpload(figmaPlaceholders[randomIndex]);
      
      toast.success('Figma design loaded successfully!');
    } catch (error) {
      console.error('Error saving Figma URL:', error);
      toast.error('Failed to process Figma URL');
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
