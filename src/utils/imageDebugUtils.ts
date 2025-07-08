/**
 * Debug utilities for image URL validation and troubleshooting
 */

export interface ImageDebugInfo {
  originalPath: string;
  isValidUrl: boolean;
  isSupabaseUrl: boolean;
  isPublicUrl: boolean;
  bucketName?: string;
  filePath?: string;
  errors: string[];
}

/**
 * Analyze an image URL for debugging purposes
 */
export function debugImageUrl(imagePath: string): ImageDebugInfo {
  const errors: string[] = [];
  
  const isValidUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');
  const isSupabaseUrl = imagePath.includes('supabase.co') || imagePath.includes('/storage/v1/object/');
  const isPublicUrl = imagePath.includes('/storage/v1/object/public/');
  
  let bucketName: string | undefined;
  let filePath: string | undefined;
  
  if (isSupabaseUrl) {
    try {
      const urlParts = imagePath.split('/storage/v1/object/');
      if (urlParts.length === 2) {
        const pathParts = urlParts[1].split('/');
        if (pathParts[0] === 'public' && pathParts.length > 2) {
          bucketName = pathParts[1];
          filePath = pathParts.slice(2).join('/');
        } else if (pathParts.length > 1) {
          bucketName = pathParts[0];
          filePath = pathParts.slice(1).join('/');
        }
      }
    } catch (error) {
      errors.push(`Failed to parse Supabase URL: ${error}`);
    }
  }
  
  // Validation checks
  if (!isValidUrl) {
    errors.push('Not a valid HTTP/HTTPS URL');
  }
  
  if (isSupabaseUrl && !isPublicUrl) {
    errors.push('Supabase URL is not public (missing /public/ in path)');
  }
  
  if (isSupabaseUrl && bucketName !== 'analysis-images') {
    errors.push(`Expected bucket 'analysis-images', got '${bucketName}'`);
  }
  
  return {
    originalPath: imagePath,
    isValidUrl,
    isSupabaseUrl,
    isPublicUrl,
    bucketName,
    filePath,
    errors
  };
}

/**
 * Log detailed image debugging information
 */
export function logImageDebugInfo(images: any[], context: string = 'Image Debug') {
  console.group(`🖼️ ${context} - Analyzing ${images.length} images`);
  
  images.forEach((img, index) => {
    const debugInfo = debugImageUrl(img.file_path || img.url || '');
    console.log(`Image ${index + 1} (${img.file_name || 'unnamed'}):`, {
      id: img.id?.substring(0, 8),
      fileName: img.file_name,
      filePath: img.file_path,
      debugInfo,
      hasErrors: debugInfo.errors.length > 0
    });
    
    if (debugInfo.errors.length > 0) {
      console.warn(`❌ Issues with image ${index + 1}:`, debugInfo.errors);
    }
  });
  
  console.groupEnd();
}

/**
 * Test image accessibility by attempting to load it
 */
export async function testImageAccessibility(imageUrl: string): Promise<{
  accessible: boolean;
  status?: number;
  error?: string;
  size?: number;
}> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    const accessible = response.ok;
    const size = response.headers.get('content-length') ? 
      parseInt(response.headers.get('content-length')!) : undefined;
    
    return {
      accessible,
      status: response.status,
      size
    };
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}