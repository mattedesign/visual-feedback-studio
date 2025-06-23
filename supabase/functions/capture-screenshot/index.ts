
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
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const validateScreenshotContent = (base64Data: string): boolean => {
  // Basic validation - check if it's a valid base64 image
  if (!base64Data || base64Data.length < 1000) {
    return false;
  }
  
  return true;
};

const captureScreenshot = async (requestData: ScreenshotRequest, attempt: number = 1): Promise<Response> => {
  const screenshotApiKey = Deno.env.get('SCREENSHOT_ONE_ACCESS_KEY');
  
  if (!screenshotApiKey) {
    console.error('Screenshot One API key not found in environment variables');
    throw new Error('Screenshot One API key not configured');
  }

  const { url, fullPage = true, viewportWidth = 1200, viewportHeight = 800, deviceScaleFactor = 1, format = 'png', cache = false, delay = 0 } = requestData;

  console.log(`Attempt ${attempt}: Capturing screenshot for URL:`, url);
  console.log('Screenshot options:', { fullPage, viewportWidth, viewportHeight, deviceScaleFactor, format, cache, delay });

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

  // Build the Screenshot One API URL with only valid parameters
  const screenshotApiUrl = new URL('https://api.screenshotone.com/take');
  screenshotApiUrl.searchParams.set('access_key', screenshotApiKey);
  screenshotApiUrl.searchParams.set('url', url);
  screenshotApiUrl.searchParams.set('full_page', fullPage.toString());
  screenshotApiUrl.searchParams.set('viewport_width', viewportWidth.toString());
  screenshotApiUrl.searchParams.set('viewport_height', viewportHeight.toString());
  screenshotApiUrl.searchParams.set('device_scale_factor', deviceScaleFactor.toString());
  screenshotApiUrl.searchParams.set('format', format);
  screenshotApiUrl.searchParams.set('cache', cache.toString());

  // Enhanced Figma-specific optimizations using only valid parameters
  if (isFigma) {
    console.log('Applying Figma-specific optimizations...');
    
    // Use valid parameters for bot detection avoidance
    screenshotApiUrl.searchParams.set('block_ads', 'true');
    screenshotApiUrl.searchParams.set('block_trackers', 'true');
    screenshotApiUrl.searchParams.set('block_cookie_banners', 'true');
    
    // Enhanced browser simulation with valid user agent
    screenshotApiUrl.searchParams.set('user_agent', getRandomUserAgent());
    
    // Advanced timing parameters - minimum 15 seconds for Figma
    const figmaDelay = Math.max(delay || 15, 15);
    screenshotApiUrl.searchParams.set('delay', Math.min(figmaDelay, 30).toString());
    screenshotApiUrl.searchParams.set('wait_until', 'networkidle0');
    screenshotApiUrl.searchParams.set('timeout', '60');
    
  } else {
    // Standard delay handling for non-Figma URLs
    if (delay && delay > 0) {
      const delayInSeconds = Math.min(delay <= 30 ? delay : Math.floor(delay / 1000), 30);
      screenshotApiUrl.searchParams.set('delay', delayInSeconds.toString());
    }
    
    // Basic user agent for non-Figma URLs
    screenshotApiUrl.searchParams.set('user_agent', getRandomUserAgent());
  }

  console.log('Making request to Screenshot One API...');
  console.log('API URL:', screenshotApiUrl.toString());
  
  const response = await fetch(screenshotApiUrl.toString());
  
  console.log(`Attempt ${attempt}: Screenshot API response status:`, response.status);
  console.log(`Attempt ${attempt}: Screenshot API response headers:`, Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Attempt ${attempt}: Screenshot API error details:`, errorText);
    
    // Parse error details for better handling
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

const attemptFigmaScreenshotWithFallback = async (requestData: ScreenshotRequest): Promise<string> => {
  const maxRetries = 3;
  let lastError: Error | null = null;

  // Strategy 1: Standard approach with valid parameters
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Strategy 1 - Attempt ${attempt}: Standard approach with valid parameters`);
      const response = await captureScreenshot(requestData, attempt);
      const screenshotBlob = await response.blob();
      const screenshotArrayBuffer = await screenshotBlob.arrayBuffer();
      
      if (screenshotArrayBuffer.byteLength > 5000) {
        const screenshotBase64 = btoa(String.fromCharCode(...new Uint8Array(screenshotArrayBuffer)));
        
        if (validateScreenshotContent(screenshotBase64)) {
          console.log(`Strategy 1 - Attempt ${attempt}: Success! Screenshot size:`, screenshotArrayBuffer.byteLength, 'bytes');
          return `data:image/${requestData.format || 'png'};base64,${screenshotBase64}`;
        }
      }
      
      console.log(`Strategy 1 - Attempt ${attempt}: Screenshot too small or invalid, retrying...`);
    } catch (error) {
      lastError = error;
      console.error(`Strategy 1 - Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt - 1) * 2000; // 2s, 4s, 8s
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // Strategy 2: Reduced parameters approach
  console.log('Strategy 2: Trying with minimal parameters...');
  try {
    const reducedRequest = {
      ...requestData,
      delay: 10, // Shorter delay
      viewportWidth: 1440,
      viewportHeight: 900,
    };
    
    const response = await captureScreenshot(reducedRequest, 1);
    const screenshotBlob = await response.blob();
    const screenshotArrayBuffer = await screenshotBlob.arrayBuffer();
    
    if (screenshotArrayBuffer.byteLength > 5000) {
      const screenshotBase64 = btoa(String.fromCharCode(...new Uint8Array(screenshotArrayBuffer)));
      if (validateScreenshotContent(screenshotBase64)) {
        console.log('Strategy 2: Success with minimal parameters!');
        return `data:image/${requestData.format || 'png'};base64,${screenshotBase64}`;
      }
    }
  } catch (error) {
    console.error('Strategy 2 failed:', error.message);
    lastError = error;
  }

  // If all strategies fail, throw the last error
  throw lastError || new Error('All screenshot capture strategies failed');
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
      // Use enhanced Figma capture with fallback strategies
      screenshotUrl = await attemptFigmaScreenshotWithFallback(requestData);
    } else {
      // Standard single-attempt capture for non-Figma URLs
      const response = await captureScreenshot(requestData, 1);
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
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Internal server error';
    let statusCode = 500;
    
    if (errorMessage.includes('Invalid URL')) {
      statusCode = 400;
    } else if (errorMessage.includes('API key not configured')) {
      statusCode = 500;
      errorMessage = 'Screenshot service configuration error';
    } else if (errorMessage.includes('host_returned_error') || errorMessage.includes('bot detection')) {
      errorMessage = 'The Figma design could not be captured. Please ensure the design is publicly accessible and try again.';
    } else if (errorMessage.includes('timeout')) {
      errorMessage = 'Screenshot capture timed out. The design may be too complex or have restricted access.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message !== errorMessage ? error.message : undefined,
        isFigmaUrl: error.message.includes('figma.com') ? true : undefined
      }), 
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
