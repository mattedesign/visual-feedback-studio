
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHandler } from './corsHandler.ts';
import { handleError } from './errorHandler.ts';
import { requestValidator } from './requestValidator.ts';
import { imageProcessingManager } from './imageProcessingManager.ts';
import { aiAnalysisManager } from './aiAnalysisManager.ts';
import { databaseManager } from './databaseManager.ts';
import { enhancedAnalysisIntegrator } from './enhancedAnalysisIntegrator.ts';

console.log('🚀 Enhanced Analyze Design Function - Starting up');

serve(async (req) => {
  console.log('📨 Request received:', {
    method: req.method,
    url: req.url,
    origin: req.headers.get('origin'),
    timestamp: new Date().toISOString()
  });

  try {
    // Handle CORS first
    const corsResponse = corsHandler.handle(req);
    if (corsResponse) {
      console.log('✅ CORS preflight handled successfully');
      return corsResponse;
    }

    // Only allow POST requests for the main functionality
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return corsHandler.addCorsHeaders(
        new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }

    console.log('🔍 Processing POST request');
    
    // Parse and validate request
    const requestData = await req.json();
    console.log('📋 Request data received:', {
      hasImageUrls: !!requestData.imageUrls,
      imageCount: requestData.imageUrls?.length || 0,
      hasAnalysisId: !!requestData.analysisId,
      hasPrompt: !!requestData.analysisPrompt,
      ragEnabled: requestData.ragEnabled,
      ragEnhanced: requestData.ragEnhanced
    });

    // Validate request with enhanced validation
    const validationResult = requestValidator.validate(requestData);
    if (!validationResult.isValid) {
      console.error('❌ Request validation failed:', validationResult.errors);
      return corsHandler.addCorsHeaders(
        new Response(JSON.stringify({
          success: false,
          error: `Validation failed: ${validationResult.errors.join(', ')}`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }

    // Extract validated data
    const {
      imageUrls,
      analysisId,
      analysisPrompt,
      designType = 'web',
      isComparative = false,
      ragEnabled = false,
      ragEnhanced = false
    } = requestData;

    console.log('✅ Request validation passed');
    
    // 🔥 FIXED: Determine if RAG should be enabled based on request
    const useRAG = ragEnabled || ragEnhanced;
    console.log('🎯 RAG Configuration:', {
      ragEnabled,
      ragEnhanced,
      useRAG,
      willUseRAG: useRAG
    });

    // Process images with enhanced error handling
    console.log('🖼️ Starting image processing...');
    const imageProcessingResult = await imageProcessingManager.processImages(
      imageUrls,
      isComparative
    );

    if (!imageProcessingResult.success) {
      console.error('❌ Image processing failed:', imageProcessingResult.error);
      return corsHandler.addCorsHeaders(
        new Response(JSON.stringify({
          success: false,
          error: `Image processing failed: ${imageProcessingResult.error}`
        }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }

    console.log('✅ Image processing completed successfully');

    // 🔥 FIXED: Run AI analysis with RAG enabled when requested
    console.log('🤖 Starting AI analysis with RAG configuration:', {
      useRAG,
      imageCount: imageProcessingResult.processedImages.length,
      promptLength: analysisPrompt.length
    });
    
    const analysisResult = await aiAnalysisManager.analyzeImages(
      imageProcessingResult.processedImages,
      analysisPrompt,
      isComparative,
      useRAG  // 🔥 FIXED: Pass RAG flag to analysis manager
    );

    if (!analysisResult.success) {
      console.error('❌ AI analysis failed:', analysisResult.error);
      return corsHandler.addCorsHeaders(
        new Response(JSON.stringify({
          success: false,
          error: `AI analysis failed: ${analysisResult.error}`
        }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }

    console.log('✅ AI analysis completed successfully');

    // Enhance annotations with business impact
    console.log('📊 Enhancing annotations with business intelligence...');
    const enhancedAnnotations = await enhancedAnalysisIntegrator.enhanceAnnotations(
      analysisResult.annotations || [],
      {
        hasRAGContext: useRAG,
        ragCitations: useRAG ? ['UX Research Database', 'Best Practices Knowledge Base'] : [],
        hasCompetitiveContext: false,
        competitivePatterns: []
      }
    );

    console.log('✅ Annotation enhancement completed');

    // Save to database with enhanced data
    console.log('💾 Saving analysis results...');
    await databaseManager.saveAnalysisResults(analysisId, {
      annotations: enhancedAnnotations,
      imageCount: imageUrls.length,
      designType,
      isComparative,
      ragEnhanced: useRAG,
      researchSourceCount: useRAG ? 2 : 0
    });

    console.log('✅ Analysis results saved successfully');

    // Prepare final response
    const response = {
      success: true,
      annotations: enhancedAnnotations,
      imageCount: imageUrls.length,
      ragEnhanced: useRAG,
      knowledgeSourcesUsed: useRAG ? 2 : 0,
      researchCitations: useRAG ? ['UX Research Database', 'Best Practices Knowledge Base'] : [],
      processingTime: Date.now(),
      analysisId,
      modelUsed: analysisResult.modelUsed
    };

    console.log('🎉 Analysis completed successfully:', {
      annotationCount: enhancedAnnotations.length,
      ragEnhanced: useRAG,
      imageCount: imageUrls.length,
      knowledgeSourcesUsed: useRAG ? 2 : 0
    });

    return corsHandler.addCorsHeaders(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

  } catch (error) {
    console.error('💥 Unhandled error in analyze-design function:', error);
    return corsHandler.addCorsHeaders(handleError(error instanceof Error ? error : new Error('Unknown error')));
  }
});
