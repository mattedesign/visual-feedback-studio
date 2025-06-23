
import { fetchImageAsBase64 } from './imageProcessor.ts';

export interface ProcessedImage {
  base64Image: string;
  mimeType: string;
  index: number;
  url: string;
}

export async function processImages(imageUrls: string[]): Promise<ProcessedImage[]> {
  console.log('=== Image Processing Phase ===');
  
  const processedImages: ProcessedImage[] = [];
  
  for (let index = 0; index < imageUrls.length; index++) {
    const url = imageUrls[index];
    console.log(`Processing image ${index + 1}/${imageUrls.length}: ${url.substring(0, 50)}...`);
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Image processing timeout (30s)')), 30000);
      });
      
      const processPromise = fetchImageAsBase64(url);
      const result = await Promise.race([processPromise, timeoutPromise]);
      
      const { base64Image, mimeType } = result;
      
      console.log(`Image ${index + 1} processed successfully:`, {
        mimeType,
        base64Size: base64Image.length,
        isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Image.substring(0, 100))
      });
      
      processedImages.push({ base64Image, mimeType, index, url });
    } catch (imageError) {
      console.error(`Image ${index + 1} processing failed:`, imageError);
      throw new Error(`Failed to process image ${index + 1}: ${imageError.message}`);
    }
  }

  console.log('All images processed successfully');
  return processedImages;
}
