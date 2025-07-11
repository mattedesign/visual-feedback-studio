import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('📊 Goblin Maturity Monitor - Health check for score calculation system');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Gathering maturity score system health metrics...');

    // Get total completed analyses
    const { count: totalAnalyses } = await supabase
      .from('goblin_analysis_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Get total maturity scores
    const { count: totalScores } = await supabase
      .from('goblin_maturity_scores')
      .select('*', { count: 'exact', head: true });

    // Get recent scores (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: recentScores } = await supabase
      .from('goblin_maturity_scores')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday.toISOString());

    // Get score distribution
    const { data: scoreDistribution } = await supabase
      .from('goblin_maturity_scores')
      .select('overall_score, maturity_level')
      .order('created_at', { ascending: false })
      .limit(100);

    // Calculate coverage percentage
    const coveragePercentage = totalAnalyses > 0 ? Math.round((totalScores / totalAnalyses) * 100) : 0;
    
    // Calculate average score
    const averageScore = scoreDistribution?.length > 0 
      ? Math.round(scoreDistribution.reduce((sum, score) => sum + score.overall_score, 0) / scoreDistribution.length)
      : 0;

    // Get maturity level distribution
    const levelDistribution = scoreDistribution?.reduce((acc: any, score) => {
      acc[score.maturity_level] = (acc[score.maturity_level] || 0) + 1;
      return acc;
    }, {}) || {};

    const health = {
      systemStatus: coveragePercentage >= 95 ? 'healthy' : coveragePercentage >= 80 ? 'warning' : 'critical',
      coverage: {
        totalAnalyses,
        totalScores,
        coveragePercentage,
        missingScores: totalAnalyses - totalScores
      },
      recentActivity: {
        scoresLast24h: recentScores,
        isActive: recentScores > 0
      },
      scoreMetrics: {
        averageScore,
        distribution: levelDistribution,
        sampleSize: scoreDistribution?.length || 0
      },
      recommendations: []
    };

    // Add recommendations based on health
    if (coveragePercentage < 95) {
      health.recommendations.push(`Run backfill to process ${health.coverage.missingScores} missing scores`);
    }
    
    if (recentScores === 0) {
      health.recommendations.push('No recent score calculations - check if new analyses are generating scores');
    }

    if (averageScore < 40) {
      health.recommendations.push('Average scores are low - consider reviewing scoring algorithm');
    }

    console.log(`📊 Health check complete:`, {
      status: health.systemStatus,
      coverage: `${coveragePercentage}%`,
      average: averageScore,
      recent: recentScores
    });

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      health
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Health check failed:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});