
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

    // Get the API key from environment variables
    const apiKey = import.meta.env.VITE_SCREENSHOT_ONE_ACCESS_KEY;
    
    if (!apiKey) {
      console.error('Screenshot One API key not found. Please set VITE_SCREENSHOT_ONE_ACCESS_KEY.');
      throw new Error('Screenshot One API key not configured');
    }

    // Build the Screenshot One API URL
    const screenshotApiUrl = new URL('https://api.screenshotone.com/take');
    screenshotApiUrl.searchParams.set('access_key', apiKey);
    screenshotApiUrl.searchParams.set('url', url);
    screenshotApiUrl.searchParams.set('full_page', defaultOptions.fullPage?.toString() || 'true');
    screenshotApiUrl.searchParams.set('viewport_width', defaultOptions.viewportWidth?.toString() || '1200');
    screenshotApiUrl.searchParams.set('viewport_height', defaultOptions.viewportHeight?.toString() || '800');
    screenshotApiUrl.searchParams.set('device_scale_factor', defaultOptions.deviceScaleFactor?.toString() || '1');
    screenshotApiUrl.searchParams.set('format', defaultOptions.format || 'png');
    screenshotApiUrl.searchParams.set('cache', defaultOptions.cache?.toString() || 'false');
    
    if (defaultOptions.delay && defaultOptions.delay > 0) {
      screenshotApiUrl.searchParams.set('delay', defaultOptions.delay.toString());
    }

    console.log('Making request to Screenshot One API...');
    const response = await fetch(screenshotApiUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Screenshot API error: ${response.status} ${response.statusText}`);
    }

    // Get the screenshot as a blob
    const screenshotBlob = await response.blob();
    
    // Convert blob to object URL for immediate use
    const screenshotUrl = URL.createObjectURL(screenshotBlob);
    
    console.log('Screenshot captured successfully');
    return screenshotUrl;
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
