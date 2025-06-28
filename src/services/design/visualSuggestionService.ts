
import { supabase } from '@/integrations/supabase/client';

export interface SuggestionRequest {
  insight: string;
  style: SuggestionStyle;
  imageContext?: ImageAnalysisContext;
  ragContext?: RAGContext;
  userPreferences?: UserPreferences;
}

export interface ImageAnalysisContext {
  layoutAnalysis: {
    gridSystem: string;
    hierarchy: string;
    density: 'sparse' | 'balanced' | 'dense';
    spacing: string;
    alignment: string;
  };
  visualStyle: {
    colorScheme: string[];
    primaryColors: string;
    typography: string;
    tone: string;
    brandPersonality: string;
  };
  components: {
    buttons: string;
    forms: string;
    navigation: string;
    contentBlocks: string;
  };
  context: {
    audience: string;
    industry: string;
    device: string;
    accessibility: string[];
    businessGoals: string;
  };
}

export interface RAGContext {
  designPatterns: string[];
  industryBestPractices: string[];
  competitiveInsights: string[];
  userResearchFindings: string[];
}

export interface UserPreferences {
  layoutDensity: number;    // 0-100
  visualTone: number;       // 0-100
  colorEmphasis: number;    // 0-100
  fidelity: number;         // 0-100
}

export type SuggestionStyle = 'professional' | 'minimal' | 'bold' | 'playful';

export interface VisualSuggestion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  style: SuggestionStyle;
  enhancedPrompt?: string;
  confidence: number;
  generationTime: number;
  contextScore: number;
}

export interface TunerSettings {
  layoutDensity: number;
  visualTone: number;
  colorEmphasis: number;
  fidelity: number;
}

class VisualSuggestionService {
  
