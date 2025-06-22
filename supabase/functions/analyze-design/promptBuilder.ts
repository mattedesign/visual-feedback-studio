
export function createAnalysisPrompt(customPrompt?: string): string {
  const basePrompt = customPrompt || 'Analyze this design for UX, accessibility, and conversion optimization opportunities.';
  
  return `You are an expert UX/UI designer and conversion optimization specialist. Analyze the provided design image and identify specific areas for improvement.

${basePrompt}

For each issue you identify, provide:
1. Exact coordinates (x, y as percentages from 0-100) where the issue is located
2. Category: ux, visual, accessibility, conversion, or brand
3. Severity: critical, suggested, or enhancement
4. Detailed feedback explaining the issue and recommended solution
5. Implementation effort: low, medium, or high
6. Business impact: low, medium, or high

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
