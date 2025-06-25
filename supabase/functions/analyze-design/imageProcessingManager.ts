
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
        const imageUrl = imageUrls[i];
        console.log(`🔄 Processing image ${i + 1}/${imageUrls.length}: ${imageUrl.substring(0, 50)}...`);
        
        try {
          // Fetch the image
          const response = await fetch(imageUrl);
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