  /**
   * Enhanced DALL-E prompt builder that incorporates context, RAG insights, and user preferences
   */
  private buildContextEnhancedPrompt(
    baseInsight: string,
    style: SuggestionStyle,
    imageContext?: ImageAnalysisContext,
    ragContext?: RAGContext,
    userPreferences?: UserPreferences
  ): string {
    console.log('🎨 Building context-enhanced DALL-E prompt...');
    console.log('Context availability:', {
      hasImageContext: !!imageContext,
      hasRAGContext: !!ragContext,
      hasUserPreferences: !!userPreferences,
      style
    });

    // Base style configurations
    const styleConfigurations = {
      professional: {
        layout: "clean grid system with generous whitespace and structured alignment",
        colors: "sophisticated color palette with high contrast ratios (4.5:1 minimum)",
        typography: "readable sans-serif typography with clear visual hierarchy",
        elements: "rounded corners (4-8px), subtle shadows, refined button styles",
        tone: "polished, trustworthy, corporate-appropriate"
      },
      minimal: {
        layout: "spacious layout with minimal visual noise and breathing room",
        colors: "monochromatic or limited color palette with strategic accent use",
        typography: "clean typography with generous line spacing and minimal font weights",
        elements: "flat design, minimal borders, clean geometric shapes",
        tone: "simple, elegant, uncluttered"
      },
      bold: {
        layout: "dynamic layout with strong visual emphasis and confident spacing",
        colors: "vibrant, high-contrast color combinations with bold accent colors",
        typography: "strong font weights with impactful sizing and dramatic hierarchy",
        elements: "prominent CTAs, bold geometric shapes, confident design language",
        tone: "energetic, confident, attention-grabbing"
      },
      playful: {
        layout: "friendly, approachable layout with visual interest and organic flow",
        colors: "warm, engaging color palette with friendly combinations",
        typography: "approachable typography with personality and varied weights",
        elements: "rounded elements, friendly micro-interactions, approachable styling",
        tone: "fun, approachable, human-centered"
      }
    };

    const selectedConfig = styleConfigurations[style];

    // Start building the enhanced prompt
    let enhancedPrompt = `Create a high-fidelity UI mockup addressing this design insight: "${baseInsight}"

CORE DESIGN REQUIREMENTS:
- Style Direction: ${style.toUpperCase()} - ${selectedConfig.tone}
- Layout Approach: ${selectedConfig.layout}
- Visual Treatment: ${selectedConfig.colors}
- Typography: ${selectedConfig.typography}
- UI Elements: ${selectedConfig.elements}`;

    // Add image context if available
    if (imageContext) {
      enhancedPrompt += `

CONTEXT FROM UPLOADED DESIGN:
- Current Layout: ${imageContext.layoutAnalysis.gridSystem} with ${imageContext.layoutAnalysis.density} content density
- Visual Hierarchy: ${imageContext.layoutAnalysis.hierarchy}
- Color Scheme: ${imageContext.visualStyle.primaryColors}
- Typography Style: ${imageContext.visualStyle.typography}
- Brand Personality: ${imageContext.visualStyle.brandPersonality}
- Target Audience: ${imageContext.context.audience}
- Industry Context: ${imageContext.context.industry}
- Device Optimization: ${imageContext.context.device}`;

      // Add component-specific context
      if (imageContext.components.buttons) {
        enhancedPrompt += `
- Button Treatment: ${imageContext.components.buttons}`;
      }
      if (imageContext.components.forms) {
        enhancedPrompt += `
- Form Elements: ${imageContext.components.forms}`;
      }
      if (imageContext.components.navigation) {
        enhancedPrompt += `
- Navigation Style: ${imageContext.components.navigation}`;
      }
    }

    // Add RAG context insights
    if (ragContext && ragContext.designPatterns.length > 0) {
      enhancedPrompt += `

DESIGN PATTERN INSIGHTS:
- Best Practices: ${ragContext.designPatterns.slice(0, 3).join('; ')}`;
      
      if (ragContext.industryBestPractices.length > 0) {
        enhancedPrompt += `
- Industry Standards: ${ragContext.industryBestPractices.slice(0, 2).join('; ')}`;
      }
      
      if (ragContext.competitiveInsights.length > 0) {
        enhancedPrompt += `
- Competitive Intelligence: ${ragContext.competitiveInsights.slice(0, 2).join('; ')}`;
      }
    }

    // Add user preference customizations
    if (userPreferences) {
      const densityLevel = userPreferences.layoutDensity < 33 ? 'sparse' : 
                          userPreferences.layoutDensity < 67 ? 'balanced' : 'dense';
      const toneLevel = userPreferences.visualTone < 33 ? 'playful' : 
                       userPreferences.visualTone < 67 ? 'balanced' : 'professional';
      const colorLevel = userPreferences.colorEmphasis < 33 ? 'subtle' : 
                        userPreferences.colorEmphasis < 67 ? 'moderate' : 'vibrant';
      const fidelityLevel = userPreferences.fidelity < 33 ? 'wireframe' : 
                           userPreferences.fidelity < 67 ? 'prototype' : 'production';

      enhancedPrompt += `

USER CUSTOMIZATION PREFERENCES:
- Layout Density: ${densityLevel} content arrangement
- Tone Preference: ${toneLevel} visual approach  
- Color Emphasis: ${colorLevel} color treatment
- Design Fidelity: ${fidelityLevel}-ready mockup`;
    }

    // Add technical specifications
    enhancedPrompt += `

TECHNICAL SPECIFICATIONS:
- Aspect Ratio: 16:10 for desktop UI mockup
- Resolution: High-definition, production-quality
- Mockup Style: Realistic UI design (not wireframe unless specified)
- Interactive States: Show hover and active states where relevant
- Content: Use realistic, professional placeholder content
- Accessibility: Follow WCAG 2.1 AA standards for contrast and usability`;

    // Add output quality requirements
    enhancedPrompt += `

OUTPUT QUALITY REQUIREMENTS:
- Visual Polish: Professional, pixel-perfect execution
- Brand Consistency: Maintain cohesive design language throughout
- User Experience: Intuitive navigation and clear information hierarchy
- Modern Standards: Current UI/UX best practices and design trends
- Responsive Considerations: Design that works across device sizes

Create a polished, production-ready UI design that directly addresses the specific insight while incorporating all contextual requirements and maintaining excellent usability.`;

    console.log('✅ Context-enhanced prompt built:', {
      promptLength: enhancedPrompt.length,
      hasImageContext: !!imageContext,
      hasRAGContext: !!ragContext,
      hasUserPreferences: !!userPreferences
    });

    return enhancedPrompt;
  }

