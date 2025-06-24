
// supabase/functions/build-rag-context/index.ts
// FIXED VERSION: Better debugging, lower threshold, improved query generation

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

    const { analysisQuery, maxResults = 8, similarityThreshold = 0.5 } = await req.json()
    
    console.log('RAG Context Request:', {
      analysisQuery: analysisQuery?.substring(0, 100) + '...',
      maxResults,
      similarityThreshold,
      hasOpenAIKey: !!Deno.env.get('OPENAI_API_KEY')
    });

    // First, check if we have knowledge entries in the database
    const { data: knowledgeCount, error: countError } = await supabaseClient
      .from('knowledge_entries')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting knowledge entries:', countError);
      throw new Error(`Database connection failed: ${countError.message}`);
    }

    console.log(`📊 Knowledge entries in database: ${knowledgeCount?.length || 0}`);

    if (!knowledgeCount || knowledgeCount.length === 0) {
      console.warn('⚠️ No knowledge entries found in database');
      return new Response(JSON.stringify({
        relevantKnowledge: [],
        totalRelevantEntries: 0,
        categories: [],
        searchQuery: analysisQuery || 'No query provided',
        enhancedPrompt: buildFallbackPrompt(analysisQuery),
        retrievalMetadata: {
          searchQueries: [],
          processingTime: 0,
          industryContext: 'general',
          error: 'No knowledge entries in database'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate comprehensive search queries from the analysis query
    const searchQueries = generateImprovedSearchQueries(analysisQuery);
    console.log('🔍 Generated search queries:', searchQueries);
    
    const startTime = Date.now();
    
    // Retrieve relevant knowledge using LOWERED threshold
    const relevantKnowledge = await retrieveKnowledgeImproved(supabaseClient, searchQueries, similarityThreshold);
    console.log('📚 Retrieved knowledge entries:', relevantKnowledge.length);
    
    const processingTime = Date.now() - startTime;
    
    // Build enhanced prompt with research context
    const enhancedPrompt = buildResearchPrompt(analysisQuery, relevantKnowledge);
    
    // Extract categories from retrieved knowledge
    const categories = [...new Set(relevantKnowledge.map(k => k.category))];
    
    const ragContext = {
      relevantKnowledge,
      totalRelevantEntries: relevantKnowledge.length,
      categories,
      searchQuery: analysisQuery || 'UX analysis with research insights',
      enhancedPrompt,
      retrievalMetadata: {
        searchQueries,
        processingTime,
        industryContext: inferIndustry(analysisQuery),
        actualThreshold: similarityThreshold,
        queriesGenerated: searchQueries.length
      }
    };

    console.log('✅ RAG Context Built Successfully:', {
      knowledgeEntries: relevantKnowledge.length,
      categories: categories.length,
      industry: ragContext.retrievalMetadata.industryContext,
      promptLength: enhancedPrompt.length,
      processingTime: `${processingTime}ms`,
      threshold: similarityThreshold
    });

    return new Response(JSON.stringify(ragContext), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ RAG Context Builder Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to build RAG context',
      relevantKnowledge: [],
      totalRelevantEntries: 0,
      categories: [],
      searchQuery: 'Error occurred',
      enhancedPrompt: 'Please provide detailed UX feedback annotations.',
      retrievalMetadata: {
        error: error.message,
        processingTime: 0
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// IMPROVED: Generate embeddings with better error handling
async function generateEmbedding(text: string): Promise<number[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    console.log(`🔄 Generating embedding for: "${text.substring(0, 50)}..."`);
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Embedding generated successfully (${result.data[0].embedding.length} dimensions)`);
    return result.data[0].embedding;
  } catch (error) {
    console.error('❌ Embedding generation failed:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

// IMPROVED: Knowledge retrieval with better error handling and debugging
async function retrieveKnowledgeImproved(supabaseClient: any, queries: string[], threshold: number = 0.5) {
  const allResults = [];
  
  console.log(`🔍 Starting knowledge retrieval with threshold: ${threshold}`);
  
  for (const query of queries) {
    try {
      console.log(`🔎 Processing query: "${query}"`);
      
      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query);
      console.log(`📊 Query embedding generated: ${queryEmbedding.length} dimensions`);
      
      // Use correct RPC call with proper formatting
      const { data, error } = await supabaseClient.rpc('match_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: 5
      });
      
      if (error) {
        console.error(`❌ RPC error for "${query}":`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} results for "${query}"`);
        console.log('Sample results:', data.slice(0, 2).map(r => ({
          title: r.title?.substring(0, 50),
          similarity: r.similarity?.toFixed(3),
          category: r.category
        })));
        allResults.push(...data);
      } else {
        console.log(`ℹ️ No results found for "${query}" (threshold: ${threshold})`);
      }
    } catch (error) {
      console.error(`❌ Query failed for "${query}":`, error);
      // Continue with other queries instead of failing completely
    }
  }
  
  // Remove duplicates based on ID and return top results
  const unique = allResults.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  );
  
  console.log(`📋 Total unique results: ${unique.length}`);
  
  // Sort by similarity and return top results
  const sorted = unique.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
  const topResults = sorted.slice(0, 8);
  
  console.log('🎯 Top results:', topResults.map(r => ({
    title: r.title?.substring(0, 30),
    similarity: r.similarity?.toFixed(3),
    category: r.category
  })));
  
  return topResults;
}

// IMPROVED: Generate more comprehensive search queries
function generateImprovedSearchQueries(userPrompt?: string): string[] {
  const baseQueries = [
    'UX design principles',
    'usability best practices',
    'user interface guidelines',
    'conversion optimization',
    'accessibility standards'
  ];
  
  if (!userPrompt) {
    console.log('ℹ️ No user prompt provided, using base queries');
    return baseQueries;
  }
  
  const queries = [...baseQueries];
  const words = userPrompt.toLowerCase();
  
  // Add specific queries based on content
  const keywordMap = {
    'button': ['button design UX', 'call to action buttons', 'button accessibility'],
    'form': ['form design conversion', 'form usability', 'form validation patterns'],
    'checkout': ['checkout optimization', 'ecommerce checkout flow', 'cart abandonment'],
    'mobile': ['mobile UX patterns', 'responsive design', 'mobile usability'],
    'navigation': ['navigation UX', 'menu design patterns', 'navigation accessibility'],
    'landing': ['landing page conversion', 'landing page optimization', 'page layout design'],
    'dashboard': ['dashboard UX design', 'data visualization', 'admin interface design'],
    'search': ['search UX patterns', 'search functionality', 'filters and sorting'],
    'signup': ['signup flow optimization', 'registration forms', 'onboarding UX'],
    'color': ['color theory UX', 'color accessibility', 'brand color usage'],
    'typography': ['typography UX', 'font readability', 'text hierarchy'],
    'spacing': ['layout spacing', 'white space design', 'visual hierarchy']
  };
  
  // Add relevant queries based on keywords
  for (const [keyword, relatedQueries] of Object.entries(keywordMap)) {
    if (words.includes(keyword)) {
      queries.push(...relatedQueries);
      console.log(`🎯 Added queries for keyword "${keyword}":`, relatedQueries);
    }
  }
  
  // Add the user prompt itself as a search query
  if (userPrompt.length > 10 && userPrompt.length < 100) {
    queries.push(userPrompt.trim());
  }
  
  // Remove duplicates and return
  const uniqueQueries = [...new Set(queries)];
  console.log(`📝 Generated ${uniqueQueries.length} unique search queries`);
  return uniqueQueries;
}

// IMPROVED: Build better research-enhanced prompts
function buildResearchPrompt(userPrompt: string = '', knowledge: any[]): string {
  let prompt = `RESEARCH-BACKED UX ANALYSIS\n\n`;
  
  if (userPrompt.trim()) {
    prompt += `PRIMARY REQUEST: ${userPrompt.trim()}\n\n`;
  }
  
  if (knowledge.length > 0) {
    prompt += `RESEARCH CONTEXT:\n`;
    prompt += `You have access to ${knowledge.length} relevant UX research insights.\n\n`;
    
    prompt += `KEY RESEARCH FINDINGS:\n`;
    knowledge.forEach((entry, i) => {
      const similarity = entry.similarity ? ` (${(entry.similarity * 100).toFixed(1)}% relevant)` : '';
      prompt += `${i + 1}. "${entry.title}"${similarity}\n`;
      prompt += `   Research: ${entry.content.substring(0, 200)}...\n`;
      prompt += `   Source: ${entry.source || 'UX Research Database'}\n`;
      prompt += `   Category: ${entry.category}\n\n`;
    });
    
    prompt += `ANALYSIS REQUIREMENTS:\n`;
    prompt += `- Reference specific research findings in your recommendations\n`;
    prompt += `- Include phrases like "Research shows...", "Studies indicate...", "According to UX research..."\n`;
    prompt += `- Cite sources when making claims (e.g., "Nielsen's usability heuristics suggest...")\n`;
    prompt += `- Prioritize recommendations based on research-backed evidence\n`;
    prompt += `- Provide specific statistics or findings when available\n`;
    prompt += `- Connect recommendations to established UX principles\n\n`;
  } else {
    console.warn('⚠️ No research knowledge available, using fallback prompt');
    prompt += `STANDARD UX ANALYSIS:\n`;
    prompt += `While no specific research context was found, provide analysis based on established UX principles and best practices.\n\n`;
  }
  
  prompt += `Please provide detailed, evidence-based UX feedback annotations.`;
  return prompt;
}

// Fallback prompt when no knowledge is available
function buildFallbackPrompt(userPrompt?: string): string {
  let prompt = `UX DESIGN ANALYSIS\n\n`;
  
  if (userPrompt?.trim()) {
    prompt += `REQUEST: ${userPrompt.trim()}\n\n`;
  }
  
  prompt += `Please analyze this design based on established UX principles including:\n`;
  prompt += `- Usability heuristics and best practices\n`;
  prompt += `- Accessibility guidelines\n`;
  prompt += `- Visual design principles\n`;
  prompt += `- Conversion optimization techniques\n`;
  prompt += `- User experience patterns\n\n`;
  prompt += `Provide specific, actionable feedback for improvement.`;
  
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
