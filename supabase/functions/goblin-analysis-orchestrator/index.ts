import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🧝‍♂️ Goblin Analysis Orchestrator - Multi-persona UX analysis v2.0');

// Simplified configuration
const SIMPLE_CONFIG = {
  maxRetries: 1, // Only one retry
  retryDelay: 2000 // 2 second delay
};

// Simplified model configuration
const MODEL_CONFIG = {
  primary: {
    name: 'claude-sonnet-4-20250514',
    function: 'goblin-model-claude-analyzer',
    timeout: 45000  // More generous timeout
  },
  fallback: {
    name: 'gpt-4.1-2025-04-14',
    function: 'goblin-model-gpt-analyzer',
    timeout: 40000  // More generous timeout
  }
};

async function withSimpleRetry<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn(`⚠️ ${context} failed, trying once more:`, error.message);
    
    // Simple retry after delay
    await new Promise(resolve => setTimeout(resolve, SIMPLE_CONFIG.retryDelay));
    return await operation(); // Final attempt
  }
}

// Simple logging function
function logMetrics(sessionId: string, stage: string, duration: number, success: boolean, metadata: any = {}) {
  console.log(`📊 ${sessionId.substring(0, 8)} | ${stage} | ${duration}ms | ${success ? 'SUCCESS' : 'FAIL'} |`, metadata);
}

