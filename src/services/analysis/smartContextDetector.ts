
interface ContextMapping {
  keywords: string[];
  category: string;
  template: string;
  focusAreas: string[];
  priority: number;
}

interface DetectionResult {
  category: string;
  template: string;
  focusAreas: string[];
  confidence: number;
  suggestions: string[];
}

export class SmartContextDetector {
  private static contextMappings: ContextMapping[] = [
    // E-commerce & Conversion
    {
      keywords: ['checkout', 'cart', 'purchase', 'buy', 'payment', 'order', 'shop', 'ecommerce', 'e-commerce', 'conversion', 'funnel'],
      category: 'E-commerce',
      template: 'E-commerce conversion optimization - analyze checkout flow, product display, trust signals, and purchase journey to maximize conversions and reduce cart abandonment',
      focusAreas: ['conversion', 'checkout flow', 'trust signals', 'product display'],
      priority: 10
    },
    
    // Accessibility
    {
      keywords: ['accessibility', 'accessible', 'contrast', 'wcag', 'ada', 'screen reader', 'keyboard', 'disability', 'inclusive', 'readable'],
      category: 'Accessibility',
      template: 'Comprehensive accessibility audit - evaluate WCAG compliance, color contrast ratios, keyboard navigation, screen reader compatibility, and inclusive design principles',
      focusAreas: ['WCAG compliance', 'color contrast', 'keyboard navigation', 'screen reader support'],
      priority: 10
    },
    
    // Mobile & Responsive
    {
      keywords: ['mobile', 'responsive', 'touch', 'tablet', 'phone', 'ios', 'android', 'device', 'screen size'],
      category: 'Mobile UX',
      template: 'Mobile user experience optimization - analyze responsive design, touch interactions, mobile navigation patterns, and device-specific usability',
      focusAreas: ['responsive design', 'touch targets', 'mobile navigation', 'device compatibility'],
      priority: 9
    },
    
    // Visual Design
    {
      keywords: ['visual', 'design', 'color', 'typography', 'font', 'layout', 'hierarchy', 'brand', 'aesthetic', 'style'],
      category: 'Visual Design',
      template: 'Visual design and brand consistency analysis - evaluate typography, color usage, visual hierarchy, brand alignment, and aesthetic appeal',
      focusAreas: ['visual hierarchy', 'typography', 'color scheme', 'brand consistency'],
      priority: 8
    },
    
    // UX & Usability
    {
      keywords: ['ux', 'usability', 'user experience', 'navigation', 'flow', 'journey', 'interaction', 'ease of use'],
      category: 'Usability',
      template: 'User experience and usability analysis - examine user flows, navigation patterns, interaction design, and task completion efficiency',
      focusAreas: ['user flow', 'navigation clarity', 'interaction patterns', 'task efficiency'],
      priority: 7
    },
    
    // Landing Page
    {
      keywords: ['landing', 'homepage', 'first impression', 'hero', 'above fold', 'value proposition'],
      category: 'Landing Page',
      template: 'Landing page optimization - analyze hero section effectiveness, value proposition clarity, call-to-action placement, and first impression impact',
      focusAreas: ['hero section', 'value proposition', 'CTA placement', 'first impression'],
      priority: 8
    },
    
    // Form Design
    {
      keywords: ['form', 'signup', 'register', 'login', 'input', 'field', 'validation', 'submit'],
      category: 'Form Design',
      template: 'Form design and conversion optimization - evaluate form layout, field organization, validation patterns, and completion rates',
      focusAreas: ['form usability', 'field design', 'validation', 'completion rate'],
      priority: 8
    }
  ];

  static detectContext(userInput: string): DetectionResult {
    if (!userInput || userInput.trim().length < 3) {
      return this.getDefaultResult();
    }

    const input = userInput.toLowerCase();
    const scores: { [key: string]: number } = {};

    // Calculate weighted scores for each mapping
    this.contextMappings.forEach((mapping, index) => {
      let score = 0;
      mapping.keywords.forEach(keyword => {
        if (input.includes(keyword)) {
          // Longer keywords get higher weight
          const keywordWeight = keyword.length > 6 ? 3 : keyword.length > 4 ? 2 : 1;
          // Priority multiplier
          const priorityWeight = mapping.priority / 10;
          score += keywordWeight * priorityWeight;
        }
      });
      scores[index] = score;
    });

    // Find the best match
    const bestMatchIndex = Object.entries(scores).reduce((best, [index, score]) => {
      return score > best.score ? { index: parseInt(index), score } : best;
    }, { index: -1, score: 0 });

    if (bestMatchIndex.score === 0) {
      return this.getDefaultResult();
    }

    const bestMapping = this.contextMappings[bestMatchIndex.index];
    const confidence = Math.min(bestMatchIndex.score / 5, 1); // Normalize to 0-1

    return {
      category: bestMapping.category,
      template: bestMapping.template,
      focusAreas: bestMapping.focusAreas,
      confidence,
      suggestions: this.generateContextualSuggestions(bestMapping.category)
    };
  }

  private static getDefaultResult(): DetectionResult {
    return {
      category: 'Comprehensive',
      template: 'Comprehensive UX analysis with actionable insights - evaluate usability, visual design, accessibility, conversion potential, and overall user experience',
      focusAreas: ['usability', 'visual design', 'accessibility', 'user experience'],
      confidence: 0.5,
      suggestions: this.generateGeneralSuggestions()
    };
  }

  private static generateContextualSuggestions(category: string): string[] {
    const suggestionMap: { [key: string]: string[] } = {
      'E-commerce': [
        'Optimize checkout conversion flow',
        'Analyze product page effectiveness',
        'Review trust signals and security indicators',
        'Evaluate cart abandonment factors'
      ],
      'Accessibility': [
        'WCAG compliance audit',
        'Color contrast and readability review',
        'Keyboard navigation assessment',
        'Screen reader compatibility check'
      ],
      'Mobile UX': [
        'Mobile responsiveness review',
        'Touch interface optimization',
        'Mobile navigation patterns',
        'Cross-device compatibility'
      ],
      'Visual Design': [
        'Visual hierarchy analysis',
        'Typography and readability review',
        'Brand consistency evaluation',
        'Color scheme effectiveness'
      ],
      'Usability': [
        'User flow optimization',
        'Navigation clarity assessment',
        'Task completion efficiency',
        'Interaction pattern review'
      ]
    };

    return suggestionMap[category] || this.generateGeneralSuggestions();
  }

  private static generateGeneralSuggestions(): string[] {
    return [
      'Comprehensive UX audit',
      'Visual design analysis',
      'Usability assessment',
      'Accessibility review',
      'Conversion optimization',
      'Mobile experience evaluation'
    ];
  }

  // Generate intelligent suggestions based on detected image content
  static generateIntelligentSuggestions(imageUrls: string[], userHistory?: string[]): string[] {
    // This would ideally analyze image content, but for now we'll use smart defaults
    const suggestions = [
      'Surprise me with unexpected insights 🎲',
      'Focus on conversion and business impact 📈',
      'Comprehensive professional analysis 🎯',
      'Mobile and responsive design review 📱',
      'Accessibility and inclusive design ♿',
      'Visual hierarchy and brand consistency 🎨'
    ];

    // TODO: In the future, this could analyze image content using vision AI
    // to provide more targeted suggestions based on what's actually in the images

    return suggestions;
  }
}

export const detectSmartContext = SmartContextDetector.detectContext;
export const generateIntelligentSuggestions = SmartContextDetector.generateIntelligentSuggestions;
