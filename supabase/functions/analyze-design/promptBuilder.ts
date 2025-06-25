
export function buildAnalysisPrompt(
  basePrompt: string,
  ragContext?: string,
  isComparative = false,
  imageCount = 1
): string {
  console.log('🏗️ Building analysis prompt with RAG context:', {
    hasBasePrompt: !!basePrompt,
    hasRAGContext: !!ragContext,
    ragContextLength: ragContext?.length || 0,
    isComparative,
    imageCount
  });

  // Build the enhanced prompt with research context
  let enhancedPrompt = basePrompt;
  
  if (ragContext && ragContext.trim().length > 0) {
    console.log('📚 Adding RAG research context to prompt');
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
  } else {
    console.log('⚠️ No RAG context available, using standard prompt');
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

  if (isComparative && imageCount > 1) {
    const finalPrompt = `${enhancedPrompt}

This is a COMPARATIVE ANALYSIS of ${imageCount} designs. Compare the designs using research-backed criteria and identify differences, strengths, and improvement opportunities across all images.

${jsonInstructions}`;
    
    console.log('✅ Built comparative analysis prompt:', {
      totalLength: finalPrompt.length,
      hasResearchContext: !!ragContext,
      imageCount
    });
    
    return finalPrompt;
  }

  const finalPrompt = `${enhancedPrompt}

Analyze this design for UX improvements, accessibility issues, and conversion optimization opportunities using research-backed methodologies.

${jsonInstructions}`;

  console.log('✅ Built standard analysis prompt:', {
    totalLength: finalPrompt.length,
    hasResearchContext: !!ragContext,
    researchContextLength: ragContext?.length || 0
  });

  return finalPrompt;
}
