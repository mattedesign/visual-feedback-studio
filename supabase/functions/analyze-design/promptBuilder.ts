export const buildAnalysisPrompt = (
  basePrompt: string, 
  ragContext?: string, 
  isComparative: boolean = false, 
  imageCount: number = 1
): string => {
  console.log('🎯 Building analysis prompt:', {
    basePromptLength: basePrompt.length,
    hasRAGContext: !!ragContext,
    isComparative,
    imageCount
  });

  let enhancedPrompt = basePrompt;

  if (ragContext && ragContext.trim()) {
    enhancedPrompt = `RESEARCH-ENHANCED ANALYSIS:

${ragContext}

Based on the above research context and UX best practices, ${basePrompt}`;
    
    console.log('✅ Enhanced prompt with RAG context');
  } else {
    console.log('⚠️ No RAG context provided:', {
      ragContextExists: !!ragContext,
      ragContextType: typeof ragContext,
      ragContextLength: ragContext?.length || 0,
      ragContextTrimmed: ragContext?.trim?.()?.length || 0,
      ragContextValue: ragContext || 'null/undefined'
    });
  }

  const jsonInstructions = `

CRITICAL: You MUST respond with a valid JSON array of annotation objects only. Do not include any markdown, explanations, or other text.

${imageCount > 1 ? `
MULTI-IMAGE ANALYSIS: You are analyzing ${imageCount} different images. Each annotation MUST specify the correct imageIndex (0 to ${imageCount - 1}) to indicate which image the annotation belongs to.

- Image 1 = imageIndex: 0
- Image 2 = imageIndex: 1
- Image 3 = imageIndex: 2
- etc.

Ensure annotations are distributed across ALL images based on their individual content and design elements.
` : ''}

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
    "imageIndex": ${imageCount > 1 ? '0' : '0'} // CRITICAL: Must be 0 to ${imageCount - 1} for multi-image
  }
]

Rules:
- x, y: Numbers 0-100 (percentage coordinates)
- category: "ux", "visual", "accessibility", "conversion", or "brand"
- severity: "critical", "suggested", or "enhancement"
- feedback: Research-enhanced explanation citing best practices (2-3 sentences)
- implementationEffort: "low", "medium", or "high"
- businessImpact: "low", "medium", or "high"
- imageIndex: ${imageCount > 1 ? `REQUIRED - specify 0 to ${imageCount - 1} based on which image` : '0 for single image'}

${imageCount > 1 ? `
For multi-image analysis, provide 2-3 annotations per image, ensuring each image receives individual attention and analysis.
` : 'Provide 3-5 specific, actionable annotations for the single image.'}

When research context is available, ensure feedback includes specific citations and evidence-based recommendations.`;

  let finalPrompt;
  
  if (isComparative && imageCount > 1) {
    finalPrompt = `${enhancedPrompt}

This is a COMPARATIVE ANALYSIS of ${imageCount} designs. Compare the designs using research-backed criteria and identify differences, strengths, and improvement opportunities across all images.

For each annotation, specify the correct imageIndex:
- Annotations for the first image should have "imageIndex": 0
- Annotations for the second image should have "imageIndex": 1
- Annotations for the third image should have "imageIndex": 2
- And so on...

${jsonInstructions}`;
    
    console.log('📊 Built COMPARATIVE analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      imageCount,
      isComparative: true
    });
  } else if (imageCount > 1) {
    finalPrompt = `${enhancedPrompt}

This is a MULTI-IMAGE ANALYSIS of ${imageCount} designs. Analyze each design individually and provide specific insights for each image.

CRITICAL: Each annotation must specify the correct imageIndex (0 to ${imageCount - 1}) to indicate which image it belongs to.

${jsonInstructions}`;

    console.log('📊 Built MULTI-IMAGE analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      imageCount,
      isComparative: false
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

  console.log('🎯 === FINAL PROMPT STRUCTURE ANALYSIS ===');
  console.log('📏 Final Prompt Metrics:', {
    totalLength: finalPrompt.length,
    basePromptLength: basePrompt.length,
    ragContextIncluded: finalPrompt.includes('RESEARCH-ENHANCED ANALYSIS'),
    researchSectionLength: ragContext ? ragContext.length : 0,
    multiImageInstructions: finalPrompt.includes('MULTI-IMAGE ANALYSIS'),
    imageIndexInstructions: finalPrompt.includes('imageIndex'),
    structureSections: {
      hasBasePrompt: finalPrompt.includes(basePrompt),
      hasResearchSection: finalPrompt.includes('RESEARCH-ENHANCED ANALYSIS'),
      hasRAGContent: ragContext ? finalPrompt.includes(ragContext) : false,
      hasImageIndexGuidance: finalPrompt.includes('imageIndex')
    }
  });

  return finalPrompt;
};