import { supabase } from '@/integrations/supabase/client';
import { smartStyleSelector, DesignContext } from './smartStyleSelector';
import { TunerSettings } from '@/types/promptTuner';

interface VisualSuggestion {
  id: string;
  type: 'before_after' | 'style_variant' | 'accessibility_fix' | 'smart_before_after';
  description: string;
  imageUrl: string;
  originalIssue: string;
  improvement: string;
  timestamp: Date;
  confidence?: number;
  style?: string;
  reasoning?: string;
  upgradeOptions?: UpgradeOption[];
  generatedAt?: string;
  customVariation?: CustomVisualResult;
}

interface CustomVisualResult {
  id: string;
  imageUrl: string;
  settings: TunerSettings;
  prompt: string;
  createdAt: Date;
}

interface UpgradeOption {
  id: string;
  name: string;
  credits: number;
  description: string;
  styles: string[];
  value_proposition: string;
}

interface SuggestionRequest {
  analysisInsights: string[];
  userContext: string;
  focusAreas: string[];
  designType: 'mobile' | 'desktop' | 'responsive';
  originalImageUrl?: string;
  imageDescription?: string;
}

class VisualSuggestionService {
  
  // Enhanced image context analysis
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

  private extractDesignContext(userContext: any): DesignContext {
    // Extract context from user input, form data, or analysis
    const context: DesignContext = {
      industry: userContext.industry || this.detectIndustryFromContext(userContext),
      deviceType: userContext.device_type || userContext.deviceType || 'desktop',
      primaryIssue: userContext.primary_concern || userContext.primaryConcern || '',
      userType: userContext.user_type || userContext.userType || 'general',
      pageType: userContext.page_type || userContext.pageType || 'landing',
      businessGoal: userContext.business_goal || userContext.businessGoal || 'conversion'
    };
    
    console.log('📋 Extracted design context:', context);
    return context;
  }

