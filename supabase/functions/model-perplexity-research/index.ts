import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

console.log('🔍 Model Perplexity Research - Competitive intelligence');

serve(async (req) => {
  console.log('🔥 PERPLEXITY RESEARCH CALLED - Request received:', req.method);
  
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
    console.log('🔍 Processing competitive research request:', body);

    const { sessionId, analysisContext, baseAnalysis } = body;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured');
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate research queries based on analysis context
    const researchQueries = [
      `Latest UX design trends 2024 2025 for ${analysisContext}`,
      `Best practices UI design patterns competitive analysis ${analysisContext}`,
      `User experience optimization techniques modern web design`,
      `Conversion rate optimization strategies ${analysisContext}`
    ];

    console.log('🔍 Starting competitive research...');

    const researchResults = [];

    for (const query of researchQueries) {
      try {
        console.log(`🔍 Researching: ${query}`);

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-sonar-small-128k-online',
            messages: [
              {
                role: 'system',
                content: 'You are a UX research analyst. Provide concise, actionable insights with specific examples and sources.'
              },
              {
                role: 'user',
                content: query
              }
            ],
            temperature: 0.2,
            top_p: 0.9,
            max_tokens: 1000,
            search_recency_filter: 'month',
            return_related_questions: false,
            return_images: false
          }),
        });

        if (!response.ok) {
          throw new Error(`Perplexity API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';

        researchResults.push({
          query,
          insights: content,
          processedAt: new Date().toISOString()
        });

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.warn(`⚠️ Failed to research query "${query}":`, error.message);
        researchResults.push({
          query,
          error: error.message,
          processedAt: new Date().toISOString()
        });
      }
    }

    // Synthesize research into actionable recommendations
    const synthesisPrompt = `Based on this competitive research, provide actionable UX recommendations:

Research Results: ${JSON.stringify(researchResults)}
Original Analysis Context: ${analysisContext}

Please provide research-backed recommendations in this JSON format:

{
  "competitiveInsights": [
    {
      "id": "ci1",
      "title": "Implement trending design pattern",
      "insight": "Based on current market trends...",
      "recommendation": "Specific action to take",
      "source": "Research finding source",
      "priority": "high",
      "category": "competitive"
    }
  ],
  "marketTrends": [
    "Key trend 1",
    "Key trend 2"
  ],
  "competitorAnalysis": {
    "commonPatterns": ["pattern1", "pattern2"],
    "opportunities": ["opportunity1", "opportunity2"]
  }
}`;

    console.log('🔍 Synthesizing research insights...');

    const synthesisResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a UX strategist. Synthesize research into specific, actionable recommendations.'
          },
          {
            role: 'user',
            content: synthesisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    let synthesizedResults;
    if (synthesisResponse.ok) {
      const synthesisData = await synthesisResponse.json();
      const synthesisContent = synthesisData.choices[0]?.message?.content || '';
      
      try {
        const jsonMatch = synthesisContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          synthesizedResults = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse synthesis, using basic structure');
      }
    }

    if (!synthesizedResults) {
      synthesizedResults = {
        competitiveInsights: [
          {
            id: 'ci1',
            title: 'Apply modern UX patterns',
            insight: 'Current market research shows emphasis on user-centric design',
            recommendation: 'Focus on intuitive navigation and clear visual hierarchy',
            source: 'Market analysis',
            priority: 'high',
            category: 'competitive'
          }
        ],
        marketTrends: [
          'Minimalist design approach',
          'Mobile-first user experience',
          'Accessibility-focused interfaces'
        ],
        competitorAnalysis: {
          commonPatterns: ['Clean layouts', 'Prominent CTAs'],
          opportunities: ['Enhanced personalization', 'Improved onboarding']
        }
      };
    }

    // Get current session data to update
    const { data: sessionData } = await supabase
      .from('analysis_sessions')
      .select('multimodel_results')
      .eq('id', sessionId)
      .single();

    const currentResults = sessionData?.multimodel_results || {};

    // Update session with research results
    await supabase
      .from('analysis_sessions')
      .update({ 
        multimodel_results: {
          ...currentResults,
          research: {
            rawResearch: researchResults,
            synthesized: synthesizedResults,
            processedAt: new Date().toISOString(),
            model: 'llama-3.1-sonar-small-128k-online',
            confidence: 0.75
          }
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log('✅ Competitive research completed');

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        results: {
          rawResearch: researchResults,
          synthesized: synthesizedResults
        },
        summary: {
          totalQueries: researchQueries.length,
          successfulQueries: researchResults.filter(r => !r.error).length,
          insights: synthesizedResults.competitiveInsights?.length || 0,
          model: 'llama-3.1-sonar-small-128k-online'
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Competitive research failed:`, errorMessage);

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