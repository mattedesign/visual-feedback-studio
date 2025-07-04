
import { useState } from 'react';
import { toast } from 'sonner';
import { saveUrlUpload } from '@/services/urlUploadService';
import { captureWebsiteScreenshot, validateUrl } from '@/services/screenshotService';
import { supabase } from '@/integrations/supabase/client';
import { analysisSessionService } from '@/services/analysisSessionService';

export const useUrlUpload = (onImageUpload: (imageUrl: string) => void) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUrlSubmit = async (url: string) => {
    console.log('=== URL Upload Process Started ===');
    console.log('URL:', url);
    console.log('Process timestamp:', new Date().toISOString());
    
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
      
      // Step 3: Get or create analysis session with proper UUID
      const analysisId = await analysisSessionService.getOrCreateSession();
      if (!analysisId) {
        console.error('Failed to get or create analysis session');
        toast.error('Failed to initialize analysis session');
        setIsProcessing(false);
        return;
      }
      console.log('✓ Using analysis session ID:', analysisId);

      // Step 4: Save URL upload record (will be associated with real analysis later)
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
        console.error('Screenshot capture failed - no URL returned');
        toast.error('Failed to capture website screenshot. Please check the URL and try again.');
        setIsProcessing(false);
        return;
      }

      console.log('✓ Screenshot captured successfully');
      console.log('Screenshot URL length:', screenshotUrl.length);
      console.log('Screenshot URL type:', screenshotUrl.startsWith('data:') ? 'Base64 data URL' : 'Regular URL');

      // Step 6: Validate screenshot URL before passing to workflow
      console.log('Step 6: Validating screenshot before workflow...');
      
      if (screenshotUrl.startsWith('data:')) {
        // Additional validation for data URLs
        const dataUrlMatch = screenshotUrl.match(/^data:image\/([^;]+);base64,(.+)$/);
        if (!dataUrlMatch) {
          console.error('Invalid data URL format before workflow');
          toast.error('Screenshot data format is invalid. Please try again.');
          setIsProcessing(false);
          return;
        }
        
        const [, format, base64Data] = dataUrlMatch;
        console.log('Pre-workflow validation:', {
          format: format,
          base64Length: base64Data.length,
          hasValidBase64Chars: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)
        });
        
        if (base64Data.length < 100) {
          console.error('Base64 data appears too short');
          toast.error('Screenshot data appears incomplete. Please try again.');
          setIsProcessing(false);
          return;
        }
      }

      // Step 7: Pass screenshot to workflow
      console.log('Step 7: Passing validated screenshot to workflow...');
      onImageUpload(screenshotUrl);
      
      toast.success('Website screenshot captured successfully!');
      console.log('=== URL Upload Process Completed Successfully ===');
      
    } catch (error) {
      console.error('=== URL Upload Process Failed ===');
      console.error('Error timestamp:', new Date().toISOString());
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: typeof error
      });
      
      // Enhanced error messaging  
      let errorMessage = 'Failed to process website URL';
      if (error instanceof Error) {
        if (error.message.includes('Authentication')) {
          errorMessage = 'Authentication failed. Please sign in again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Invalid') && error.message.includes('URL')) {
          errorMessage = 'Invalid screenshot format received. Please try again.';
        } else {
          errorMessage = `Failed to process website: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleUrlSubmit,
  };
};
