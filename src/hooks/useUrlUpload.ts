
import { useState } from 'react';
import { toast } from 'sonner';
import { createAnalysis } from '@/services/analysisService';
import { saveUrlUpload } from '@/services/urlUploadService';
import { captureWebsiteScreenshot, validateUrl } from '@/services/screenshotService';
import { supabase } from '@/integrations/supabase/client';

export const useUrlUpload = (onImageUpload: (imageUrl: string) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUrlSubmit = async (url: string) => {
    console.log('=== URL Upload Process Started ===');
    console.log('URL:', url);
    
    setIsProcessing(true);
    
    try {
      // Step 1: Authentication check
      console.log('Step 1: Checking authentication...');
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Authentication error:', authError);
        toast.error('Authentication error. Please sign in again.');
        setIsProcessing(false);
        return;
      }
      
      if (!session || !session.user) {
        console.error('No active session found');
        toast.error('Please sign in to upload websites');
        setIsProcessing(false);
        return;
      }
      
      console.log('✓ Authentication verified, user ID:', session.user.id);
      
      // Step 2: URL validation
      console.log('Step 2: Validating URL...');
      if (!validateUrl(url)) {
        console.error('Invalid URL format:', url);
        toast.error('Please enter a valid URL (must start with http:// or https://)');
        setIsProcessing(false);
        return;
      }
      console.log('✓ URL validation passed');
      
      // Step 3: Create analysis
      console.log('Step 3: Creating analysis...');
      const analysisId = await createAnalysis();
      if (!analysisId) {
        console.error('Failed to create analysis');
        toast.error('Failed to create analysis record');
        setIsProcessing(false);
        return;
      }
      console.log('✓ Analysis created with ID:', analysisId);

      // Step 4: Save URL upload record
      console.log('Step 4: Saving URL upload record...');
      const savedUrl = await saveUrlUpload(url, 'website', analysisId);
      if (!savedUrl) {
        console.error('Failed to save URL upload record');
        toast.error('Failed to save URL information');
        setIsProcessing(false);
        return;
      }
      console.log('✓ URL upload record saved');

      // Step 5: Show progress and capture screenshot
      console.log('Step 5: Capturing website screenshot...');
      toast.info('Capturing website screenshot...', { duration: 5000 });

      const screenshotUrl = await captureWebsiteScreenshot(url, {
        fullPage: true,
        viewportWidth: 1200,
        viewportHeight: 800,
        delay: 2
      });

      if (!screenshotUrl) {
        console.error('Screenshot capture failed');
        toast.error('Failed to capture website screenshot. Please check the URL and try again.');
        setIsProcessing(false);
        return;
      }

      console.log('✓ Screenshot captured successfully');
      console.log('Screenshot URL length:', screenshotUrl.length);
      console.log('Screenshot URL type:', screenshotUrl.startsWith('data:') ? 'Base64 data URL' : 'Regular URL');

      // Step 6: Pass screenshot to workflow
      console.log('Step 6: Passing screenshot to workflow...');
      onImageUpload(screenshotUrl);
      
      toast.success('Website screenshot captured successfully!');
      console.log('=== URL Upload Process Completed Successfully ===');
      
    } catch (error) {
      console.error('=== URL Upload Process Failed ===');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      toast.error(`Failed to process website URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleUrlSubmit,
  };
};
