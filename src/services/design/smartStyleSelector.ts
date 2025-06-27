
export interface DesignContext {
  industry?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  primaryIssue?: string;
  userType?: string;
  pageType?: string;
  businessGoal?: string;
}

export interface StyleRecommendation {
  style: 'professional' | 'minimal' | 'bold' | 'playful';
  confidence: number;
  reasoning: string;
  alternatives: string[];
}

export class SmartStyleSelector {
  
  selectOptimalStyle(
    analysisInsights: string[], 
    userContext: any,
    designContext?: DesignContext
  ): StyleRecommendation {
    
    // Industry-based style mapping
    const industryStyles: Record<string, string> = {
      'finance': 'professional',
      'healthcare': 'professional', 
      'banking': 'professional',
      'legal': 'professional',
      'gaming': 'bold',
      'entertainment': 'bold',
      'sports': 'bold',
      'startup': 'minimal',
      'tech': 'minimal',
      'saas': 'minimal',
      'creative': 'playful',
      'education': 'playful',
      'nonprofit': 'playful'
    };

    // Problem-based style mapping
    const problemStyles: Record<string, string> = {
      'clutter': 'minimal',
      'overwhelming': 'minimal',
      'complex': 'minimal',
      'boring': 'bold',
      'bland': 'bold',
      'unprofessional': 'professional',
      'childish': 'professional',
      'confusing': 'minimal'
    };

    let selectedStyle = 'professional'; // Safe default
    let confidence = 0.7;
    let reasoning = 'Default professional style for broad appeal';
    let alternatives: string[] = [];

    // 1. Check industry context
    if (designContext?.industry) {
      const industryStyle = industryStyles[designContext.industry.toLowerCase()];
      if (industryStyle) {
        selectedStyle = industryStyle;
        confidence = 0.85;
        reasoning = `${designContext.industry} industry typically performs best with ${industryStyle} design`;
      }
    }

    // 2. Override based on specific problems mentioned
    const combinedInsights = analysisInsights.join(' ').toLowerCase();
    for (const [problem, style] of Object.entries(problemStyles)) {
      if (combinedInsights.includes(problem)) {
        selectedStyle = style;
        confidence = 0.9;
        reasoning = `Detected "${problem}" issue - ${style} style addresses this directly`;
        break;
      }
    }

    // 3. Set alternatives based on selected style
    const allStyles = ['professional', 'minimal', 'bold', 'playful'];
    alternatives = allStyles.filter(style => style !== selectedStyle);

    return {
      style: selectedStyle as any,
      confidence,
      reasoning,
      alternatives
    };
  }

  buildEnhancedPrompt(
    basePrompt: string, 
    selectedStyle: string,
    designContext?: DesignContext
  ): string {
    
    const styleModifiers = {
      'professional': 'Clean, corporate design with muted colors, professional typography, and formal layout structure. Emphasizes trust and credibility.',
      'minimal': 'Minimalist design with abundant whitespace, simple typography, limited color palette, and focus on essential elements only.',
      'bold': 'High-contrast design with vibrant colors, strong typography, dramatic visual hierarchy, and eye-catching elements.',
      'playful': 'Friendly, approachable design with rounded elements, bright colors, casual typography, and engaging visual elements.'
    };

    const deviceModifiers = {
      'mobile': 'Optimized for mobile viewing with touch-friendly elements, vertical layout, and thumb-accessible navigation.',
      'tablet': 'Optimized for tablet viewing with medium-sized touch targets and landscape-friendly layout.',
      'desktop': 'Desktop-optimized with precise cursor interactions, horizontal navigation, and detailed information density.'
    };

    let enhancedPrompt = `${basePrompt}

STYLE DIRECTION: ${styleModifiers[selectedStyle]}`;

    if (designContext?.deviceType) {
      enhancedPrompt += `
DEVICE OPTIMIZATION: ${deviceModifiers[designContext.deviceType]}`;
    }

    if (designContext?.businessGoal) {
      enhancedPrompt += `
BUSINESS GOAL: Optimize for ${designContext.businessGoal}`;
    }

    enhancedPrompt += `

TECHNICAL REQUIREMENTS:
- Generate an actual interface mockup, not conceptual art
- Show realistic UI elements and interactions
- Use proper visual hierarchy and UX principles
- Include specific improvements addressing user feedback
- Maintain professional quality suitable for client presentation`;

    return enhancedPrompt;
  }
}

export const smartStyleSelector = new SmartStyleSelector();
