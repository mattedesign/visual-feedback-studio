
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
    console.log('=== RAG-Enhanced AI Analysis Edge Function Started ===');
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
      isComparative: validatedRequest.isComparative,
      ragEnabled: validatedRequest.ragEnabled || false,
      ragKnowledgeCount: validatedRequest.ragContext?.retrievedKnowledge.relevantPatterns.length || 0,
      ragCitationsCount: validatedRequest.researchCitations?.length || 0,
      ragIndustryContext: validatedRequest.ragContext?.industryContext || 'none',
      hasEnhancedPrompt: !!validatedRequest.ragContext?.enhancedPrompt
    });
    
    // Process images
    console.log('=== Processing Images ===');
    const processedImages = await processImages(validatedRequest.imagesToProcess);
    console.log('Images processed successfully:', processedImages.length);
    
    // CRITICAL FIX: Determine the final prompt to use
    let finalPrompt: string;
    
    if (validatedRequest.ragEnabled && validatedRequest.ragContext?.enhancedPrompt) {
      // Use the RAG-enhanced prompt directly (contains research citations)
      finalPrompt = validatedRequest.ragContext.enhancedPrompt;
      console.log('✅ Using RAG-enhanced prompt with research citations');
    } else {
      // Fallback to standard prompt creation
      finalPrompt = createEnhancedPrompt(
        validatedRequest.analysisPrompt,
        validatedRequest.isComparative,
        validatedRequest.isMultiImage,
        validatedRequest.imagesToProcess,
        validatedRequest.ragContext
      );
      console.log('📊 Using standard enhanced prompt');
    }
    
    console.log('Final prompt details:', {
      promptLength: finalPrompt.length,
      containsResearchCitations: finalPrompt.includes('Based on') || finalPrompt.includes('research shows') || finalPrompt.includes('Nielsen'),
      containsWCAG: finalPrompt.includes('WCAG'),
      containsHeuristics: finalPrompt.includes('heuristic'),
      ragEnhanced: validatedRequest.ragEnabled && !!validatedRequest.ragContext?.enhancedPrompt
    });

    // For comparative analysis, use the first image as primary
    const primaryImage = processedImages[0];
    
    // Perform AI analysis with the final prompt
    console.log('=== Starting AI Analysis with Final Prompt ===');
    console.log('Using provider:', validatedRequest.aiProvider);
    console.log('Using model:', validatedRequest.model);
    
    const startTime = Date.now();
    const annotations = await performAIAnalysis(
      primaryImage.base64Image,
      primaryImage.mimeType,
      finalPrompt, // This now contains research citations when available
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

    // Format response with RAG metadata
    const responseData = formatAnalysisResponse(annotations);
    
    // Add model information to response
    responseData.providerUsed = validatedRequest.aiProvider || 'auto-selected';
    responseData.modelUsed = validatedRequest.model || 'default';
    responseData.testMode = validatedRequest.testMode || false;
    
    // Add RAG information to response
    if (validatedRequest.ragEnabled && validatedRequest.ragContext) {
      responseData.researchEnhanced = true;
      responseData.knowledgeSourcesUsed = validatedRequest.ragContext.retrievedKnowledge.relevantPatterns.length;
      responseData.researchCitations = validatedRequest.researchCitations || [];
      responseData.industryContext = validatedRequest.ragContext.industryContext;
      responseData.ragBuildTimestamp = validatedRequest.ragContext.buildTimestamp;
      responseData.usedEnhancedPrompt = !!validatedRequest.ragContext.enhancedPrompt;
    } else {
      responseData.researchEnhanced = false;
      responseData.knowledgeSourcesUsed = 0;
      responseData.researchCitations = [];
      responseData.usedEnhancedPrompt = false;
    }
    
    console.log('=== RAG-Enhanced Analysis Completed Successfully ===');
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
      usedEnhancedPrompt: responseData.usedEnhancedPrompt,
      totalProcessingTime: `${analysisTime}ms`
    });
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== RAG-Enhanced Analysis Function Error ===');
    console.error('Error timestamp:', new Date().toISOString());
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return handleError(error as Error);
  }
});