async function attemptModelAnalysis(modelConfig: any, requestBody: any, supabase: any): Promise<any> {
  const startTime = Date.now();
  console.log(`🤖 Attempting analysis with ${modelConfig.name}...`);
  
  try {
    const result = await Promise.race([
      supabase.functions.invoke(modelConfig.function, { body: requestBody }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Model timeout: ${modelConfig.name}`)), modelConfig.timeout)
      )
    ]);
    
    const duration = Date.now() - startTime;
    
    if (result.error) {
      logMetrics(requestBody.sessionId, `model_${modelConfig.name}`, duration, false, {
        error: result.error.message
      });
      throw new Error(`${modelConfig.name} analysis failed: ${result.error.message}`);
    }
    
    logMetrics(requestBody.sessionId, `model_${modelConfig.name}`, duration, true, {
      modelUsed: modelConfig.name,
      responseSize: JSON.stringify(result.data || {}).length
    });
    
    console.log(`✅ Analysis completed with ${modelConfig.name} in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logMetrics(requestBody.sessionId, `model_${modelConfig.name}`, duration, false, {
      error: error.message
    });
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let requestBody;
  let sessionId;
  let supabase;
  const startTime = Date.now();

  try {
    // Enhanced request parsing with validation
    try {
      requestBody = await req.json();
      console.log('📥 Received request body:', {
        sessionId: requestBody?.sessionId?.substring(0, 8),
        timestamp: new Date().toISOString()
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid request body - must be valid JSON',
          details: parseError.message,
          stage: 'request_parsing'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate sessionId
    sessionId = requestBody?.sessionId;
    if (!sessionId) {
      console.error('❌ Missing sessionId in request');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'sessionId is required',
          received: requestBody,
          stage: 'validation'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase with enhanced error handling and connection resilience
    try {
      supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
          db: {
            schema: 'public',
          },
          global: {
            headers: {
              'x-client-info': 'goblin-orchestrator@2.1',
            },
          },
          realtime: {
            channels: {},
            eventsTimeout: 10000,
            heartbeatIntervalMs: 30000,
            heartbeatTimeout: 10000,
          }
        }
      );
      
      // Test connection with a lightweight query
      const { error: connectionTest } = await supabase
        .from('goblin_analysis_sessions')
        .select('id')
        .limit(1);
      
      if (connectionTest) {
        throw new Error(`Database connection test failed: ${connectionTest.message}`);
      }
      
    } catch (supabaseError) {
      console.error('❌ Failed to initialize Supabase client:', supabaseError);
      logMetrics(sessionId || 'unknown', 'database_connection', Date.now() - startTime, false, {
        error: supabaseError.message
      });
      throw new Error(`Database connection failed: ${supabaseError.message}`);
    }

    // Get session details with simple retry
    const session = await withSimpleRetry(async () => {
      const { data, error } = await supabase
        .from('goblin_analysis_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw new Error(`Session query failed: ${error.message}`);
      if (!data) throw new Error('Session not found');
      
      return data;
    }, `Session fetch for ${sessionId.substring(0, 8)}`);

    const { persona_type: persona, analysis_mode: mode, goal_description: goal, confidence_level: confidence } = session;

    // Update session status to processing
    await supabase
      .from('goblin_analysis_sessions')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    // Step 1: Fetch images with enhanced error recovery
    console.log('📸 Fetching images via get-images-by-session function...');
    
    const imageUrls = await withSimpleRetry(async () => {
      const imagesResponse = await supabase.functions.invoke('get-images-by-session', {
        body: { sessionId }
      });
      
      if (imagesResponse.error) {
        throw new Error(`Failed to fetch images: ${imagesResponse.error.message}`);
      }

      const images = imagesResponse.data?.validImages || [];
      if (images.length === 0) {
        throw new Error('No images found for analysis session');
      }
      
      return images;
    }, `Image fetch for session ${sessionId.substring(0, 8)}`);

    // Extract and validate image URLs
    const validImageUrls = imageUrls
      .filter(img => img && img.file_path && typeof img.file_path === 'string' && img.file_path.trim().length > 0)
      .map(img => img.file_path);

    console.log(`✅ Found ${validImageUrls.length} valid images for analysis`);

    if (validImageUrls.length === 0) {
      throw new Error('No valid image URLs found after processing');
    }

    // Step 2: Process images with Google Vision (with fallback)
    console.log('👁️ Processing images with Google Vision...');
    const visionResults = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      const imageData = imageUrls[i];
      console.log(`🔍 Processing image ${i + 1}/${imageUrls.length}: ${imageData.file_name}`);
      
      try {
        const visionResult = await withSimpleRetry(async () => {
          const result = await supabase.functions.invoke('goblin-vision-screen-detector', {
            body: { 
              imageUrl: imageData.file_path,
              order: imageData.upload_order
            }
          });
          
          return result;
        }, `Vision processing for image ${i + 1}`);
        
        if (visionResult.error) {
          console.warn(`⚠️ Vision failed for image ${i + 1}:`, visionResult.error);
          visionResults.push({
            order: imageData.upload_order,
            screenType: 'interface',
            confidence: 0,
            error: visionResult.error.message,
            fallback: true
          });
        } else {
          visionResults.push(visionResult.data);
          console.log(`✅ Vision completed for image ${i + 1}: ${visionResult.data?.screenType}`);
        }
        
        // Update image with vision metadata
        await supabase
          .from('goblin_analysis_images')
          .update({ 
            screen_type: visionResult.data?.screenType || 'interface',
            vision_metadata: visionResult.data
          })
          .eq('id', imageData.id);
          
      } catch (error) {
        console.warn(`⚠️ Vision processing failed for image ${i + 1}:`, error.message);
        visionResults.push({
          order: imageData.upload_order || i + 1,
          screenType: 'interface',
          confidence: 0,
          error: error.message,
          fallback: true
        });
      }
    }

    // Step 3: Build unified persona-specific prompt
    const promptResult = await withSimpleRetry(async () => {
      const result = await supabase.functions.invoke('goblin-unified-prompt-system', {
        body: { 
          persona, 
          goal, 
          imageCount: validImageUrls.length,
          mode, 
          confidence,
          visionResults,
          chatMode: false
        }
      });
      
      if (result.error) throw new Error(`Unified prompt building failed: ${result.error.message}`);
      return result;
    }, `Unified prompt building for ${persona}`);

    // Step 4: AI Analysis with Enhanced Fallback System
    console.log('🤖 Starting AI analysis with intelligent fallback...');
    
    let analysisResult;
    let modelUsed = 'unknown';
    let fallbackUsed = false;
    
    const analysisRequestBody = {
      sessionId,
      imageUrls: validImageUrls,
      prompt: promptResult.data.prompt,
      persona,
      chatMode: false
    };
    
    try {
      // Try primary model (Claude) first
      analysisResult = await withSimpleRetry(async () => {
        return await attemptModelAnalysis(MODEL_CONFIG.primary, analysisRequestBody, supabase);
      }, `Primary model analysis (${MODEL_CONFIG.primary.name})`);
      
      modelUsed = MODEL_CONFIG.primary.name;
      console.log(`✅ Primary model ${modelUsed} succeeded`);
      
    } catch (primaryError) {
      console.warn(`⚠️ Primary model failed: ${primaryError.message}`);
      
      // Fallback to GPT
      try {
        console.log(`🔄 Falling back to ${MODEL_CONFIG.fallback.name}...`);
        
        analysisResult = await withSimpleRetry(async () => {
          return await attemptModelAnalysis(MODEL_CONFIG.fallback, analysisRequestBody, supabase);
        }, `Fallback model analysis (${MODEL_CONFIG.fallback.name})`);
        
        modelUsed = MODEL_CONFIG.fallback.name;
        fallbackUsed = true;
        console.log(`✅ Fallback model ${modelUsed} succeeded`);
        
      } catch (fallbackError) {
        console.error(`❌ Both primary and fallback models failed:`, {
          primary: primaryError.message,
          fallback: fallbackError.message
        });
        
        // Create minimal fallback response
        analysisResult = {
          data: {
            success: true,
            analysisData: {
              analysis: "Analysis temporarily unavailable due to service issues. Please try again in a few minutes.",
              recommendations: [
                "Try refreshing the page and uploading your images again",
                "Ensure your images are clear and properly formatted",
                "Contact support if the issue persists"
              ],
              biggestGripe: "Technical difficulties prevent proper analysis right now",
              whatMakesGoblinHappy: "When all systems work smoothly",
              goblinWisdom: "Even goblins need a break sometimes",
              goblinPrediction: "Service will be restored shortly"
            },
            modelUsed: 'fallback-static',
            timestamp: new Date().toISOString()
          }
        };
        
        modelUsed = 'fallback-static';
        fallbackUsed = true;
        console.log('⚠️ Using static fallback response');
      }
    }

    // Step 5: Synthesize results
    const synthesisResult = await withSimpleRetry(async () => {
      const result = await supabase.functions.invoke('goblin-model-synthesis', {
        body: {
          sessionId,
          persona,
          analysisData: analysisResult.data,
          goal,
          imageCount: validImageUrls.length
        }
      });
      
      if (result.error) throw new Error(`Result synthesis failed: ${result.error.message}`);
      return result;
    }, `Result synthesis for ${persona}`);

    // Step 6: Save final results with transaction-like behavior
    try {
      await supabase
        .from('goblin_analysis_results')
        .insert({
          session_id: sessionId,
          persona_feedback: synthesisResult.data.personaFeedback,
          synthesis_summary: synthesisResult.data.summary,
          priority_matrix: synthesisResult.data.priorityMatrix,
          annotations: synthesisResult.data.annotations,
          model_metadata: {
            model: modelUsed,
            persona,
            confidence,
            processedAt: new Date().toISOString(),
            orchestratorVersion: '2.1',
            processingTimeMs: Date.now() - startTime,
            fallbackUsed
          },
          processing_time_ms: Date.now() - startTime,
          goblin_gripe_level: persona === 'clarity' ? synthesisResult.data.gripeLevel : null
        });

      // Update session to completed
      await supabase
        .from('goblin_analysis_sessions')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

    } catch (saveError) {
      console.error('❌ Failed to save results:', saveError);
      throw new Error(`Failed to save analysis results: ${saveError.message}`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Goblin analysis orchestration completed in ${totalTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        persona,
        results: synthesisResult.data,
        metadata: {
          processingTimeMs: totalTime,
          orchestratorVersion: '2.1',
          modelUsed,
          fallbackUsed,
          visionSuccessRate: visionResults.filter(r => !r.fallback).length / visionResults.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Goblin orchestration failed:', {
      error: error.message,
      stack: error.stack,
      sessionId: sessionId?.substring(0, 8),
      processingTime: totalTime
    });

    // Enhanced error recovery - try to update session status
    if (sessionId && supabase) {
      try {
        console.log(`🔄 Updating session ${sessionId.substring(0, 8)} status to failed`);
        await supabase
          .from('goblin_analysis_sessions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);
        
        console.log(`✅ Session ${sessionId.substring(0, 8)} marked as failed`);
      } catch (updateError) {
        console.error('Failed to update session status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        sessionId: sessionId || null,
        timestamp: new Date().toISOString(),
        stage: 'orchestration',
        metadata: {
          processingTimeMs: totalTime,
          orchestratorVersion: '2.1',
          retryable: ['timeout', 'network', 'api_error'].some(e => error.message.toLowerCase().includes(e))
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});