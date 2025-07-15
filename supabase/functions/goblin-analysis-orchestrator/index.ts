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

// Enhanced circuit breaker for external services with memory management
const CIRCUIT_BREAKER = {
  failureThreshold: 3,
  resetTimeout: 60000,
  failures: new Map(),
  lastFailureTime: new Map(),
  maxEntries: 100, // Prevent memory leaks
  cleanupInterval: 300000 // 5 minutes
};

// Model configuration and fallback hierarchy
const MODEL_CONFIG = {
  primary: {
    name: 'claude-sonnet-4-20250514',
    function: 'goblin-model-claude-analyzer',
    timeout: 30000
  },
  fallback: {
    name: 'gpt-4.1-2025-04-14',
    function: 'goblin-model-gpt-analyzer',
    timeout: 25000
  }
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
  cleanupOldEntries(); // Prevent memory leaks
  
  if (success) {
    CIRCUIT_BREAKER.failures.delete(service);
    CIRCUIT_BREAKER.lastFailureTime.delete(service);
    console.log(`✅ Circuit breaker reset for ${service}`);
  } else {
    const current = CIRCUIT_BREAKER.failures.get(service) || 0;
    CIRCUIT_BREAKER.failures.set(service, current + 1);
    CIRCUIT_BREAKER.lastFailureTime.set(service, Date.now());
    console.warn(`⚠️ Circuit breaker failure count for ${service}: ${current + 1}/${CIRCUIT_BREAKER.failureThreshold}`);
  }
}

function cleanupOldEntries() {
  const now = Date.now();
  const cutoff = now - (CIRCUIT_BREAKER.resetTimeout * 2); // Clean entries older than 2x reset timeout
  
  // Cleanup old failure times
  for (const [service, lastFailure] of CIRCUIT_BREAKER.lastFailureTime.entries()) {
    if (lastFailure < cutoff) {
      CIRCUIT_BREAKER.failures.delete(service);
      CIRCUIT_BREAKER.lastFailureTime.delete(service);
    }
  }
  
  // Enforce max entries limit
  if (CIRCUIT_BREAKER.failures.size > CIRCUIT_BREAKER.maxEntries) {
    const entries = Array.from(CIRCUIT_BREAKER.lastFailureTime.entries())
      .sort(([,a], [,b]) => a - b); // Sort by oldest first
    
    const toDelete = entries.slice(0, entries.length - CIRCUIT_BREAKER.maxEntries);
    for (const [service] of toDelete) {
      CIRCUIT_BREAKER.failures.delete(service);
      CIRCUIT_BREAKER.lastFailureTime.delete(service);
    }
  }
}

// Enhanced metrics collection
function collectMetrics(sessionId: string, stage: string, duration: number, success: boolean, metadata: any = {}) {
  const metrics = {
    sessionId: sessionId.substring(0, 8),
    stage,
    duration,
    success,
    timestamp: Date.now(),
    ...metadata
  };
  
  // Log for monitoring systems
  console.log(`📊 METRICS: ${JSON.stringify(metrics)}`);
  return metrics;
}

function isCircuitOpen(service: string): boolean {
  const failures = CIRCUIT_BREAKER.failures.get(service) || 0;
  if (failures >= CIRCUIT_BREAKER.failureThreshold) {
    const lastFailureTime = CIRCUIT_BREAKER.lastFailureTime.get(service) || 0;
    const timeSinceLastFailure = Date.now() - lastFailureTime;
    
    // Reset circuit breaker after timeout
    if (timeSinceLastFailure > CIRCUIT_BREAKER.resetTimeout) {
      console.log(`🔄 Circuit breaker timeout reached for ${service}, attempting reset`);
      CIRCUIT_BREAKER.failures.delete(service);
      CIRCUIT_BREAKER.lastFailureTime.delete(service);
      return false;
    }
    
    console.warn(`🚫 Circuit breaker OPEN for ${service} (failures: ${failures})`);
    return true;
  }
  return false;
}

