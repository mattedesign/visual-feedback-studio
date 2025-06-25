
export function buildAnalysisPrompt(
  basePrompt: string,
  ragContext?: string,
  isComparative = false,
  imageCount = 1
): string {
  console.log('🏗️ === PROMPT BUILDER DETAILED DEBUG ===');
  console.log('📋 Prompt Builder Inputs:', {
    hasBasePrompt: !!basePrompt,
    basePromptLength: basePrompt.length,
    basePromptPreview: basePrompt.substring(0, 100) + '...',
    hasRAGContext: !!ragContext,
    ragContextLength: ragContext?.length || 0,
    ragContextPreview: ragContext ? ragContext.substring(0, 200) + '...' : null,
    isComparative,
    imageCount,
    timestamp: new Date().toISOString()
  });

  // Build the enhanced prompt with research context
  let enhancedPrompt = basePrompt;
  
  if (ragContext && ragContext.trim().length > 0) {
    console.log('✅ RAG CONTEXT DETECTED - Building research-enhanced prompt');
    console.log('📚 RAG Context Details:', {
      contextLength: ragContext.length,
      contextPreview: ragContext.substring(0, 300),
      contextContainsResearch: ragContext.includes('RESEARCH-ENHANCED'),
      contextContainsCitations: ragContext.includes('Best Practices') || ragContext.includes('Guidelines'),
      fullContextSample: ragContext.substring(0, 500) + (ragContext.length > 500 ? '...' : '')
    });
    
    enhancedPrompt = `${basePrompt}

=== RESEARCH-ENHANCED ANALYSIS ===
Based on UX research, design best practices, and proven methodologies, provide evidence-backed recommendations using the following knowledge base:

${ragContext}

IMPORTANT: Use this research context to:
- Cite specific best practices and methodologies
- Provide evidence-based recommendations
- Reference proven design patterns and principles
- Support your feedback with research-backed insights

`;
    
    console.log('🔬 Enhanced Prompt Built Successfully:', {
      originalLength: basePrompt.length,
      enhancedLength: enhancedPrompt.length,
      addedLength: enhancedPrompt.length - basePrompt.length,
      includesResearchSection: enhancedPrompt.includes('RESEARCH-ENHANCED ANALYSIS'),
      includesRAGContext: enhancedPrompt.includes(ragContext),
      ragContextPosition: enhancedPrompt.indexOf(ragContext)
    });
  } else {
    console.log('⚠️ NO RAG CONTEXT PROVIDED - Using standard prompt only');
    console.log('🔍 RAG Context Debug:', {
      ragContextExists: !!ragContext,
      ragContextType: typeof ragContext,
      ragContextLength: ragContext?.length || 0,
      ragContextTrimmed: ragContext?.trim?.()?.length || 0,
      ragContextValue: ragContext || 'null/undefined'
    });
  }

  const jsonInstructions = `

CRITICAL: You MUST respond with a valid JSON array of annotation objects only. Do not include any markdown, explanations, or other text.

Required JSON format:
[
  {
    "x": 50,
    "y": 30,
    "category": "ux",
    "severity": "critical", 
    "feedback": "Research-backed feedback with specific citations and best practices",
    "implementationEffort": "medium",
    "businessImpact": "high",
    "imageIndex": 0
  }
]

Rules:
- x, y: Numbers 0-100 (percentage coordinates)
- category: "ux", "visual", "accessibility", "conversion", or "brand"
- severity: "critical", "suggested", or "enhancement"
- feedback: Research-enhanced explanation citing best practices (2-3 sentences)
- implementationEffort: "low", "medium", or "high"
- businessImpact: "low", "medium", or "high"
- imageIndex: 0 for single image, 0-n for multiple images

When research context is available, ensure feedback includes specific citations and evidence-based recommendations.
Provide 3-5 specific, actionable annotations based on your research-enhanced analysis.`;

  let finalPrompt;
  
  if (isComparative && imageCount > 1) {
    finalPrompt = `${enhancedPrompt}

This is a COMPARATIVE ANALYSIS of ${imageCount} designs. Compare the designs using research-backed criteria and identify differences, strengths, and improvement opportunities across all images.

${jsonInstructions}`;
    
    console.log('📊 Built COMPARATIVE analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      imageCount,
      isComparative: true
    });
  } else {
    finalPrompt = `${enhancedPrompt}

Analyze this design for UX improvements, accessibility issues, and conversion optimization opportunities using research-backed methodologies.

${jsonInstructions}`;

    console.log('📊 Built STANDARD analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      researchContextLength: ragContext?.length || 0,
      isComparative: false
    });
  }

  // CRITICAL: Log the final prompt sections for debugging
  console.log('🎯 === FINAL PROMPT STRUCTURE ANALYSIS ===');
  console.log('📏 Final Prompt Metrics:', {
    totalLength: finalPrompt.length,
    basePromptLength: basePrompt.length,
    ragContextIncluded: finalPrompt.includes('RESEARCH-ENHANCED ANALYSIS'),
    researchSectionLength: ragContext ? ragContext.length : 0,
    structureSections: {
      hasBasePrompt: finalPrompt.includes(basePrompt),
      hasResearchSection: finalPrompt.includes('RESEARCH-ENHANCED ANALYSIS'),
      hasRAGContent: ragContext ? finalPrompt.includes(ragContext) : false,
      hasJSONInstructions: finalPrompt.includes('CRITICAL: You MUST respond')
    }
  });

  // Log exact prompt sections for debugging
  if (ragContext) {
    console.log('🔍 RAG Context Verification in Final Prompt:');
    console.log('   RAG Context Start Index:', finalPrompt.indexOf('RESEARCH-ENHANCED ANALYSIS'));
    console.log('   RAG Content Start Index:', finalPrompt.indexOf(ragContext));
    console.log('   Sample from Final Prompt (where RAG should be):');
    const ragStart = finalPrompt.indexOf('RESEARCH-ENHANCED ANALYSIS');
    if (ragStart !== -1) {
      console.log('   ' + finalPrompt.substring(ragStart, ragStart + 500) + '...');
    }
  }

  console.log('✅ === PROMPT BUILDER COMPLETE ===');
  
  return finalPrompt;
}
