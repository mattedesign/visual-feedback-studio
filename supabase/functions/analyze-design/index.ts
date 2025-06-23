
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
    console.log('=== AI Analysis Edge Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Timestamp:', new Date().toISOString());
    
    // Enhanced environment validation
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('Environment validation:', {
      openaiKeyExists: !!openaiApiKey,
      openaiKeyLength: openaiApiKey?.length || 0,
      openaiKeyPrefix: openaiApiKey?.substring(0, 7) || 'none'
    });
    
    if (!openaiApiKey) {
      console.error('CRITICAL: OPENAI_API_KEY environment variable is not set');
      throw new Error('OPENAI_API_KEY is not configured in Supabase secrets');
    }

    // Enhanced API key validation
    const trimmedKey = openaiApiKey.trim().replace(/[\r\n\t]/g, '');
    console.log('API key validation:', {
      originalEqualsProcessed: trimmedKey === openaiApiKey,
      processedLength: trimmedKey.length,
      hasControlChars: /[\r\n\t]/.test(openaiApiKey),
      isValidFormat: trimmedKey.startsWith('sk-')
    });
    
    if (!trimmedKey.startsWith('sk-')) {
      console.error('CRITICAL: OPENAI_API_KEY does not have expected format');
      throw new Error('OPENAI_API_KEY appears to be invalid - should start with sk-');
    }

    // Parse and validate request body
    let requestBody: AnalysisRequest;
    try {
      requestBody = await req.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Request parsing failed:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { imageUrl, imageUrls, analysisId, analysisPrompt, designType, isComparative } = requestBody;

    // Determine which images to process
    const imagesToProcess = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
    const isMultiImage = imagesToProcess.length > 1;

    console.log('=== Analysis Configuration ===');
    console.log({
      analysisId,
      imageCount: imagesToProcess.length,
      isComparative: isComparative || isMultiImage,
      isMultiImage,
      designType,
      promptLength: analysisPrompt?.length || 0,
      requestHasImageUrls: !!imageUrls,
      requestHasImageUrl: !!imageUrl
    });

    // Validate required parameters
    if (imagesToProcess.length === 0) {
      console.error('Validation failed: No images provided');
      throw new Error('At least one image URL is required');
    }
    if (!analysisId) {
      console.error('Validation failed: No analysis ID provided');
      throw new Error('analysisId is required');
    }

    // Enhanced image processing with detailed logging
    console.log('=== Image Processing Phase ===');
    const imagePromises = imagesToProcess.map(async (url, index) => {
      console.log(`Processing image ${index + 1}/${imagesToProcess.length}: ${url.substring(0, 50)}...`);
      
      try {
        const { base64Image, mimeType } = await fetchImageAsBase64(url);
        
        console.log(`Image ${index + 1} processed successfully:`, {
          mimeType,
          base64Size: base64Image.length,
          isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(base64Image.substring(0, 100))
        });
        
        return { base64Image, mimeType, index, url };
      } catch (imageError) {
        console.error(`Image ${index + 1} processing failed:`, imageError);
        throw new Error(`Failed to process image ${index + 1}: ${imageError.message}`);
      }
    });

    const processedImages = await Promise.all(imagePromises);
    console.log('All images processed successfully');

    // Enhanced prompt creation
    console.log('=== Prompt Creation Phase ===');
    const systemPrompt = createAnalysisPrompt(
      analysisPrompt, 
      isComparative || isMultiImage, 
      imagesToProcess.length
    );
    
    console.log('System prompt created:', {
      promptLength: systemPrompt.length,
      includesComparative: systemPrompt.includes('COMPARATIVE'),
      includesImageCount: systemPrompt.includes(imagesToProcess.length.toString())
    });

    // For comparative analysis, use the first image as primary but enhance context
    const primaryImage = processedImages[0];
    
    let enhancedPrompt = systemPrompt;
    if (isMultiImage || isComparative) {
      enhancedPrompt += `\n\n=== MULTI-IMAGE CONTEXT ===\n`;
      enhancedPrompt += `You are analyzing ${imagesToProcess.length} images for comparative analysis.\n`;
      enhancedPrompt += `Image URLs being analyzed:\n`;
      imagesToProcess.forEach((url, index) => {
        enhancedPrompt += `Image ${index}: ${url.substring(url.lastIndexOf('/') + 1)}\n`;
      });
      enhancedPrompt += `\nWhen providing annotations, use the imageIndex field (0-${imagesToProcess.length - 1}) to specify which image each annotation applies to.\n`;
      enhancedPrompt += `Focus on comparative insights, consistency issues, and cross-design recommendations.\n`;
      enhancedPrompt += `=== END MULTI-IMAGE CONTEXT ===\n`;
    }

    console.log('Enhanced prompt prepared:', {
      finalLength: enhancedPrompt.length,
      isComparativeAnalysis: isComparative || isMultiImage
    });

    // Call OpenAI with enhanced error handling
    console.log('=== OpenAI Analysis Phase ===');
    let annotations;
    try {
      annotations = await analyzeWithOpenAI(
        primaryImage.base64Image, 
        primaryImage.mimeType, 
        enhancedPrompt, 
        trimmedKey
      );
      
      console.log('OpenAI analysis completed:', {
        annotationCount: annotations.length,
        hasAnnotations: annotations.length > 0
      });
    } catch (openaiError) {
      console.error('OpenAI analysis failed:', openaiError);
      throw new Error(`OpenAI analysis failed: ${openaiError.message}`);
    }

    // Process annotations with imageIndex handling
    const processedAnnotations = annotations.map(annotation => ({
      ...annotation,
      imageIndex: annotation.imageIndex ?? 0 // Default to first image if not specified
    }));

    console.log('Annotations processed:', {
      originalCount: annotations.length,
      processedCount: processedAnnotations.length,
      imageIndexDistribution: processedAnnotations.reduce((acc, ann) => {
        acc[ann.imageIndex] = (acc[ann.imageIndex] || 0) + 1;
        return acc;
      }, {} as Record<number, number>)
    });

    // Format response
    const responseData = formatAnalysisResponse(processedAnnotations);
    
    console.log('=== Analysis Completed Successfully ===');
    console.log('Final response:', {
      success: responseData.success,
      totalAnnotations: responseData.totalAnnotations,
      isComparative: isComparative || isMultiImage
    });
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== EDGE FUNCTION ERROR ===');
    console.error('Error timestamp:', new Date().toISOString());
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Enhanced error categorization
    let errorCategory = 'unknown_error';
    let errorSeverity = 'medium';
    
    if (error.message.includes('Incorrect API key') || error.message.includes('authentication')) {
      errorCategory = 'auth_error';
      errorSeverity = 'high';
    } else if (error.message.includes('Rate limit')) {
      errorCategory = 'rate_limit';
      errorSeverity = 'medium';
    } else if (error.message.includes('base64') || error.message.includes('Image')) {
      errorCategory = 'image_processing_error';
      errorSeverity = 'medium';
    } else if (error.message.includes('JSON') || error.message.includes('parse')) {
      errorCategory = 'parsing_error';
      errorSeverity = 'low';
    } else if (error.message.includes('OPENAI_API_KEY')) {
      errorCategory = 'config_error';
      errorSeverity = 'high';
    }
    
    console.error('Error categorization:', {
      category: errorCategory,
      severity: errorSeverity,
      isRetryable: errorSeverity !== 'high'
    });
    
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
