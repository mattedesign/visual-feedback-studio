import { supabase } from '@/integrations/supabase/client';

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
  originalImageUrl?: string; // NEW: Reference to original image
  imageDescription?: string; // NEW: Description of what's in the image
}

class VisualSuggestionService {
  
  // NEW: Analyze the context to understand what kind of interface this is
  private analyzeImageContext(context: string, insights: string[]): {
    interfaceType: string;
    keyElements: string[];
    styleDescription: string;
  } {
    const contextLower = context.toLowerCase();
    const allText = (context + ' ' + insights.join(' ')).toLowerCase();
    
    // Determine interface type
    let interfaceType = 'web application';
    if (allText.includes('dashboard')) interfaceType = 'dashboard interface';
    if (allText.includes('mobile') || allText.includes('app')) interfaceType = 'mobile application';
    if (allText.includes('landing') || allText.includes('marketing')) interfaceType = 'landing page';
    if (allText.includes('ecommerce') || allText.includes('shop')) interfaceType = 'ecommerce interface';
    if (allText.includes('form') || allText.includes('signup')) interfaceType = 'form interface';
    
    // Extract key elements mentioned
    const keyElements = [];
    if (allText.includes('button')) keyElements.push('buttons');
    if (allText.includes('card')) keyElements.push('cards');
    if (allText.includes('navigation') || allText.includes('nav')) keyElements.push('navigation');
    if (allText.includes('sidebar')) keyElements.push('sidebar');
    if (allText.includes('table') || allText.includes('data')) keyElements.push('data tables');
    if (allText.includes('chart') || allText.includes('graph')) keyElements.push('charts');
    if (allText.includes('form') || allText.includes('input')) keyElements.push('form fields');
    if (allText.includes('header')) keyElements.push('header');
    if (allText.includes('menu')) keyElements.push('menu');
    
    // Determine style approach
    let styleDescription = 'clean, modern design';
    if (allText.includes('teacher') || allText.includes('education')) styleDescription = 'educational, user-friendly design';
    if (allText.includes('professional') || allText.includes('enterprise')) styleDescription = 'professional, corporate design';
    if (allText.includes('minimal')) styleDescription = 'minimal, clean design';
    if (allText.includes('colorful') || allText.includes('vibrant')) styleDescription = 'vibrant, engaging design';
    
    return { interfaceType, keyElements, styleDescription };
  }

  private buildEnhancedPrompt(
    insight: string, 
    context: string, 
    type: string,
    imageAnalysis: { interfaceType: string; keyElements: string[]; styleDescription: string; }
  ): string {
    const { interfaceType, keyElements, styleDescription } = imageAnalysis;
    
    // Build specific element references
    const elementReferences = keyElements.length > 0 
      ? `featuring ${keyElements.join(', ')}` 
      : '';
    
    const basePrompt = `High-quality ${interfaceType} mockup with ${styleDescription} ${elementReferences}`;
    
    switch (type) {
      case 'before_after':
        return `${basePrompt}, showing the IMPROVED version that addresses: "${insight}". 
                Context: ${context}. 
                Focus on maintaining the same layout structure while making specific improvements to ${keyElements.join(' and ')}.
                Show the solution with better UX, enhanced visual hierarchy, and improved usability.
                Professional UI/UX design, realistic interface, modern styling.`;
                
      case 'style_variant': 
        return `${basePrompt}, redesigned with enhanced ${styleDescription} approach to solve: "${insight}".
                Context: ${context}.
                Keep the same general layout but apply better visual design, improved spacing, enhanced typography, and modern UI patterns.
                Show specific design improvements while maintaining usability.
                Professional interface design, clean mockup style.`;
                
      case 'accessibility_fix':
        return `${basePrompt}, redesigned for WCAG compliance and accessibility to address: "${insight}".
                Context: ${context}.
                Show the same interface with improved contrast ratios, clearer labels, better button sizing, enhanced keyboard navigation indicators.
                Focus on accessibility improvements: high contrast colors, readable text, clear visual hierarchy, accessible form elements.
                Professional accessible design, meets WCAG AA standards.`;
                
      default:
        return `${basePrompt} addressing: "${insight}" in context: ${context}`;
    }
  }

  private async generateSuggestion(
    insight: string, 
    context: string, 
    type: 'before_after' | 'style_variant' | 'accessibility_fix',
    imageAnalysis: { interfaceType: string; keyElements: string[]; styleDescription: string; }
  ): Promise<VisualSuggestion> {
    const prompt = this.buildEnhancedPrompt(insight, context, type, imageAnalysis);
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

  private getImprovementDescription(insight: string, type: 'before_after' | 'style_variant' | 'accessibility_fix'): string {
    switch (type) {
      case 'before_after':
        return `Enhanced UX solution: ${insight.substring(0, 100)}${insight.length > 100 ? '...' : ''}`;
      case 'style_variant':
        return `Visual redesign: ${insight.substring(0, 100)}${insight.length > 100 ? '...' : ''}`;
      case 'accessibility_fix':
        return `Accessibility improvement: ${insight.substring(0, 100)}${insight.length > 100 ? '...' : ''}`;
      default:
        return `Enhancement: ${insight.substring(0, 100)}${insight.length > 100 ? '...' : ''}`;
    }
  }

  private async callDALLEViaEdgeFunction(prompt: string): Promise<string> {
    try {
      console.log('🎨 Enhanced DALL-E prompt:', prompt.substring(0, 200) + '...');
      
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

      console.log('✅ Enhanced DALL-E generation successful');
      return data.imageUrl;
      
    } catch (error) {
      console.error('❌ Error calling DALL-E edge function:', error);
      throw new Error(`Failed to generate visual suggestion: ${error.message}`);
    }
  }

  async generateVisualSuggestions(request: SuggestionRequest): Promise<VisualSuggestion[]> {
    const suggestions: VisualSuggestion[] = [];
    const topInsights = request.analysisInsights.slice(0, 3);

    console.log('🚀 Starting ENHANCED visual suggestions generation');
    
    // NEW: Analyze the image context for better prompts
    const imageAnalysis = this.analyzeImageContext(request.userContext, topInsights);
    console.log('🔍 Image analysis:', imageAnalysis);

    for (const insight of topInsights) {
      try {
        // Generate contextual before/after for each insight
        console.log(`🎨 Generating contextual improvement for: ${insight.substring(0, 50)}...`);
        const beforeAfter = await this.generateSuggestion(insight, request.userContext, 'before_after', imageAnalysis);
        suggestions.push(beforeAfter);

        // Generate accessibility fix if accessibility issues mentioned
        if (insight.toLowerCase().match(/contrast|accessibility|wcag|readable|screen.reader|keyboard|color/)) {
          console.log(`♿ Generating accessibility improvement for: ${insight.substring(0, 50)}...`);
          const accessibilityFix = await this.generateSuggestion(insight, request.userContext, 'accessibility_fix', imageAnalysis);
          suggestions.push(accessibilityFix);
        }

      } catch (error) {
        console.error(`❌ Failed to generate enhanced suggestion for insight: ${insight}`, error);
      }
    }

    console.log(`✅ Generated ${suggestions.length} ENHANCED visual suggestions`);
    return suggestions;
  }
}

export const visualSuggestionService = new VisualSuggestionService();