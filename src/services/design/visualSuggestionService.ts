import { supabase } from '@/lib/supabase';

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
    const imageUrl = await this.callDALLEViaEdgeFunction(prompt);
    
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

  // NEW: Use your working edge function instead of direct API call
  private async callDALLEViaEdgeFunction(prompt: string): Promise<string> {
    try {
      console.log('🎨 Calling DALL-E via edge function with prompt:', prompt.substring(0, 100) + '...');
      
      const { data, error } = await supabase.functions.invoke('generate-dalle-image', {
        body: { prompt }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`DALL-E generation failed: ${error.message}`);
      }

      if (!data?.imageUrl) {
        console.error('❌ No image URL in response:', data);
        throw new Error('No image URL returned from DALL-E service');
      }

      console.log('✅ DALL-E generation successful');
      return data.imageUrl;
      
    } catch (error) {
      console.error('❌ Error calling DALL-E edge function:', error);
      throw new Error(`Failed to generate visual suggestion: ${error.message}`);
    }
  }

  async generateVisualSuggestions(request: SuggestionRequest): Promise<VisualSuggestion[]> {
    const suggestions: VisualSuggestion[] = [];
    const topInsights = request.analysisInsights.slice(0, 3); // Limit to top 3

    console.log('🚀 Starting visual suggestions generation for insights:', topInsights);

    for (const insight of topInsights) {
      try {
        // Generate before/after for each insight
        console.log(`🎨 Generating before/after for: ${insight.substring(0, 50)}...`);
        const beforeAfter = await this.generateSuggestion(insight, request.userContext, 'before_after');
        suggestions.push(beforeAfter);

        // Generate style variant if context suggests style changes
        if (request.userContext.toLowerCase().match(/premium|professional|modern|playful|elegant|minimal/)) {
          console.log(`🎨 Generating style variant for: ${insight.substring(0, 50)}...`);
          const styleVariant = await this.generateSuggestion(insight, request.userContext, 'style_variant');
          suggestions.push(styleVariant);
        }

        // Generate accessibility fix if accessibility is mentioned
        if (insight.toLowerCase().match(/contrast|accessibility|wcag|readable|screen.reader|keyboard/)) {
          console.log(`♿ Generating accessibility fix for: ${insight.substring(0, 50)}...`);
          const accessibilityFix = await this.generateSuggestion(insight, request.userContext, 'accessibility_fix');
          suggestions.push(accessibilityFix);
        }

      } catch (error) {
        console.error(`❌ Failed to generate suggestion for insight: ${insight}`, error);
        // Continue with other insights even if one fails
      }
    }

    console.log(`✅ Generated ${suggestions.length} visual suggestions successfully`);
    return suggestions;
  }
}

export const visualSuggestionService = new VisualSuggestionService();