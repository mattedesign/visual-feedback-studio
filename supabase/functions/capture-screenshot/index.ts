
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const screenshotApiKey = Deno.env.get('SCREENSHOT_ONE_ACCESS_KEY');
    
    if (!screenshotApiKey) {
      console.error('Screenshot One API key not found in environment variables');
      return new Response(
        JSON.stringify({ error: 'Screenshot One API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requestData: ScreenshotRequest = await req.json();
    const { url, fullPage = true, viewportWidth = 1200, viewportHeight = 800, deviceScaleFactor = 1, format = 'png', cache = false, delay = 0 } = requestData;

    console.log('Capturing screenshot for URL:', url);
    console.log('Screenshot options:', { fullPage, viewportWidth, viewportHeight, deviceScaleFactor, format, cache, delay });

    // Validate URL
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        throw new Error('Invalid URL protocol');
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL provided' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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
    
    // Fix delay parameter - API expects seconds, not milliseconds, and max 30 seconds
    if (delay && delay > 0) {
      const delayInSeconds = Math.min(delay <= 30 ? delay : Math.floor(delay / 1000), 30);
      screenshotApiUrl.searchParams.set('delay', delayInSeconds.toString());
    }

    console.log('Making request to Screenshot One API with URL:', screenshotApiUrl.toString().replace(screenshotApiKey, '[REDACTED]'));
    
    const response = await fetch(screenshotApiUrl.toString());
    
    console.log('Screenshot API response status:', response.status);
    console.log('Screenshot API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Screenshot API error details:', errorText);
      return new Response(
        JSON.stringify({ 
          error: `Screenshot API error: ${response.status} ${response.statusText}`,
          details: errorText
        }), 
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the screenshot as a blob and convert to data URL for frontend use
    const screenshotBlob = await response.blob();
    const screenshotArrayBuffer = await screenshotBlob.arrayBuffer();
    
    console.log('Screenshot captured successfully, size:', screenshotArrayBuffer.byteLength, 'bytes');
    
    // Return the screenshot as base64 data URL for easy handling in the frontend
    const screenshotBase64 = btoa(String.fromCharCode(...new Uint8Array(screenshotArrayBuffer)));
    const dataUrl = `data:image/${format};base64,${screenshotBase64}`;
    
    return new Response(
      JSON.stringify({ screenshotUrl: dataUrl }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in capture-screenshot function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
