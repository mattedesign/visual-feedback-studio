
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  similarity?: number;
  tags?: string[];
}

interface RAGResponse {
  retrievedKnowledge: {
    relevantPatterns: KnowledgeEntry[];
    competitorInsights: KnowledgeEntry[];
  };
  enhancedPrompt: string;
  researchCitations: string[];
  industryContext: string;
  buildTimestamp: string;
  searchTermsUsed: string[];
  totalEntriesFound: number;
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

    const { userPrompt, imageUrls, imageAnnotations, analysisId } = await req.json()
    
    console.log('RAG Context Request:', {
      hasPrompt: !!userPrompt,
      promptLength: userPrompt?.length || 0,
      analysisId,
      imageCount: imageUrls?.length || 0
    });

    // Step 1: Extract UX-specific search terms from user prompt
    const searchTerms = extractUXSearchTerms(userPrompt || '');
    console.log('🔍 Extracted UX search terms:', searchTerms);

    // Step 2: Generate embeddings and search for relevant knowledge
    const allKnowledgeEntries: KnowledgeEntry[] = [];
    const processedTerms: string[] = [];
    
    for (const term of searchTerms) {
      try {
        console.log(`🔗 Processing search term: "${term}"`);
        
        // Generate embedding for this term
        const embedding = await generateEmbedding(term);
        console.log(`✅ Generated embedding for "${term}" (${embedding.length} dimensions)`);
        
        // Search knowledge base using the match_knowledge RPC function
        // FIXED: Pass embedding as array instead of string
        const { data: entries, error } = await supabaseClient.rpc('match_knowledge', {
          query_embedding: embedding, // Pass as array, not string
          match_threshold: 0.5, // Lower threshold to get more results
          match_count: 5
        });

        if (error) {
          console.error(`❌ Database error for term "${term}":`, error);
          continue;
        }

        if (entries && entries.length > 0) {
          console.log(`✅ Found ${entries.length} entries for "${term}":`, 
            entries.map((e: any) => e.title).join(', '));
          
          // Transform entries to match expected format
          const transformedEntries = entries.map((entry: any) => ({
            id: entry.id,
            title: entry.title,
            content: entry.content,
            source: entry.source || 'UX Research Database',
            category: entry.category,
            similarity: entry.similarity,
            tags: entry.tags || []
          }));
          
          allKnowledgeEntries.push(...transformedEntries);
          processedTerms.push(term);
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

    // Step 4: Separate relevant patterns from competitor insights
    const relevantPatterns = uniqueEntries.filter(entry => 
      entry.category !== 'competitor-insights'
    );
    const competitorInsights = uniqueEntries.filter(entry => 
      entry.category === 'competitor-insights'
    );

    // Step 5: Build enhanced prompt with research context
    const enhancedPrompt = buildEnhancedPrompt(userPrompt || '', uniqueEntries);

    // Step 6: Build research citations
    const researchCitations = uniqueEntries.map(entry => 
      `${entry.title} - ${entry.source} (${((entry.similarity || 0) * 100).toFixed(1)}% match)`
    );

    // Step 7: Infer industry context
    const industryContext = inferIndustryContext(userPrompt);

    // Step 8: Prepare final RAG response
    const ragResponse: RAGResponse = {
      retrievedKnowledge: {
        relevantPatterns,
        competitorInsights
      },
      enhancedPrompt,
      researchCitations,
      industryContext,
      buildTimestamp: new Date().toISOString(),
      searchTermsUsed: processedTerms,
      totalEntriesFound: uniqueEntries.length
    };

    console.log('✅ RAG Context Built Successfully:', {
      relevantPatterns: relevantPatterns.length,
      competitorInsights: competitorInsights.length,
      totalEntries: uniqueEntries.length,
      citations: researchCitations.length,
      industry: industryContext,
      searchTermsProcessed: processedTerms.length,
      enhancedPromptLength: enhancedPrompt.length
    });

    return new Response(JSON.stringify(ragResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ RAG Context Builder Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to build RAG context',
      retrievedKnowledge: {
        relevantPatterns: [],
        competitorInsights: []
      },
      enhancedPrompt: '',
      researchCitations: [],
      industryContext: 'general',
      buildTimestamp: new Date().toISOString(),
      searchTermsUsed: [],
      totalEntriesFound: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Extract UX-specific search terms from user prompt
function extractUXSearchTerms(userPrompt: string): string[] {
  const terms = new Set<string>();
  
  // Always include fundamental UX terms
  terms.add('UX best practices');
  terms.add('user experience design');
  
  const lowerPrompt = userPrompt.toLowerCase();
  
  // UI Component terms
  if (lowerPrompt.includes('button')) {
    terms.add('button design');
    terms.add('button usability');
    terms.add('CTA design');
  }
  
  if (lowerPrompt.includes('form')) {
    terms.add('form design');
    terms.add('form usability');
    terms.add('input field design');
  }
  
  if (lowerPrompt.includes('navigation')) {
    terms.add('navigation design');
    terms.add('menu usability');
    terms.add('information architecture');
  }
  
  // Accessibility terms
  if (lowerPrompt.includes('accessibility') || lowerPrompt.includes('contrast')) {
    terms.add('accessibility guidelines');
    terms.add('WCAG compliance');
    terms.add('inclusive design');
    terms.add('color contrast');
  }
  
  // Conversion terms
  if (lowerPrompt.includes('conversion') || lowerPrompt.includes('cta')) {
    terms.add('conversion optimization');
    terms.add('call to action');
    terms.add('user engagement');
  }
  
  // Mobile/responsive terms
  if (lowerPrompt.includes('mobile') || lowerPrompt.includes('responsive')) {
    terms.add('mobile UX');
    terms.add('responsive design');
    terms.add('touch interface');
  }
  
  // Usability terms
  if (lowerPrompt.includes('usability') || lowerPrompt.includes('user')) {
    terms.add('usability heuristics');
    terms.add('user testing');
    terms.add('user behavior');
  }
  
  // Add the original prompt as a search term if it's a reasonable length
  if (userPrompt.length > 10 && userPrompt.length < 200) {
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

// Remove duplicate entries based on ID and sort by similarity
function removeDuplicateEntries(entries: KnowledgeEntry[]): KnowledgeEntry[] {
  const seen = new Set<string>();
  const unique = entries.filter(entry => {
    if (seen.has(entry.id)) {
      return false;
    }
    seen.add(entry.id);
    return true;
  });
  
  // Sort by similarity score (highest first)
  return unique.sort((a, b) => (b.similarity || 0) - (a.similarity || 0)).slice(0, 15);
}

// Build enhanced prompt with research context
function buildEnhancedPrompt(userPrompt: string, knowledgeEntries: KnowledgeEntry[]): string {
  let prompt = `You are an expert UX analyst with access to research-backed insights.\n\n`;
  
  if (userPrompt.trim()) {
    prompt += `PRIMARY REQUEST: ${userPrompt.trim()}\n\n`;
  }
  
  if (knowledgeEntries.length > 0) {
    prompt += `RESEARCH-BACKED CONTEXT:\n`;
    prompt += `Your analysis should be informed by these ${knowledgeEntries.length} research insights:\n\n`;
    
    knowledgeEntries.forEach((entry, i) => {
      prompt += `${i + 1}. **${entry.title}** (${((entry.similarity || 0) * 100).toFixed(1)}% match)\n`;
      prompt += `   Content: ${entry.content.substring(0, 250)}...\n`;
      prompt += `   Source: ${entry.source}\n`;
      prompt += `   Category: ${entry.category}\n`;
      if (entry.tags && entry.tags.length > 0) {
        prompt += `   Tags: ${entry.tags.join(', ')}\n`;
      }
      prompt += `\n`;
    });
    
    prompt += `ANALYSIS INSTRUCTIONS:\n`;
    prompt += `- Ground all recommendations in the provided research insights\n`;
    prompt += `- Cite specific sources when making claims\n`;
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
function inferIndustryContext(prompt?: string): string {
  if (!prompt) return 'general';
  const p = prompt.toLowerCase();
  
  if (p.includes('ecommerce') || p.includes('shop') || p.includes('cart') || p.includes('checkout')) {
    return 'ecommerce';
  }
  if (p.includes('saas') || p.includes('software') || p.includes('dashboard')) {
    return 'saas';
  }
  if (p.includes('fintech') || p.includes('finance') || p.includes('banking')) {
    return 'fintech';
  }
  if (p.includes('healthcare') || p.includes('medical') || p.includes('health')) {
    return 'healthcare';
  }
  if (p.includes('education') || p.includes('learning') || p.includes('course')) {
    return 'education';
  }
  
  return 'general';
}
