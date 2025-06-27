
export function buildEnhancedAnalysisPrompt(
  basePrompt: string,
  ragContext?: string,
  competitiveContext?: string,
  isComparative = false,
  imageCount = 1
): string {
  console.log('🏗️ === ENHANCED PROMPT BUILDER WITH COMPETITIVE INTELLIGENCE ===');
  console.log('📋 Enhanced Prompt Builder Inputs:', {
    hasBasePrompt: !!basePrompt,
    basePromptLength: basePrompt.length,
    hasRAGContext: !!ragContext,
    ragContextLength: ragContext?.length || 0,
    hasCompetitiveContext: !!competitiveContext,
    competitiveContextLength: competitiveContext?.length || 0,
    isComparative,
    imageCount,
    timestamp: new Date().toISOString()
  });

  // Add console.log for imageCount as requested
  console.log('📊 Image Count in buildEnhancedAnalysisPrompt:', imageCount);

  console.log('🖼️ Multi-Image Detection:', {
    imageCount,
    isMultiImage: imageCount > 1,
    requiresImageIndexGuidance: imageCount > 1,
    analysisType: isComparative ? 'comparative' : 'standard'
  });

  // Build the comprehensive enhanced prompt
  let enhancedPrompt = basePrompt;
  
  // Add research context if available
  if (ragContext && ragContext.trim().length > 0) {
    console.log('✅ RAG CONTEXT DETECTED - Adding research enhancement');
    
    enhancedPrompt += `

=== RESEARCH-ENHANCED ANALYSIS ===
Based on UX research, design best practices, and proven methodologies, provide evidence-backed recommendations using the following knowledge base:

${ragContext}

IMPORTANT: Use this research context to:
- Cite specific best practices and methodologies
- Provide evidence-based recommendations
- Reference proven design patterns and principles
- Support your feedback with research-backed insights

`;
  }
  
  // Add competitive intelligence if available
  if (competitiveContext && competitiveContext.trim().length > 0) {
    console.log('✅ COMPETITIVE CONTEXT DETECTED - Adding competitive intelligence enhancement');
    
    enhancedPrompt += `

=== COMPETITIVE INTELLIGENCE & BENCHMARKING ===
Leverage competitive analysis and industry benchmarks to provide context-aware recommendations using these competitive patterns:

${competitiveContext}

COMPETITIVE ANALYSIS INSTRUCTIONS:
- Reference how industry leaders implement similar UI patterns
- Include specific performance metrics and effectiveness scores when available
- Compare against competitive benchmarks to identify opportunities
- Cite competitive examples to justify recommendations
- Highlight differentiation opportunities vs. competitors

`;
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
    "feedback": "Research and competitively-informed feedback with specific citations and benchmarks",
    "implementationEffort": "medium",
    "businessImpact": "high",
    "imageIndex": ${imageCount > 1 ? `REQUIRED - specify 0 to ${imageCount - 1} based on which image` : '0 for single image'}
  }
]

Rules:
- x, y: Numbers 0-100 (percentage coordinates)
- category: "ux", "visual", "accessibility", "conversion", or "brand"
- severity: "critical", "suggested", or "enhancement"
- feedback: Enhanced explanation citing research AND competitive benchmarks (2-3 sentences)
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

When research and competitive context are available, ensure feedback includes:
- Specific research citations and best practices
- Competitive benchmarks and industry leader examples
- Performance metrics and effectiveness scores where available
- Differentiation opportunities vs. competitors`;

  let finalPrompt;
  
  if (isComparative && imageCount > 1) {
    finalPrompt = `${enhancedPrompt}${multiImageInstructions}

This is a COMPARATIVE ANALYSIS of ${imageCount} designs. Compare the designs using research-backed criteria AND competitive benchmarks to identify differences, strengths, and improvement opportunities across all images.

CRITICAL MULTI-IMAGE INSTRUCTION: You are analyzing ${imageCount} different design images. Each annotation must specify the correct imageIndex to indicate which specific image it belongs to:
- Annotations for the first image should have "imageIndex": 0
- Annotations for the second image should have "imageIndex": 1
- Annotations for the third image should have "imageIndex": 2
- Continue this pattern for all ${imageCount} images

