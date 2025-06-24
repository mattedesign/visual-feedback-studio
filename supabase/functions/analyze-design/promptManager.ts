
import { createAnalysisPrompt } from './promptBuilder.ts';
import { RAGContext } from './types.ts';

export function createEnhancedPrompt(
  analysisPrompt?: string,
  isComparative?: boolean,
  isMultiImage?: boolean,
  imageUrls?: string[],
  ragContext?: RAGContext
): string {
  console.log('=== Enhanced Prompt Creation with Advanced RAG ===');
  console.log('Prompt configuration:', {
    hasAnalysisPrompt: !!analysisPrompt,
    isComparative,
    isMultiImage,
    imageCount: imageUrls?.length || 0,
    hasRAGContext: !!ragContext,
    ragKnowledgeCount: ragContext?.retrievedKnowledge.relevantPatterns.length || 0,
    ragCitationsCount: ragContext?.researchCitations.length || 0,
    ragIndustryContext: ragContext?.industryContext || 'general'
  });

  // PRIORITY 1: Use RAG-enhanced prompt when available (this is research-backed)
  if (ragContext?.enhancedPrompt) {
    console.log('🎯 Using RAG-enhanced prompt with comprehensive research context');
    console.log('Enhanced RAG context details:', {
      knowledgeEntries: ragContext.retrievedKnowledge.relevantPatterns.length,
      competitorInsights: ragContext.retrievedKnowledge.competitorInsights.length,
      industry: ragContext.industryContext,
      citationsCount: ragContext.researchCitations.length,
      searchTermsCount: ragContext.searchCitations?.length || 0,
      enhancedPromptLength: ragContext.enhancedPrompt.length
    });
    
    // Add multi-image context to the RAG-enhanced prompt if needed
    let finalPrompt = ragContext.enhancedPrompt;
    
    if (isMultiImage || isComparative) {
      finalPrompt += `\n\n=== MULTI-IMAGE ANALYSIS CONTEXT ===\n`;
      finalPrompt += `You are analyzing ${(imageUrls && imageUrls.length) || 1} images for comparative analysis.\n`;
      if (imageUrls && imageUrls.length > 0) {
        finalPrompt += `Image Context:\n`;
        imageUrls.forEach((url, index) => {
          finalPrompt += `Image ${index}: ${url.substring(url.lastIndexOf('/') + 1)}\n`;
        });
        finalPrompt += `\nIMPORTANT: Use the imageIndex field (0-${imageUrls.length - 1}) to specify which image each annotation applies to.\n`;
      }
      finalPrompt += `Focus on comparative insights, consistency issues, and cross-design recommendations based on the research context provided above.\n`;
      finalPrompt += `=== END MULTI-IMAGE CONTEXT ===\n`;
    }
    
    return finalPrompt;
  }

  // PRIORITY 2: Build enhanced prompt with available RAG knowledge
  if (ragContext && ragContext.retrievedKnowledge.relevantPatterns.length > 0) {
    console.log('🔧 Building enhanced prompt with available RAG knowledge');
    
    let enhancedPrompt = createAnalysisPrompt(
      analysisPrompt, 
      isComparative || isMultiImage, 
      (imageUrls && imageUrls.length) || 1
    );
    
    // Inject research context into the standard prompt
    enhancedPrompt += `\n\n=== RESEARCH-BACKED ANALYSIS CONTEXT ===\n`;
    enhancedPrompt += `Your analysis should be informed by these ${ragContext.retrievedKnowledge.relevantPatterns.length} research insights:\n\n`;
    
    // Add knowledge entries in a structured way
    const categorizedKnowledge = ragContext.retrievedKnowledge.relevantPatterns.reduce((acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<string, any[]>);
    
    Object.entries(categorizedKnowledge).forEach(([category, entries]) => {
      enhancedPrompt += `**${category.toUpperCase()} RESEARCH (${entries.length} sources):**\n`;
      entries.forEach((entry, i) => {
        const similarityPercentage = ((entry.similarity || 0) * 100).toFixed(1);
        enhancedPrompt += `${i + 1}. **${entry.title}** (${similarityPercentage}% relevance)\n`;
        enhancedPrompt += `   Research: ${entry.content.substring(0, 300)}...\n`;
        enhancedPrompt += `   Source: ${entry.source}\n\n`;
      });
    });
    
    enhancedPrompt += `RESEARCH-BACKED REQUIREMENTS:\n`;
    enhancedPrompt += `- Ground ALL recommendations in the provided research insights\n`;
    enhancedPrompt += `- Cite specific sources when making claims\n`;
    enhancedPrompt += `- Provide actionable, research-backed recommendations\n`;
    enhancedPrompt += `- Explain HOW each recommendation connects to the research\n`;
    enhancedPrompt += `- Include implementation guidance based on research best practices\n`;
    enhancedPrompt += `=== END RESEARCH CONTEXT ===\n\n`;
    
    // Add multi-image context if needed
    if (isMultiImage || isComparative) {
      enhancedPrompt += `=== MULTI-IMAGE CONTEXT ===\n`;
      enhancedPrompt += `You are analyzing ${(imageUrls && imageUrls.length) || 1} images for comparative analysis.\n`;
      if (imageUrls && imageUrls.length > 0) {
        enhancedPrompt += `Image URLs being analyzed:\n`;
        imageUrls.forEach((url, index) => {
          enhancedPrompt += `Image ${index}: ${url.substring(url.lastIndexOf('/') + 1)}\n`;
        });
        enhancedPrompt += `\nWhen providing annotations, use the imageIndex field (0-${imageUrls.length - 1}) to specify which image each annotation applies to.\n`;
      }
      enhancedPrompt += `Focus on comparative insights, consistency issues, and cross-design recommendations while incorporating the research context above.\n`;
      enhancedPrompt += `=== END MULTI-IMAGE CONTEXT ===\n`;
    }
    
    console.log('Enhanced prompt with RAG knowledge prepared:', {
      finalLength: enhancedPrompt.length,
      knowledgeCategories: Object.keys(categorizedKnowledge),
      isComparativeAnalysis: isComparative || isMultiImage
    });
    
    return enhancedPrompt;
  }

  // PRIORITY 3: Fallback to standard prompt (no RAG context available)
  console.log('📊 No RAG context available, using standard prompt builder');
  
  const systemPrompt = createAnalysisPrompt(
    analysisPrompt, 
    isComparative || isMultiImage, 
    (imageUrls && imageUrls.length) || 1
  );
  
  console.log('Standard prompt created:', {
    promptLength: systemPrompt.length,
    includesComparative: systemPrompt.includes('COMPARATIVE'),
    includesImageCount: systemPrompt.includes(((imageUrls && imageUrls.length) || 1).toString())
  });

  let enhancedPrompt = systemPrompt;
  
  // Add multi-image context for standard prompt
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

  console.log('Final enhanced prompt prepared:', {
    finalLength: enhancedPrompt.length,
    isComparativeAnalysis: isComparative || isMultiImage,
    hasRAGContext: false
  });

  return enhancedPrompt;
}
