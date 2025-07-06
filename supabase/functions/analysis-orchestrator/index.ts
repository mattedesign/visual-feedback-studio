import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

console.log('🎼 Analysis Orchestrator - Starting orchestration engine');

interface OrchestrationRequest {
  sessionId: string;
  imageUrls?: string[];
  analysisPrompt: string;
  useMultiModel?: boolean;
  models?: string[];
  analysisType?: string;
  enablePerplexityResearch?: boolean;
  enableMicrocopyEnhancement?: boolean;
}

serve(async (req) => {
  console.log('🔥 ORCHESTRATOR CALLED - Request received:', req.method);
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('🔍 Parsing request body...');
    const body = await req.json();
    console.log('✅ Body parsed:', JSON.stringify(body, null, 2));

    // Validate request
    if (!body.sessionId) {
      throw new Error('Session ID is required');
    }

    if (!body.analysisPrompt) {
      throw new Error('Analysis prompt is required');
    }

    const request: OrchestrationRequest = {
      sessionId: body.sessionId,
      imageUrls: body.imageUrls || [],
      analysisPrompt: body.analysisPrompt,
      useMultiModel: body.useMultiModel || false,
      models: body.models || ['claude'],
      analysisType: body.analysisType || 'strategic',
      enablePerplexityResearch: body.enablePerplexityResearch || false,
      enableMicrocopyEnhancement: body.enableMicrocopyEnhancement || false
    };

    console.log('🚀 Starting orchestrated analysis pipeline...');
    
    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update session status
    console.log('📝 Updating session status to processing...');
    await supabase
      .from('analysis_sessions')
      .update({ 
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', request.sessionId);

    // Step 1: Google Vision Analysis (if images present)
    let visionResults = null;
    if (request.imageUrls && request.imageUrls.length > 0) {
      console.log('👁️ Step 1: Starting Google Vision analysis...');
      try {
        const visionResponse = await supabase.functions.invoke('google-vision-analysis', {
          body: {
            sessionId: request.sessionId,
            imageUrls: request.imageUrls
          }
        });
        
        if (visionResponse.error) {
          console.warn('⚠️ Vision analysis failed:', visionResponse.error);
        } else {
          visionResults = visionResponse.data;
          console.log('✅ Vision analysis completed');
        }
      } catch (error) {
        console.warn('⚠️ Vision analysis error:', error.message);
      }
    }

    // Step 2: Core Claude Analysis
    console.log('🤖 Step 2: Starting Claude analysis...');
    const claudeResponse = await supabase.functions.invoke('analyze-design', {
      body: {
        sessionId: request.sessionId,
        imageUrls: request.imageUrls,
        analysisPrompt: request.analysisPrompt,
        designType: 'web',
        useMultiModel: request.useMultiModel,
        models: request.models,
        analysisType: request.analysisType
      }
    });

    if (claudeResponse.error) {
      throw new Error(`Claude analysis failed: ${claudeResponse.error.message}`);
    }

    console.log('✅ Claude analysis completed');

    // Step 3: Multi-model coordination (if enabled)
    let multiModelResults = null;
    if (request.useMultiModel && request.models && request.models.length > 1) {
      console.log('🔄 Step 3: Starting multi-model coordination...');
      try {
        const multiModelResponse = await supabase.functions.invoke('multi-model-analysis', {
          body: {
            sessionId: request.sessionId,
            baseAnalysis: claudeResponse.data,
            models: request.models,
            analysisType: request.analysisType
          }
        });
        
        if (multiModelResponse.error) {
          console.warn('⚠️ Multi-model coordination failed:', multiModelResponse.error);
        } else {
          multiModelResults = multiModelResponse.data;
          console.log('✅ Multi-model coordination completed');
        }
      } catch (error) {
        console.warn('⚠️ Multi-model coordination error:', error.message);
      }
    }

    // Step 4: Perplexity Research (if enabled)
    let perplexityResults = null;
    if (request.enablePerplexityResearch) {
      console.log('🔍 Step 4: Starting Perplexity research...');
      try {
        const perplexityResponse = await supabase.functions.invoke('perplexity-research', {
          body: {
            sessionId: request.sessionId,
            analysisContext: request.analysisPrompt,
            analysisResults: claudeResponse.data
          }
        });
        
        if (perplexityResponse.error) {
          console.warn('⚠️ Perplexity research failed:', perplexityResponse.error);
        } else {
          perplexityResults = perplexityResponse.data;
          console.log('✅ Perplexity research completed');
        }
      } catch (error) {
        console.warn('⚠️ Perplexity research error:', error.message);
      }
    }

    // Final: Update session with orchestrated results
    console.log('💾 Finalizing orchestrated results...');
    const orchestratedResults = {
      orchestration: {
        pipeline: 'multi-stage',
        timestamp: new Date().toISOString(),
        stagesCompleted: [
          'claude-analysis',
          ...(visionResults ? ['google-vision'] : []),
          ...(multiModelResults ? ['multi-model'] : []),
          ...(perplexityResults ? ['perplexity-research'] : [])
        ]
      },
      primary: claudeResponse.data,
      vision: visionResults,
      multiModel: multiModelResults,
      research: perplexityResults
    };

    // Update session with final results
    await supabase
      .from('analysis_sessions')
      .update({ 
        status: 'completed',
        claude_results: claudeResponse.data,
        multimodel_results: orchestratedResults,
        vision_results: visionResults,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.sessionId);

    console.log('✅ Orchestration completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        orchestration: orchestratedResults.orchestration,
        sessionId: request.sessionId,
        stagesCompleted: orchestratedResults.orchestration.stagesCompleted.length,
        message: 'Analysis orchestration completed successfully'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Orchestration failed:`, errorMessage);
    console.error(`❌ Error stack:`, error instanceof Error ? error.stack : 'No stack trace');

    // Update session status to error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase
        .from('analysis_sessions')
        .update({ 
          status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', req.body?.sessionId);
    } catch (updateError) {
      console.error(`Failed to update session error status:`, updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});