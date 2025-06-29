
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

  // 🔥 FIXED: Safe base64 conversion without recursion
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    console.log('🔄 Converting array buffer to base64, size:', buffer.byteLength);
    
    try {
      const uint8Array = new Uint8Array(buffer);
      
      // Use smaller chunk size to prevent stack overflow
      const chunkSize = 8192; // 8KB chunks
      let result = '';
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        
        // Convert chunk to string using a safe method
        const chunkArray = Array.from(chunk);
        const binaryString = String.fromCharCode.apply(null, chunkArray);
        result += btoa(binaryString);
      }
      
      console.log('✅ Base64 conversion completed, length:', result.length);
      return result;
      
    } catch (error) {
      console.error('❌ Base64 conversion failed:', error);
      
      // Fallback: Use FileReader approach for smaller images
      try {
        const blob = new Blob([buffer]);
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }) as any;
      } catch (fallbackError) {
        throw new Error(`Base64 conversion failed: ${error.message}`);
      }
    }
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
          // 🔥 FIXED: Add timeout and proper error handling
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          const response = await fetch(fullUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'FigmantAI/1.0'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }

          // Get the image as array buffer with size check
          const arrayBuffer = await response.arrayBuffer();
          
          // 🔥 FIXED: Validate image size (max 10MB for processing to avoid stack overflow)
          const maxSize = 10 * 1024 * 1024;
          if (arrayBuffer.byteLength > maxSize) {
            console.warn(`⚠️ Image ${i + 1} too large: ${Math.round(arrayBuffer.byteLength / 1024)}KB, skipping`);
            continue; // Skip this image instead of failing entirely
          }
          
          if (arrayBuffer.byteLength === 0) {
            throw new Error('Empty image data received');
          }
          
          // 🔥 FIXED: Use safe base64 conversion
          const base64Data = this.arrayBufferToBase64(arrayBuffer);
          
          // Get content type with fallback
          const mimeType = response.headers.get('content-type') || 'image/jpeg';
          
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
