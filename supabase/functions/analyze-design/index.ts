
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AnalysisRequest } from './types.ts';
import { fetchImageAsBase64 } from './imageProcessor.ts';
import { createAnalysisPrompt } from './promptBuilder.ts';
import { analyzeWithOpenAI } from './openaiClient.ts';
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
    console.log('=== AI Analysis Function Started (OpenAI Mode) ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    // Check for OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('Environment check - OPENAI_API_KEY exists:', !!openaiApiKey);
    
    if (openaiApiKey) {
      const cleanKey = openaiApiKey.trim();
      console.log('Environment check:', {
        apiKeyType: typeof openaiApiKey,
        originalLength: openaiApiKey.length,
        cleanedLength: cleanKey.length,
        firstChars: cleanKey.substring(0, 15),
        lastChars: cleanKey.substring(cleanKey.length - 10),
        startsCorrectly: cleanKey.startsWith('sk-'),
        hasWhitespace: openaiApiKey !== cleanKey
      });
    }
    
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY environment variable is not set');
      throw new Error('OPENAI_API_KEY is not configured in Supabase secrets');
    }

    // Enhanced API key validation
    const trimmedKey = openaiApiKey.trim().replace(/[\r\n\t]/g, '');
    console.log('Enhanced key validation:', {
      originalEqualsProcessed: trimmedKey === openaiApiKey,
      processedLength: trimmedKey.length,
      hasControlChars: /[\r\n\t]/.test(openaiApiKey),
      isValidFormat: trimmedKey.startsWith('sk-')
    });
    
    if (!trimmedKey.startsWith('sk-')) {
      console.error('OPENAI_API_KEY does not have expected format (should start with sk-)');
      throw new Error('OPENAI_API_KEY appears to be invalid - should start with sk-');
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { imageUrl, analysisId, analysisPrompt, designType }: AnalysisRequest = requestBody;

    console.log('Starting OpenAI analysis for:', { 
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
    console.log('Image processing completed:', {
      mimeType,
      base64Size: base64Image.length,
      isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Image.substring(0, 100))
    });

    // Create analysis prompt
    console.log('Creating analysis prompt...');
    const systemPrompt = createAnalysisPrompt(analysisPrompt);
    console.log('System prompt created, length:', systemPrompt.length);

    // Analyze with OpenAI
    console.log('Calling OpenAI API...');
    const annotations = await analyzeWithOpenAI(base64Image, mimeType, systemPrompt, trimmedKey);

    console.log('Analysis completed successfully with', annotations.length, 'annotations');

    // Format and return response
    const responseData = formatAnalysisResponse(annotations);
    
    console.log('=== AI Analysis Function Completed Successfully (OpenAI) ===');
    
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
    if (error.message.includes('Incorrect API key') || error.message.includes('authentication')) {
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
