import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🎯 Goblin Maturity Score Backfill - Calculating missing scores for past analyses');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Finding completed analyses without maturity scores...');

    // Get all completed analyses that don't have maturity scores
    const { data: incompleteAnalyses, error: queryError } = await supabase
      .from('goblin_analysis_sessions')
      .select(`
        id,
        user_id,
        persona_type,
        created_at,
        goblin_analysis_results!inner(
          id,
          persona_feedback,
          synthesis_summary,
          priority_matrix,
          annotations,
          goblin_gripe_level
        )
      `)
      .eq('status', 'completed')
      .is('goblin_maturity_scores.id', null)
      .order('created_at', { ascending: false });

    if (queryError) {
      throw new Error(`Failed to query incomplete analyses: ${queryError.message}`);
    }

    console.log(`📊 Found ${incompleteAnalyses?.length || 0} analyses needing maturity scores`);

    if (!incompleteAnalyses || incompleteAnalyses.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No analyses need backfilling',
        processed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let processedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each analysis
    for (const analysis of incompleteAnalyses) {
      try {
        console.log(`🎯 Processing analysis ${analysis.id.substring(0, 8)} for user ${analysis.user_id.substring(0, 8)}`);

        const result = analysis.goblin_analysis_results[0];
        if (!result) {
          console.warn(`⚠️ No results found for analysis ${analysis.id.substring(0, 8)}`);
          continue;
        }

        // Calculate maturity score using the synthesis function
        const synthesisResult = await supabase.functions.invoke('goblin-model-synthesis', {
          body: {
            sessionId: analysis.id,
            userId: analysis.user_id,
            persona: analysis.persona_type,
            analysisData: {
              analysisData: result.persona_feedback,
              rawResponse: result.synthesis_summary
            },
            goal: 'Backfill maturity calculation',
            imageCount: 1
          }
        });

        if (synthesisResult.error) {
          throw new Error(`Synthesis failed: ${synthesisResult.error.message}`);
        }

        if (synthesisResult.data?.maturityData) {
          console.log(`✅ Calculated maturity score ${synthesisResult.data.maturityData.overallScore}/100 for analysis ${analysis.id.substring(0, 8)}`);
          processedCount++;
        } else {
          console.warn(`⚠️ No maturity data returned for analysis ${analysis.id.substring(0, 8)}`);
        }

      } catch (error) {
        console.error(`❌ Failed to process analysis ${analysis.id.substring(0, 8)}:`, error);
        errorCount++;
        errors.push({
          analysisId: analysis.id.substring(0, 8),
          error: error.message
        });
      }

      // Add small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`🎉 Backfill completed: ${processedCount} processed, ${errorCount} errors`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Maturity score backfill completed',
      processed: processedCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 10), // Limit error details to first 10
      totalAnalyses: incompleteAnalyses.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Backfill failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});