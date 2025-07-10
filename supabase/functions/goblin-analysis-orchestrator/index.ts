import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🧝‍♂️ Goblin Analysis Orchestrator - Multi-persona UX analysis v2.0');

// Enhanced retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  retryableErrors: ['timeout', 'network', 'api_error', 'rate_limit']
};

// Circuit breaker for external services
const CIRCUIT_BREAKER = {
  failureThreshold: 5,
  resetTimeout: 60000,
  failures: new Map()
};

async function withRetry<T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ ${context} attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) break;
      
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);
      console.log(`🔄 Retrying ${context} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`${context} failed after ${maxRetries} attempts: ${lastError.message}`);
}

function updateCircuitBreaker(service: string, success: boolean) {
  if (success) {
    CIRCUIT_BREAKER.failures.delete(service);
  } else {
    const current = CIRCUIT_BREAKER.failures.get(service) || 0;
    CIRCUIT_BREAKER.failures.set(service, current + 1);
  }
}

function isCircuitOpen(service: string): boolean {
  const failures = CIRCUIT_BREAKER.failures.get(service) || 0;
  return failures >= CIRCUIT_BREAKER.failureThreshold;
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

    // Initialize Supabase with enhanced error handling
    try {
      supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
    } catch (supabaseError) {
      console.error('❌ Failed to initialize Supabase client:', supabaseError);
      throw new Error(`Database connection failed: ${supabaseError.message}`);
    }

    // Get session details with retry
    const session = await withRetry(async () => {
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
    
    const imageUrls = await withRetry(async () => {
      if (isCircuitOpen('get-images-by-session')) {
        throw new Error('Circuit breaker open for image service');
      }
      
      const imagesResponse = await supabase.functions.invoke('get-images-by-session', {
        body: { sessionId }
      });

      updateCircuitBreaker('get-images-by-session', !imagesResponse.error);
      
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
        const visionResult = await withRetry(async () => {
          if (isCircuitOpen('goblin-vision-screen-detector')) {
            throw new Error('Circuit breaker open for vision service');
          }
          
          const result = await supabase.functions.invoke('goblin-vision-screen-detector', {
            body: { 
              imageUrl: imageData.file_path,
              order: imageData.upload_order
            }
          });
          
          updateCircuitBreaker('goblin-vision-screen-detector', !result.error);
          return result;
        }, `Vision processing for image ${i + 1}`, 2);
        
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

    // Step 3: Build persona-specific prompt
    const promptResult = await withRetry(async () => {
      const result = await supabase.functions.invoke('goblin-persona-prompt-builder', {
        body: { 
          persona, 
          goal, 
          imageCount: validImageUrls.length,
          mode, 
          confidence,
          visionResults
        }
      });
      
      if (result.error) throw new Error(`Prompt building failed: ${result.error.message}`);
      return result;
    }, `Prompt building for ${persona}`);

    // Step 4: Analyze with Claude - Enhanced validation and recovery
    console.log('🤖 Calling Claude analyzer with verified parameters...');
    
    const analysisResult = await withRetry(async () => {
      if (isCircuitOpen('goblin-model-claude-analyzer')) {
        throw new Error('Circuit breaker open for Claude service');
      }
      
      const claudeRequestBody = {
        sessionId,
        imageUrls: validImageUrls,
        prompt: promptResult.data.prompt,
        persona,
        chatMode: false
      };
      
      const result = await supabase.functions.invoke('goblin-model-claude-analyzer', {
        body: claudeRequestBody
      });
      
      updateCircuitBreaker('goblin-model-claude-analyzer', !result.error);
      
      if (result.error) throw new Error(`Claude analysis failed: ${result.error.message}`);
      return result;
    }, `Claude analysis for ${persona}`, 2);

    // Step 5: Synthesize results
    const synthesisResult = await withRetry(async () => {
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
            model: 'claude-sonnet-4-20250514',
            persona,
            confidence,
            processedAt: new Date().toISOString(),
            orchestratorVersion: '2.0',
            processingTimeMs: Date.now() - startTime
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
          orchestratorVersion: '2.0',
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
          orchestratorVersion: '2.0',
          retryable: RETRY_CONFIG.retryableErrors.some(e => error.message.toLowerCase().includes(e))
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});