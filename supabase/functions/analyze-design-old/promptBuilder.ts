
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

🎯 COMPREHENSIVE PROFESSIONAL UX ANALYSIS REQUIREMENTS:

⚠️ CRITICAL: You MUST generate exactly 16-19 detailed insights. This is a professional UX audit requirement.

MANDATORY INSIGHT DISTRIBUTION:
• 3-4 Critical Issues (severity: "critical") - urgent problems affecting user experience
• 5-7 Important Improvements (severity: "suggested") - high-impact enhancements  
• 4-5 Enhancement Opportunities (severity: "enhancement") - optimization suggestions
• 3-5 Positive Validations (severity: "enhancement") - strengths to acknowledge and maintain

REQUIRED CATEGORY COVERAGE (must include all):
1. USER EXPERIENCE (UX): 4-5 insights on navigation, user flows, task completion, cognitive load
2. VISUAL DESIGN: 3-4 insights on typography, color usage, visual hierarchy, brand consistency
3. ACCESSIBILITY: 2-3 insights on WCAG compliance, contrast ratios, screen reader compatibility
4. CONVERSION OPTIMIZATION: 3-4 insights on CTAs, forms, trust signals, friction reduction
5. BUSINESS IMPACT: 2-3 insights on professional credibility, competitive positioning, ROI potential

COMPREHENSIVE ANALYSIS SCOPE:
✅ Navigation patterns and information architecture
✅ Form design and user input optimization
✅ Visual hierarchy and content scanability
✅ Mobile responsiveness and touch interactions
✅ Accessibility compliance and inclusive design
✅ Conversion funnel optimization
✅ Trust signals and credibility indicators
✅ Brand consistency and professional appearance
✅ Performance implications and load times
✅ User engagement and retention factors

POSITIVE VALIDATION REQUIREMENTS:
Include 3-5 annotations highlighting design strengths such as:
• Effective use of whitespace and layout
• Strong visual hierarchy implementation
• Good accessibility practices already in place
• Clear call-to-action design
• Professional brand presentation
• User-friendly navigation elements

RESEARCH-BACKED APPROACH:
${ragContext ? '• Reference the provided UX research and best practices context' : '• Apply established UX principles and industry standards'}
• Cite specific methodologies (Nielsen's heuristics, WCAG guidelines, etc.)
• Include quantitative impact estimates where applicable
• Provide evidence-based recommendations with implementation guidance

🚨 MANDATORY OUTPUT REQUIREMENT 🚨
You MUST respond with a valid JSON array of exactly 16-19 annotation objects. No markdown, no explanations, no other text.

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

MANDATORY JSON FORMAT:
[
  {
    "x": 50,
    "y": 30,
    "category": "ux",
    "severity": "critical", 
    "feedback": "Detailed, research-backed feedback with specific citations and actionable recommendations (minimum 3-4 sentences with implementation guidance)",
    "implementationEffort": "medium",
    "businessImpact": "high",
    "imageIndex": ${imageCount > 1 ? `REQUIRED - specify 0 to ${imageCount - 1} based on which image this annotation analyzes` : '0 for single image'}
  }
]

COMPREHENSIVE ANNOTATION RULES:
- x, y: Numbers 0-100 (percentage coordinates) - distribute across the entire design
- category: "ux", "visual", "accessibility", "conversion", or "brand" - ensure balanced distribution
- severity: "critical" (3-4 items), "suggested" (5-7 items), "enhancement" (8-10 items) - balanced mix
- feedback: Comprehensive explanation with research citations (minimum 3-4 sentences with specific implementation steps)
- implementationEffort: "low", "medium", or "high" - realistic development assessment
- businessImpact: "low", "medium", or "high" - quantified business value when possible
- imageIndex: ${imageCount > 1 ? `REQUIRED - specify 0 to ${imageCount - 1} based on which specific image this annotation analyzes` : '0 for single image'}

${imageCount > 1 ? `
🔥 FINAL COMPREHENSIVE MULTI-IMAGE REQUIREMENTS 🔥
- Provide exactly 16-19 annotations total, strategically distributed across all ${imageCount} images
- Each image must receive 4-6 individual annotations analyzing its unique elements
- Include cross-image comparative insights for consistency analysis
- Each annotation must have the correct imageIndex (0, 1, 2, etc.)
- Balance critical issues, improvements, and positive validations for each image
- Consider how different images work together in the overall user experience
- VERIFY: Does the distribution comprehensively cover all images?
` : 'Provide exactly 16-19 comprehensive annotations covering all aspects of the single image design.'}

PROFESSIONAL ANALYSIS STANDARDS:
- Each annotation must provide specific, actionable guidance with implementation steps
- Include both improvement opportunities AND positive design validations
- Reference research context and industry best practices with citations
- Ensure annotations cover the full scope of the design comprehensively
- Balance critical issues with enhancement opportunities and strengths
- Provide clear implementation guidance with estimated effort and business impact
- Use professional UX terminology and methodology references

⚠️ FINAL VERIFICATION CHECKLIST:
□ Exactly 16-19 annotations generated
□ All 5 categories covered (UX, Visual, Accessibility, Conversion, Business)
□ Balanced severity distribution (3-4 critical, 5-7 suggested, 8-10 enhancement)
□ 3-5 positive validations included
□ Research citations included when context available
□ Implementation guidance provided for each insight
□ Coordinates distributed across entire design
□ Professional UX consulting quality maintained

When research context is available, ensure all feedback includes specific citations and evidence-based recommendations with quantified impact estimates.`;

  let finalPrompt;
  
  if (isComparative && imageCount > 1) {
    finalPrompt = `${enhancedPrompt}

🔥 COMPREHENSIVE COMPARATIVE ANALYSIS of ${imageCount} designs:

Compare the designs using research-backed criteria and identify differences, strengths, and improvement opportunities across all images. Generate exactly 16-19 comprehensive insights.

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

🔥 COMPREHENSIVE MULTI-IMAGE ANALYSIS 🔥
You are analyzing ${imageCount} different design images. Analyze each design individually and provide comprehensive insights for each image.

CRITICAL IMAGEINDEX ASSIGNMENT: Each annotation must specify the correct imageIndex (0 to ${imageCount - 1}):
- Image 1 comprehensive analysis → "imageIndex": 0 (5-6 annotations)
- Image 2 comprehensive analysis → "imageIndex": 1 (5-6 annotations)
- Image 3 comprehensive analysis → "imageIndex": 2 (4-5 annotations)
- Continue for all ${imageCount} images

🚨 COMPREHENSIVE DISTRIBUTION REQUIREMENT 🚨
Generate exactly 16-19 total annotations distributed across ALL ${imageCount} images based on their individual content and design elements. Each image should receive 4-6 comprehensive annotations.

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

🔥 COMPREHENSIVE SINGLE-IMAGE PROFESSIONAL UX ANALYSIS:

Perform a thorough professional UX audit of this design, analyzing all aspects for comprehensive insights covering UX improvements, accessibility compliance, conversion optimization opportunities, and positive design validations using research-backed methodologies.

⚠️ MANDATORY: Generate exactly 16-19 comprehensive professional insights covering all design aspects.

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
    mandatoryRequirements: finalPrompt.includes('MANDATORY OUTPUT REQUIREMENT'),
    distributionLogic: imageCount > 1,
    imageCount: imageCount
  });

  return finalPrompt;
};
