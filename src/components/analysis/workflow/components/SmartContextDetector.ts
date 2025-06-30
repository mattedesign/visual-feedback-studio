
interface ContextIntent {
  category: string;
  focus: string[];
  enhancedPrompt: string;
}

export class SmartContextDetector {
  private static intentPatterns = {
    ecommerce: {
      keywords: ['checkout', 'cart', 'purchase', 'ecommerce', 'e-commerce', 'order', 'product', 'shop', 'buy'],
      category: 'E-commerce',
      focus: ['conversion', 'checkout flow', 'product display', 'trust signals'],
      enhance: (input: string) => `E-commerce optimization analysis: ${input} - Focus on conversion flow, trust signals, and purchase journey optimization`
    },
    accessibility: {
      keywords: ['accessibility', 'contrast', 'wcag', 'ada', 'screen reader', 'keyboard', 'disability', 'inclusive'],
      category: 'Accessibility',
      focus: ['WCAG compliance', 'color contrast', 'keyboard navigation', 'screen reader'],
      enhance: (input: string) => `Accessibility audit: ${input} - Comprehensive WCAG compliance review with contrast ratios and assistive technology compatibility`
    },
    mobile: {
      keywords: ['mobile', 'responsive', 'touch', 'tablet', 'phone', 'ios', 'android', 'device'],
      category: 'Mobile UX',
      focus: ['responsive design', 'touch targets', 'mobile navigation', 'device compatibility'],
      enhance: (input: string) => `Mobile UX analysis: ${input} - Focus on responsive design, touch interactions, and mobile-first experience optimization`
    },
    conversion: {
      keywords: ['conversion', 'cta', 'revenue', 'optimize', 'funnel', 'landing', 'signup', 'lead'],
      category: 'Conversion',
      focus: ['call-to-action', 'conversion funnel', 'landing page', 'form optimization'],
      enhance: (input: string) => `Conversion optimization: ${input} - Analyze conversion blockers, CTA effectiveness, and user flow optimization`
    },
    usability: {
      keywords: ['usability', 'navigation', 'flow', 'journey', 'interaction', 'ux', 'user experience'],
      category: 'Usability',
      focus: ['user flow', 'navigation', 'interaction design', 'task completion'],
      enhance: (input: string) => `Usability analysis: ${input} - Focus on user flow optimization, navigation clarity, and interaction patterns`
    },
    visual: {
      keywords: ['visual', 'design', 'color', 'typography', 'layout', 'brand', 'aesthetic', 'hierarchy'],
      category: 'Visual Design',
      focus: ['visual hierarchy', 'typography', 'color scheme', 'brand consistency'],
      enhance: (input: string) => `Visual design analysis: ${input} - Evaluate visual hierarchy, typography, color usage, and brand consistency`
    },
    comprehensive: {
      keywords: ['comprehensive', 'complete', 'full', 'audit', 'everything', 'all', 'thorough'],
      category: 'Comprehensive',
      focus: ['UX', 'visual design', 'accessibility', 'conversion', 'technical'],
      enhance: (input: string) => `Comprehensive UX audit: ${input} - Complete analysis covering usability, accessibility, visual design, conversion optimization, and technical considerations`
    }
  };

  static detectIntent(userInput: string): ContextIntent | null {
    if (!userInput || userInput.trim().length < 3) {
      return null;
    }

    const input = userInput.toLowerCase();
    const scores: { [key: string]: number } = {};

    // Calculate relevance scores for each category
    Object.entries(this.intentPatterns).forEach(([key, pattern]) => {
      scores[key] = pattern.keywords.reduce((score, keyword) => {
        if (input.includes(keyword)) {
          return score + (keyword.length > 4 ? 2 : 1); // Longer keywords get higher weight
        }
        return score;
      }, 0);
    });

    // Find the highest scoring category
    const bestMatch = Object.entries(scores).reduce((best, [key, score]) => {
      return score > best.score ? { key, score } : best;
    }, { key: '', score: 0 });

    if (bestMatch.score === 0) {
      // Default to comprehensive if no specific intent detected
      return {
        category: 'General UX',
        focus: ['usability', 'visual design', 'user experience'],
        enhancedPrompt: `UX analysis: ${userInput} - Focus on overall user experience, usability patterns, and design effectiveness`
      };
    }

    const pattern = this.intentPatterns[bestMatch.key as keyof typeof this.intentPatterns];
    return {
      category: pattern.category,
      focus: pattern.focus,
      enhancedPrompt: pattern.enhance(userInput)
    };
  }

  static enhanceContext(userInput: string): string {
    const intent = this.detectIntent(userInput);
    return intent ? intent.enhancedPrompt : userInput;
  }

  static getFocusAreas(userInput: string): string[] {
    const intent = this.detectIntent(userInput);
    return intent ? intent.focus : [];
  }

  static getCategory(userInput: string): string {
    const intent = this.detectIntent(userInput);
    return intent ? intent.category : 'General';
  }
}

// Export for use in other components
export const detectContextIntent = SmartContextDetector.detectIntent;
export const enhanceUserContext = SmartContextDetector.enhanceContext;
export const getContextFocusAreas = SmartContextDetector.getFocusAreas;
export const getContextCategory = SmartContextDetector.getCategory;
