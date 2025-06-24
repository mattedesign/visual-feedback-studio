
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
    
    // Retrieve relevant knowledge using embeddings
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

// Generate embeddings using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY_RAG')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

// Retrieve knowledge using the match_knowledge RPC function
async function retrieveKnowledge(supabaseClient: any, queries: string[]) {
  const allResults = [];
  
  for (const query of queries) {
    try {
      console.log(`🔍 Searching for: "${query}"`);
      
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);
      
      // Call the match_knowledge RPC function
      const { data, error } = await supabaseClient.rpc('match_knowledge', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: 0.7,
        match_count: 3
      });
      
      if (error) {
        console.error(`Query error for "${query}":`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        console.log(`Found ${data.length} results for "${query}"`);
        allResults.push(...data);
      } else {
        console.log(`No results found for "${query}"`);
      }
    } catch (error) {
      console.error(`Query failed for "${query}":`, error);
      // Continue with other queries even if one fails
    }
  }
  
  // Remove duplicates based on ID and return top 8
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
    if (words.includes('button')) queries.push('button design UX');
    if (words.includes('form')) queries.push('form design conversion');
    if (words.includes('checkout')) queries.push('checkout optimization');
    if (words.includes('mobile')) queries.push('mobile UX patterns');
    if (words.includes('ecommerce') || words.includes('shop')) queries.push('ecommerce UX patterns');
    if (words.includes('saas')) queries.push('saas design patterns');
    if (words.includes('navigation')) queries.push('navigation UX');
    if (words.includes('landing')) queries.push('landing page conversion');
    if (words.includes('dashboard')) queries.push('dashboard UX design');
    if (words.includes('accessibility')) queries.push('accessibility guidelines');
  }
  
  // Add annotation-based queries
  if (annotations && annotations.length > 0) {
    annotations.forEach(imgAnnotation => {
      if (imgAnnotation.annotations) {
        imgAnnotation.annotations.forEach(ann => {
          if (ann.comment && ann.comment.length > 10) {
            queries.push(ann.comment.substring(0, 50));
          }
        });
      }
    });
  }
  
  return [...new Set(queries)]; // Remove duplicates
}

function buildResearchPrompt(userPrompt: string = '', knowledge: any[]): string {
  let prompt = `You are an expert UX analyst with access to research insights.\n\n`;
  
  if (userPrompt.trim()) {
    prompt += `PRIMARY REQUEST: ${userPrompt.trim()}\n\n`;
  }
  
  if (knowledge.length > 0) {
    prompt += `RESEARCH CONTEXT:\nYour analysis should be informed by these research insights:\n\n`;
    knowledge.forEach((entry, i) => {
      prompt += `${i + 1}. ${entry.title}\n`;
      prompt += `   ${entry.content.substring(0, 200)}...\n`;
      prompt += `   Source: ${entry.source || 'UX Research Database'}\n`;
      prompt += `   Category: ${entry.category}\n\n`;
    });
    
    prompt += `ANALYSIS INSTRUCTIONS:\n`;
    prompt += `- Reference specific research findings when making recommendations\n`;
    prompt += `- Cite sources for any claims you make\n`;
    prompt += `- Provide industry-specific insights when possible\n`;
    prompt += `- Include quantitative benchmarks or metrics when available\n`;
    prompt += `- Focus on actionable, business-impact driven recommendations\n\n`;
  }
  
  prompt += `Please provide detailed, research-backed UX feedback annotations.`;
  return prompt;
}

function inferIndustry(prompt?: string): string {
  if (!prompt) return 'general';
  const p = prompt.toLowerCase();
  if (p.includes('ecommerce') || p.includes('shop') || p.includes('cart')) return 'ecommerce';
  if (p.includes('saas') || p.includes('software')) return 'saas';
  if (p.includes('fintech') || p.includes('finance')) return 'fintech';
  if (p.includes('healthcare') || p.includes('medical')) return 'healthcare';
  return 'general';
}
