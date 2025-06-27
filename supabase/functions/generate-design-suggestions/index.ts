
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateDesignSuggestionsRequest {
  analysisInsights: Array<{
    category: string;
    feedback: string;
    severity: string;
  }>;
  userContext: {
    designType: string;
    targetAudience?: string;
    brandGuidelines?: string;
    businessGoals?: string;
  };
  designContext: 'wireframe' | 'mockup' | 'prototype' | 'redesign';
  numberOfSuggestions?: number;
}

interface DesignSuggestion {
  id: string;
  imageUrl: string;
  prompt: string;
  category: string;
  description: string;
  implementationNotes: string;
  metadata: {
    model: string;
    revised_prompt?: string;
    size: string;
    quality: string;
    style: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: GenerateDesignSuggestionsRequest = await req.json();
    const { analysisInsights, userContext, designContext, numberOfSuggestions = 3 } = body;

    console.log('Generating design suggestions:', {
      insightsCount: analysisInsights.length,
      designType: userContext.designType,
      designContext,
      numberOfSuggestions
    });

    // Generate prompts based on analysis insights
    const prompts = generateDesignPrompts(analysisInsights, userContext, designContext, numberOfSuggestions);
    
    const suggestions: DesignSuggestion[] = [];

    // Generate images for each prompt
    for (let i = 0; i < prompts.length; i++) {
      const promptData = prompts[i];
      
      try {
        console.log(`Generating image ${i + 1}/${prompts.length} with DALL-E 3`);
        
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: promptData.prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'natural'
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`DALL-E 3 API error for prompt ${i + 1}:`, errorText);
          continue;
        }

        const data = await response.json();
        
        if (data.data && data.data[0]?.url) {
          const suggestion: DesignSuggestion = {
            id: `suggestion_${Date.now()}_${i}`,
            imageUrl: data.data[0].url,
            prompt: promptData.prompt,
            category: promptData.category,
            description: promptData.description,
            implementationNotes: promptData.implementationNotes,
            metadata: {
              model: 'dall-e-3',
              revised_prompt: data.data[0].revised_prompt,
              size: '1024x1024',
              quality: 'standard',
              style: 'natural'
            }
          };
          
          suggestions.push(suggestion);
          console.log(`Successfully generated suggestion ${i + 1}: ${promptData.category}`);
        }
      } catch (error) {
        console.error(`Error generating image ${i + 1}:`, error);
        continue;
      }
    }

    console.log(`Generated ${suggestions.length} design suggestions successfully`);

    return new Response(JSON.stringify({ 
      success: true,
      suggestions,
      totalGenerated: suggestions.length,
      requestedCount: numberOfSuggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-design-suggestions function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateDesignPrompts(
  insights: Array<{ category: string; feedback: string; severity: string }>,
  userContext: { designType: string; targetAudience?: string; brandGuidelines?: string; businessGoals?: string },
  designContext: string,
  count: number
) {
  const prompts = [];
  
  // Categorize insights
  const uxIssues = insights.filter(i => i.category === 'ux');
  const visualIssues = insights.filter(i => i.category === 'visual');
  const accessibilityIssues = insights.filter(i => i.category === 'accessibility');
  const conversionIssues = insights.filter(i => i.category === 'conversion');

  // Template prompts based on design context
  const baseContext = `Create a professional ${userContext.designType} design ${designContext === 'redesign' ? 'redesign' : designContext}`;
  const audience = userContext.targetAudience ? ` for ${userContext.targetAudience}` : '';
  const style = ', clean modern interface, professional layout, user-friendly design';

  // Generate UX improvement suggestion
  if (uxIssues.length > 0 && prompts.length < count) {
    const uxFeedback = uxIssues.map(i => i.feedback).join('. ');
    prompts.push({
      prompt: `${baseContext}${audience} that solves these UX issues: ${uxFeedback.substring(0, 200)}${style}, intuitive navigation, clear user flow, responsive design`,
      category: 'UX Improvement',
      description: 'Design suggestion focusing on user experience improvements',
      implementationNotes: 'Focus on navigation clarity, user flow optimization, and intuitive interactions'
    });
  }

  // Generate visual design suggestion
  if (visualIssues.length > 0 && prompts.length < count) {
    const visualFeedback = visualIssues.map(i => i.feedback).join('. ');
    prompts.push({
      prompt: `${baseContext}${audience} with improved visual hierarchy addressing: ${visualFeedback.substring(0, 200)}${style}, consistent typography, balanced color scheme, proper spacing`,
      category: 'Visual Design',
      description: 'Design suggestion focusing on visual hierarchy and aesthetics',
      implementationNotes: 'Emphasize typography consistency, color harmony, and visual balance'
    });
  }

  // Generate conversion optimization suggestion
  if (conversionIssues.length > 0 && prompts.length < count) {
    const conversionFeedback = conversionIssues.map(i => i.feedback).join('. ');
    prompts.push({
      prompt: `${baseContext}${audience} optimized for conversions addressing: ${conversionFeedback.substring(0, 200)}${style}, prominent call-to-action buttons, trust signals, streamlined forms`,
      category: 'Conversion Optimization',
      description: 'Design suggestion focusing on conversion rate optimization',
      implementationNotes: 'Highlight CTAs, reduce friction, add trust elements and social proof'
    });
  }

  // Fill remaining slots with general improvement suggestions
  while (prompts.length < count) {
    const generalFeedback = insights.slice(0, 2).map(i => i.feedback).join('. ');
    prompts.push({
      prompt: `${baseContext}${audience} that addresses these design improvements: ${generalFeedback.substring(0, 200)}${style}, modern aesthetics, excellent usability`,
      category: 'General Improvement',
      description: 'Comprehensive design suggestion based on overall analysis',
      implementationNotes: 'Apply best practices for modern web design and user experience'
    });
  }

  return prompts.slice(0, count);
}
