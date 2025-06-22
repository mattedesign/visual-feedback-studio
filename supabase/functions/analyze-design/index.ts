
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AnalysisRequest } from './types.ts';
import { fetchImageAsBase64 } from './imageProcessor.ts';
import { createAnalysisPrompt } from './promptBuilder.ts';
import { analyzeWithClaude } from './claudeClient.ts';
import { formatAnalysisResponse, formatErrorResponse } from './responseFormatter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const { imageUrl, analysisId, analysisPrompt, designType }: AnalysisRequest = await req.json();

    console.log('Starting AI analysis for:', { analysisId, imageUrl, designType });

    // Fetch and process the image
    const { base64Image, mimeType } = await fetchImageAsBase64(imageUrl);

    // Create analysis prompt
    const systemPrompt = createAnalysisPrompt(analysisPrompt);

    // Analyze with Claude
    const annotations = await analyzeWithClaude(base64Image, mimeType, systemPrompt, anthropicApiKey);

    console.log('Analysis completed successfully with', annotations.length, 'annotations');

    // Format and return response
    const responseData = formatAnalysisResponse(annotations);
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-design function:', error);
    const errorData = formatErrorResponse(error);
    
    return new Response(
      JSON.stringify(errorData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
