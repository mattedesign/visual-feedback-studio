
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ScreenshotRequest } from './types.ts';
import { captureScreenshot } from './screenshotService.ts';
import { handleError } from './errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    return handleError(error);
  }
});
