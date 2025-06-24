
import { supabase } from '@/integrations/supabase/client';

interface ScreenshotOptions {
  fullPage?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  deviceScaleFactor?: number;
  format?: 'png' | 'jpg' | 'webp';
  cache?: boolean;
  delay?: number;
}

export const captureWebsiteScreenshot = async (
  url: string, 
  options: ScreenshotOptions = {}
): Promise<string | null> => {
  console.log('=== Screenshot Service Called ===');
  console.log('URL to capture:', url);
  console.log('Screenshot options:', options);
  
  try {
    // Default options
    const defaultOptions: ScreenshotOptions = {
      fullPage: true,
      viewportWidth: 1200,
      viewportHeight: 800,
      deviceScaleFactor: 1,
      format: 'png',
      cache: false,
      delay: 0,
      ...options
    };

    console.log('Final screenshot options:', defaultOptions);

    // Check authentication before making the call
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.error('Authentication error before screenshot call:', authError);
      throw new Error('Authentication required for screenshot capture');
    }

    console.log('Calling Supabase Edge Function: capture-screenshot');
    console.log('Function payload:', {
      url,
      ...defaultOptions
    });

    // Call the Screenshot Capture Edge Function
    const { data, error } = await supabase.functions.invoke('capture-screenshot', {
      body: {
        url,
        ...defaultOptions
      }
    });

    console.log('Edge function response received');
    console.log('Response error:', error);
    console.log('Response data:', data);

    if (error) {
      console.error('Edge function error details:', error);
      throw new Error(`Screenshot function error: ${error.message || 'Unknown error'}`);
    }

    if (!data) {
      console.error('No data returned from edge function');
      throw new Error('No response data from screenshot service');
    }

    if (!data.screenshotUrl) {
      console.error('No screenshot URL in response data:', data);
      throw new Error('No screenshot data received from service');
    }

    console.log('Screenshot URL received, length:', data.screenshotUrl.length);
    console.log('Screenshot URL type:', data.screenshotUrl.startsWith('data:') ? 'Base64 data URL' : 'HTTP URL');
    console.log('=== Screenshot Service Completed Successfully ===');
    
    return data.screenshotUrl;
  } catch (error) {
    console.error('=== Screenshot Service Failed ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Full error object:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        console.error('Authentication issue detected');
      } else if (error.message.includes('timeout')) {
        console.error('Timeout issue detected');
      } else if (error.message.includes('network')) {
        console.error('Network issue detected');
      }
    }
    
    return null;
  }
};

export const validateUrl = (url: string): boolean => {
  console.log('Validating URL:', url);
  
  try {
    const urlObj = new URL(url);
    const isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    console.log('URL validation result:', isValid);
    console.log('URL protocol:', urlObj.protocol);
    return isValid;
  } catch (error) {
    console.error('URL validation failed:', error);
    return false;
  }
};
