
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

    console.log('Capturing screenshot for:', url);
    console.log('Screenshot options:', defaultOptions);

    // Call the Screenshot Capture Edge Function
    const { data, error } = await supabase.functions.invoke('capture-screenshot', {
      body: {
        url,
        ...defaultOptions
      }
    });

    if (error) {
      console.error('Error calling screenshot function:', error);
      throw new Error(`Screenshot function error: ${error.message}`);
    }

    if (!data || !data.screenshotUrl) {
      console.error('No screenshot URL returned from function');
      throw new Error('No screenshot data received');
    }

    console.log('Screenshot captured successfully');
    return data.screenshotUrl;
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return null;
  }
};

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};
