
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
      analysisId,
      userPrompt: userPrompt?.substring(0, 100) || 'none'
    });

    // Step 1: Extract search terms from user prompt
    const searchTerms = extractSearchTerms(userPrompt || '');
    console.log('🔍 Extracted search terms:', searchTerms);

    // Step 2: Generate embeddings and search for each term
    const allKnowledgeEntries = [];
    
    for (const term of searchTerms) {
      try {
        console.log(`🔗 Processing search term: "${term}"`);
        
        // Generate embedding for this term
        const embedding = await generateEmbedding(term);
        console.log(`✅ Generated embedding for "${term}" (${embedding.length} dimensions)`);
        
        // Search knowledge base using the match_knowledge RPC function
        const { data: entries, error } = await supabaseClient.rpc('match_knowledge', {
          query_embedding: `[${embedding.join(',')}]`,
          match_threshold: 0.6, // Lower threshold to get more results
          match_count: 5
        });

        if (error) {
          console.error(`❌ Database error for term "${term}":`, error);
          continue;
        }

        if (entries && entries.length > 0) {
          console.log(`✅ Found ${entries.length} entries for "${term}":`, 
            entries.map(e => e.title).join(', '));
          allKnowledgeEntries.push(...entries);
        } else {
          console.log(`ℹ️ No entries found for "${term}"`);
        }

      } catch (error) {
        console.error(`❌ Error processing term "${term}":`, error);
        continue;
      }
    }

    // Step 3: Remove duplicates and sort by similarity
    const uniqueEntries = removeDuplicateEntries(allKnowledgeEntries);
    console.log(`📊 Total unique knowledge entries found: ${uniqueEntries.length}`);

    // Step 4: Build enhanced prompt with the retrieved knowledge
    const enhancedPrompt = buildEnhancedPrompt(userPrompt || '', uniqueEntries);

    // Step 5: Prepare response
    const ragContext = {
      retrievedKnowledge: {
        relevantPatterns: uniqueEntries.map(entry => ({
          id: entry.id,
          title: entry.title,
          content: entry.content,
          category: entry.category,
          source: entry.source || 'UX Research Database',
          similarity: entry.similarity,
          tags: entry.tags || []
        })),
        competitorInsights: []
      },
      enhancedPrompt,
      researchCitations: uniqueEntries.map(entry => 
        `${entry.title} - ${entry.source || 'UX Research Database'} (${(entry.similarity * 100).toFixed(1)}% match)`
      ),
      industryContext: inferIndustry(userPrompt),
      buildTimestamp: new Date().toISOString(),
      searchTermsUsed: searchTerms,
      totalEntriesFound: uniqueEntries.length
    };

    console.log('✅ RAG Context Built Successfully:', {
      knowledgeEntries: uniqueEntries.length,
      citations: ragContext.researchCitations.length,
      industry: ragContext.industryContext,
      promptLength: enhancedPrompt.length,
      searchTerms: searchTerms,
      topEntries: uniqueEntries.slice(0, 3).map(e => e.title)
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

// Extract meaningful search terms from user prompt
function extractSearchTerms(userPrompt: string): string[] {
  const terms = new Set<string>();
  
  // Always include base terms
  terms.add('UX best practices');
  terms.add('design guidelines');
  
  const lowerPrompt = userPrompt.toLowerCase();
  
  // UI/UX specific terms
  if (lowerPrompt.includes('button')) {
    terms.add('button design');
    terms.add('button UX');
    terms.add('button color psychology');
  }
  
  if (lowerPrompt.includes('accessibility')) {
    terms.add('accessibility guidelines');
    terms.add('WCAG standards');
    terms.add('inclusive design');
  }
  
  if (lowerPrompt.includes('contrast')) {
    terms.add('color contrast');
    terms.add('accessibility contrast');
    terms.add('WCAG color contrast');
  }
  
  if (lowerPrompt.includes('form')) {
    terms.add('form design');
    terms.add('form usability');
    terms.add('input design');
  }
  
  if (lowerPrompt.includes('navigation')) {
    terms.add('navigation design');
    terms.add('menu design');
    terms.add('user navigation');
  }
  
  if (lowerPrompt.includes('mobile')) {
    terms.add('mobile UX');
    terms.add('responsive design');
    terms.add('mobile usability');
  }
  
  if (lowerPrompt.includes('usability')) {
    terms.add('usability heuristics');
    terms.add('Nielsen heuristics');
    terms.add('user testing');
  }
  
  // Add the full prompt as a search term if it's not too long
  if (userPrompt.length > 5 && userPrompt.length < 100) {
    terms.add(userPrompt);
  }
  
  return Array.from(terms);
}

// Generate embeddings using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = Deno.env.get('OPENAI_API_KEY_RAG');
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY_RAG not configured');
  }

  console.log(`🔗 Generating embedding for: "${text.substring(0, 50)}..."`);
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  return result.data[0].embedding;
}

// Remove duplicate entries based on ID
function removeDuplicateEntries(entries: any[]): any[] {
  const seen = new Set();
  return entries.filter(entry => {
    if (seen.has(entry.id)) {
      return false;
    }
    seen.add(entry.id);
    return true;
  }).sort((a, b) => (b.similarity || 0) - (a.similarity || 0)).slice(0, 10);
}

// Build enhanced prompt with research context
function buildEnhancedPrompt(userPrompt: string, knowledgeEntries: any[]): string {
  let prompt = `You are an expert UX analyst with access to research-backed insights.\n\n`;
  
  if (userPrompt.trim()) {
    prompt += `PRIMARY REQUEST: ${userPrompt.trim()}\n\n`;
  }
  
  if (knowledgeEntries.length > 0) {
    prompt += `RESEARCH-BACKED CONTEXT:\n`;
    prompt += `Your analysis should be informed by these ${knowledgeEntries.length} research insights:\n\n`;
    
    knowledgeEntries.forEach((entry, i) => {
      prompt += `${i + 1}. **${entry.title}** (${(entry.similarity * 100).toFixed(1)}% match)\n`;
      prompt += `   Content: ${entry.content.substring(0, 300)}...\n`;
      prompt += `   Source: ${entry.source || 'UX Research Database'}\n`;
      prompt += `   Category: ${entry.category}\n`;
      if (entry.tags && entry.tags.length > 0) {
        prompt += `   Tags: ${entry.tags.join(', ')}\n`;
      }
      prompt += `\n`;
    });
    
    prompt += `ANALYSIS INSTRUCTIONS:\n`;
    prompt += `- Ground all recommendations in the provided research insights\n`;
    prompt += `- Cite specific sources when making claims (e.g., "According to Nielsen's Heuristics...")\n`;
    prompt += `- Reference similarity scores to indicate confidence in research relevance\n`;
    prompt += `- Provide actionable, research-backed recommendations\n`;
    prompt += `- Include quantitative data or benchmarks when available\n\n`;
  } else {
    prompt += `Note: No specific research entries found for this query. Provide analysis based on established UX principles.\n\n`;
  }
  
  prompt += `Please provide detailed, research-backed UX feedback annotations in JSON format.`;
  return prompt;
}

// Infer industry context from prompt
function inferIndustry(prompt?: string): string {
  if (!prompt) return 'general';
  const p = prompt.toLowerCase();
  if (p.includes('ecommerce') || p.includes('shop') || p.includes('cart')) return 'ecommerce';
  if (p.includes('saas') || p.includes('software')) return 'saas';
  if (p.includes('fintech') || p.includes('finance')) return 'fintech';
  if (p.includes('healthcare') || p.includes('medical')) return 'healthcare';
  return 'general';
}
