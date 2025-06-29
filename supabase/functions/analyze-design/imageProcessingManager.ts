
interface ProcessedImage {
  base64Data: string;
  mimeType: string;
  width?: number;
  height?: number;
}

interface ImageProcessingResult {
  success: boolean;
  processedImages: ProcessedImage[];
  error?: string;
}

class ImageProcessingManager {
  private convertToFullUrl(imageUrl: string): string {
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative URL starting with /lovable-uploads/, convert to full URL
    if (imageUrl.startsWith('/lovable-uploads/')) {
      return `https://preview--figmant-ai.lovable.app${imageUrl}`;
    }
    
    // If it's a relative URL that might be a Supabase storage path
    if (imageUrl.startsWith('/')) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      if (supabaseUrl) {
        return `${supabaseUrl}${imageUrl}`;
      }
    }
    
    return imageUrl;
  }

  // 🔥 FIXED: Improved base64 conversion with better error handling
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    console.log('🔄 Converting array buffer to base64, size:', buffer.byteLength);
    
    try {
      // Convert to Uint8Array
      const bytes = new Uint8Array(buffer);
      
      // Convert to binary string using a safe method
      let binaryString = '';
      const chunkSize = 1024; // Smaller chunks for stability
      
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        // Use Array.from to avoid spread operator issues
        const charCodes = Array.from(chunk);
        binaryString += String.fromCharCode.apply(null, charCodes);
      }
      
      // Convert to base64
      const base64 = btoa(binaryString);
      
      console.log('✅ Base64 conversion completed, length:', base64.length);
      return base64;
      
    } catch (error) {
      console.error('❌ Base64 conversion failed:', error);
      throw new Error(`Base64 conversion failed: ${error.message}`);
    }
  }

  // 🔥 FIXED: Better image validation and processing
  private async validateAndProcessImage(arrayBuffer: ArrayBuffer, mimeType: string): Promise<string> {
    // Check if it's a valid image by looking at the first few bytes (magic numbers)
    const bytes = new Uint8Array(arrayBuffer);
    
    // PNG signature
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      console.log('✅ Valid PNG image detected');
      return this.arrayBufferToBase64(arrayBuffer);
    }
    
    // JPEG signature
    if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xD8) {
      console.log('✅ Valid JPEG image detected');
      return this.arrayBufferToBase64(arrayBuffer);
    }
    
    // WebP signature
    if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && 
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      console.log('✅ Valid WebP image detected');
      return this.arrayBufferToBase64(arrayBuffer);
    }
    
    // If we can't identify the format, try to process anyway but log a warning
    console.warn('⚠️ Unknown image format, attempting to process anyway');
    return this.arrayBufferToBase64(arrayBuffer);
  }

  async processImages(
    imageUrls: string[],
    isComparative: boolean = false
  ): Promise<ImageProcessingResult> {
    console.log('🖼️ ImageProcessingManager.processImages - Starting processing');
    console.log('📊 Processing parameters:', {
      imageCount: imageUrls.length,
      isComparative,
      urls: imageUrls.map(url => url.substring(0, 50) + '...')
    });

    if (!imageUrls || imageUrls.length === 0) {
      console.error('❌ No image URLs provided');
      return {
        success: false,
        processedImages: [],
        error: 'No image URLs provided'
      };
    }

    const processedImages: ProcessedImage[] = [];
    
    try {
      for (let i = 0; i < imageUrls.length; i++) {
        const originalUrl = imageUrls[i];
        const fullUrl = this.convertToFullUrl(originalUrl);
        
        console.log(`🔄 Processing image ${i + 1}/${imageUrls.length}:`);
        console.log(`   Original URL: ${originalUrl.substring(0, 50)}...`);
        console.log(`   Full URL: ${fullUrl.substring(0, 100)}...`);
        
        try {
          // 🔥 FIXED: Better fetch with timeout and headers
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          const response = await fetch(fullUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'FigmantAI/1.0',
              'Accept': 'image/*'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }

          // Get the image as array buffer with size check
          const arrayBuffer = await response.arrayBuffer();
          
          // 🔥 FIXED: Validate image size (max 5MB to be safe)
          const maxSize = 5 * 1024 * 1024;
          if (arrayBuffer.byteLength > maxSize) {
            console.warn(`⚠️ Image ${i + 1} too large: ${Math.round(arrayBuffer.byteLength / 1024)}KB, skipping`);
            continue;
          }
          
          if (arrayBuffer.byteLength === 0) {
            throw new Error('Empty image data received');
          }
          
          // Get content type with fallback
          const mimeType = response.headers.get('content-type') || 'image/png';
          
          // 🔥 FIXED: Validate and process the image
          const base64Data = await this.validateAndProcessImage(arrayBuffer, mimeType);
          
          console.log(`✅ Image ${i + 1} processed successfully:`, {
            mimeType,
            sizeKB: Math.round(arrayBuffer.byteLength / 1024),
            base64Length: base64Data.length
          });

          processedImages.push({
            base64Data,
            mimeType
          });

        } catch (imageError) {
          console.error(`❌ Failed to process image ${i + 1}:`, imageError);
          
          // 🔥 FIXED: Don't fail entire batch for one image
          if (imageUrls.length === 1) {
            // If it's the only image, fail the request
            throw new Error(`Failed to process image: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
          } else {
            // If it's part of a batch, log and continue
            console.warn(`⚠️ Skipping image ${i + 1} due to processing error:`, imageError.message);
            continue;
          }
        }
      }

      if (processedImages.length === 0) {
        throw new Error('No images could be processed successfully');
      }

      console.log('✅ Image processing completed:', {
        totalProcessed: processedImages.length,
        totalRequested: imageUrls.length,
        isComparative
      });

      return {
        success: true,
        processedImages
      };

    } catch (error) {
      console.error('❌ ImageProcessingManager.processImages - Error:', error);
      return {
        success: false,
        processedImages: [],
        error: error instanceof Error ? error.message : 'Unknown image processing error'
      };
    }
  }
}

export const imageProcessingManager = new ImageProcessingManager();
