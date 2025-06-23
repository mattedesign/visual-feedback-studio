
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

    const { imageUrl, imageUrls, analysisId, analysisPrompt, designType, isComparative }: AnalysisRequest = requestBody;

    // Determine which images to process
    const imagesToProcess = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
    const isMultiImage = imagesToProcess.length > 1;

    console.log('Starting OpenAI analysis for:', { 
      analysisId, 
      imageCount: imagesToProcess.length,
      isComparative: isComparative || isMultiImage,
      designType,
      promptLength: analysisPrompt?.length 
    });

    // Validate required parameters
    if (imagesToProcess.length === 0) {
      throw new Error('At least one image URL is required');
    }
    if (!analysisId) {
      throw new Error('analysisId is required');
    }

    // Fetch and process all images
    console.log('Fetching images from URLs...');
    const imagePromises = imagesToProcess.map(async (url, index) => {
      const { base64Image, mimeType } = await fetchImageAsBase64(url);
      console.log(`Image ${index + 1} processed:`, {
        mimeType,
        base64Size: base64Image.length,
        isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Image.substring(0, 100))
      });
      return { base64Image, mimeType, index };
    });

    const processedImages = await Promise.all(imagePromises);

    // Create analysis prompt
    console.log('Creating analysis prompt...');
    const systemPrompt = createAnalysisPrompt(
      analysisPrompt, 
      isComparative || isMultiImage, 
      imagesToProcess.length
    );
    console.log('System prompt created, length:', systemPrompt.length);

    // For comparative analysis, we'll analyze with the first image as primary
    // and include context about multiple images in the prompt
    const primaryImage = processedImages[0];
    
    // Enhanced prompt for multi-image analysis
    let enhancedPrompt = systemPrompt;
    if (isMultiImage) {
      enhancedPrompt += `\n\nYou are analyzing ${imagesToProcess.length} images. The primary image is provided for visual analysis. `;
      enhancedPrompt += `When providing annotations, use the imageIndex field (0-based) to specify which image each annotation applies to. `;
      enhancedPrompt += `Focus on identifying patterns, inconsistencies, and opportunities for improvement across all designs.`;
    }

    // Analyze with OpenAI
    console.log('Calling OpenAI API...');
    const annotations = await analyzeWithOpenAI(
      primaryImage.base64Image, 
      primaryImage.mimeType, 
      enhancedPrompt, 
      trimmedKey
    );

    console.log('Analysis completed successfully with', annotations.length, 'annotations');

    // Add imageIndex to annotations if not present (for backward compatibility)
    const processedAnnotations = annotations.map(annotation => ({
      ...annotation,
      imageIndex: annotation.imageIndex ?? 0 // Default to first image if not specified
    }));

    // Format and return response
    const responseData = formatAnalysisResponse(processedAnnotations);
    
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
