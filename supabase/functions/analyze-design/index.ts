
import { corsHandler } from './corsHandler.ts';
import { requestValidator } from './requestValidator.ts';
import { imageProcessingManager } from './imageProcessingManager.ts';
import { analyzeWithAIProvider, determineOptimalProvider } from './aiProviderRouter.ts';
import { databaseManager } from './databaseManager.ts';
import { responseFormatter } from './responseFormatter.ts';
import { errorHandler } from './errorHandler.ts';

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

    // Determine AI provider configuration
    console.log('🤖 Determining AI provider...');
    const aiProviderConfig = determineOptimalProvider();
    
    // Process each image with AI provider
    const allAnnotations = [];
    
    for (const processedImage of imageProcessingResult.processedImages) {
      console.log(`🔍 Analyzing image with ${aiProviderConfig.provider}...`);
      
      try {
        const annotations = await analyzeWithAIProvider(
          processedImage.base64Data,
          processedImage.mimeType,
          requestData.analysisPrompt,
          aiProviderConfig
        );
        
        allAnnotations.push(...annotations);
        console.log(`✅ Found ${annotations.length} annotations for image`);
      } catch (error) {
        console.error('❌ AI analysis failed for image:', error);
        return errorHandler.createErrorResponse(error.message, 500);
      }
    }

    console.log(`✅ AI analysis completed with ${allAnnotations.length} total annotations`);

    // Save to database
    console.log('💾 Saving to database...');
    const dbResult = await databaseManager.saveAnalysisResults({
      analysisId: requestData.analysisId,
      annotations: allAnnotations,
      aiModelUsed: aiProviderConfig.provider + (aiProviderConfig.model ? `:${aiProviderConfig.model}` : ''),
      processingTime: Date.now() // Simple timestamp for now
    });

    if (!dbResult.success) {
      console.error('❌ Database save failed:', dbResult.error);
      return errorHandler.createErrorResponse(dbResult.error, 500);
    }

    console.log('✅ Results saved to database');

    // Format response
    const response = responseFormatter.formatSuccessResponse({
      annotations: allAnnotations,
      totalAnnotations: allAnnotations.length,
      modelUsed: aiProviderConfig.provider + (aiProviderConfig.model ? `:${aiProviderConfig.model}` : ''),
      processingTime: Date.now(),
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
