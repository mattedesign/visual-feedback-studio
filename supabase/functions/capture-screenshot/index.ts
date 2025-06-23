
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScreenshotRequest {
  url: string;
  fullPage?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  deviceScaleFactor?: number;
  format?: 'png' | 'jpg' | 'webp';
  cache?: boolean;
  delay?: number;
}

const isFigmaUrl = (url: string): boolean => {
  return url.toLowerCase().includes('figma.com');
};

const getRandomUserAgent = (): string => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const getRandomViewport = () => {
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1366, height: 768 },
    { width: 1280, height: 720 },
    { width: 1600, height: 1200 },
  ];
  return viewports[Math.floor(Math.random() * viewports.length)];
};

const validateScreenshotContent = (base64Data: string): boolean => {
  if (!base64Data || base64Data.length < 1000) {
    return false;
  }
  
  // Check for common bot detection indicators in base64 (these would appear as specific patterns)
  const suspiciousPatterns = [
    'bGV0cyBjb25maXJt', // "lets confirm" in base64
    'Y2FwdGNoYQ==', // "captcha" in base64
    'aHVtYW4=', // "human" in base64
  ];
  
  return !suspiciousPatterns.some(pattern => base64Data.includes(pattern));
};

const captureScreenshot = async (requestData: ScreenshotRequest, strategy: string, attempt: number = 1): Promise<Response> => {
  const screenshotApiKey = Deno.env.get('SCREENSHOT_ONE_ACCESS_KEY');
  
  if (!screenshotApiKey) {
    console.error('Screenshot One API key not found in environment variables');
    throw new Error('Screenshot One API key not configured');
  }

  const { url, fullPage = true, format = 'png', cache = false } = requestData;

  console.log(`Strategy: ${strategy}, Attempt ${attempt}: Capturing screenshot for URL:`, url);

  // Validate URL
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      throw new Error('Invalid URL protocol');
    }
  } catch {
    throw new Error('Invalid URL provided');
  }

  const isFigma = isFigmaUrl(url);
  const screenshotApiUrl = new URL('https://api.screenshotone.com/take');
  screenshotApiUrl.searchParams.set('access_key', screenshotApiKey);
  screenshotApiUrl.searchParams.set('url', url);
  screenshotApiUrl.searchParams.set('format', format);
  screenshotApiUrl.searchParams.set('cache', cache.toString());

  // Strategy-specific configurations
  if (strategy === 'stealth') {
    const viewport = getRandomViewport();
    screenshotApiUrl.searchParams.set('viewport_width', viewport.width.toString());
    screenshotApiUrl.searchParams.set('viewport_height', viewport.height.toString());
    screenshotApiUrl.searchParams.set('full_page', 'false'); // Capture visible area only
    screenshotApiUrl.searchParams.set('user_agent', getRandomUserAgent());
    screenshotApiUrl.searchParams.set('delay', '8');
    screenshotApiUrl.searchParams.set('wait_until', 'networkidle2');
    screenshotApiUrl.searchParams.set('block_ads', 'true');
    screenshotApiUrl.searchParams.set('block_trackers', 'true');
    screenshotApiUrl.searchParams.set('block_cookie_banners', 'true');
    
  } else if (strategy === 'mobile') {
    screenshotApiUrl.searchParams.set('viewport_width', '375');
    screenshotApiUrl.searchParams.set('viewport_height', '812');
    screenshotApiUrl.searchParams.set('device_scale_factor', '2');
    screenshotApiUrl.searchParams.set('full_page', fullPage.toString());
    screenshotApiUrl.searchParams.set('user_agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1');
    screenshotApiUrl.searchParams.set('delay', '6');
    screenshotApiUrl.searchParams.set('wait_until', 'networkidle0');
    
  } else if (strategy === 'fast') {
    screenshotApiUrl.searchParams.set('viewport_width', '1200');
    screenshotApiUrl.searchParams.set('viewport_height', '800');
    screenshotApiUrl.searchParams.set('full_page', 'false');
    screenshotApiUrl.searchParams.set('user_agent', getRandomUserAgent());
    screenshotApiUrl.searchParams.set('delay', '3');
    screenshotApiUrl.searchParams.set('timeout', '30');
    
  } else {
    // Standard strategy with enhanced settings
    const viewport = requestData.viewportWidth && requestData.viewportHeight 
      ? { width: requestData.viewportWidth, height: requestData.viewportHeight }
      : getRandomViewport();
    
    screenshotApiUrl.searchParams.set('viewport_width', viewport.width.toString());
    screenshotApiUrl.searchParams.set('viewport_height', viewport.height.toString());
    screenshotApiUrl.searchParams.set('device_scale_factor', (requestData.deviceScaleFactor || 1).toString());
    screenshotApiUrl.searchParams.set('full_page', fullPage.toString());
    screenshotApiUrl.searchParams.set('user_agent', getRandomUserAgent());
    
    if (isFigma) {
      screenshotApiUrl.searchParams.set('delay', '12');
      screenshotApiUrl.searchParams.set('wait_until', 'networkidle0');
      screenshotApiUrl.searchParams.set('timeout', '60');
      screenshotApiUrl.searchParams.set('block_ads', 'true');
      screenshotApiUrl.searchParams.set('block_trackers', 'true');
      screenshotApiUrl.searchParams.set('block_cookie_banners', 'true');
    } else {
      const delay = requestData.delay && requestData.delay > 0 
        ? Math.min(requestData.delay <= 30 ? requestData.delay : Math.floor(requestData.delay / 1000), 30)
        : 0;
      if (delay > 0) {
        screenshotApiUrl.searchParams.set('delay', delay.toString());
      }
    }
  }

  console.log(`Strategy: ${strategy}, Making request to Screenshot One API...`);
  
  const response = await fetch(screenshotApiUrl.toString());
  
  console.log(`Strategy: ${strategy}, Attempt ${attempt}: Screenshot API response status:`, response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Strategy: ${strategy}, Attempt ${attempt}: Screenshot API error details:`, errorText);
    
    let errorDetails;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = { error_message: errorText };
    }
    
    throw new Error(`Screenshot API error (${strategy}): ${response.status} ${response.statusText} - ${errorDetails.error_message || errorText}`);
  }

  return response;
};

const attemptEnhancedFigmaCapture = async (requestData: ScreenshotRequest): Promise<string> => {
  const strategies = [
    { name: 'stealth', description: 'Stealth mode with random viewport and enhanced blocking' },
    { name: 'mobile', description: 'Mobile user agent simulation' },
    { name: 'standard', description: 'Standard approach with optimizations' },
    { name: 'fast', description: 'Fast capture with minimal delay' },
  ];

  let lastError: Error | null = null;

  for (const strategy of strategies) {
    console.log(`Trying strategy: ${strategy.name} - ${strategy.description}`);
    
    try {
      const response = await captureScreenshot(requestData, strategy.name, 1);
      const screenshotBlob = await response.blob();
      const screenshotArrayBuffer = await screenshotBlob.arrayBuffer();
      
      if (screenshotArrayBuffer.byteLength > 5000) {
        const screenshotBase64 = btoa(String.fromCharCode(...new Uint8Array(screenshotArrayBuffer)));
        
        if (validateScreenshotContent(screenshotBase64)) {
          console.log(`Strategy ${strategy.name} SUCCESS! Screenshot size:`, screenshotArrayBuffer.byteLength, 'bytes');
          return `data:image/${requestData.format || 'png'};base64,${screenshotBase64}`;
        } else {
          console.log(`Strategy ${strategy.name}: Screenshot appears to contain bot detection content, trying next strategy...`);
          continue;
        }
      }
      
      console.log(`Strategy ${strategy.name}: Screenshot too small (${screenshotArrayBuffer.byteLength} bytes), trying next strategy...`);
    } catch (error) {
      lastError = error;
      console.error(`Strategy ${strategy.name} failed:`, error.message);
      
      // Add delay between strategy attempts
      if (strategy !== strategies[strategies.length - 1]) {
        const waitTime = 2000; // 2 second delay between strategies
        console.log(`Waiting ${waitTime}ms before next strategy...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // If all strategies fail, throw the last error
  throw lastError || new Error('All enhanced capture strategies failed');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ScreenshotRequest = await req.json();
    const isFigma = isFigmaUrl(requestData.url);
    
    console.log(`Processing ${isFigma ? 'Figma' : 'standard'} URL:`, requestData.url);

    let screenshotUrl: string;

    if (isFigma) {
      // Use enhanced multi-strategy capture for Figma
      screenshotUrl = await attemptEnhancedFigmaCapture(requestData);
    } else {
      // Standard single-attempt capture for non-Figma URLs
      const response = await captureScreenshot(requestData, 'standard', 1);
      const screenshotBlob = await response.blob();
      const screenshotArrayBuffer = await screenshotBlob.arrayBuffer();
      
      console.log('Standard capture completed, size:', screenshotArrayBuffer.byteLength, 'bytes');
      
      const screenshotBase64 = btoa(String.fromCharCode(...new Uint8Array(screenshotArrayBuffer)));
      screenshotUrl = `data:image/${requestData.format || 'png'};base64,${screenshotBase64}`;
    }
    
    return new Response(
      JSON.stringify({ screenshotUrl }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in capture-screenshot function:', error);
    
    // Enhanced error handling with specific Figma guidance
    let errorMessage = error.message || 'Internal server error';
    let statusCode = 500;
    
    if (errorMessage.includes('Invalid URL')) {
      statusCode = 400;
    } else if (errorMessage.includes('API key not configured')) {
      statusCode = 500;
      errorMessage = 'Screenshot service configuration error';
    } else if (errorMessage.includes('bot detection') || errorMessage.includes('captcha') || errorMessage.includes('human')) {
      statusCode = 422;
      errorMessage = 'Figma has detected automated access. Please ensure your design is publicly accessible and try again. Our enhanced system tried multiple approaches but was unable to bypass detection.';
    } else if (errorMessage.includes('timeout')) {
      statusCode = 408;
      errorMessage = 'Screenshot capture timed out. The design may be too complex or have restricted access.';
    } else if (errorMessage.includes('host_returned_error') || errorMessage.includes('403') || errorMessage.includes('401')) {
      statusCode = 403;
      errorMessage = 'Unable to access the Figma design. Please verify the link is public and accessible.';
    } else if (errorMessage.includes('All enhanced capture strategies failed')) {
      statusCode = 422;
      errorMessage = 'Despite trying multiple advanced capture strategies, we were unable to capture your Figma design. This may be due to enhanced bot detection or access restrictions.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message !== errorMessage ? error.message : undefined,
        isFigmaUrl: isFigmaUrl(requestData?.url || ''),
        strategiesAttempted: isFigmaUrl(requestData?.url || '') ? ['stealth', 'mobile', 'standard', 'fast'] : ['standard']
      }), 
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
