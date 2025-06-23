
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
    
    // Enhanced environment debugging with validation
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    console.log('Environment check - ANTHROPIC_API_KEY exists:', !!anthropicApiKey);
    
    if (anthropicApiKey) {
      const cleanKey = anthropicApiKey.trim();
      console.log('Environment check:', {
        apiKeyType: typeof anthropicApiKey,
        originalLength: anthropicApiKey.length,
        cleanedLength: cleanKey.length,
        firstChars: cleanKey.substring(0, 15),
        lastChars: cleanKey.substring(cleanKey.length - 10),
        startsCorrectly: cleanKey.startsWith('sk-ant-'),
        hasValidFormat: /^sk-ant-api03-[A-Za-z0-9_-]+AAA$/.test(cleanKey),
        hasWhitespace: anthropicApiKey !== cleanKey
      });
    }
    
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY environment variable is not set');
      throw new Error('ANTHROPIC_API_KEY is not configured in Supabase secrets');
    }

    // Enhanced API key validation
    const trimmedKey = anthropicApiKey.trim().replace(/[\r\n\t]/g, '');
    console.log('Enhanced key validation:', {
      originalEqualsProcessed: trimmedKey === anthropicApiKey,
      processedLength: trimmedKey.length,
      hasControlChars: /[\r\n\t]/.test(anthropicApiKey),
      isValidFormat: /^sk-ant-api03-[A-Za-z0-9_-]+AAA$/.test(trimmedKey)
    });
    
    if (!trimmedKey.startsWith('sk-ant-')) {
      console.error('ANTHROPIC_API_KEY does not have expected format (should start with sk-ant-)');
      throw new Error('ANTHROPIC_API_KEY appears to be invalid - should start with sk-ant-');
    }

    // Parse request body with enhanced error handling
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

    // Fetch and process the image with enhanced validation
    console.log('Fetching image from URL...');
    const { base64Image, mimeType } = await fetchImageAsBase64(imageUrl);
    console.log('Image processing completed:', {
      mimeType,
      base64Size: base64Image.length,
      isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Image.substring(0, 100))
    });

    // Create analysis prompt
    console.log('Creating analysis prompt...');
    const systemPrompt = createAnalysisPrompt(analysisPrompt);
    console.log('System prompt created, length:', systemPrompt.length);

    // Analyze with Claude using enhanced client
    console.log('Calling enhanced Claude API...');
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
    
    // Enhanced error categorization for debugging
    let errorCategory = 'unknown_error';
    if (error.message.includes('Invalid bearer token') || error.message.includes('authentication')) {
      errorCategory = 'auth_error';
    } else if (error.message.includes('Rate limit')) {
      errorCategory = 'rate_limit';
    } else if (error.message.includes('base64') || error.message.includes('Image')) {
      errorCategory = 'image_processing_error';
    } else if (error.message.includes('JSON') || error.message.includes('parse')) {
      errorCategory = 'parsing_error';
    }
    
    console.error('Error category:', errorCategory);
    
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
