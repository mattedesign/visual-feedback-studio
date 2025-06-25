

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
      // Use the current origin for lovable-uploads
      return `https://e1dd9711-6db1-4967-b1cc-c8425b453c2a.lovableproject.com${imageUrl}`;
    }
    
    // If it's a relative URL that might be a Supabase storage path
    if (imageUrl.startsWith('/')) {
      // Try to construct a full URL using the current request origin
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      if (supabaseUrl) {
        return `${supabaseUrl}${imageUrl}`;
      }
    }
    
    // If none of the above, assume it's already a valid URL
    return imageUrl;
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
          // Fetch the image
          const response = await fetch(fullUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }

          // Get the image as array buffer
          const arrayBuffer = await response.arrayBuffer();
          
          // Convert to base64
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          // Get content type
          const mimeType = response.headers.get('content-type') || 'image/jpeg';
          
          console.log(`✅ Image ${i + 1} processed successfully:`, {
            mimeType,
            sizeKB: Math.round(arrayBuffer.byteLength / 1024)
          });

          processedImages.push({
            base64Data,
            mimeType
          });

        } catch (imageError) {
          console.error(`❌ Failed to process image ${i + 1}:`, imageError);
          throw new Error(`Failed to process image ${i + 1}: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
        }
      }

      console.log('✅ All images processed successfully:', {
        totalProcessed: processedImages.length,
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

