
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
  console.log('Service timestamp:', new Date().toISOString());
  
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
    console.log('Checking authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.error('Authentication error before screenshot call:', authError);
      throw new Error('Authentication required for screenshot capture');
    }
    console.log('Authentication verified, user ID:', session.user.id);

    console.log('Calling Supabase Edge Function: capture-screenshot');
    const functionPayload = {
      url,
      ...defaultOptions
    };
    console.log('Function payload:', functionPayload);
    console.log('Payload size:', JSON.stringify(functionPayload).length, 'characters');

    // Call the Screenshot Capture Edge Function
    const { data, error } = await supabase.functions.invoke('capture-screenshot', {
      body: functionPayload
    });

    console.log('=== Edge Function Response Analysis ===');
    console.log('Response received at:', new Date().toISOString());
    console.log('Response error:', error);
    console.log('Response data type:', typeof data);
    console.log('Response data exists:', !!data);

    if (error) {
      console.error('Edge function error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Screenshot function error: ${error.message || 'Unknown error'}`);
    }

    if (!data) {
      console.error('No data returned from edge function');
      throw new Error('No response data from screenshot service');
    }

    console.log('Response data structure:', {
      hasScreenshotUrl: !!data.screenshotUrl,
      hasMetadata: !!data.metadata,
      dataKeys: Object.keys(data)
    });

    if (!data.screenshotUrl) {
      console.error('No screenshot URL in response data:', data);
      throw new Error('No screenshot data received from service');
    }

    const screenshotUrl = data.screenshotUrl;
    console.log('=== Screenshot URL Analysis ===');
    console.log('Screenshot URL length:', screenshotUrl.length);
    console.log('Screenshot URL type:', screenshotUrl.startsWith('data:') ? 'Base64 data URL' : 'HTTP URL');
    
    if (screenshotUrl.startsWith('data:')) {
      // Validate data URL format
      const dataUrlMatch = screenshotUrl.match(/^data:image\/([^;]+);base64,(.+)$/);
      if (!dataUrlMatch) {
        console.error('Invalid data URL format detected');
        console.error('URL prefix (first 100 chars):', screenshotUrl.substring(0, 100));
        throw new Error('Invalid screenshot data URL format received');
      }
      
      const [, imageFormat, base64Data] = dataUrlMatch;
      console.log('Data URL validation:', {
        imageFormat: imageFormat,
        base64Length: base64Data.length,
        base64Preview: base64Data.substring(0, 20) + '...' + base64Data.substring(base64Data.length - 20),
        isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)
      });
      
      // Additional validation - try to create a test image to verify the data URL works
      try {
        const testImage = new Image();
        const imageLoadPromise = new Promise((resolve, reject) => {
          testImage.onload = () => {
            console.log('Screenshot URL validation: Image loads successfully');
            console.log('Image dimensions:', testImage.width, 'x', testImage.height);
            resolve(true);
          };
          testImage.onerror = (error) => {
            console.error('Screenshot URL validation: Image failed to load', error);
            reject(new Error('Generated screenshot URL is not valid'));
          };
        });
        
        testImage.src = screenshotUrl;
        
        // Give it 2 seconds to load for validation
        await Promise.race([
          imageLoadPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Image validation timeout')), 2000))
        ]);
        
      } catch (validationError) {
        console.warn('Image validation failed (but proceeding):', validationError);
        // Don't throw here, just log the warning and proceed
      }
    }
    
    if (data.metadata) {
      console.log('Screenshot metadata:', data.metadata);
    }
    
    console.log('=== Screenshot Service Completed Successfully ===');
    
    return screenshotUrl;
  } catch (error) {
    console.error('=== Screenshot Service Failed ===');
    console.error('Error timestamp:', new Date().toISOString());
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Enhanced error categorization for better user feedback
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        console.error('Authentication issue detected');
      } else if (error.message.includes('timeout')) {
        console.error('Timeout issue detected');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        console.error('Network issue detected');
      } else if (error.message.includes('Invalid') && error.message.includes('URL')) {
        console.error('Data URL validation issue detected');
      } else if (error.message.includes('base64')) {
        console.error('Base64 processing issue detected');
      } else {
        console.error('Unknown error type:', error.message);
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
    console.log('URL validation result:', {
      url: url,
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      isValid: isValid
    });
    return isValid;
  } catch (error) {
    console.error('URL validation failed:', error);
    return false;
  }
};
