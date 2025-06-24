
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
  console.log('Request parameters:', { fullPage, format, cache });

  // Validate URL
  validateUrl(url);

  const screenshotApiUrl = new URL('https://api.screenshotone.com/take');
  screenshotApiUrl.searchParams.set('access_key', screenshotApiKey);
  screenshotApiUrl.searchParams.set('url', url);
  screenshotApiUrl.searchParams.set('format', format);
  screenshotApiUrl.searchParams.set('cache', cache.toString());

  // Use more conservative settings to prevent large images
  const viewport = requestData.viewportWidth && requestData.viewportHeight 
    ? { width: requestData.viewportWidth, height: requestData.viewportHeight }
    : getRandomViewport();
  
  // Further limit viewport size to prevent overly large images
  const maxWidth = 1000; // Reduced from 1200
  const maxHeight = 700; // Reduced from 800
  const optimizedViewport = {
    width: Math.min(viewport.width, maxWidth),
    height: Math.min(viewport.height, maxHeight)
  };
  
  screenshotApiUrl.searchParams.set('viewport_width', optimizedViewport.width.toString());
  screenshotApiUrl.searchParams.set('viewport_height', optimizedViewport.height.toString());
  screenshotApiUrl.searchParams.set('device_scale_factor', (requestData.deviceScaleFactor || 1).toString());
  screenshotApiUrl.searchParams.set('full_page', fullPage.toString());
  screenshotApiUrl.searchParams.set('user_agent', getRandomUserAgent());
  
  // Add quality optimization for smaller file sizes
  if (format === 'jpg' || format === 'jpeg') {
    screenshotApiUrl.searchParams.set('image_quality', '75'); // Further reduced quality
  }
  
  // Optimize for web performance and smaller images
  screenshotApiUrl.searchParams.set('block_ads', 'true');
  screenshotApiUrl.searchParams.set('block_cookie_banners', 'true');
  screenshotApiUrl.searchParams.set('block_trackers', 'true');
  screenshotApiUrl.searchParams.set('block_chats', 'true'); // Block chat widgets
  screenshotApiUrl.searchParams.set('optimize_for_print', 'false'); // Optimize for web
  
  const delay = requestData.delay && requestData.delay > 0 
    ? Math.min(requestData.delay <= 30 ? requestData.delay : Math.floor(requestData.delay / 1000), 15) // Reduced max delay
    : 1; // Reduced default delay
  screenshotApiUrl.searchParams.set('delay', delay.toString());

  console.log('Making request to Screenshot One API with optimized parameters...');
  console.log('Viewport:', optimizedViewport);
  console.log('Delay:', delay);
  
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(screenshotApiUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'DesignAnalyzer/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Screenshot API response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Screenshot API error details:', errorText);
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { error_message: errorText };
      }
      
      // Handle specific API errors
      if (response.status === 403) {
        throw new Error('Access denied: The website may be blocking screenshot capture or the URL may be invalid');
      } else if (response.status === 422) {
        throw new Error('Invalid request parameters: Please check the URL format');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded: Please try again later');
      }
      
      throw new Error(`Screenshot API error: ${response.status} ${response.statusText} - ${errorDetails.error_message || errorText}`);
    }

    return response;
  } catch (fetchError) {
    console.error('Network error during screenshot capture:', fetchError);
    
    if (fetchError.name === 'AbortError') {
      throw new Error('Screenshot capture timed out: The website took too long to load');
    }
    
    if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to screenshot service');
    }
    throw fetchError;
  }
};
