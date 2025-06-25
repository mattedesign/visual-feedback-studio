
export function buildAnalysisPrompt(
  basePrompt: string,
  ragContext?: string,
  isComparative = false,
  imageCount = 1
): string {
  const contextualPrompt = ragContext 
    ? `${basePrompt}\n\n=== RELEVANT UX RESEARCH & BEST PRACTICES ===\n${ragContext}\n\nANALYSIS INSTRUCTION: Use this research context to provide evidence-based recommendations.`
    : basePrompt;

  const jsonInstructions = `

CRITICAL: You MUST respond with a valid JSON array of annotation objects only. Do not include any markdown, explanations, or other text.

Required JSON format:
[
  {
    "x": 50,
    "y": 30,
    "category": "ux",
    "severity": "critical",
    "feedback": "Detailed feedback about this specific issue",
    "implementationEffort": "medium",
    "businessImpact": "high",
    "imageIndex": 0
  }
]

Rules:
- x, y: Numbers 0-100 (percentage coordinates)
- category: "ux", "visual", "accessibility", "conversion", or "brand"
- severity: "critical", "suggested", or "enhancement"
- feedback: Detailed explanation (2-3 sentences)
- implementationEffort: "low", "medium", or "high"
- businessImpact: "low", "medium", or "high"
- imageIndex: 0 for single image, 0-n for multiple images

Provide 3-5 specific, actionable annotations based on your analysis.`;

  if (isComparative && imageCount > 1) {
    return `${contextualPrompt}

This is a COMPARATIVE ANALYSIS of ${imageCount} designs. Compare the designs and identify differences, strengths, and improvement opportunities across all images.

${jsonInstructions}`;
  }

  return `${contextualPrompt}

Analyze this design for UX improvements, accessibility issues, and conversion optimization opportunities.

${jsonInstructions}`;
}
