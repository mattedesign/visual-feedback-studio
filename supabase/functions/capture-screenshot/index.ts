
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ScreenshotRequest } from './types.ts';
import { captureScreenshot } from './screenshotService.ts';
import { handleError } from './errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum image size in bytes (3MB - reduced from 5MB)
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ScreenshotRequest = await req.json();
    
    console.log('Processing URL:', requestData.url);

    const response = await captureScreenshot(requestData);
    
    // Check content length before processing
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      console.warn('Image too large:', contentLength, 'bytes. Reducing quality.');
      
      // Retry with reduced quality for large images
      const reducedQualityRequest = {
        ...requestData,
        viewportWidth: Math.min(requestData.viewportWidth || 1200, 800),
        viewportHeight: Math.min(requestData.viewportHeight || 800, 600),
        format: 'jpg' as const,
        deviceScaleFactor: 1
      };
      
      const retryResponse = await captureScreenshot(reducedQualityRequest);
      const retryBlob = await retryResponse.blob();
      
      if (retryBlob.size > MAX_IMAGE_SIZE) {
        throw new Error('Screenshot too large even after optimization. Please try a different URL.');
      }
      
      return await processImageResponse(retryBlob, reducedQualityRequest.format || 'jpg');
    }
    
    const screenshotBlob = await response.blob();
    console.log('Screenshot capture completed, size:', screenshotBlob.size, 'bytes');
    
    if (screenshotBlob.size > MAX_IMAGE_SIZE) {
      throw new Error('Screenshot too large. Please try a different URL or contact support.');
    }
    
    return await processImageResponse(screenshotBlob, requestData.format || 'png');
    
  } catch (error) {
    return handleError(error);
  }
});

async function processImageResponse(blob: Blob, format: string): Promise<Response> {
  try {
    console.log('Starting image processing, blob size:', blob.size);
    
    if (blob.size === 0) {
      throw new Error('Empty image data received');
    }
    
    // Convert blob to array buffer
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log('Array buffer created, size:', uint8Array.length);
    
    // Use a more efficient base64 encoding approach
    let base64 = '';
    const chunkSize = 8192; // Smaller chunks to prevent stack overflow
    
    // Process in small chunks to avoid stack overflow
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      
      // Convert chunk to string safely
      let chunkString = '';
      for (let j = 0; j < chunk.length; j++) {
        chunkString += String.fromCharCode(chunk[j]);
      }
      
      // Encode chunk to base64
      base64 += btoa(chunkString);
      
      // Log progress for large images
      if (i % (chunkSize * 10) === 0) {
        console.log('Processing progress:', Math.round((i / uint8Array.length) * 100), '%');
      }
    }
    
    const screenshotUrl = `data:image/${format};base64,${base64}`;
    
    console.log('Base64 conversion completed, final size:', screenshotUrl.length, 'characters');
    
    // Validate the result
    if (screenshotUrl.length < 100) {
      throw new Error('Generated base64 data appears to be invalid or too small');
    }
    
    return new Response(
      JSON.stringify({ screenshotUrl }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (conversionError) {
    console.error('Error during base64 conversion:', conversionError);
    console.error('Conversion error details:', {
      message: conversionError?.message,
      name: conversionError?.name,
      stack: conversionError?.stack
    });
    throw new Error('Failed to process screenshot image. The image may be too large or corrupted.');
  }
}
