
import { ScreenshotRequest } from './types.ts';
import { getRandomUserAgent, getRandomViewport } from './utils.ts';
import { validateUrl } from './validator.ts';

export const captureScreenshot = async (requestData: ScreenshotRequest): Promise<Response> => {
  const screenshotApiKey = Deno.env.get('SCREENSHOT_ONE_ACCESS_KEY');
  
  if (!screenshotApiKey) {
    console.error('Screenshot One API key not found in environment variables');
    throw new Error('Screenshot One API key not configured');
  }

  const { url, fullPage = true, format = 'png', cache = false } = requestData;

  console.log('Capturing screenshot for URL:', url);

  // Validate URL
  validateUrl(url);

  const screenshotApiUrl = new URL('https://api.screenshotone.com/take');
  screenshotApiUrl.searchParams.set('access_key', screenshotApiKey);
  screenshotApiUrl.searchParams.set('url', url);
  screenshotApiUrl.searchParams.set('format', format);
  screenshotApiUrl.searchParams.set('cache', cache.toString());

  // Use enhanced settings for better screenshot quality
  const viewport = requestData.viewportWidth && requestData.viewportHeight 
    ? { width: requestData.viewportWidth, height: requestData.viewportHeight }
    : getRandomViewport();
  
  screenshotApiUrl.searchParams.set('viewport_width', viewport.width.toString());
  screenshotApiUrl.searchParams.set('viewport_height', viewport.height.toString());
  screenshotApiUrl.searchParams.set('device_scale_factor', (requestData.deviceScaleFactor || 1).toString());
  screenshotApiUrl.searchParams.set('full_page', fullPage.toString());
  screenshotApiUrl.searchParams.set('user_agent', getRandomUserAgent());
  
  const delay = requestData.delay && requestData.delay > 0 
    ? Math.min(requestData.delay <= 30 ? requestData.delay : Math.floor(requestData.delay / 1000), 30)
    : 0;
  if (delay > 0) {
    screenshotApiUrl.searchParams.set('delay', delay.toString());
  }

  console.log('Making request to Screenshot One API...');
  
  const response = await fetch(screenshotApiUrl.toString());
  
  console.log('Screenshot API response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Screenshot API error details:', errorText);
    
    let errorDetails;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = { error_message: errorText };
    }
    
    throw new Error(`Screenshot API error: ${response.status} ${response.statusText} - ${errorDetails.error_message || errorText}`);
  }

  return response;
};
