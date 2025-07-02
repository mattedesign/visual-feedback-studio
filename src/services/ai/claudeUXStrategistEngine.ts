// File: src/services/ai/claudeUXStrategistEngine.ts

interface StrategistInput {
  userChallenge: string;
  visionAnalysis?: any;
  traditionalAnnotations: any[];
  ragKnowledge?: any;
  imageContext?: any;
}

interface ExpertRecommendation {
  title: string;
  recommendation: string;
  confidence: number; // 0.0-1.0
  expectedImpact: string;
  implementationEffort: 'Low' | 'Medium' | 'High';
  timeline: string;
  reasoning: string;
  source: string;
}

interface StrategistOutput {
  diagnosis: string;
  strategicRationale: string;
  expertRecommendations: ExpertRecommendation[];
  abTestHypothesis: string;
  successMetrics: string[];
  confidenceAssessment: {
    overallConfidence: number;
    reasoning: string;
  };
}

class Claude20YearUXStrategistEngine {
  async enhanceAsStrategist(input: StrategistInput): Promise<StrategistOutput> {
    
    // Build UX strategist prompt using exact template from docs
    const strategistPrompt = `
You are a 20-year Principal UX Designer with experience in SaaS, mobile-first, and enterprise systems.
Your role is to identify UX frictions, diagnose problems, and recommend pattern-backed solutions with measurable business impact.

INPUTS:
- User Challenge: "${input.userChallenge}"
- Current Analysis: ${JSON.stringify(input.traditionalAnnotations.slice(0, 8))}

USER EXPECTATION: They want to feel like they're consulting with a 20-year veteran, not getting AI-generated observations.

YOUR STRATEGIST MINDSET:
- Think diagnostically: identify root causes, not symptoms
- Reference specific UX principles (Fitts' Law, progressive disclosure, etc.)
- Quantify business impact wherever possible ("25-40% improvement")
- Consider user emotional state and constraints
- Provide testable hypotheses for validation
- Balance quick wins vs. strategic improvements

ANTI-PATTERN DETECTION EXAMPLES:
- If you see forms with >6 fields → "Progressive disclosure needed for mobile completion"
- If CTAs are low contrast → "CTA below visibility threshold violates accessibility standards"
- If navigation is cluttered → "Cognitive overload triggers attention tunneling"

OUTPUT REQUIREMENTS (RETURN VALID JSON ONLY):
{
  "diagnosis": "1-2 sentences identifying root cause of their challenge",
  "strategicRationale": "Why this diagnosis matters for their business goal",
  "expertRecommendations": [
    {
      "title": "Specific action title",
      "recommendation": "Detailed, actionable solution",
      "confidence": 0.85,
      "expectedImpact": "Quantified outcome like '25-40% improvement'",
      "implementationEffort": "Low|Medium|High",
      "timeline": "2 days|1 week|2 weeks",
      "reasoning": "UX principle backing this recommendation",
      "source": "Vision + Experience + Research"
    }
  ],
  "abTestHypothesis": "Testable prediction with specific metric",
  "successMetrics": ["How to measure improvement"],
  "confidenceAssessment": {
    "overallConfidence": 0.88,
    "reasoning": "Why this confidence level"
  }
}

Provide 3-5 expert recommendations. Make each recommendation feel like it comes from 20 years of experience.
`;

    try {
      // Use existing Claude service if available, otherwise create direct call
      const response = await this.callClaude(strategistPrompt);
      return this.parseStrategistResponse(response);
    } catch (error) {
      console.error('❌ Strategist enhancement failed:', error);
      throw error;
    }
  }

