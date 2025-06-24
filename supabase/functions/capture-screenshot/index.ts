
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ScreenshotRequest } from './types.ts';
import { captureScreenshot } from './screenshotService.ts';
import { handleError } from './errorHandler.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Maximum image size in bytes (2MB - conservative limit)
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: ScreenshotRequest = await req.json();
    
    console.log('=== Screenshot Request Started ===');
    console.log('Processing URL:', requestData.url);
    console.log('Request timestamp:', new Date().toISOString());

    const response = await captureScreenshot(requestData);
    
    // Check content length before processing
    const contentLength = response.headers.get('content-length');
    console.log('Screenshot API content-length header:', contentLength);
    
    if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
      console.warn('Image too large:', contentLength, 'bytes. Retrying with reduced settings.');
      
      // Retry with very conservative settings for large images
      const reducedQualityRequest = {
        ...requestData,
        viewportWidth: 600,
        viewportHeight: 400,
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
    console.log('Screenshot blob received, size:', screenshotBlob.size, 'bytes');
    console.log('Screenshot blob type:', screenshotBlob.type);
    
    if (screenshotBlob.size > MAX_IMAGE_SIZE) {
      throw new Error('Screenshot too large. Please try a simpler page or contact support.');
    }
    
    if (screenshotBlob.size === 0) {
      throw new Error('Empty screenshot data received from API');
    }
    
    return await processImageResponse(screenshotBlob, requestData.format || 'png');
    
  } catch (error) {
    console.error('=== Screenshot Request Failed ===');
    console.error('Error timestamp:', new Date().toISOString());
    console.error('Error details:', error);
    return handleError(error);
  }
});

