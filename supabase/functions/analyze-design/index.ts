
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCorsPreflightRequest, corsHeaders } from './corsHandler.ts';
import { validateEnvironment } from './environmentValidator.ts';
import { validateAndParseRequest } from './requestValidator.ts';
import { processImages } from './imageProcessingManager.ts';
import { createEnhancedPrompt } from './promptManager.ts';
import { performAIAnalysis } from './aiAnalysisManager.ts';
import { saveAnnotationsToDatabase } from './databaseManager.ts';
import { formatAnalysisResponse } from './responseFormatter.ts';
import { handleError } from './errorHandler.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    console.log('=== Enhanced AI Analysis Edge Function Started ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Timestamp:', new Date().toISOString());
    
    // Validate environment
    const envConfig = validateEnvironment();
    
    // Parse and validate request
    const validatedRequest = await validateAndParseRequest(req);
    
    console.log('Request configuration:', {
      imageCount: validatedRequest.imagesToProcess.length,
      aiProvider: validatedRequest.aiProvider,
      model: validatedRequest.model,
      testMode: validatedRequest.testMode,
      isComparative: validatedRequest.isComparative
    });
    
    // Process images
    const processedImages = await processImages(validatedRequest.imagesToProcess);
    
    // Create enhanced prompt
    const enhancedPrompt = createEnhancedPrompt(
      validatedRequest.analysisPrompt,
      validatedRequest.isComparative,
      validatedRequest.isMultiImage,
      validatedRequest.imagesToProcess
    );

    // For comparative analysis, use the first image as primary
    const primaryImage = processedImages[0];
    
    // Perform AI analysis with model selection support
    const annotations = await performAIAnalysis(
      primaryImage.base64Image,
      primaryImage.mimeType,
      enhancedPrompt,
      validatedRequest.aiProvider,
      validatedRequest.model
    );

    // Save annotations to database
    const savedAnnotations = await saveAnnotationsToDatabase(
      annotations,
      validatedRequest.analysisId,
      envConfig.supabaseUrl,
      envConfig.supabaseServiceKey
    );

    // Format response
    const responseData = formatAnalysisResponse(annotations);
    
    // Add model information to response for testing purposes
    responseData.providerUsed = validatedRequest.aiProvider || 'auto-selected';
    responseData.modelUsed = validatedRequest.model || 'default';
    responseData.testMode = validatedRequest.testMode || false;
    
    console.log('=== Analysis Completed Successfully ===');
    console.log('Final response:', {
      success: responseData.success,
      totalAnnotations: responseData.totalAnnotations,
      totalSavedAnnotations: savedAnnotations.length,
      isComparative: validatedRequest.isComparative || validatedRequest.isMultiImage,
      providerUsed: responseData.providerUsed,
      modelUsed: responseData.modelUsed,
      testMode: responseData.testMode
    });
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return handleError(error as Error);
  }
});
