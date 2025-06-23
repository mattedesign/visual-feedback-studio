
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

  // Build the Screenshot One API URL with correct parameter names
  const screenshotApiUrl = new URL('https://api.screenshotone.com/take');
  screenshotApiUrl.searchParams.set('access_key', screenshotApiKey);
  screenshotApiUrl.searchParams.set('url', url);
  screenshotApiUrl.searchParams.set('full_page', fullPage.toString());
  screenshotApiUrl.searchParams.set('viewport_width', viewportWidth.toString());
  screenshotApiUrl.searchParams.set('viewport_height', viewportHeight.toString());
  screenshotApiUrl.searchParams.set('device_scale_factor', deviceScaleFactor.toString());
  screenshotApiUrl.searchParams.set('format', format);
  screenshotApiUrl.searchParams.set('cache', cache.toString());

  // Figma-specific optimizations
  if (isFigma) {
    console.log('Applying Figma-specific optimizations...');
    
    // Ignore host errors for Figma (they often return non-2xx status codes)
    screenshotApiUrl.searchParams.set('ignore_host_errors', 'true');
    
    // Enable JavaScript rendering
    screenshotApiUrl.searchParams.set('block_ads', 'true');
    screenshotApiUrl.searchParams.set('block_trackers', 'true');
    screenshotApiUrl.searchParams.set('block_cookie_banners', 'true');
    
    // Increase delay for Figma to load properly (minimum 5 seconds for Figma)
    const figmaDelay = Math.max(delay || 5, 5);
    screenshotApiUrl.searchParams.set('delay', Math.min(figmaDelay, 30).toString());
    
    // Set user agent to mimic a real browser
    screenshotApiUrl.searchParams.set('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Wait for network idle
    screenshotApiUrl.searchParams.set('wait_until', 'network_idle');
  } else {
    // Standard delay handling for non-Figma URLs
    if (delay && delay > 0) {
      const delayInSeconds = Math.min(delay <= 30 ? delay : Math.floor(delay / 1000), 30);
      screenshotApiUrl.searchParams.set('delay', delayInSeconds.toString());
    }
  }

  console.log('Making request to Screenshot One API with URL:', screenshotApiUrl.toString().replace(screenshotApiKey, '[REDACTED]'));
  
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ScreenshotRequest = await req.json();
    const maxRetries = isFigmaUrl(requestData.url) ? 3 : 1;
    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await captureScreenshot(requestData, attempt);
        
        // Get the screenshot as a blob and convert to data URL for frontend use
        const screenshotBlob = await response.blob();
        const screenshotArrayBuffer = await screenshotBlob.arrayBuffer();
        
        console.log(`Attempt ${attempt}: Screenshot captured successfully, size:`, screenshotArrayBuffer.byteLength, 'bytes');
        
        // Return the screenshot as base64 data URL for easy handling in the frontend
        const screenshotBase64 = btoa(String.fromCharCode(...new Uint8Array(screenshotArrayBuffer)));
        const dataUrl = `data:image/${requestData.format || 'png'};base64,${screenshotBase64}`;
        
        return new Response(
          JSON.stringify({ screenshotUrl: dataUrl }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        // If this isn't the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // If all retries failed, return the last error
    throw lastError;
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
    } else if (errorMessage.includes('host_returned_error')) {
      errorMessage = 'The target website is not accessible or returned an error. For Figma URLs, please ensure the design is publicly accessible.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message !== errorMessage ? error.message : undefined
      }), 
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
