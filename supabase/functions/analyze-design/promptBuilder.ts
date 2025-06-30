
export const buildAnalysisPrompt = (
  basePrompt: string, 
  ragContext?: string, 
  isComparative: boolean = false, 
  imageCount: number = 1
): string => {
  console.log('🎯 Building comprehensive analysis prompt:', {
    basePromptLength: basePrompt.length,
    hasRAGContext: !!ragContext,
    ragContextLength: ragContext?.length || 0,
    isComparative,
    imageCount
  });

  // Add console.log for imageCount as requested
  console.log('📊 Image Count in buildAnalysisPrompt:', imageCount);

  let enhancedPrompt = basePrompt;

  if (ragContext && ragContext.trim()) {
    enhancedPrompt = `RESEARCH-ENHANCED COMPREHENSIVE ANALYSIS:

${ragContext}

ANALYSIS DIRECTIVE: Based on the above research context and UX best practices, perform a thorough comprehensive analysis of the provided design(s). ${basePrompt}`;
    
    console.log('✅ Enhanced prompt with RAG context for comprehensive analysis');
  } else {
    console.log('⚠️ No RAG context provided - proceeding with standard comprehensive analysis');
  }

  const comprehensiveInstructions = `

🎯 COMPREHENSIVE ANALYSIS REQUIREMENTS:

SCOPE: Perform a thorough, professional UX audit covering ALL aspects of the design.

INSIGHT GENERATION TARGET: Generate 16-19 detailed insights covering:
• 4-5 Critical issues requiring immediate attention
• 6-8 Important improvements with high business impact  
• 4-5 Enhancement opportunities for optimization
• 2-3 Positive validations of strong design elements

ANALYSIS CATEGORIES (must cover all):
1. USER EXPERIENCE (UX): Navigation, user flows, task completion, cognitive load
2. VISUAL DESIGN: Typography, color usage, visual hierarchy, brand consistency
3. ACCESSIBILITY: WCAG compliance, contrast ratios, screen reader compatibility
4. CONVERSION OPTIMIZATION: CTAs, forms, trust signals, friction reduction
5. BUSINESS IMPACT: Professional credibility, competitive positioning, ROI potential

RESEARCH-BACKED APPROACH:
${ragContext ? '• Reference the provided UX research and best practices context' : '• Apply established UX principles and industry standards'}
• Cite specific methodologies (Nielsen's heuristics, WCAG guidelines, etc.)
• Include quantitative impact estimates where applicable
• Provide evidence-based recommendations

CRITICAL: You MUST respond with a valid JSON array of 16-19 annotation objects. Do not include any markdown, explanations, or other text.

${imageCount > 1 ? `
🚨 MULTI-IMAGE COMPREHENSIVE ANALYSIS 🚨

YOU ARE ANALYZING ${imageCount} DIFFERENT IMAGES. Each annotation MUST specify the correct imageIndex (0 to ${imageCount - 1}).

MANDATORY DISTRIBUTION ACROSS ALL IMAGES:
- Image 1 (imageIndex: 0): 5-6 annotations analyzing its specific design elements
- Image 2 (imageIndex: 1): 5-6 annotations analyzing its unique aspects
${imageCount > 2 ? `- Image 3 (imageIndex: 2): 4-5 annotations analyzing its individual components` : ''}
${imageCount > 3 ? `- Image 4 (imageIndex: 3): 4-5 annotations analyzing its distinct features` : ''}
- Remaining annotations: Cross-image comparative insights

🚨 CRITICAL DISTRIBUTION REQUIREMENT 🚨
- MUST distribute all 16-19 annotations across ALL ${imageCount} images
- Each image should receive 4-6 specific annotations analyzing its unique design aspects
- DO NOT assign all annotations to imageIndex: 0
- Ensure comprehensive coverage of each individual image
` : ''}

Required JSON format for COMPREHENSIVE analysis:
[
  {
    "x": 50,
    "y": 30,
    "category": "ux",
    "severity": "critical", 
    "feedback": "Detailed, research-backed feedback with specific citations and actionable recommendations (3-4 sentences minimum)",
    "implementationEffort": "medium",
    "businessImpact": "high",
    "imageIndex": ${imageCount > 1 ? `REQUIRED - specify 0 to ${imageCount - 1} based on which image this annotation analyzes` : '0 for single image'}
  }
]

COMPREHENSIVE ANALYSIS RULES:
- x, y: Numbers 0-100 (percentage coordinates) - vary positions across the design
- category: "ux", "visual", "accessibility", "conversion", or "brand" - ensure good distribution
- severity: "critical" (4-5 items), "suggested" (6-8 items), "enhancement" (4-5 items) - balanced mix
- feedback: Detailed, research-enhanced explanation with specific citations (3-4 sentences minimum)
- implementationEffort: "low", "medium", or "high" - realistic assessment
- businessImpact: "low", "medium", or "high" - quantified when possible
- imageIndex: ${imageCount > 1 ? `REQUIRED - specify 0 to ${imageCount - 1} based on which specific image this annotation analyzes` : '0 for single image'}

${imageCount > 1 ? `
🚨 FINAL COMPREHENSIVE MULTI-IMAGE REQUIREMENTS 🚨
- Provide 16-19 annotations total, distributed across all ${imageCount} images
- Each image must receive 4-6 individual annotations analyzing its unique elements
- Include cross-image comparative insights for consistency analysis
- Each annotation must have the correct imageIndex (0, 1, 2, etc.)
- Analyze both strengths and improvement opportunities for each image
- Consider how different images work together in the overall user experience
- VERIFY: Does the distribution cover all images comprehensively?
` : 'Provide exactly 16-19 specific, actionable annotations for comprehensive single-image analysis.'}

QUALITY STANDARDS:
- Each annotation must provide specific, actionable guidance
- Include both improvement opportunities AND positive validations
- Reference research context and industry best practices
- Ensure annotations cover the full scope of the design
- Balance critical issues with enhancement opportunities
- Provide clear implementation guidance and business rationale

When research context is available, ensure feedback includes specific citations and evidence-based recommendations.`;

  let finalPrompt;
  
  if (isComparative && imageCount > 1) {
    finalPrompt = `${enhancedPrompt}

COMPREHENSIVE COMPARATIVE ANALYSIS of ${imageCount} designs:

Compare the designs using research-backed criteria and identify differences, strengths, and improvement opportunities across all images. Generate 16-19 comprehensive insights.

🚨 CRITICAL MULTI-IMAGE COMPREHENSIVE INSTRUCTION 🚨
You are analyzing ${imageCount} different design images. Each annotation must specify the correct imageIndex:
- Annotations for the first image: "imageIndex": 0
- Annotations for the second image: "imageIndex": 1
- Annotations for the third image: "imageIndex": 2
- Continue this pattern for all ${imageCount} images

🚨 COMPREHENSIVE DISTRIBUTION REQUIREMENT 🚨
Distribute all 16-19 annotations across ALL ${imageCount} images based on comprehensive analysis. Each image should receive 4-6 specific annotations analyzing its unique design aspects, plus comparative insights.

${comprehensiveInstructions}`;
    
    console.log('📊 Built COMPREHENSIVE COMPARATIVE analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      imageCount,
      targetInsights: '16-19',
      isComparative: true
    });
  } else if (imageCount > 1) {
    finalPrompt = `${enhancedPrompt}

🚨 COMPREHENSIVE MULTI-IMAGE ANALYSIS 🚨
You are analyzing ${imageCount} different design images. Analyze each design individually and provide comprehensive insights for each image.

CRITICAL IMAGEINDEX ASSIGNMENT: Each annotation must specify the correct imageIndex (0 to ${imageCount - 1}):
- Image 1 comprehensive analysis → "imageIndex": 0 (5-6 annotations)
- Image 2 comprehensive analysis → "imageIndex": 1 (5-6 annotations)
- Image 3 comprehensive analysis → "imageIndex": 2 (4-5 annotations)
- Continue for all ${imageCount} images

🚨 COMPREHENSIVE DISTRIBUTION REQUIREMENT 🚨
Generate 16-19 total annotations distributed across ALL ${imageCount} images based on their individual content and design elements. Each image should receive 4-6 comprehensive annotations.

${comprehensiveInstructions}`;

    console.log('📊 Built COMPREHENSIVE MULTI-IMAGE analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      imageCount,
      targetInsights: '16-19',
      isComparative: false
    });
  } else {
    finalPrompt = `${enhancedPrompt}

COMPREHENSIVE SINGLE-IMAGE ANALYSIS:

Analyze this design comprehensively for UX improvements, accessibility issues, conversion optimization opportunities, and positive validations using research-backed methodologies.

Generate exactly 16-19 comprehensive insights covering all aspects of the design.

${comprehensiveInstructions}`;

    console.log('📊 Built COMPREHENSIVE STANDARD analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      researchContextLength: ragContext?.length || 0,
      targetInsights: '16-19',
      isComparative: false
    });
  }

  console.log('🎯 === COMPREHENSIVE PROMPT STRUCTURE ANALYSIS ===');
  console.log('📏 Final Comprehensive Prompt Metrics:', {
    totalLength: finalPrompt.length,
    basePromptLength: basePrompt.length,
    ragContextIncluded: finalPrompt.includes('RESEARCH-ENHANCED'),
    researchSectionLength: ragContext ? ragContext.length : 0,
    comprehensiveInstructions: finalPrompt.includes('16-19 detailed insights'),
    targetInsightCount: '16-19',
    distributionLogic: imageCount > 1,
    imageCount: imageCount
  });

  return finalPrompt;
};
