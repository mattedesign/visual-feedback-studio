
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

    // For demo purposes, return a placeholder
    // In production, you would:
    // 1. Make API call to Screenshot One
    // 2. Handle the response
    // 3. Either return the direct URL or base64 data
    
    // Placeholder implementation - replace with actual Screenshot One API call
    const placeholderScreenshots = [
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=800&fit=crop'
    ];
    
    // Return a random placeholder for demo
    const randomIndex = Math.floor(Math.random() * placeholderScreenshots.length);
    return placeholderScreenshots[randomIndex];

    // TODO: Replace above with actual Screenshot One integration:
    /*
    const screenshotApiUrl = new URL('https://api.screenshotone.com/take');
    screenshotApiUrl.searchParams.set('access_key', process.env.SCREENSHOT_ONE_ACCESS_KEY || '');
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

    const response = await fetch(screenshotApiUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Screenshot API error: ${response.status} ${response.statusText}`);
    }

    // Handle the response based on Screenshot One's API
    // This could be a direct image URL or base64 data
    const screenshotData = await response.blob();
    
    // Convert to object URL or upload to your storage
    const screenshotUrl = URL.createObjectURL(screenshotData);
    
    return screenshotUrl;
    */
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
