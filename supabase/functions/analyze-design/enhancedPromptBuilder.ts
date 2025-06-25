
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

  const jsonInstructions = `

CRITICAL: You MUST respond with a valid JSON array of annotation objects only. Do not include any markdown, explanations, or other text.

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
    "imageIndex": 0
  }
]

Rules:
- x, y: Numbers 0-100 (percentage coordinates)
- category: "ux", "visual", "accessibility", "conversion", or "brand"
- severity: "critical", "suggested", or "enhancement"
- feedback: Enhanced explanation citing research AND competitive benchmarks (2-3 sentences)
- implementationEffort: "low", "medium", or "high"
- businessImpact: "low", "medium", or "high"
- imageIndex: 0 for single image, 0-n for multiple images

When research and competitive context are available, ensure feedback includes:
- Specific research citations and best practices
- Competitive benchmarks and industry leader examples
- Performance metrics and effectiveness scores where available
- Differentiation opportunities vs. competitors

Provide 3-5 specific, actionable annotations based on your research-enhanced and competitively-informed analysis.`;

  let finalPrompt;
  
  if (isComparative && imageCount > 1) {
    finalPrompt = `${enhancedPrompt}

This is a COMPARATIVE ANALYSIS of ${imageCount} designs. Compare the designs using research-backed criteria AND competitive benchmarks to identify differences, strengths, and improvement opportunities across all images.

${jsonInstructions}`;
    
    console.log('📊 Built COMPARATIVE analysis prompt with competitive intelligence:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      hasCompetitiveContext: !!competitiveContext,
      imageCount,
      isComparative: true
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
    structureSections: {
      hasBasePrompt: finalPrompt.includes(basePrompt),
      hasResearchSection: finalPrompt.includes('RESEARCH-ENHANCED ANALYSIS'),
      hasCompetitiveSection: finalPrompt.includes('COMPETITIVE INTELLIGENCE & BENCHMARKING'),
      hasJSONInstructions: finalPrompt.includes('CRITICAL: You MUST respond')
    }
  });

  console.log('✅ === ENHANCED PROMPT BUILDER WITH COMPETITIVE INTELLIGENCE COMPLETE ===');
  
  return finalPrompt;
}
