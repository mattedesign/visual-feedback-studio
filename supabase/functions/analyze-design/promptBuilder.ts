
export function createAnalysisPrompt(customPrompt?: string, isComparative?: boolean, imageCount?: number): string {
  const basePrompt = customPrompt || 'Analyze this design for UX, accessibility, and conversion optimization opportunities.';
  
  if (isComparative && imageCount && imageCount > 1) {
    return `You are an expert UX/UI designer and conversion optimization specialist performing COMPARATIVE ANALYSIS across ${imageCount} design images.

${basePrompt}

=== COMPARATIVE ANALYSIS INSTRUCTIONS ===
This is a multi-image comparative analysis. Your task is to:

1. ANALYZE EACH IMAGE: First, examine each design individually for UX, visual, and accessibility issues
2. COMPARE ACROSS IMAGES: Identify patterns, inconsistencies, and differences between designs
3. PROVIDE COMPARATIVE INSIGHTS: Highlight which design approaches work better and why
4. FOCUS ON CONSISTENCY: Note branding, layout, and interaction inconsistencies
5. CONSIDER USER JOURNEY: How would users experience moving between these designs?

=== ANNOTATION REQUIREMENTS ===
For each issue you identify, provide:
1. Exact coordinates (x, y as percentages from 0-100) where the issue is located
2. Category: ux, visual, accessibility, conversion, or brand
3. Severity: critical, suggested, or enhancement
4. Detailed feedback explaining the issue, comparison insights, and recommended solution
5. Implementation effort: low, medium, or high
6. Business impact: low, medium, or high
7. **IMAGE INDEX**: 0-based index (0 to ${imageCount - 1}) to identify which image this annotation applies to

=== COMPARATIVE FOCUS AREAS ===
- Visual hierarchy differences across designs
- Inconsistent button styles, colors, or placement
- Navigation pattern variations
- Content structure and layout differences  
- Branding consistency issues
- User flow disruptions between designs
- Accessibility variations

=== RESPONSE FORMAT ===
Respond with a JSON array of annotations in this exact format:
[
  {
    "x": 25.5,
    "y": 30.2,
    "category": "ux",
    "severity": "critical",
    "feedback": "COMPARATIVE INSIGHT: Detailed comparison analysis explaining the issue across designs and recommended solution for consistency",
    "implementationEffort": "low",
    "businessImpact": "high",
    "imageIndex": 0
  }
]

Provide 5-10 annotations focusing on the most impactful comparative improvements and consistency issues across all ${imageCount} designs.`;
  }

  return `You are an expert UX/UI designer and conversion optimization specialist. Analyze the provided design image and identify specific areas for improvement.

${basePrompt}

=== ANALYSIS REQUIREMENTS ===
For each issue you identify, provide:
1. Exact coordinates (x, y as percentages from 0-100) where the issue is located
2. Category: ux, visual, accessibility, conversion, or brand
3. Severity: critical, suggested, or enhancement
4. Detailed feedback explaining the issue and recommended solution
5. Implementation effort: low, medium, or high
6. Business impact: low, medium, or high

=== RESPONSE FORMAT ===
Respond with a JSON array of annotations in this exact format:
[
  {
    "x": 25.5,
    "y": 30.2,
    "category": "ux",
    "severity": "critical",
    "feedback": "Detailed explanation of the issue and recommended solution",
    "implementationEffort": "low",
    "businessImpact": "high"
  }
]

Provide 3-7 annotations focusing on the most impactful improvements.`;
}
