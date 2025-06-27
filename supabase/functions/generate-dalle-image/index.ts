
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY_DALLE');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const buildUIPrompt = (userPrompt: string): string => {
  return `Create a detailed UI mockup for: ${userPrompt}

REQUIREMENTS:
- Generate an actual interface mockup, not a conceptual design
- Show realistic UI elements: buttons, forms, navigation bars, content areas
- Use modern flat design principles with clean typography
- Include proper spacing, hierarchy, and visual organization
- Display actual interface components that users would interact with
- Use a professional color scheme with good contrast ratios
- Show realistic content placeholders and UI text
- Create a desktop or mobile interface layout as appropriate
- Include navigation elements, CTAs, and interactive components
- Make it look like a real application screenshot or wireframe

STYLE: Clean, modern, minimalist UI design with proper UX principles. Flat design aesthetic with subtle shadows and contemporary typography. Professional appearance suitable for a real product.`;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Valid prompt is required');
    }

    console.log('Generating UI mockup with prompt:', prompt);

    const enhancedPrompt = buildUIPrompt(prompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'natural'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    if (data.data && data.data[0] && data.data[0].url) {
      return new Response(JSON.stringify({ 
        success: true, 
        imageUrl: data.data[0].url 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('No image generated in response');
    }
  } catch (error) {
    console.error('Error in generate-dalle-image function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