  private detectIndustryFromContext(userContext: any): string | undefined {
    // Convert user context to searchable string
    const contextStr = JSON.stringify(userContext).toLowerCase();
    
    const industryKeywords = {
      'finance': ['bank', 'financial', 'investment', 'loan', 'credit', 'trading', 'fintech'],
      'healthcare': ['medical', 'health', 'doctor', 'patient', 'clinic', 'hospital', 'pharmacy'],
      'ecommerce': ['shop', 'store', 'product', 'cart', 'checkout', 'buy', 'retail', 'marketplace'],
      'saas': ['software', 'platform', 'dashboard', 'analytics', 'subscription', 'saas'],
      'education': ['learn', 'course', 'student', 'university', 'school', 'education', 'training'],
      'gaming': ['game', 'gaming', 'player', 'level', 'score', 'tournament'],
      'tech': ['technology', 'developer', 'api', 'integration', 'technical'],
      'startup': ['startup', 'launch', 'mvp', 'growth', 'founder']
    };

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(keyword => contextStr.includes(keyword))) {
        console.log(`🏭 Detected industry: ${industry} (found keywords: ${keywords.filter(k => contextStr.includes(k)).join(', ')})`);
        return industry;
      }
    }
    
    console.log('🏭 No specific industry detected, using default');
    return undefined;
  }

  private buildContextualPrompt(insight: string, userContext: any, designContext: DesignContext): string {
    // Build a contextual prompt based on the insight and context
    const basePrompt = `Create a UI mockup that addresses this UX issue: ${insight}`;
    
    let contextualPrompt = basePrompt;
    
    if (designContext.pageType) {
      contextualPrompt += ` for a ${designContext.pageType} page`;
    }
    
    if (designContext.industry) {
      contextualPrompt += ` in the ${designContext.industry} industry`;
    }
    
    if (designContext.businessGoal) {
      contextualPrompt += ` optimized for ${designContext.businessGoal}`;
    }
    
    // Add specific UI improvement direction
    contextualPrompt += `. Show a clear before/after comparison or improved version that solves the identified problem.`;
    
    return contextualPrompt;
  }

  private buildUpgradeOptions(alternatives: string[], context: DesignContext): UpgradeOption[] {
    const upgradeOptions: UpgradeOption[] = [
      {
        id: 'style_variety_pack',
        name: 'Style Variety Pack',
        credits: 2,
        description: `See ${alternatives.length} additional style approaches: ${alternatives.join(', ')}`,
        styles: alternatives,
        value_proposition: 'Compare different design directions before making final decisions'
      }
    ];

    // Add device-specific upgrade if not already mobile-focused
    if (context.deviceType !== 'mobile') {
      upgradeOptions.push({
        id: 'responsive_design_pack',
        name: 'Responsive Design Pack', 
        credits: 2,
        description: 'See how this design works across mobile, tablet, and desktop',
        styles: ['mobile_optimized', 'tablet_optimized', 'desktop_optimized'],
        value_proposition: 'Ensure your design works perfectly across all devices'
      });
    }

    // Add A/B testing upgrade for conversion-focused contexts
    if (context.businessGoal === 'conversion' || context.pageType === 'landing') {
      upgradeOptions.push({
        id: 'ab_test_variants',
        name: 'A/B Test Variants',
        credits: 3,
        description: 'Generate 2 statistically different versions for split testing',
        styles: ['conversion_variant_a', 'conversion_variant_b'],
        value_proposition: 'Get proven-different designs for conversion optimization testing'
      });
    }

    return upgradeOptions;
  }

  private generateSmartDescription(style: string, insight: string): string {
    const truncatedInsight = insight.substring(0, 80) + (insight.length > 80 ? '...' : '');
    
    const styleDescriptions = {
      'professional': `Professional redesign addressing: ${truncatedInsight}`,
      'minimal': `Clean, simplified approach for: ${truncatedInsight}`,
      'bold': `High-impact design targeting: ${truncatedInsight}`,
      'playful': `Engaging, user-friendly solution for: ${truncatedInsight}`
    };
    
    return styleDescriptions[style] || `Smart enhanced design for: ${truncatedInsight}`;
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

  // Enhanced generateVisualSuggestions method with Smart Style Selector integration
  async generateVisualSuggestions(request: SuggestionRequest): Promise<VisualSuggestion[]> {
    console.log('🚀 Starting ENHANCED smart visual generation');
    
    // Extract design context from user input
    const designContext = this.extractDesignContext(request.userContext);
    console.log('🔍 Design context extracted:', designContext);
    
    // Get smart style recommendation using SmartStyleSelector
    const styleRecommendation = smartStyleSelector.selectOptimalStyle(
      request.analysisInsights,
      request.userContext,
      designContext
    );
    
    console.log('🧠 Smart style selected:', styleRecommendation);
    
    try {
      // Use the top insight for the primary visual
      const primaryInsight = request.analysisInsights[0];
      
      // Build enhanced prompt with smart style
      const basePrompt = this.buildContextualPrompt(primaryInsight, request.userContext, designContext);
      const enhancedPrompt = smartStyleSelector.buildEnhancedPrompt(
        basePrompt, 
        styleRecommendation.style,
        designContext
      );
      
      console.log(`🎨 Generating smart ${styleRecommendation.style} visual for: ${primaryInsight.substring(0, 50)}...`);
      
      // Generate single high-quality visual
      const imageUrl = await this.callDALLEViaEdgeFunction(enhancedPrompt);
      
      // Build upgrade options
      const upgradeOptions = this.buildUpgradeOptions(styleRecommendation.alternatives, designContext);
      
      const smartSuggestion: VisualSuggestion = {
        id: `smart_visual_${Date.now()}`,
        type: 'smart_before_after',
        imageUrl,
        description: this.generateSmartDescription(styleRecommendation.style, primaryInsight),
        originalIssue: primaryInsight,
        improvement: `Smart ${styleRecommendation.style} redesign with ${styleRecommendation.confidence * 100}% confidence`,
        timestamp: new Date(),
        confidence: styleRecommendation.confidence,
        style: styleRecommendation.style,
        reasoning: styleRecommendation.reasoning,
        upgradeOptions,
        generatedAt: new Date().toISOString()
      };
      
      console.log(`✅ Generated 1 SMART visual suggestion with ${upgradeOptions.length} upgrade options`);
      return [smartSuggestion];
      
    } catch (error) {
      console.error(`❌ Failed to generate smart visual suggestion:`, error);
      // Fallback: return empty array rather than breaking the analysis
      return [];
    }
  }

  // New method for custom visual generation
  async generateCustomVisual(
    enhancedPrompt: string, 
    settings: TunerSettings, 
    suggestionId: string
  ): Promise<CustomVisualResult> {
    console.log('🎛️ Generating custom visual with tuner settings:', settings);
    
    try {
      // Build enhanced prompt with tuner settings
      const customPrompt = this.buildTunedPrompt(enhancedPrompt, settings);
      
      // Generate the custom visual
      const imageUrl = await this.callDALLEViaEdgeFunction(customPrompt);
      
      const customResult: CustomVisualResult = {
        id: `custom_${suggestionId}_${Date.now()}`,
        imageUrl,
        settings,
        prompt: customPrompt,
        createdAt: new Date()
      };
      
      console.log('✅ Custom visual generated successfully');
      return customResult;
      
    } catch (error) {
      console.error('❌ Failed to generate custom visual:', error);
      throw new Error(`Custom visual generation failed: ${error.message}`);
    }
  }

  private buildTunedPrompt(basePrompt: string, settings: TunerSettings): string {
    let tunedPrompt = basePrompt;
    
    // Apply layout density
    if (settings.layoutDensity > 70) {
      tunedPrompt += ' with dense, information-rich layout';
    } else if (settings.layoutDensity < 30) {
      tunedPrompt += ' with spacious, minimal layout';
    }
    
    // Apply visual tone
    if (settings.visualTone > 70) {
      tunedPrompt += ', professional and corporate aesthetic';
    } else if (settings.visualTone < 30) {
      tunedPrompt += ', playful and creative aesthetic';
    }
    
    // Apply color emphasis
    if (settings.colorEmphasis > 70) {
      tunedPrompt += ', vibrant and colorful design';
    } else if (settings.colorEmphasis < 30) {
      tunedPrompt += ', monochromatic and subtle colors';
    }
    
    // Apply fidelity
    if (settings.fidelity > 70) {
      tunedPrompt += ', high-fidelity detailed mockup';
    } else if (settings.fidelity < 30) {
      tunedPrompt += ', low-fidelity wireframe style';
    }
    
    return tunedPrompt;
  }
}

export const visualSuggestionService = new VisualSuggestionService();