async function attemptModelAnalysis(modelConfig: any, requestBody: any, supabase: any): Promise<any> {
  const startTime = Date.now();
  console.log(`🤖 Attempting analysis with ${modelConfig.name}...`);
  
  if (isCircuitOpen(modelConfig.function)) {
    const error = new Error(`Circuit breaker open for ${modelConfig.function}`);
    collectMetrics(requestBody.sessionId, `model_${modelConfig.name}`, Date.now() - startTime, false, {
      error: error.message,
      reason: 'circuit_breaker_open'
    });
    throw error;
  }
  
  try {
    const result = await Promise.race([
      supabase.functions.invoke(modelConfig.function, { body: requestBody }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Model timeout: ${modelConfig.name}`)), modelConfig.timeout)
      )
    ]);
    
    const duration = Date.now() - startTime;
    updateCircuitBreaker(modelConfig.function, !result.error);
    
    if (result.error) {
      collectMetrics(requestBody.sessionId, `model_${modelConfig.name}`, duration, false, {
        error: result.error.message
      });
      throw new Error(`${modelConfig.name} analysis failed: ${result.error.message}`);
    }
    
    collectMetrics(requestBody.sessionId, `model_${modelConfig.name}`, duration, true, {
      modelUsed: modelConfig.name,
      responseSize: JSON.stringify(result.data).length
    });
    
    console.log(`✅ Analysis completed with ${modelConfig.name} in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    updateCircuitBreaker(modelConfig.function, false);
    collectMetrics(requestBody.sessionId, `model_${modelConfig.name}`, duration, false, {
      error: error.message
    });
    throw error;
  }
}

serve(async (req) => {
  console.log('🔴 DEBUG_ORCHESTRATOR: Function entry point reached');
  console.log('🔴 DEBUG_ORCHESTRATOR: Request method:', req.method);
  console.log('🔴 DEBUG_ORCHESTRATOR: Environment check:', {
    hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
    hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    hasAnthropicKey: !!Deno.env.get('ANTHROPIC_API_KEY'),
    timestamp: new Date().toISOString()
  });

  if (req.method === 'OPTIONS') {
    console.log('🔴 DEBUG_ORCHESTRATOR: Returning CORS response');
    return new Response(null, { headers: corsHeaders });
  }

  let requestBody;
  let sessionId;
  let supabase;
  const startTime = Date.now();
  console.log('🔴 DEBUG_ORCHESTRATOR: Starting analysis orchestration');

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
      collectMetrics(sessionId || 'unknown', 'database_connection', Date.now() - startTime, false, {
        error: supabaseError.message
      });
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

    // Step 3: Build unified persona-specific prompt
    const promptResult = await withRetry(async () => {
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

    // Step 4: Technical Forensic Integration (Enhanced Audit)
    console.log('🔬 Starting technical forensic integration...');
    let forensicData = null;
    
    try {
      const forensicResult = await withRetry(async () => {
        if (isCircuitOpen('goblin-forensic-integration')) {
          throw new Error('Circuit breaker open for forensic integration');
        }
        
        const result = await supabase.functions.invoke('goblin-forensic-integration', {
          body: { 
            sessionId,
            visionResults
          }
        });
        
        updateCircuitBreaker('goblin-forensic-integration', !result.error);
        return result;
      }, `Forensic integration for session ${sessionId.substring(0, 8)}`, 1);
      
      if (forensicResult.error) {
        console.warn(`⚠️ Forensic integration failed: ${forensicResult.error.message}`);
      } else {
        forensicData = forensicResult.data;
        console.log('✅ Technical forensic integration completed');
      }
      
    } catch (forensicError) {
      console.warn(`⚠️ Forensic integration failed: ${forensicError.message}`);
      // Continue without forensic data - it's an enhancement, not critical
    }

    // Step 5: AI Analysis with Enhanced Fallback System
    console.log('🤖 Starting AI analysis with intelligent fallback...');
    
    let analysisResult;
    let modelUsed = 'unknown';
    let fallbackUsed = false;
    
    const analysisRequestBody = {
      sessionId,
      imageUrls: validImageUrls,
      prompt: promptResult.data.prompt,
      persona,
      chatMode: false,
      forensicData // Include technical audit data
    };
    
    try {
      // Try primary model (Claude) first
      analysisResult = await withRetry(async () => {
        return await attemptModelAnalysis(MODEL_CONFIG.primary, analysisRequestBody, supabase);
      }, `Primary model analysis (${MODEL_CONFIG.primary.name})`, 2);
      
      modelUsed = MODEL_CONFIG.primary.name;
      console.log(`✅ Primary model ${modelUsed} succeeded`);
      
    } catch (primaryError) {
      console.warn(`⚠️ Primary model failed: ${primaryError.message}`);
      
      // Fallback to GPT
      try {
        console.log(`🔄 Falling back to ${MODEL_CONFIG.fallback.name}...`);
        
        analysisResult = await withRetry(async () => {
          return await attemptModelAnalysis(MODEL_CONFIG.fallback, analysisRequestBody, supabase);
        }, `Fallback model analysis (${MODEL_CONFIG.fallback.name})`, 1);
        
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

    // Step 5: Synthesize results (now includes maturity score calculation)
    const synthesisResult = await withRetry(async () => {
      const result = await supabase.functions.invoke('goblin-model-synthesis', {
         body: {
           sessionId,
           userId: session.user_id,
           persona,
           analysisData: analysisResult.data,
           goal,
           imageCount: validImageUrls.length,
           forensicData // Include technical audit summary
         }
      });
      
      if (result.error) throw new Error(`Result synthesis failed: ${result.error.message}`);
      return result;
    }, `Result synthesis for ${persona}`);

    // Step 6: Save final results with transaction-like behavior
    try {
      const resultData = {
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
          fallbackUsed,
          maturityData: synthesisResult.data.maturityData,
          circuitBreakerStatus: {
            claude: isCircuitOpen('goblin-model-claude-analyzer'),
            gpt: isCircuitOpen('goblin-model-gpt-analyzer'),
            vision: isCircuitOpen('goblin-vision-screen-detector')
          }
        },
        processing_time_ms: Date.now() - startTime,
        goblin_gripe_level: persona === 'clarity' ? synthesisResult.data.gripeLevel : null
      };
      
      const dbResult = await supabase
        .from('goblin_analysis_results')
        .insert(resultData);
        
      if (dbResult.error) {
        console.error('🔴 DEBUG_GOBLIN: DB save failed', dbResult.error, resultData);
        throw dbResult.error;
      }

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
    
    // Log maturity score if calculated
    if (synthesisResult.data.maturityData) {
      console.log(`🎯 Maturity score calculated: ${synthesisResult.data.maturityData.overallScore}/100`);
    }

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
          visionSuccessRate: visionResults.filter(r => !r.fallback).length / visionResults.length,
          circuitBreakerStatus: {
            claude: isCircuitOpen('goblin-model-claude-analyzer'),
            gpt: isCircuitOpen('goblin-model-gpt-analyzer'),
            vision: isCircuitOpen('goblin-vision-screen-detector')
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('🔴 DEBUG_GOBLIN: Orchestrator failed', error);
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
          retryable: RETRY_CONFIG.retryableErrors.some(e => error.message.toLowerCase().includes(e)),
          circuitBreakerStatus: {
            claude: isCircuitOpen('goblin-model-claude-analyzer'),
            gpt: isCircuitOpen('goblin-model-gpt-analyzer'),
            vision: isCircuitOpen('goblin-vision-screen-detector')
          }
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});