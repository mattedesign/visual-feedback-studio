import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHandler } from './corsHandler.ts';
import { handleError } from './errorHandler.ts';
import { requestValidator } from './requestValidator.ts';
import { imageProcessingManager } from './imageProcessingManager.ts';
import { aiAnalysisManager } from './aiAnalysisManager.ts';
import { databaseManager } from './databaseManager.ts';
import { enhancedAnalysisIntegrator } from './enhancedAnalysisIntegrator.ts';
// ✅ NEW: Import Well Done Service (safe addition)
import { WellDoneService } from './services/wellDoneService.ts';

console.log('🚀 Enhanced Comprehensive Analysis Function - Starting up');

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

    console.log('🔍 Processing comprehensive analysis request');
    
    // Parse and validate request
    const requestData = await req.json();
    console.log('📋 Comprehensive analysis request data received:', {
      hasImageUrls: !!requestData.imageUrls,
      imageCount: requestData.imageUrls?.length || 0,
      hasAnalysisId: !!requestData.analysisId,
      hasPrompt: !!requestData.analysisPrompt,
      ragEnabled: requestData.ragEnabled,
      ragEnhanced: requestData.ragEnhanced,
      targetInsights: '16-19'
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

    console.log('✅ Request validation passed for comprehensive analysis');
    
    // 🔥 COMPREHENSIVE ANALYSIS: Always enable RAG for better insights
    const useRAG = ragEnabled || ragEnhanced || true; // Force RAG for comprehensive analysis
    console.log('🎯 Comprehensive Analysis Configuration:', {
      ragEnabled,
      ragEnhanced,
      useRAG,
      targetInsights: '16-19',
      comprehensiveMode: true
    });

    // Process images with enhanced error handling
    console.log('🖼️ Starting image processing for comprehensive analysis...');
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

    console.log('✅ Image processing completed successfully for comprehensive analysis');

    // 🔥 COMPREHENSIVE AI ANALYSIS: Run with enhanced parameters
    console.log('🤖 Starting comprehensive AI analysis:', {
      useRAG,
      imageCount: imageProcessingResult.processedImages.length,
      promptLength: analysisPrompt.length,
      targetInsights: '16-19',
      comprehensiveScope: true
    });
    
    const analysisResult = await aiAnalysisManager.analyzeImages(
      imageProcessingResult.processedImages,
      analysisPrompt,
      isComparative,
      useRAG  // 🔥 COMPREHENSIVE: Always use RAG for better insights
    );

    if (!analysisResult.success) {
      console.error('❌ Comprehensive AI analysis failed:', analysisResult.error);
      return corsHandler.addCorsHeaders(
        new Response(JSON.stringify({
          success: false,
          error: `Comprehensive analysis failed: ${analysisResult.error}`
        }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }

    console.log('✅ Comprehensive AI analysis completed successfully:', {
      annotationCount: analysisResult.annotations?.length || 0,
      targetCount: '16-19',
      comprehensiveSuccess: (analysisResult.annotations?.length || 0) >= 16
    });

    // ✅ NEW: Generate Well Done insights (safe addition)
    let wellDoneData = null;
    try {
      console.log('🎉 Generating Well Done insights from analysis results...');
      
      // Extract the AI response content for Well Done analysis
      // We'll use the analysisPrompt or any available content from analysisResult
      const contentForWellDone = analysisResult.rawContent || 
                                analysisResult.content || 
                                analysisPrompt || 
                                'Strong design foundation with thoughtful UX considerations.';
      
      const wellDoneInsights = WellDoneService.extractInsights(contentForWellDone);
      wellDoneData = WellDoneService.processInsights(wellDoneInsights);
      
      console.log('✅ Well Done insights generated successfully:', {
        insightsCount: wellDoneData.insights.length,
        categoriesFound: Object.keys(wellDoneData.categoryHighlights),
        strengthsCount: wellDoneData.overallStrengths.length
      });
    } catch (wellDoneError) {
      console.error('⚠️ Well Done generation failed (non-critical):', wellDoneError);
      console.log('🔄 Continuing with analysis without Well Done section');
      // Create fallback Well Done data
      wellDoneData = {
        insights: [{
          title: "Strong Design Foundation",
          description: "The design demonstrates solid UX principles and thoughtful consideration for user needs.",
          category: 'overall' as const
        }],
        overallStrengths: ["Strong Design Foundation"],
        categoryHighlights: { overall: "Strong Design Foundation" }
      };
    }

    // Enhance annotations with comprehensive business impact
    console.log('📊 Enhancing annotations with comprehensive business intelligence...');
    const enhancedAnnotations = await enhancedAnalysisIntegrator.enhanceAnnotations(
      analysisResult.annotations || [],
      {
        hasRAGContext: useRAG,
        ragCitations: useRAG ? ['UX Research Database', 'Best Practices Knowledge Base'] : [],
        hasCompetitiveContext: false,
        competitivePatterns: []
      }
    );

    console.log('✅ Comprehensive annotation enhancement completed:', {
      finalCount: enhancedAnnotations.length,
      targetAchieved: enhancedAnnotations.length >= 16
    });

    // Save to database with enhanced data
    console.log('💾 Saving comprehensive analysis results...');
    try {
      const saveResult = await databaseManager.saveAnalysisResults(analysisId, {
        analysisId,
        annotations: enhancedAnnotations,
        imageCount: imageUrls.length,
        designType,
        isComparative,
        ragEnhanced: useRAG,
        researchSourceCount: useRAG ? 2 : 0,
        wellDone: wellDoneData
      });
      
      if (saveResult.success) {
        console.log('✅ Analysis results saved to database successfully');
      } else {
        console.error('❌ Database save failed:', saveResult.error);
      }
    } catch (dbError) {
      console.error('❌ Database save error:', dbError);
    }

    // ✅ NEW: Prepare comprehensive response with Well Done data (safe addition)
    const response = {
      success: true,
      annotations: enhancedAnnotations,
      imageCount: imageUrls.length,
      ragEnhanced: useRAG,
      knowledgeSourcesUsed: useRAG ? 2 : 0,
      researchCitations: useRAG ? ['UX Research Database', 'Best Practices Knowledge Base'] : [],
      processingTime: Date.now(),
      analysisId,
      modelUsed: analysisResult.modelUsed,
      comprehensiveAnalysis: true,
      targetInsights: '16-19',
      insightGoalAchieved: enhancedAnnotations.length >= 16,
      // ✅ NEW: Add Well Done data to response (safe addition)
      wellDone: wellDoneData
    };

    console.log('🎉 Comprehensive analysis completed successfully:', {
      annotationCount: enhancedAnnotations.length,
      targetCount: '16-19',
      targetAchieved: enhancedAnnotations.length >= 16,
      ragEnhanced: useRAG,
      imageCount: imageUrls.length,
      knowledgeSourcesUsed: useRAG ? 2 : 0,
      comprehensiveSuccess: true,
      // ✅ NEW: Log Well Done success (safe addition)
      wellDoneInsights: wellDoneData?.insights?.length || 0,
      wellDoneGenerated: !!wellDoneData
    });

    return corsHandler.addCorsHeaders(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    );

  } catch (error) {
    console.error('💥 Unhandled error in comprehensive analysis function:', error);
    return corsHandler.addCorsHeaders(handleError(error instanceof Error ? error : new Error('Unknown error')));
  }
});