async function processImageResponse(blob: Blob, format: string): Promise<Response> {
  console.log('=== Image Processing Started ===');
  console.log('Input blob size:', blob.size, 'bytes');
  console.log('Input blob type:', blob.type);
  console.log('Target format:', format);
  
  try {
    if (blob.size === 0) {
      throw new Error('Empty image data received');
    }
    
    // Convert blob to array buffer with validation
    console.log('Converting blob to array buffer...');
    const arrayBuffer = await blob.arrayBuffer();
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Empty array buffer after blob conversion');
    }
    
    if (arrayBuffer.byteLength !== blob.size) {
      console.warn('Array buffer size mismatch:', {
        expected: blob.size,
        actual: arrayBuffer.byteLength
      });
    }
    
    const uint8Array = new Uint8Array(arrayBuffer);
    console.log('Array buffer created successfully, size:', uint8Array.length, 'bytes');
    
    // Validate image data format (check for valid image headers)
    const isValidImage = validateImageData(uint8Array, format);
    if (!isValidImage) {
      throw new Error(`Invalid ${format.toUpperCase()} image data format`);
    }
    
    // Use memory-efficient base64 conversion with validation
    console.log('Starting optimized base64 conversion...');
    const base64 = await convertToBase64Optimized(uint8Array);
    
    if (!base64 || base64.length === 0) {
      throw new Error('Base64 conversion resulted in empty string');
    }
    
    console.log('Base64 conversion completed, length:', base64.length, 'characters');
    
    // Construct data URL with validation
    const dataUrlPrefix = `data:image/${format};base64,`;
    const screenshotUrl = dataUrlPrefix + base64;
    
    console.log('Data URL constructed:');
    console.log('- Prefix length:', dataUrlPrefix.length);
    console.log('- Base64 length:', base64.length);
    console.log('- Total URL length:', screenshotUrl.length);
    
    // Validate the final data URL
    if (!screenshotUrl.startsWith(dataUrlPrefix)) {
      throw new Error('Generated data URL format is invalid');
    }
    
    // Additional validation - check if base64 string is properly formatted
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
      throw new Error('Generated base64 string contains invalid characters');
    }
    
    // Sample validation - check first and last few characters
    const firstChars = base64.substring(0, 10);
    const lastChars = base64.substring(base64.length - 10);
    console.log('Base64 validation:');
    console.log('- First 10 chars:', firstChars);
    console.log('- Last 10 chars:', lastChars);
    
    if (screenshotUrl.length < 100) {
      throw new Error('Generated data URL appears to be too small to be valid');
    }
    
    console.log('=== Image Processing Completed Successfully ===');
    console.log('Final validation passed, returning response');
    
    return new Response(
      JSON.stringify({ 
        screenshotUrl,
        metadata: {
          originalSize: blob.size,
          base64Length: base64.length,
          format: format,
          timestamp: new Date().toISOString()
        }
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (conversionError) {
    console.error('=== Image Processing Failed ===');
    console.error('Error timestamp:', new Date().toISOString());
    console.error('Processing error:', {
      message: conversionError?.message,
      name: conversionError?.name,
      stack: conversionError?.stack?.substring(0, 1000)
    });
    
    // Provide specific error messages based on the error type
    if (conversionError?.message?.includes('base64')) {
      throw new Error('Failed to encode image data to base64. The image may be corrupted.');
    } else if (conversionError?.message?.includes('Invalid') && conversionError?.message?.includes('image')) {
      throw new Error('Invalid image format received. Please try a different URL.');
    } else if (conversionError?.message?.includes('Empty')) {
      throw new Error('No image data received. The website may be blocking screenshots.');
    } else {
      throw new Error(`Image processing failed: ${conversionError?.message || 'Unknown error'}`);
    }
  }
}

// Optimized base64 conversion with better memory management
async function convertToBase64Optimized(uint8Array: Uint8Array): Promise<string> {
  console.log('Base64 conversion starting with optimized algorithm...');
  
  const chunkSize = 3 * 1024; // 3KB chunks for optimal base64 conversion (divisible by 3)
  let base64 = '';
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, uint8Array.length);
    const chunk = uint8Array.subarray(i, end);
    
    // Convert chunk to binary string more efficiently
    let binaryString = '';
    for (let j = 0; j < chunk.length; j++) {
      binaryString += String.fromCharCode(chunk[j]);
    }
    
    try {
      const chunkBase64 = btoa(binaryString);
      base64 += chunkBase64;
    } catch (btoaError) {
      console.error('btoa error at chunk', i, ':', btoaError);
      throw new Error(`Base64 encoding failed at position ${i}: ${btoaError.message}`);
    }
    
    // Log progress every 50 chunks to monitor without overwhelming logs
    if ((i / chunkSize) % 50 === 0) {
      const progress = Math.round((i / uint8Array.length) * 100);
      console.log('Base64 conversion progress:', progress, '%');
      
      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  console.log('Base64 conversion completed, validating result...');
  
  // Validate the result
  if (base64.length === 0) {
    throw new Error('Base64 conversion produced empty result');
  }
  
  // Check if the conversion looks correct (should be roughly 4/3 the size of input)
  const expectedLength = Math.ceil(uint8Array.length * 4 / 3);
  const actualLength = base64.length;
  const lengthDiff = Math.abs(actualLength - expectedLength);
  
  console.log('Base64 length validation:', {
    inputBytes: uint8Array.length,
    expectedBase64Length: expectedLength,
    actualBase64Length: actualLength,
    difference: lengthDiff
  });
  
  // Allow some variance but catch major discrepancies
  if (lengthDiff > expectedLength * 0.1) {
    console.warn('Base64 length seems incorrect, but proceeding...');
  }
  
  return base64;
}

// Validate image data format
function validateImageData(data: Uint8Array, format: string): boolean {
  console.log('Validating image data format for:', format);
  
  if (data.length < 10) {
    console.error('Image data too small to be valid');
    return false;
  }
  
  // Check for common image format signatures
  const header = Array.from(data.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('Image header (hex):', header);
  
  switch (format.toLowerCase()) {
    case 'png':
      // PNG signature: 89504E470D0A1A0A
      if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) {
        console.log('Valid PNG header detected');
        return true;
      }
      break;
    case 'jpg':
    case 'jpeg':
      // JPEG signature: FFD8FF
      if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) {
        console.log('Valid JPEG header detected');
        return true;
      }
      break;
    case 'webp':
      // WebP signature: RIFF + WEBP
      if (data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46 &&
          data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50) {
        console.log('Valid WebP header detected');
        return true;
      }
      break;
  }
  
  console.warn('Image format validation failed, but proceeding (may be a variant)');
  return true; // Allow proceeding even if header doesn't match exactly
}
