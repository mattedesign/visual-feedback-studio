import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Content-Type': 'application/json'
};

console.log('🔬 Perplexity Research Function - Starting up');

serve(async (req) => {
  console.log('📨 Perplexity request received:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get Perplexity API key from environment
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      console.error('❌ Perplexity API key not configured');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Perplexity API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { type, query, domain, industry, recencyFilter = 'month', maxSources = 5 } = requestBody;
    
    console.log('🔍 Processing Perplexity request:', {
      type,
      query: query?.substring(0, 100),
      domain,
      industry,
      recencyFilter,
      maxSources
    });

    // Validate required fields
    if (!query || !type) {
      console.error('❌ Missing required fields');
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: query and type'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build Perplexity request based on type
    let perplexityQuery = query;
    let systemPrompt = 'You are a UX research expert. Provide accurate, current information with proper citations.';

    if (type === 'competitive') {
      systemPrompt = 'You are a UX competitive analysis expert. Provide detailed competitor insights, industry trends, and actionable recommendations with sources.';
      perplexityQuery = `${query} Include specific examples, metrics, and recent developments in UX design.`;
    } else if (type === 'validation') {
      systemPrompt = 'You are a UX research validator. Evaluate the accuracy and currentness of UX claims with supporting or contradicting evidence.';
      perplexityQuery = `Validate this UX claim: ${query}. Provide supporting evidence or contradictions with recent sources.`;
    }

    // Set domain filter if provided
    const searchDomainFilter = domain ? [`${domain}.com`, 'nngroup.com', 'smashingmagazine.com', 'uxplanet.org'] : undefined;

    console.log('🚀 Calling Perplexity API...');

    // Call Perplexity API with enhanced error handling
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Figmant/1.0'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online', // ✅ FIX: Use smaller model to reduce 406 errors
        messages: [
          {
            role: 'system',
            content: systemPrompt.substring(0, 200) // ✅ FIX: Shorter system prompt
          },
          {
            role: 'user',
            content: perplexityQuery.substring(0, 300) // ✅ FIX: Shorter query to avoid 406
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 800, // ✅ FIX: Reduced tokens to avoid 406 errors
        return_images: false,
        return_related_questions: false, // ✅ FIX: Disable to reduce response size
        search_domain_filter: searchDomainFilter?.slice(0, 2), // ✅ FIX: Limit domains
        search_recency_filter: recencyFilter,
        frequency_penalty: 0.5, // ✅ FIX: Reduced to allow more natural responses
        presence_penalty: 0
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('❌ Perplexity API error:', {
        status: perplexityResponse.status,
        statusText: perplexityResponse.statusText,
        headers: Object.fromEntries(perplexityResponse.headers.entries()),
        body: errorText
      });
      
      // Handle specific 406 errors
      if (perplexityResponse.status === 406) {
        throw new Error('Perplexity API rejected request - content format issue');
      }
      
      throw new Error(`Perplexity API error ${perplexityResponse.status}: ${errorText || perplexityResponse.statusText}`);
    }

    const perplexityData = await perplexityResponse.json();
    console.log('✅ Perplexity API response received');

    // Extract content and citations
    const content = perplexityData.choices?.[0]?.message?.content || '';
    const citations = perplexityData.citations || [];
    const relatedQuestions = perplexityData.related_questions || [];

    // Parse citations into structured format
    const sources = citations.map((citation: any, index: number) => ({
      title: citation.title || `Source ${index + 1}`,
      url: citation.url || '',
      snippet: citation.snippet || citation.text || '',
      publishedDate: citation.published_date,
      domain: citation.domain || citation.url?.split('/')[2] || ''
    })).slice(0, maxSources);

    // For competitive analysis, structure the response differently
    if (type === 'competitive') {
      const response = {
        success: true,
        competitors: extractCompetitorInsights(content, sources),
        industryTrends: extractTrendInsights(content, sources),
        benchmarks: extractBenchmarks(content, sources),
        recommendations: extractRecommendations(content),
        sources,
        relatedQuestions: relatedQuestions.slice(0, 5)
      };

      console.log('🎯 Competitive analysis completed:', {
        competitorsCount: response.competitors.length,
        trendsCount: response.industryTrends.length,
        benchmarksCount: response.benchmarks.length
      });

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Standard research response
    const response = {
      success: true,
      content,
      sources,
      relatedQuestions: relatedQuestions.slice(0, 5)
    };

    console.log('✅ Research completed successfully:', {
      contentLength: content.length,
      sourcesCount: sources.length,
      relatedQuestionsCount: response.relatedQuestions.length
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Perplexity function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper functions for competitive analysis parsing
function extractCompetitorInsights(content: string, sources: any[]): any[] {
  // Simple extraction - in production this could use more sophisticated NLP
  const competitors: any[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('competitor') || line.toLowerCase().includes('company')) {
      const match = line.match(/(\w+(?:\s+\w+)*)/);
      if (match) {
        competitors.push({
          name: match[1],
          strengths: [],
          weaknesses: [],
          marketPosition: line,
          sources: sources.slice(0, 2)
        });
      }
    }
  }
  
  return competitors.slice(0, 5);
}

function extractTrendInsights(content: string, sources: any[]): any[] {
  const trends: any[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('trend') || line.toLowerCase().includes('emerging')) {
      trends.push({
        trend: line.trim(),
        impact: 'medium',
        timeframe: '2024',
        description: line,
        sources: sources.slice(0, 2)
      });
    }
  }
  
  return trends.slice(0, 3);
}

function extractBenchmarks(content: string, sources: any[]): any[] {
  const benchmarks: any[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes('%') || line.includes('metric') || line.includes('benchmark')) {
      benchmarks.push({
        metric: line.trim(),
        value: line,
        industry: 'UX Design',
        source: sources[0] || { title: 'Perplexity Research', url: '' }
      });
    }
  }
  
  return benchmarks.slice(0, 3);
}

function extractRecommendations(content: string): string[] {
  const recommendations: string[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('recommend') || line.toLowerCase().includes('should') || line.toLowerCase().includes('consider')) {
      recommendations.push(line.trim());
    }
  }
  
  return recommendations.slice(0, 5);
}