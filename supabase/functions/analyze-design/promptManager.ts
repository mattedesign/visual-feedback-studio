
import { createAnalysisPrompt } from './promptBuilder.ts';
import { RAGContext } from './types.ts';

function parseContextIntelligence(analysisPrompt?: string): {
  focusAreas: string[];
  ragQueries: string[];
  analysisType: 'targeted' | 'comprehensive';
} {
  console.log('🧠 === CONTEXT INTELLIGENCE PARSING ===');
  console.log('📝 Analysis Prompt:', analysisPrompt?.substring(0, 200) + '...');

  if (!analysisPrompt || analysisPrompt.trim().length < 10) {
    console.log('⚠️ No meaningful context provided - using comprehensive analysis');
    return {
      focusAreas: ['general'],
      ragQueries: ['UX best practices', 'design principles', 'user interface guidelines'],
      analysisType: 'comprehensive'
    };
  }

  const prompt = analysisPrompt.toLowerCase();
  const focusAreas: string[] = [];
  const ragQueries: string[] = [];

  // E-commerce focus detection
  if (prompt.match(/\b(checkout|cart|purchase|payment|buy|shop|ecommerce|e-commerce|order|product)\b/)) {
    focusAreas.push('ecommerce');
    ragQueries.push(
      'ecommerce checkout best practices',
      'shopping cart optimization',
      'payment form design',
      'product page conversion'
    );
    console.log('🛒 E-commerce focus detected');
  }

  // Mobile/responsive focus detection
  if (prompt.match(/\b(mobile|responsive|touch|tablet|phone|ios|android|device|screen)\b/)) {
    focusAreas.push('mobile');
    ragQueries.push(
      'mobile UX design principles',
      'responsive design patterns',
      'touch interface guidelines',
      'mobile navigation best practices'
    );
    console.log('📱 Mobile/responsive focus detected');
  }

  // Accessibility focus detection
  if (prompt.match(/\b(accessibility|contrast|wcag|ada|screen reader|keyboard|disability|inclusive)\b/)) {
    focusAreas.push('accessibility');
    ragQueries.push(
      'web accessibility guidelines',
      'WCAG compliance best practices',
      'color contrast requirements',
      'keyboard navigation patterns'
    );
    console.log('♿ Accessibility focus detected');
  }

  // Conversion optimization focus detection
  if (prompt.match(/\b(conversion|cta|revenue|optimize|funnel|landing|signup|subscribe|lead)\b/)) {
    focusAreas.push('conversion');
    ragQueries.push(
      'conversion rate optimization',
      'call-to-action design',
      'landing page best practices',
      'user conversion patterns'
    );
    console.log('📈 Conversion focus detected');
  }

  // Visual design focus detection
  if (prompt.match(/\b(visual|design|color|typography|layout|brand|aesthetic|style)\b/)) {
    focusAreas.push('visual');
    ragQueries.push(
      'visual design principles',
      'typography best practices',
      'color theory in UI design',
      'layout design patterns'
    );
    console.log('🎨 Visual design focus detected');
  }

  // UX/Usability focus detection
  if (prompt.match(/\b(ux|usability|user experience|navigation|flow|journey|interaction)\b/)) {
    focusAreas.push('ux');
    ragQueries.push(
      'user experience design principles',
      'navigation design patterns',
      'user flow optimization',
      'interaction design best practices'
    );
    console.log('👤 UX/Usability focus detected');
  }

  // Determine analysis type
  const analysisType = focusAreas.length > 0 ? 'targeted' : 'comprehensive';
  
  // Add comprehensive queries if no specific focus detected
  if (focusAreas.length === 0) {
    focusAreas.push('general');
    ragQueries.push(
      'user interface design principles',
      'web design best practices',
      'UX design guidelines',
      'digital product design standards'
    );
    console.log('🎯 No specific focus detected - using comprehensive analysis');
  }

  console.log('📊 Context Intelligence Results:', {
    focusAreas,
    ragQueriesCount: ragQueries.length,
    analysisType,
    targetedQueries: ragQueries.slice(0, 3)
  });

  return {
    focusAreas,
    ragQueries,
    analysisType
  };
}

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

  // NEW: Parse context intelligence from user input
  const contextIntelligence = parseContextIntelligence(analysisPrompt);
  console.log('🧠 Context Intelligence Applied:', {
    focusAreas: contextIntelligence.focusAreas,
    analysisType: contextIntelligence.analysisType,
    targetedQueries: contextIntelligence.ragQueries.length
  });

  // If RAG context is available, use the enhanced prompt
  if (ragContext?.enhancedPrompt) {
    console.log('📚 Using RAG-enhanced prompt with research context');
    console.log('Research context details:', {
      knowledgeEntries: ragContext.retrievedKnowledge.relevantPatterns.length,
      competitorInsights: ragContext.retrievedKnowledge.competitorInsights.length,
      industry: ragContext.industryContext,
      citationsCount: ragContext.researchCitations.length,
      buildTimestamp: ragContext.buildTimestamp
    });
    
    // Enhance the RAG prompt with context intelligence
    let enhancedRAGPrompt = ragContext.enhancedPrompt;
    
    if (contextIntelligence.analysisType === 'targeted') {
      enhancedRAGPrompt += `\n\n=== TARGETED ANALYSIS FOCUS ===\n`;
      enhancedRAGPrompt += `Based on your context, this analysis will focus specifically on: ${contextIntelligence.focusAreas.join(', ')}\n`;
      enhancedRAGPrompt += `Priority areas for feedback: ${contextIntelligence.focusAreas.map(area => area.toUpperCase()).join(', ')}\n`;
      enhancedRAGPrompt += `=== END TARGETED FOCUS ===\n`;
      
      console.log('🎯 Enhanced RAG prompt with targeted focus:', contextIntelligence.focusAreas);
    }
    
    return enhancedRAGPrompt;
  }

  // Fallback: Use existing prompt building logic
  console.log('📊 Using standard prompt (no RAG context available)');
  
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
  
  // Add context intelligence enhancement to standard prompt
  if (contextIntelligence.analysisType === 'targeted') {
    enhancedPrompt += `\n\n=== CONTEXT-DRIVEN ANALYSIS ===\n`;
    enhancedPrompt += `Focus Areas Detected: ${contextIntelligence.focusAreas.join(', ')}\n`;
    enhancedPrompt += `Prioritize feedback in these areas: ${contextIntelligence.focusAreas.map(area => area.toUpperCase()).join(', ')}\n`;
    enhancedPrompt += `Analysis Type: ${contextIntelligence.analysisType}\n`;
    enhancedPrompt += `=== END CONTEXT-DRIVEN ANALYSIS ===\n`;
    
    console.log('🎯 Enhanced standard prompt with context intelligence');
  }
  
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
    isComparativeAnalysis: isComparative || isMultiImage,
    hasContextIntelligence: contextIntelligence.analysisType === 'targeted'
  });

  return enhancedPrompt;
}
