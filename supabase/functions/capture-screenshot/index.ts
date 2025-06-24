
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ScreenshotRequest } from './types.ts';
import { captureScreenshot } from './screenshotService.ts';
import { handleError } from './errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum image size in bytes (2MB - further reduced for better stability)
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

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
      console.warn('Image too large:', contentLength, 'bytes. Retrying with reduced settings.');
      
      // Retry with very conservative settings for large images
      const reducedQualityRequest = {
        ...requestData,
        viewportWidth: 800,
        viewportHeight: 600,
        format: 'jpg' as const,
        deviceScaleFactor: 1
      };
      
      const retryResponse = await captureScreenshot(reducedQualityRequest);
      const retryBlob = await retryResponse.blob();
      
      if (retryBlob.size > MAX_IMAGE_SIZE) {
        throw new Error('Screenshot too large even after optimization. Please try a simpler page.');
      }
      
      return await processImageResponse(retryBlob, reducedQualityRequest.format || 'jpg');
    }
    
    const screenshotBlob = await response.blob();
    console.log('Screenshot capture completed, size:', screenshotBlob.size, 'bytes');
    
    if (screenshotBlob.size > MAX_IMAGE_SIZE) {
      throw new Error('Screenshot too large. Please try a simpler page or contact support.');
    }
    
    return await processImageResponse(screenshotBlob, requestData.format || 'png');
    
  } catch (error) {
    console.error('Screenshot capture error:', error);
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
    
    // Use a memory-efficient base64 conversion that avoids stack overflow
    let base64 = '';
    const chunkSize = 1024; // Small chunks to prevent stack overflow
    
    console.log('Starting base64 conversion with chunk size:', chunkSize);
    
    // Process in very small chunks to avoid any stack issues
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const end = Math.min(i + chunkSize, uint8Array.length);
      const chunk = uint8Array.subarray(i, end);
      
      // Convert each byte to character individually to avoid spreading large arrays
      let chunkString = '';
      for (let j = 0; j < chunk.length; j++) {
        chunkString += String.fromCharCode(chunk[j]);
      }
      
      // Encode chunk to base64
      try {
        base64 += btoa(chunkString);
      } catch (btoaError) {
        console.error('btoa error at chunk', i, ':', btoaError);
        throw new Error('Failed to encode image data to base64');
      }
      
      // Log progress every 100 chunks to avoid too much logging
      if ((i / chunkSize) % 100 === 0) {
        const progress = Math.round((i / uint8Array.length) * 100);
        console.log('Base64 conversion progress:', progress, '%');
      }
    }
    
    const screenshotUrl = `data:image/${format};base64,${base64}`;
    
    console.log('Base64 conversion completed successfully');
    console.log('Final base64 string length:', screenshotUrl.length, 'characters');
    
    // Validate the result
    if (screenshotUrl.length < 100) {
      throw new Error('Generated base64 data appears to be invalid or too small');
    }
    
    // Additional validation - check if the base64 string looks valid
    if (!screenshotUrl.startsWith(`data:image/${format};base64,`)) {
      throw new Error('Generated data URL format is invalid');
    }
    
    console.log('Screenshot processing completed successfully');
    
    return new Response(
      JSON.stringify({ screenshotUrl }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (conversionError) {
    console.error('Error during image processing:', conversionError);
    console.error('Conversion error details:', {
      message: conversionError?.message,
      name: conversionError?.name,
      stack: conversionError?.stack?.substring(0, 500) // Limit stack trace length
    });
    
    // Provide more specific error messages based on the error type
    if (conversionError?.message?.includes('btoa')) {
      throw new Error('Failed to encode image data. The image may contain invalid characters.');
    } else if (conversionError?.message?.includes('stack')) {
      throw new Error('Image too complex to process. Please try a simpler page.');
    } else {
      throw new Error('Failed to process screenshot image. Please try again or contact support.');
    }
  }
}