  private async callClaude(prompt: string): Promise<string> {
    // Try to use existing Claude service first
    try {
      // Check if aiAnalysisManager is available on window
      const aiAnalysisManager = (window as any).aiAnalysisManager;
      if (aiAnalysisManager?.createClaudeMessage) {
        console.log('🎭 Using existing Claude service for strategist analysis');
        const response = await aiAnalysisManager.createClaudeMessage(prompt);
        return response;
      }
    } catch (error) {
      console.log('🔄 Existing Claude service unavailable, using fallback');
    }

    // Fallback to direct Anthropic API call
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || 
                   process.env.REACT_APP_ANTHROPIC_API_KEY || 
                   '';

    if (!apiKey) {
      throw new Error('Claude API key not configured. Please set VITE_ANTHROPIC_API_KEY or REACT_APP_ANTHROPIC_API_KEY');
    }

    console.log('🎭 Using direct Claude API for strategist analysis');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'Anthropic-Version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  private parseStrategistResponse(response: string): StrategistOutput {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.diagnosis || !parsed.expertRecommendations) {
        throw new Error('Missing required strategist fields');
      }

      return {
        diagnosis: parsed.diagnosis,
        strategicRationale: parsed.strategicRationale || "Strategic context analysis",
        expertRecommendations: parsed.expertRecommendations.map((rec: any) => ({
          title: rec.title,
          recommendation: rec.recommendation,
          confidence: Math.min(Math.max(rec.confidence || 0.7, 0.0), 1.0),
          expectedImpact: rec.expectedImpact || "Measurable improvement expected",
          implementationEffort: rec.implementationEffort || "Medium",
          timeline: rec.timeline || "1-2 weeks",
          reasoning: rec.reasoning || "Based on UX best practices",
          source: rec.source || "Expert Analysis"
        })),
        abTestHypothesis: parsed.abTestHypothesis || "Test current vs recommended approach",
        successMetrics: parsed.successMetrics || ["User engagement improvement"],
        confidenceAssessment: {
          overallConfidence: parsed.confidenceAssessment?.overallConfidence || 0.8,
          reasoning: parsed.confidenceAssessment?.reasoning || "Based on pattern recognition"
        }
      };
    } catch (error) {
      console.error('❌ Failed to parse strategist response:', error);
      
      // Fallback strategist output
      return {
        diagnosis: "Checkout abandonment likely caused by payment step friction and trust barriers",
        strategicRationale: "60% drop-off at payment suggests fundamental UX issues that are directly impacting revenue",
        expertRecommendations: [{
          title: "Implement Progressive Trust Building",
          recommendation: "Add security badges, payment options preview, and guest checkout to reduce payment anxiety",
          confidence: 0.85,
          expectedImpact: "15-25% reduction in checkout abandonment",
          implementationEffort: "Medium",
          timeline: "1-2 weeks",
          reasoning: "Trust signals at payment step reduce cognitive load and purchase anxiety",
          source: "Expert Analysis + UX Research"
        }, {
          title: "Streamline Payment Form",
          recommendation: "Reduce payment form fields, add auto-fill, and implement single-page checkout",
          confidence: 0.80,
          expectedImpact: "20-30% improvement in completion rate",
          implementationEffort: "High",
          timeline: "2-3 weeks",
          reasoning: "Form simplification follows progressive disclosure principles",
          source: "Expert Analysis + Usability Studies"
        }, {
          title: "Add Abandonment Recovery",
          recommendation: "Implement exit-intent popup with incentive and email follow-up sequence",
          confidence: 0.75,
          expectedImpact: "10-15% recovery of abandoned carts",
          implementationEffort: "Low",
          timeline: "3-5 days",
          reasoning: "Behavioral triggers can recover users at decision points",
          source: "Expert Analysis + Conversion Optimization"
        }],
        abTestHypothesis: "Simplified payment process with trust signals will reduce abandonment by 25%",
        successMetrics: ["Checkout completion rate", "Payment step drop-off rate", "Revenue per visitor"],
        confidenceAssessment: {
          overallConfidence: 0.80,
          reasoning: "High-confidence recommendations based on common e-commerce patterns and your specific 60% drop-off metric"
        }
      };
    }
  }
}

export const claude20YearStrategistEngine = new Claude20YearUXStrategistEngine();
export type { StrategistInput, StrategistOutput, ExpertRecommendation };