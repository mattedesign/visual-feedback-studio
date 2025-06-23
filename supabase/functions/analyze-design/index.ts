
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
    console.log('=== AI Analysis Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    // Enhanced environment debugging
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    console.log('Environment check - ANTHROPIC_API_KEY exists:', !!anthropicApiKey);
    console.log('Environment check - API key type:', typeof anthropicApiKey);
    
    if (anthropicApiKey) {
      console.log('Environment check - API key first 15 chars:', anthropicApiKey.substring(0, 15));
      console.log('Environment check - API key last 10 chars:', anthropicApiKey.substring(anthropicApiKey.length - 10));
      console.log('Environment check - API key length:', anthropicApiKey.length);
      console.log('Environment check - API key starts with sk-ant-:', anthropicApiKey.startsWith('sk-ant-'));
    }
    
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY environment variable is not set');
      throw new Error('ANTHROPIC_API_KEY is not configured in Supabase secrets');
    }

    // Enhanced API key validation
    const trimmedKey = anthropicApiKey.trim();
    console.log('Trimmed key equals original:', trimmedKey === anthropicApiKey);
    console.log('Trimmed key length:', trimmedKey.length);
    
    if (!trimmedKey.startsWith('sk-ant-')) {
      console.error('ANTHROPIC_API_KEY does not have expected format (should start with sk-ant-)');
      throw new Error('ANTHROPIC_API_KEY appears to be invalid - should start with sk-ant-');
    }

    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { imageUrl, analysisId, analysisPrompt, designType }: AnalysisRequest = requestBody;

    console.log('Starting AI analysis for:', { 
      analysisId, 
      imageUrl: imageUrl?.substring(0, 50) + '...', 
      designType,
      promptLength: analysisPrompt?.length 
    });

    // Validate required parameters
    if (!imageUrl) {
      throw new Error('imageUrl is required');
    }
    if (!analysisId) {
      throw new Error('analysisId is required');
    }

    // Fetch and process the image
    console.log('Fetching image from URL...');
    const { base64Image, mimeType } = await fetchImageAsBase64(imageUrl);
    console.log('Image fetched successfully, type:', mimeType, 'size:', base64Image.length);

    // Create analysis prompt
    console.log('Creating analysis prompt...');
    const systemPrompt = createAnalysisPrompt(analysisPrompt);
    console.log('System prompt created, length:', systemPrompt.length);

    // Analyze with Claude
    console.log('Calling Claude API...');
    const annotations = await analyzeWithClaude(base64Image, mimeType, systemPrompt, trimmedKey);

    console.log('Analysis completed successfully with', annotations.length, 'annotations');

    // Format and return response
    const responseData = formatAnalysisResponse(annotations);
    
    console.log('=== AI Analysis Function Completed Successfully ===');
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== Error in analyze-design function ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error cause:', error.cause);
    
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
