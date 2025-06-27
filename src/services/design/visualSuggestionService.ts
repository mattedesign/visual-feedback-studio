
interface VisualSuggestion {
  id: string;
  type: 'before_after' | 'style_variant' | 'accessibility_fix';
  description: string;
  imageUrl: string;
  originalIssue: string;
  improvement: string;
  timestamp: Date;
}

interface SuggestionRequest {
  analysisInsights: string[];
  userContext: string;
  focusAreas: string[];
  designType: 'mobile' | 'desktop' | 'responsive';
}

class VisualSuggestionService {
  private async generateSuggestion(
    insight: string, 
    context: string, 
    type: 'before_after' | 'style_variant' | 'accessibility_fix'
  ): Promise<VisualSuggestion> {
    const prompt = this.buildPromptForType(insight, context, type);
    const imageUrl = await this.callDALLE(prompt);
    
    return {
      id: crypto.randomUUID(),
      type,
      description: insight,
      imageUrl,
      originalIssue: insight,
      improvement: this.getImprovementDescription(insight, type),
      timestamp: new Date()
    };
  }

  private buildPromptForType(insight: string, context: string, type: string): string {
    const baseStyle = "Professional UI mockup, clean interface design, modern web application";
    
    switch (type) {
      case 'before_after':
        return `${baseStyle} showing IMPROVED version of: ${insight}. ${context} context. Show the solution, not the problem.`;
      case 'style_variant':
        return `${baseStyle} with ${context} style applied to address: ${insight}. Show specific design improvements.`;
      case 'accessibility_fix':
        return `${baseStyle} demonstrating WCAG-compliant solution for: ${insight}. High contrast, clear labels, accessible design.`;
      default:
        return `${baseStyle} addressing: ${insight} in ${context} context.`;
    }
  }

  private getImprovementDescription(insight: string, type: 'before_after' | 'style_variant' | 'accessibility_fix'): string {
    switch (type) {
      case 'before_after':
        return `Improved solution for: ${insight}`;
      case 'style_variant':
        return `Style variant addressing: ${insight}`;
      case 'accessibility_fix':
        return `Accessibility improvement for: ${insight}`;
      default:
        return `Enhancement for: ${insight}`;
    }
  }

  private async callDALLE(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY_DALLE}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    });

    const data = await response.json();
    return data.data[0].url;
  }

  async generateVisualSuggestions(request: SuggestionRequest): Promise<VisualSuggestion[]> {
    const suggestions: VisualSuggestion[] = [];
    const topInsights = request.analysisInsights.slice(0, 3); // Limit to top 3

    for (const insight of topInsights) {
      // Generate before/after for each insight
      const beforeAfter = await this.generateSuggestion(insight, request.userContext, 'before_after');
      suggestions.push(beforeAfter);

      // Generate style variant if context suggests style changes
      if (request.userContext.toLowerCase().includes('premium|professional|modern|playful')) {
        const styleVariant = await this.generateSuggestion(insight, request.userContext, 'style_variant');
        suggestions.push(styleVariant);
      }

      // Generate accessibility fix if accessibility is mentioned
      if (insight.toLowerCase().includes('contrast|accessibility|wcag|readable')) {
        const accessibilityFix = await this.generateSuggestion(insight, request.userContext, 'accessibility_fix');
        suggestions.push(accessibilityFix);
      }
    }

    return suggestions;
  }
}

export const visualSuggestionService = new VisualSuggestionService();
