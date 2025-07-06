import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🧝‍♂️ Goblin Analysis Orchestrator - Multi-persona UX analysis');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, imageUrls, persona, mode, goal, confidence } = await req.json();

    console.log('🎯 Orchestrating goblin analysis:', {
      sessionId: sessionId?.substring(0, 8),
      persona,
      mode,
      imageCount: imageUrls?.length,
      goalLength: goal?.length
    });

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update session status
    await supabase
      .from('goblin_analysis_sessions')
      .update({ status: 'processing' })
      .eq('id', sessionId);

    // Step 1: Build persona-specific prompt
    const promptResult = await supabase.functions.invoke('goblin-persona-prompt-builder', {
      body: { persona, goal, imageCount: imageUrls.length, mode, confidence }
    });

    if (promptResult.error) {
      throw new Error(`Prompt building failed: ${promptResult.error.message}`);
    }

    // Step 2: Analyze with Claude
    const analysisResult = await supabase.functions.invoke('goblin-model-claude-analyzer', {
      body: {
        sessionId,
        imageUrls,
        prompt: promptResult.data.prompt,
        persona,
        systemPrompt: promptResult.data.systemPrompt
      }
    });

    if (analysisResult.error) {
      throw new Error(`Claude analysis failed: ${analysisResult.error.message}`);
    }

    // Step 3: Synthesize results
    const synthesisResult = await supabase.functions.invoke('goblin-model-synthesis', {
      body: {
        sessionId,
        persona,
        analysisData: analysisResult.data,
        goal
      }
    });

    if (synthesisResult.error) {
      throw new Error(`Result synthesis failed: ${synthesisResult.error.message}`);
    }

    // Step 4: Save final results
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
          processedAt: new Date().toISOString()
        },
        processing_time_ms: Date.now() - new Date(promptResult.data.startTime).getTime(),
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

    console.log('✅ Goblin analysis orchestration completed');

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        persona,
        results: synthesisResult.data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Goblin orchestration failed:', error);

    // Try to update session status to error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { sessionId } = await req.json();
      if (sessionId) {
        await supabase
          .from('goblin_analysis_sessions')
          .update({ status: 'failed' })
          .eq('id', sessionId);
      }
    } catch (updateError) {
      console.error('Failed to update session status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});