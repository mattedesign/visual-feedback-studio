
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

  // Add console.log for imageCount as requested
  console.log('📊 Image Count in buildAnalysisPrompt:', imageCount);

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

  // Add multi-image analysis instructions when imageCount > 1
  let multiImageInstructions = '';
  if (imageCount > 1) {
    multiImageInstructions = `

MULTI-IMAGE ANALYSIS: You are analyzing ${imageCount} different images. Each annotation MUST specify the correct imageIndex (0 to ${imageCount - 1}) to indicate which image the annotation belongs to.

Image 1 = imageIndex: 0
Image 2 = imageIndex: 1
${imageCount > 2 ? 'Image 3 = imageIndex: 2' : ''}
${imageCount > 3 ? 'Image 4 = imageIndex: 3' : ''}
${imageCount > 4 ? `Image ${imageCount} = imageIndex: ${imageCount - 1}` : ''}

Ensure annotations are distributed across ALL images based on their individual content and design elements.`;
  }

  const jsonInstructions = `

CRITICAL: You MUST respond with a valid JSON array of annotation objects only. Do not include any markdown, explanations, or other text.

${imageCount > 1 ? `
MULTI-IMAGE ANALYSIS: You are analyzing ${imageCount} different images. Each annotation MUST specify the correct imageIndex (0 to ${imageCount - 1}) to indicate which image the annotation belongs to.

CRITICAL IMAGE INDEX ASSIGNMENT:
- Image 1 = imageIndex: 0
- Image 2 = imageIndex: 1
- Image 3 = imageIndex: 2
- Image ${imageCount} = imageIndex: ${imageCount - 1}

DISTRIBUTION REQUIREMENT: Ensure annotations are distributed across ALL images based on their individual content and design elements. Each image should receive 2-3 specific annotations analyzing its unique design aspects.

DO NOT assign all annotations to imageIndex: 0. You must analyze each image individually and assign the correct imageIndex.
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
    "imageIndex": ${imageCount > 1 ? `REQUIRED - specify 0 to ${imageCount - 1} based on which image` : '0 for single image'}
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
MULTI-IMAGE ANALYSIS REQUIREMENTS:
- For multi-image analysis, provide 2-3 annotations per image, ensuring each image receives individual attention
- Each annotation must have the correct imageIndex (0, 1, 2, etc.)
- Analyze each image's unique design elements, don't just copy annotations across images
- Consider how different images work together in the overall user experience
` : 'Provide 3-5 specific, actionable annotations for the single image.'}

When research context is available, ensure feedback includes specific citations and evidence-based recommendations.`;

  let finalPrompt;
  
  if (isComparative && imageCount > 1) {
    finalPrompt = `${enhancedPrompt}${multiImageInstructions}

This is a COMPARATIVE ANALYSIS of ${imageCount} designs. Compare the designs using research-backed criteria and identify differences, strengths, and improvement opportunities across all images.

CRITICAL MULTI-IMAGE INSTRUCTION: You are analyzing ${imageCount} different design images. Each annotation must specify the correct imageIndex to indicate which specific image it belongs to:
- Annotations for the first image should have "imageIndex": 0
- Annotations for the second image should have "imageIndex": 1
- Annotations for the third image should have "imageIndex": 2
- Continue this pattern for all ${imageCount} images

DISTRIBUTION REQUIREMENT: Ensure annotations are distributed across ALL ${imageCount} images. Each image should receive 2-3 specific annotations analyzing its unique design aspects. Do NOT assign all annotations to imageIndex: 0.

${jsonInstructions}`;
    
    console.log('📊 Built COMPARATIVE analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      imageCount,
      isComparative: true,
      multiImageInstructionsIncluded: true
    });
  } else if (imageCount > 1) {
    finalPrompt = `${enhancedPrompt}${multiImageInstructions}

MULTI-IMAGE ANALYSIS: You are analyzing ${imageCount} different design images. Analyze each design individually and provide specific insights for each image.

CRITICAL IMAGEINDEX ASSIGNMENT: Each annotation must specify the correct imageIndex (0 to ${imageCount - 1}) to indicate which specific image it belongs to:
- Image 1 analysis → "imageIndex": 0
- Image 2 analysis → "imageIndex": 1  
- Image 3 analysis → "imageIndex": 2
- Continue for all ${imageCount} images

DISTRIBUTION REQUIREMENT: Ensure annotations are distributed across ALL ${imageCount} images based on their individual content and design elements. Each image should receive 2-3 specific annotations. Do NOT assign all annotations to the first image (imageIndex: 0).

${jsonInstructions}`;

    console.log('📊 Built MULTI-IMAGE analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      imageCount,
      isComparative: false,
      multiImageInstructionsIncluded: true
    });
  } else {
    finalPrompt = `${enhancedPrompt}

Analyze this design for UX improvements, accessibility issues, and conversion optimization opportunities using research-backed methodologies.

${jsonInstructions}`;

    console.log('📊 Built STANDARD analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      researchContextLength: ragContext?.length || 0,
      isComparative: false,
      imageCount: 1
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
    imageCount: imageCount,
    distributionRequirement: finalPrompt.includes('DISTRIBUTION REQUIREMENT'),
    structureSections: {
      hasBasePrompt: finalPrompt.includes(basePrompt),
      hasResearchSection: finalPrompt.includes('RESEARCH-ENHANCED ANALYSIS'),
      hasRAGContent: ragContext ? finalPrompt.includes(ragContext) : false,
      hasImageIndexGuidance: finalPrompt.includes('imageIndex'),
      hasMultiImageLogic: imageCount > 1
    }
  });

  return finalPrompt;
};
