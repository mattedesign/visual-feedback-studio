
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
    
    // Validate environment with API key diagnostics
    const envConfig = validateEnvironment();
    console.log('=== API Key Diagnostics ===');
    console.log('Anthropic API key exists:', !!envConfig.anthropicApiKey);
    console.log('API key length:', envConfig.anthropicApiKey?.length || 0);
    console.log('API key format valid:', envConfig.anthropicApiKey?.startsWith('sk-ant-') || false);
    
    // Parse and validate request
    const validatedRequest = await validateAndParseRequest(req);
    
    console.log('Request configuration:', {
      imageCount: validatedRequest.imagesToProcess.length,
      aiProvider: validatedRequest.aiProvider,
      model: validatedRequest.model,
      testMode: validatedRequest.testMode,
      isComparative: validatedRequest.isComparative,
      ragEnabled: validatedRequest.ragEnabled || false,
      ragKnowledgeCount: validatedRequest.ragContext?.retrievedKnowledge.relevantPatterns.length || 0,
      ragCitationsCount: validatedRequest.researchCitations?.length || 0,
      ragIndustryContext: validatedRequest.ragContext?.industryContext || 'none'
    });
    
    // Process images
    console.log('=== Processing Images ===');
    const processedImages = await processImages(validatedRequest.imagesToProcess);
    console.log('Images processed successfully:', processedImages.length);
    
    // Create enhanced prompt with RAG context
    console.log('=== Creating Enhanced Prompt ===');
    const enhancedPrompt = createEnhancedPrompt(
      validatedRequest.analysisPrompt,
      validatedRequest.isComparative,
      validatedRequest.isMultiImage,
      validatedRequest.imagesToProcess,
      validatedRequest.ragContext
    );
    console.log('Prompt length:', enhancedPrompt.length);

    // For comparative analysis, use the first image as primary
    const primaryImage = processedImages[0];
    
    // Perform AI analysis with model selection support
    console.log('=== Starting AI Analysis ===');
    console.log('Using provider:', validatedRequest.aiProvider);
    console.log('Using model:', validatedRequest.model);
    
    const startTime = Date.now();
    const annotations = await performAIAnalysis(
      primaryImage.base64Image,
      primaryImage.mimeType,
      enhancedPrompt,
      validatedRequest.aiProvider,
      validatedRequest.model
    );
    const analysisTime = Date.now() - startTime;
    console.log(`AI analysis completed in ${analysisTime}ms`);
    console.log('Annotations received:', annotations.length);

    // Save annotations to database
    console.log('=== Saving to Database ===');
    const savedAnnotations = await saveAnnotationsToDatabase(
      annotations,
      validatedRequest.analysisId,
      envConfig.supabaseUrl,
      envConfig.supabaseServiceKey
    );
    console.log('Annotations saved successfully:', savedAnnotations.length);

    // Format response
    const responseData = formatAnalysisResponse(annotations);
    
    // Add model information to response for testing purposes
    responseData.providerUsed = validatedRequest.aiProvider || 'auto-selected';
    responseData.modelUsed = validatedRequest.model || 'default';
    responseData.testMode = validatedRequest.testMode || false;
    
    // Add RAG information to response
    if (validatedRequest.ragEnabled && validatedRequest.ragContext) {
      responseData.researchEnhanced = true;
      responseData.knowledgeSourcesUsed = validatedRequest.ragContext.retrievedKnowledge.relevantPatterns.length;
      responseData.researchCitations = validatedRequest.researchCitations || [];
      responseData.industryContext = validatedRequest.ragContext.industryContext;
    } else {
      responseData.researchEnhanced = false;
      responseData.knowledgeSourcesUsed = 0;
      responseData.researchCitations = [];
    }
    
    console.log('=== Analysis Completed Successfully ===');
    console.log('Final response:', {
      success: responseData.success,
      totalAnnotations: responseData.totalAnnotations,
      totalSavedAnnotations: savedAnnotations.length,
      isComparative: validatedRequest.isComparative || validatedRequest.isMultiImage,
      providerUsed: responseData.providerUsed,
      modelUsed: responseData.modelUsed,
      testMode: responseData.testMode,
      researchEnhanced: responseData.researchEnhanced,
      knowledgeSourcesUsed: responseData.knowledgeSourcesUsed,
      ragCitationsCount: responseData.researchCitations?.length || 0,
      totalProcessingTime: `${analysisTime}ms`
    });
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== Analysis Function Error ===');
    console.error('Error timestamp:', new Date().toISOString());
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return handleError(error as Error);
  }
});
