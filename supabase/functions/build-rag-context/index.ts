
// supabase/functions/build-rag-context/index.ts
// FIXED VERSION: Correct RPC parameters and embedding generation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== RAG Context Builder Started ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { imageUrls, userPrompt, imageAnnotations, analysisId } = await req.json()
    
    console.log('RAG Context Request:', {
      imageCount: imageUrls?.length || 0,
      hasPrompt: !!userPrompt,
      hasAnnotations: !!imageAnnotations && imageAnnotations.length > 0,
      analysisId
    });

    // Generate search queries based on user input
    const searchQueries = generateSearchQueries(userPrompt, imageAnnotations);
    console.log('Generated search queries:', searchQueries);
    
    // Retrieve relevant knowledge using CORRECTED parameters
    const relevantKnowledge = await retrieveKnowledge(supabaseClient, searchQueries);
    console.log('Retrieved knowledge entries:', relevantKnowledge.length);
    
    // Build enhanced prompt with research context
    const enhancedPrompt = buildResearchPrompt(userPrompt, relevantKnowledge);
    
    const ragContext = {
      retrievedKnowledge: {
        relevantPatterns: relevantKnowledge,
        competitorInsights: []
      },
      enhancedPrompt,
      researchCitations: relevantKnowledge.map(k => `${k.title} - ${k.source || 'Research Database'}`),
      industryContext: inferIndustry(userPrompt),
      buildTimestamp: new Date().toISOString()
    };

    console.log('✅ RAG Context Built Successfully:', {
      knowledgeEntries: relevantKnowledge.length,
      citations: ragContext.researchCitations.length,
      industry: ragContext.industryContext,
      promptLength: enhancedPrompt.length
    });

    return new Response(JSON.stringify(ragContext), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ RAG Context Builder Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to build RAG context'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// FIXED: Generate embeddings for search queries
async function generateEmbedding(text: string): Promise<number[]> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text.substring(0, 8000), // Limit input length
        model: 'text-embedding-3-small'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

// FIXED: Use correct RPC parameters and handle errors gracefully
async function retrieveKnowledge(supabaseClient: any, queries: string[]) {
  const allResults = [];
  
  for (const query of queries) {
    try {
      console.log(`🔍 Searching for: "${query}"`);
      
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);
      
      // Use the match_knowledge RPC function with correct parameter format
      const { data, error } = await supabaseClient.rpc('match_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: 0.6,
        match_count: 4
      });
      
      if (error) {
        console.error(`Query error for "${query}":`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} results for "${query}"`);
        allResults.push(...data.map(item => ({
          ...item,
          source: item.source || 'UX Research Database'
        })));
      } else {
        console.log(`No results found for "${query}"`);
      }
    } catch (error) {
      console.error(`Query failed for "${query}":`, error);
      // Continue with other queries even if one fails
    }
  }
  
  // Remove duplicates based on ID and return top results
  const unique = allResults.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  );
  
  console.log(`Total unique results: ${unique.length}`);
  return unique.slice(0, 8);
}

function generateSearchQueries(userPrompt?: string, annotations?: any[]): string[] {
  const queries = ['UX best practices', 'conversion optimization'];
  
  if (userPrompt) {
    const words = userPrompt.toLowerCase();
    
    // Add specific queries based on user prompt content
    if (words.includes('button')) queries.push('button design UX patterns');
    if (words.includes('form')) queries.push('form design conversion best practices');
    if (words.includes('checkout')) queries.push('checkout optimization research');
    if (words.includes('mobile')) queries.push('mobile UX design patterns');
    if (words.includes('ecommerce') || words.includes('shop')) queries.push('ecommerce UX research');
    if (words.includes('saas')) queries.push('saas design patterns research');
    if (words.includes('navigation')) queries.push('navigation UX research');
    if (words.includes('landing')) queries.push('landing page conversion research');
    if (words.includes('dashboard')) queries.push('dashboard UX design research');
    if (words.includes('accessibility')) queries.push('accessibility UX research');
    if (words.includes('trust') || words.includes('credibility')) queries.push('trust signals UX research');
    
    // Add the user prompt itself as a search query (truncated)
    const cleanPrompt = userPrompt.trim().substring(0, 100);
    if (cleanPrompt.length > 10) {
      queries.push(cleanPrompt);
    }
  }
  
  // Add annotation-based queries
  if (annotations && annotations.length > 0) {
    annotations.forEach(imgAnnotation => {
      if (imgAnnotation.annotations) {
        imgAnnotation.annotations.forEach(ann => {
          if (ann.comment && ann.comment.length > 15) {
            queries.push(ann.comment.substring(0, 80));
          }
        });
      }
    });
  }
  
  // Remove duplicates and return
  return [...new Set(queries)];
}

function buildResearchPrompt(userPrompt: string = '', knowledge: any[]): string {
  let enhancedPrompt = `RESEARCH-ENHANCED UX ANALYSIS

You are a senior UX consultant with access to research-backed insights. Provide expert analysis that references specific research findings.

`;
  
  if (userPrompt.trim()) {
    enhancedPrompt += `USER REQUEST:
${userPrompt.trim()}

`;
  }
  
  if (knowledge.length > 0) {
    enhancedPrompt += `RESEARCH CONTEXT:
You have access to ${knowledge.length} relevant UX research insights:

`;
    knowledge.forEach((entry, i) => {
      enhancedPrompt += `${i + 1}. "${entry.title}"
   Category: ${entry.category}
   Key Insight: ${entry.content.substring(0, 200)}...
   Source: ${entry.source || 'UX Research Database'}
   Relevance: ${((entry.similarity || 0) * 100).toFixed(1)}%

`;
    });
    
    enhancedPrompt += `ANALYSIS REQUIREMENTS:
• Ground all recommendations in the provided research insights
• Reference specific research sources for each major recommendation  
• Explain how recommendations connect to established UX principles
• Prioritize recommendations based on research-backed impact
• Include specific metrics or benchmarks when available from research
• Provide implementation guidance based on research best practices

OUTPUT FORMAT:
Structure annotations to clearly indicate which research sources support each recommendation. Include research citations and explain the connection between research and your specific recommendations.

`;
  } else {
    enhancedPrompt += `RESEARCH CONTEXT:
Limited research context available. Provide analysis based on established UX principles and industry best practices.

`;
  }
  
  enhancedPrompt += `Please analyze the provided design and generate detailed, research-backed feedback annotations.`;
  
  return enhancedPrompt;
}

function inferIndustry(prompt?: string): string {
  if (!prompt) return 'general';
  const p = prompt.toLowerCase();
  if (p.includes('ecommerce') || p.includes('shop') || p.includes('cart') || p.includes('checkout')) return 'ecommerce';
  if (p.includes('saas') || p.includes('software') || p.includes('dashboard')) return 'saas';
  if (p.includes('fintech') || p.includes('finance') || p.includes('banking')) return 'fintech';
  if (p.includes('healthcare') || p.includes('medical') || p.includes('health')) return 'healthcare';
  if (p.includes('education') || p.includes('learning') || p.includes('course')) return 'education';
  return 'general';
}