  /**
   * Enhanced suggestion generation with context integration
   */
  async generateVisualSuggestions(request: SuggestionRequest): Promise<VisualSuggestion[]> {
    const startTime = Date.now();
    console.log('🚀 Starting enhanced visual suggestion generation...');
    console.log('Request details:', {
      insight: request.insight.substring(0, 100) + '...',
      style: request.style,
      hasImageContext: !!request.imageContext,
      hasRAGContext: !!request.ragContext
    });

    try {
      // Build the context-enhanced prompt
      const enhancedPrompt = this.buildContextEnhancedPrompt(
        request.insight,
        request.style,
        request.imageContext,
        request.ragContext,
        request.userPreferences
      );

      // Generate the image using enhanced prompt
      const imageUrl = await this.callDALLEViaEdgeFunction(enhancedPrompt);
      
      // Calculate metrics
      const generationTime = Date.now() - startTime;
      const contextScore = this.calculateContextScore(request);
      
      const suggestion: VisualSuggestion = {
        id: `suggestion_${Date.now()}`,
        title: this.generateSuggestionTitle(request.insight, request.style),
        description: this.generateSuggestionDescription(request.insight, request.style),
        imageUrl,
        style: request.style,
        enhancedPrompt,
        confidence: Math.min(85 + contextScore * 10, 98), // Higher confidence with better context
        generationTime,
        contextScore
      };

      console.log('✅ Enhanced suggestion generated successfully:', {
        confidence: suggestion.confidence,
        contextScore: suggestion.contextScore,
        generationTime: `${generationTime}ms`
      });

      return [suggestion];

    } catch (error) {
      console.error('❌ Enhanced suggestion generation failed:', error);
      throw new Error(`Failed to generate context-enhanced visual suggestion: ${error.message}`);
    }
  }

  /**
   * Generate custom visual with user tuner settings
   */
  async generateCustomVisual(
    basePrompt: string, 
    settings: TunerSettings, 
    context?: {
      imageContext?: ImageAnalysisContext;
      ragContext?: RAGContext;
    }
  ): Promise<VisualSuggestion> {
    console.log('🎛️ Generating custom visual with tuner settings...');
    console.log('Tuner settings:', settings);

    try {
      // Convert tuner settings to user preferences
      const userPreferences: UserPreferences = {
        layoutDensity: settings.layoutDensity,
        visualTone: settings.visualTone,
        colorEmphasis: settings.colorEmphasis,
        fidelity: settings.fidelity
      };

      // Extract style from base prompt or default to professional
      const style: SuggestionStyle = this.extractStyleFromPrompt(basePrompt) || 'professional';

      // Build enhanced prompt with custom settings
      const enhancedPrompt = this.buildContextEnhancedPrompt(
        basePrompt,
        style,
        context?.imageContext,
        context?.ragContext,
        userPreferences
      );

      const imageUrl = await this.callDALLEViaEdgeFunction(enhancedPrompt);
      
      return {
        id: `custom_${Date.now()}`,
        title: 'Custom Visual Suggestion',
        description: 'Generated with custom tuner settings',
        imageUrl,
        style,
        enhancedPrompt,
        confidence: 90, // High confidence for custom generations
        generationTime: Date.now(),
        contextScore: 0.8 // Good context score for custom requests
      };

    } catch (error) {
      console.error('❌ Custom visual generation failed:', error);
      throw new Error(`Failed to generate custom visual: ${error.message}`);
    }
  }

