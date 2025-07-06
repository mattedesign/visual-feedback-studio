import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

console.log('🔄 Analysis Multimodel Orchestrator - Multi-AI coordination');

serve(async (req) => {
  console.log('🔥 MULTIMODEL ORCHESTRATOR CALLED - Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }

  try {
    const body = await req.json();
    console.log('🔄 Processing multimodel coordination request:', body);

    const { sessionId, baseAnalysis, models = ['claude', 'gpt4'], analysisContext } = body;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`🔄 Coordinating ${models.length} models...`);

    const coordinationResults = {
      models: models,
      startedAt: new Date().toISOString(),
      results: {},
      orchestrationSummary: {}
    };

    // Parallel execution of different model specializations
    const modelTasks = [];

    // GPT-4 for microcopy if requested
    if (models.includes('gpt4')) {
      console.log('✍️ Queuing GPT-4 microcopy enhancement...');
      modelTasks.push(
        supabase.functions.invoke('model-gpt4-microcopy', {
          body: {
            sessionId,
            baseAnalysis,
            analysisContext
          }
        }).then(response => ({
          model: 'gpt4-microcopy',
          response,
          completedAt: new Date().toISOString()
        }))
      );
    }

    // Perplexity for competitive research if requested
    if (models.includes('perplexity')) {
      console.log('🔍 Queuing Perplexity competitive research...');
      modelTasks.push(
        supabase.functions.invoke('model-perplexity-research', {
          body: {
            sessionId,
            analysisContext,
            baseAnalysis
          }
        }).then(response => ({
          model: 'perplexity-research',
          response,
          completedAt: new Date().toISOString()
        }))
      );
    }

    // Execute all model tasks in parallel
    console.log(`🚀 Executing ${modelTasks.length} model tasks in parallel...`);
    const modelResults = await Promise.allSettled(modelTasks);

    // Process results
    let successCount = 0;
    let errorCount = 0;

    modelResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { model, response, completedAt } = result.value;
        coordinationResults.results[model] = {
          success: !response.error,
          data: response.data,
          error: response.error,
          completedAt
        };
        
        if (!response.error) {
          successCount++;
          console.log(`✅ ${model} completed successfully`);
        } else {
          errorCount++;
          console.warn(`⚠️ ${model} failed:`, response.error);
        }
      } else {
        errorCount++;
        console.error(`❌ Model task failed:`, result.reason);
      }
    });

    // Create orchestration summary
    coordinationResults.orchestrationSummary = {
      totalModels: models.length,
      successfulModels: successCount,
      failedModels: errorCount,
      completedAt: new Date().toISOString(),
      confidence: successCount / models.length,
      recommendations: this.synthesizeRecommendations(coordinationResults.results)
    };

    // Update session with multimodel results
    await supabase
      .from('analysis_sessions')
      .update({ 
        multimodel_results: {
          ...coordinationResults,
          processedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log('✅ Multimodel coordination completed');

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        coordination: coordinationResults,
        summary: coordinationResults.orchestrationSummary
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Multimodel coordination failed:`, errorMessage);

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

// Helper function to synthesize recommendations from multiple models
function synthesizeRecommendations(modelResults: any) {
  const synthesis = {
    combinedInsights: [],
    conflictingViews: [],
    consensus: []
  };

  // Extract insights from each successful model
  Object.keys(modelResults).forEach(modelKey => {
    const result = modelResults[modelKey];
    if (result.success && result.data) {
      const insights = result.data.results || result.data;
      
      if (insights.microcopyEnhancements) {
        synthesis.combinedInsights.push({
          source: modelKey,
          type: 'microcopy',
          recommendations: insights.microcopyEnhancements
        });
      }
      
      if (insights.competitiveInsights) {
        synthesis.combinedInsights.push({
          source: modelKey,
          type: 'competitive',
          recommendations: insights.competitiveInsights
        });
      }
    }
  });

  return synthesis;
}