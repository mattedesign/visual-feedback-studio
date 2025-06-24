
import { createAnalysisPrompt } from './promptBuilder.ts';
import { RAGContext } from './types.ts';

export function createEnhancedPrompt(
  analysisPrompt?: string,
  isComparative?: boolean,
  isMultiImage?: boolean,
  imageUrls?: string[],
  ragContext?: RAGContext
): string {
  console.log('=== Enhanced Prompt Creation ===');
  console.log('Prompt configuration:', {
    hasAnalysisPrompt: !!analysisPrompt,
    isComparative,
    isMultiImage,
    imageCount: imageUrls?.length || 0,
    hasRAGContext: !!ragContext,
    ragKnowledgeCount: ragContext?.retrievedKnowledge.relevantPatterns.length || 0
  });

  // CRITICAL FIX: Always use the RAG-enhanced prompt when available
  if (ragContext?.enhancedPrompt) {
    console.log('🎯 Using RAG-enhanced prompt with research context');
    console.log('Research context details:', {
      knowledgeEntries: ragContext.retrievedKnowledge.relevantPatterns.length,
      competitorInsights: ragContext.retrievedKnowledge.competitorInsights.length,
      industry: ragContext.industryContext,
      citationsCount: ragContext.researchCitations.length,
      enhancedPromptLength: ragContext.enhancedPrompt.length
    });
    
    // Return the research-enhanced prompt immediately - this contains all the citations
    return ragContext.enhancedPrompt;
  }

  // Fallback: Use existing prompt building logic when no RAG context
  console.log('📊 No RAG context available, using standard prompt builder');
  
  const systemPrompt = createAnalysisPrompt(
    analysisPrompt, 
    isComparative || isMultiImage, 
    (imageUrls && imageUrls.length) || 1
  );
  
  console.log('System prompt created:', {
    promptLength: systemPrompt.length,
    includesComparative: systemPrompt.includes('COMPARATIVE'),
    includesImageCount: systemPrompt.includes(((imageUrls && imageUrls.length) || 1).toString())
  });

  let enhancedPrompt = systemPrompt;
  
  if (isMultiImage || isComparative) {
    enhancedPrompt += `\n\n=== MULTI-IMAGE CONTEXT ===\n`;
    enhancedPrompt += `You are analyzing ${(imageUrls && imageUrls.length) || 1} images for comparative analysis.\n`;
    if (imageUrls && imageUrls.length > 0) {
      enhancedPrompt += `Image URLs being analyzed:\n`;
      imageUrls.forEach((url, index) => {
        enhancedPrompt += `Image ${index}: ${url.substring(url.lastIndexOf('/') + 1)}\n`;
      });
      enhancedPrompt += `\nWhen providing annotations, use the imageIndex field (0-${imageUrls.length - 1}) to specify which image each annotation applies to.\n`;
    }
    enhancedPrompt += `Focus on comparative insights, consistency issues, and cross-design recommendations.\n`;
    enhancedPrompt += `=== END MULTI-IMAGE CONTEXT ===\n`;
  }

  console.log('Enhanced prompt prepared:', {
    finalLength: enhancedPrompt.length,
    isComparativeAnalysis: isComparative || isMultiImage
  });

  return enhancedPrompt;
}
