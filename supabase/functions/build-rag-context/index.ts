
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RAGRequest {
  analysisQuery: string;
  maxResults?: number;
  similarityThreshold?: number;
  categoryFilter?: string;
  industryFilter?: string;
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  source?: string;
  similarity: number;
}

interface RAGContextResponse {
  relevantKnowledge: KnowledgeEntry[];
  totalRelevantEntries: number;
  categories: string[];
  searchQuery: string;
  enhancedPrompt: string;
  retrievalMetadata: {
    searchQueries: string[];
    processingTime: number;
    industryContext: string;
  };
}

serve(async (req) => {
  console.log('=== RAG Context Builder Function Started ===');
  console.log('Request method:', req.method);
  console.log('Timestamp:', new Date().toISOString());

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const requestBody: RAGRequest = await req.json();
    console.log('Request body received:', {
      queryLength: requestBody.analysisQuery?.length || 0,
      maxResults: requestBody.maxResults,
      categoryFilter: requestBody.categoryFilter
    });

    const {
      analysisQuery,
      maxResults = 10,
      similarityThreshold = 0.7,
      categoryFilter,
      industryFilter
    } = requestBody;

    if (!analysisQuery?.trim()) {
      throw new Error('Analysis query is required');
    }

    console.log('=== Knowledge Retrieval Phase ===');
    
    // Generate multiple search queries for better coverage
    const searchQueries = generateSearchQueries(analysisQuery);
    console.log('Generated search queries:', searchQueries);

    // Generate embedding for the main query
    console.log('Generating embedding for query...');
    const { data: embeddingData, error: embeddingError } = await supabaseClient.functions.invoke('generate-embeddings', {
      body: { text: analysisQuery }
    });

    if (embeddingError || !embeddingData?.embedding) {
      console.error('Embedding generation error:', embeddingError);
      throw new Error('Failed to generate embedding for query');
    }

    const queryEmbedding = embeddingData.embedding;
    console.log('Embedding generated successfully, dimensions:', queryEmbedding.length);

    // Search for relevant knowledge using vector similarity
    console.log('Searching knowledge base...');
    const { data: knowledgeResults, error: searchError } = await supabaseClient.rpc('match_knowledge', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      match_threshold: similarityThreshold,
      match_count: maxResults,
      filter_category: categoryFilter || null
    });

    if (searchError) {
      console.error('Knowledge search error:', searchError);
      throw new Error(`Knowledge search failed: ${searchError.message}`);
    }

    const relevantKnowledge: KnowledgeEntry[] = (knowledgeResults || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      source: item.source || 'UX Research Database',
      similarity: item.similarity
    }));

    console.log(`Found ${relevantKnowledge.length} relevant knowledge entries`);

    // Extract unique categories
    const categories = [...new Set(relevantKnowledge.map(entry => entry.category))];
    console.log('Knowledge categories found:', categories);

    // Build enhanced prompt with research context
    console.log('Building enhanced prompt...');
    const enhancedPrompt = buildEnhancedPrompt(analysisQuery, relevantKnowledge);

    // Infer industry context
    const industryContext = inferIndustryContext(analysisQuery);

    const processingTime = Date.now() - startTime;

    const response: RAGContextResponse = {
      relevantKnowledge,
      totalRelevantEntries: relevantKnowledge.length,
      categories,
      searchQuery: analysisQuery,
      enhancedPrompt,
      retrievalMetadata: {
        searchQueries,
        processingTime,
        industryContext
      }
    };

    console.log('=== RAG Context Build Complete ===');
    console.log('Processing time:', processingTime, 'ms');
    console.log('Knowledge entries retrieved:', relevantKnowledge.length);
    console.log('Categories covered:', categories.length);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('=== RAG Context Builder Error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

/**
 * Generate multiple search queries to improve knowledge retrieval coverage
 */
function generateSearchQueries(mainQuery: string): string[] {
  const queries = [mainQuery];
  const lowerQuery = mainQuery.toLowerCase();

  // Add general UX queries
  queries.push('UX best practices and principles');
  queries.push('user experience optimization');

  // Add specific domain queries based on keywords
  if (lowerQuery.includes('button') || lowerQuery.includes('cta')) {
    queries.push('button design and call-to-action optimization');
  }
  if (lowerQuery.includes('form') || lowerQuery.includes('input')) {
    queries.push('form design and user input optimization');
  }
  if (lowerQuery.includes('navigation') || lowerQuery.includes('menu')) {
    queries.push('website navigation and menu design');
  }
  if (lowerQuery.includes('mobile') || lowerQuery.includes('responsive')) {
    queries.push('mobile UX and responsive design patterns');
  }
  if (lowerQuery.includes('conversion') || lowerQuery.includes('checkout')) {
    queries.push('conversion rate optimization techniques');
  }
  if (lowerQuery.includes('accessibility') || lowerQuery.includes('a11y')) {
    queries.push('web accessibility and inclusive design');
  }
  if (lowerQuery.includes('ecommerce') || lowerQuery.includes('shop')) {
    queries.push('ecommerce user experience optimization');
  }
  if (lowerQuery.includes('saas') || lowerQuery.includes('dashboard')) {
    queries.push('SaaS application and dashboard design');
  }

  // Remove duplicates and limit to 5 queries to avoid overwhelming the system
  return [...new Set(queries)].slice(0, 5);
}

/**
 * Build an enhanced analysis prompt incorporating research context
 */
function buildEnhancedPrompt(userQuery: string, knowledge: KnowledgeEntry[]): string {
  let prompt = `RESEARCH-ENHANCED UX ANALYSIS REQUEST\n\n`;

  // Add user's original query
  prompt += `USER REQUEST:\n${userQuery}\n\n`;

  // Add research context if available
  if (knowledge.length > 0) {
    prompt += `RELEVANT UX RESEARCH CONTEXT:\n`;
    prompt += `You have access to ${knowledge.length} relevant UX research insights covering these areas: ${[...new Set(knowledge.map(k => k.category))].join(', ')}\n\n`;

    prompt += `KEY RESEARCH INSIGHTS TO CONSIDER:\n`;
    knowledge.slice(0, 6).forEach((entry, index) => {
      prompt += `${index + 1}. ${entry.title} (Relevance: ${(entry.similarity * 100).toFixed(1)}%)\n`;
      prompt += `   Insight: ${entry.content.substring(0, 200)}...\n`;
      prompt += `   Source: ${entry.source}\n`;
      prompt += `   Category: ${entry.category}\n\n`;
    });

    prompt += `RESEARCH-BACKED ANALYSIS REQUIREMENTS:\n`;
    prompt += `• Ground all recommendations in the provided research insights\n`;
    prompt += `• Cite specific research sources for each recommendation when relevant\n`;
    prompt += `• Include relevance scores for cited research\n`;
    prompt += `• Explain how each recommendation connects to established UX principles\n`;
    prompt += `• Prioritize recommendations based on research-backed impact\n`;
    prompt += `• Provide implementation guidance based on research best practices\n\n`;
  } else {
    prompt += `RESEARCH CONTEXT:\n`;
    prompt += `No highly specific research entries found for this query. Provide analysis based on general UX principles and industry best practices.\n\n`;
  }

  prompt += `OUTPUT REQUIREMENTS:\n`;
  prompt += `Structure your response to clearly indicate which research sources support each recommendation. When citing research, include the relevance score and explain the connection between the research and your specific recommendations.\n`;

  return prompt;
}

/**
 * Infer industry context from the analysis query
 */
function inferIndustryContext(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('ecommerce') || lowerQuery.includes('shop') || lowerQuery.includes('cart') || lowerQuery.includes('checkout')) {
    return 'ecommerce';
  }
  if (lowerQuery.includes('saas') || lowerQuery.includes('dashboard') || lowerQuery.includes('software')) {
    return 'saas';
  }
  if (lowerQuery.includes('fintech') || lowerQuery.includes('banking') || lowerQuery.includes('financial')) {
    return 'fintech';
  }
  if (lowerQuery.includes('healthcare') || lowerQuery.includes('medical')) {
    return 'healthcare';
  }
  if (lowerQuery.includes('education') || lowerQuery.includes('learning')) {
    return 'education';
  }
  
  return 'general';
}
