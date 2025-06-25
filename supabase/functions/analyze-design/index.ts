
import { corsHandler } from './corsHandler.ts';
import { requestValidator } from './requestValidator.ts';
import { imageProcessingManager } from './imageProcessingManager.ts';
import { aiProviderRouter } from './aiProviderRouter.ts';
import { databaseManager } from './databaseManager.ts';
import { responseFormatter } from './responseFormatter.ts';
import { errorHandler } from './errorHandler.ts';
import { getRAGContext } from './aiAnalysisManager.ts'; // Fixed import - only import what exists

console.log('🚀 Design Analysis Function Starting');

Deno.serve(async (req) => {
  console.log(`📥 ${req.method} ${req.url}`);
  
  try {
    // Handle CORS preflight
    const corsResponse = corsHandler.handle(req);
    if (corsResponse) {
      console.log('✅ CORS preflight handled');
      return corsResponse;
    }

    // Validate request
    const validationResult = await requestValidator.validate(req);
    if (!validationResult.isValid) {
      console.error('❌ Request validation failed:', validationResult.error);
      return errorHandler.createErrorResponse(validationResult.error, 400);
    }

    const requestData = validationResult.data;
    console.log('✅ Request validated successfully');

    // Process images
    console.log('🖼️ Processing images...');
    const imageProcessingResult = await imageProcessingManager.processImages(
      requestData.imageUrls || [requestData.imageUrl],
      requestData.isComparative || false
    );

    if (!imageProcessingResult.success) {
      console.error('❌ Image processing failed:', imageProcessingResult.error);
      return errorHandler.createErrorResponse(imageProcessingResult.error, 400);
    }

    console.log(`✅ Images processed: ${imageProcessingResult.processedImages.length}`);

    // RAG Context - DISABLED to prevent loops
    console.log('⚠️ RAG Context temporarily disabled');
    const ragContext = null; // Always null to prevent any loops

    // Route to AI provider
    console.log('🤖 Routing to AI provider...');
    const aiResult = await aiProviderRouter.processAnalysis({
      images: imageProcessingResult.processedImages,
      prompt: requestData.analysisPrompt,
      designType: requestData.designType,
      isComparative: requestData.isComparative,
      aiProvider: requestData.aiProvider,
      ragContext: ragContext // Will be null
    });

    if (!aiResult.success) {
      console.error('❌ AI analysis failed:', aiResult.error);
      return errorHandler.createErrorResponse(aiResult.error, 500);
    }

    console.log('✅ AI analysis completed');

    // Save to database
    console.log('💾 Saving to database...');
    const dbResult = await databaseManager.saveAnalysisResults({
      analysisId: requestData.analysisId,
      annotations: aiResult.annotations,
      aiModelUsed: aiResult.modelUsed,
      processingTime: aiResult.processingTime
    });

    if (!dbResult.success) {
      console.error('❌ Database save failed:', dbResult.error);
      return errorHandler.createErrorResponse(dbResult.error, 500);
    }

    console.log('✅ Results saved to database');

    // Format response
    const response = responseFormatter.formatSuccessResponse({
      annotations: aiResult.annotations,
      totalAnnotations: aiResult.annotations.length,
      modelUsed: aiResult.modelUsed,
      processingTime: aiResult.processingTime,
      ragEnhanced: false // Always false since RAG is disabled
    });

    console.log('✅ Analysis completed successfully');
    return response;

  } catch (error) {
    console.error('❌ Unexpected error in analysis function:', error);
    return errorHandler.createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    );
  }
});
