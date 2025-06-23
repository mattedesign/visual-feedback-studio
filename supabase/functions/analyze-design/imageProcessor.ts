
export async function fetchImageAsBase64(imageUrl: string): Promise<{ base64Image: string, mimeType: string }> {
  console.log('Fetching image from URL:', imageUrl.substring(0, 100) + '...');
  
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
    }
    
    // Get content type
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    console.log('Image mime type:', mimeType);
    
    // Get image as array buffer
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageSizeKB = Math.round(imageBuffer.byteLength / 1024);
    console.log('Image size:', imageSizeKB, 'KB');
    
    // Validate image size (max 50MB)
    if (imageBuffer.byteLength > 50 * 1024 * 1024) {
      throw new Error(`Image too large: ${imageSizeKB}KB (max 50MB allowed)`);
    }
    
    // Convert to base64 using proper method
    const uint8Array = new Uint8Array(imageBuffer);
    let binaryString = '';
    
    // Process in chunks to avoid stack overflow
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Image = btoa(binaryString);
    
    console.log('Base64 conversion completed, length:', base64Image.length);
    
    // Validate base64 format
    if (!base64Image || base64Image.length === 0) {
      throw new Error('Base64 conversion resulted in empty string');
    }
    
    return { base64Image, mimeType };
    
  } catch (error) {
    console.error('Error in fetchImageAsBase64:', error);
    throw new Error(`Image processing failed: ${error.message}`);
  }
}
