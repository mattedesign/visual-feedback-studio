
import { createAnalysisPrompt } from './promptBuilder.ts';

export function createEnhancedPrompt(
  analysisPrompt: string | undefined,
  isComparative: boolean | undefined,
  isMultiImage: boolean,
  imageUrls: string[]
): string {
  console.log('=== Prompt Creation Phase ===');
  
  const systemPrompt = createAnalysisPrompt(
    analysisPrompt, 
    isComparative || isMultiImage, 
    imageUrls.length
  );
  
  console.log('System prompt created:', {
    promptLength: systemPrompt.length,
    includesComparative: systemPrompt.includes('COMPARATIVE'),
    includesImageCount: systemPrompt.includes(imageUrls.length.toString())
  });

  let enhancedPrompt = systemPrompt;
  
  if (isMultiImage || isComparative) {
    enhancedPrompt += `\n\n=== MULTI-IMAGE CONTEXT ===\n`;
    enhancedPrompt += `You are analyzing ${imageUrls.length} images for comparative analysis.\n`;
    enhancedPrompt += `Image URLs being analyzed:\n`;
    imageUrls.forEach((url, index) => {
      enhancedPrompt += `Image ${index}: ${url.substring(url.lastIndexOf('/') + 1)}\n`;
    });
    enhancedPrompt += `\nWhen providing annotations, use the imageIndex field (0-${imageUrls.length - 1}) to specify which image each annotation applies to.\n`;
    enhancedPrompt += `Focus on comparative insights, consistency issues, and cross-design recommendations.\n`;
    enhancedPrompt += `=== END MULTI-IMAGE CONTEXT ===\n`;
  }

  console.log('Enhanced prompt prepared:', {
    finalLength: enhancedPrompt.length,
    isComparativeAnalysis: isComparative || isMultiImage
  });

  return enhancedPrompt;
}