  /**
   * Calculate context quality score
   */
  private calculateContextScore(request: SuggestionRequest): number {
    let score = 0.3; // Base score
    
    if (request.imageContext) {
      score += 0.3; // +30% for image context
      if (request.imageContext.context.audience) score += 0.1;
      if (request.imageContext.context.industry) score += 0.1;
    }
    
    if (request.ragContext) {
      score += 0.2; // +20% for RAG context
      if (request.ragContext.designPatterns.length > 0) score += 0.05;
      if (request.ragContext.competitiveInsights.length > 0) score += 0.05;
    }

    if (request.userPreferences) {
      score += 0.1; // +10% for user preferences
    }

    return Math.min(score, 1.0);
  }

  /**
   * Extract style from prompt text
   */
  private extractStyleFromPrompt(prompt: string): SuggestionStyle | null {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('professional') || lowercasePrompt.includes('corporate')) {
      return 'professional';
    } else if (lowercasePrompt.includes('minimal') || lowercasePrompt.includes('clean')) {
      return 'minimal';
    } else if (lowercasePrompt.includes('bold') || lowercasePrompt.includes('vibrant')) {
      return 'bold';
    } else if (lowercasePrompt.includes('playful') || lowercasePrompt.includes('fun')) {
      return 'playful';
    }
    
    return null;
  }

  /**
   * Generate contextual suggestion title
   */
  private generateSuggestionTitle(insight: string, style: SuggestionStyle): string {
    const truncatedInsight = insight.length > 60 ? insight.substring(0, 60) + '...' : insight;
    
    const titleTemplates = {
      'professional': `Professional Solution: ${truncatedInsight}`,
      'minimal': `Clean Approach: ${truncatedInsight}`,
      'bold': `Bold Design: ${truncatedInsight}`,
      'playful': `Engaging Solution: ${truncatedInsight}`
    };
    
    return titleTemplates[style] || `Enhanced Design: ${truncatedInsight}`;
  }

  /**
   * Generate contextual suggestion description
   */
  private generateSuggestionDescription(insight: string, style: SuggestionStyle): string {
    const truncatedInsight = insight.length > 80 ? insight.substring(0, 80) + '...' : insight;
    
    const styleDescriptions = {
      'professional': `Professional redesign with enhanced context addressing: ${truncatedInsight}`,
      'minimal': `Clean, simplified approach with focused context for: ${truncatedInsight}`,
      'bold': `High-impact design with strategic context targeting: ${truncatedInsight}`,
      'playful': `Engaging, user-friendly solution with contextual insights for: ${truncatedInsight}`
    };
    
    return styleDescriptions[style] || `Context-enhanced design solution for: ${truncatedInsight}`;
  }

  /**
   * Call DALL-E via edge function with enhanced error handling
   */
  async callDALLEViaEdgeFunction(prompt: string): Promise<string> {
    try {
      console.log('🎨 Calling DALL-E with enhanced prompt...');
      console.log('Prompt preview:', prompt.substring(0, 200) + '...');
      console.log('Full prompt length:', prompt.length);
      
      const { data, error } = await supabase.functions.invoke('generate-dalle-image', {
        body: { 
          prompt,
          quality: 'hd', // Request HD quality for better results
          size: '1792x1024' // 16:10 aspect ratio
        }
      });

      if (error) {
        console.error('❌ DALL-E edge function error:', error);
        throw new Error(`DALL-E generation failed: ${error.message}`);
      }

      if (!data?.imageUrl) {
        console.error('❌ No image URL in DALL-E response:', data);
        throw new Error('No image URL returned from DALL-E service');
      }

      console.log('✅ Enhanced DALL-E generation successful');
      console.log('Generated image URL:', data.imageUrl);
      
      return data.imageUrl;
      
    } catch (error) {
      console.error('❌ Error calling enhanced DALL-E edge function:', error);
      throw new Error(`Failed to generate enhanced visual suggestion: ${error.message}`);
    }
  }
}

// Export singleton instance
export const visualSuggestionService = new VisualSuggestionService();
