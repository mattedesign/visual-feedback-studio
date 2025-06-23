
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

const captureScreenshot = async (requestData: ScreenshotRequest): Promise<Response> => {
  const screenshotApiKey = Deno.env.get('SCREENSHOT_ONE_ACCESS_KEY');
  
  if (!screenshotApiKey) {
    console.error('Screenshot One API key not found in environment variables');
    throw new Error('Screenshot One API key not configured');
  }

  const { url, fullPage = true, format = 'png', cache = false } = requestData;

  console.log('Capturing screenshot for URL:', url);

  // Validate URL
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      throw new Error('Invalid URL protocol');
    }
  } catch {
    throw new Error('Invalid URL provided');
  }

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ScreenshotRequest = await req.json();
    
    console.log('Processing URL:', requestData.url);

    const response = await captureScreenshot(requestData);
    const screenshotBlob = await response.blob();
    const screenshotArrayBuffer = await screenshotBlob.arrayBuffer();
    
    console.log('Screenshot capture completed, size:', screenshotArrayBuffer.byteLength, 'bytes');
    
    const screenshotBase64 = btoa(String.fromCharCode(...new Uint8Array(screenshotArrayBuffer)));
    const screenshotUrl = `data:image/${requestData.format || 'png'};base64,${screenshotBase64}`;
    
    return new Response(
      JSON.stringify({ screenshotUrl }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in capture-screenshot function:', error);
    
    let errorMessage = error.message || 'Internal server error';
    let statusCode = 500;
    
    if (errorMessage.includes('Invalid URL')) {
      statusCode = 400;
    } else if (errorMessage.includes('API key not configured')) {
      statusCode = 500;
      errorMessage = 'Screenshot service configuration error';
    } else if (errorMessage.includes('timeout')) {
      statusCode = 408;
      errorMessage = 'Screenshot capture timed out.';
    } else if (errorMessage.includes('host_returned_error') || errorMessage.includes('403') || errorMessage.includes('401')) {
      statusCode = 403;
      errorMessage = 'Unable to access the website. Please verify the URL is accessible.';
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