DISTRIBUTION REQUIREMENT: Ensure annotations are distributed across ALL ${imageCount} images. Each image should receive 2-3 specific annotations with competitive benchmarks analyzing its unique design aspects. Do NOT assign all annotations to imageIndex: 0.

${jsonInstructions}`;
    
    console.log('📊 Built COMPARATIVE analysis prompt with competitive intelligence:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      hasCompetitiveContext: !!competitiveContext,
      imageCount,
      isComparative: true,
      multiImageInstructionsIncluded: true
    });
  } else if (imageCount > 1) {
    finalPrompt = `${enhancedPrompt}${multiImageInstructions}

MULTI-IMAGE ANALYSIS: You are analyzing ${imageCount} different design images. Analyze each design individually and provide specific insights for each image using research-backed methodologies AND competitive intelligence.

CRITICAL IMAGEINDEX ASSIGNMENT: Each annotation must specify the correct imageIndex (0 to ${imageCount - 1}) to indicate which specific image it belongs to:
- Image 1 analysis → "imageIndex": 0
- Image 2 analysis → "imageIndex": 1  
- Image 3 analysis → "imageIndex": 2
- Continue for all ${imageCount} images

DISTRIBUTION REQUIREMENT: Ensure annotations are distributed across ALL ${imageCount} images based on their individual content and design elements. Each image should receive 2-3 specific annotations with competitive benchmarks. Do NOT assign all annotations to the first image (imageIndex: 0).

${jsonInstructions}`;

    console.log('📊 Built MULTI-IMAGE analysis prompt with competitive intelligence:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      hasCompetitiveContext: !!competitiveContext,
      imageCount,
      isComparative: false,
      multiImageInstructionsIncluded: true
    });
  } else {
    finalPrompt = `${enhancedPrompt}

Analyze this design for UX improvements, accessibility issues, and conversion optimization opportunities using research-backed methodologies AND competitive intelligence.

${jsonInstructions}`;

    console.log('📊 Built STANDARD analysis prompt with competitive intelligence:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      hasCompetitiveContext: !!competitiveContext,
      researchContextLength: ragContext?.length || 0,
      competitiveContextLength: competitiveContext?.length || 0,
      isComparative: false
    });
  }

  // CRITICAL: Log the final prompt sections for debugging
  console.log('🎯 === FINAL ENHANCED PROMPT STRUCTURE ANALYSIS ===');
  console.log('📏 Final Enhanced Prompt Metrics:', {
    totalLength: finalPrompt.length,
    basePromptLength: basePrompt.length,
    ragContextIncluded: finalPrompt.includes('RESEARCH-ENHANCED ANALYSIS'),
    competitiveContextIncluded: finalPrompt.includes('COMPETITIVE INTELLIGENCE & BENCHMARKING'),
    researchSectionLength: ragContext ? ragContext.length : 0,
    competitiveSectionLength: competitiveContext ? competitiveContext.length : 0,
    multiImageInstructions: finalPrompt.includes('MULTI-IMAGE ANALYSIS'),
    imageIndexInstructions: finalPrompt.includes('imageIndex'),
    imageCount: imageCount,
    distributionRequirement: finalPrompt.includes('DISTRIBUTION REQUIREMENT'),
    structureSections: {
      hasBasePrompt: finalPrompt.includes(basePrompt),
      hasResearchSection: finalPrompt.includes('RESEARCH-ENHANCED ANALYSIS'),
      hasCompetitiveSection: finalPrompt.includes('COMPETITIVE INTELLIGENCE & BENCHMARKING'),
      hasJSONInstructions: finalPrompt.includes('CRITICAL: You MUST respond'),
      hasImageIndexGuidance: finalPrompt.includes('imageIndex'),
      hasMultiImageLogic: imageCount > 1
    }
  });

  console.log('✅ === ENHANCED PROMPT BUILDER WITH COMPETITIVE INTELLIGENCE COMPLETE ===');
  
  return finalPrompt;
}
