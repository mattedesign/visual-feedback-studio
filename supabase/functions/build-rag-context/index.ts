
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
    console.log('Environment Debug:');
    
    // Step 1: Verify Environment Variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY_RAG');
    
    console.log('SUPABASE_URL exists:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey);
    console.log('OPENAI_API_KEY_RAG exists:', !!openaiKey);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    if (!openaiKey) {
      throw new Error('Missing OPENAI_API_KEY_RAG environment variable');
    }

    // Initialize Supabase client with service role key
    console.log('Initializing Supabase client with service role...');
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { userPrompt, imageUrls, imageAnnotations, analysisId } = await req.json()
    
    console.log('RAG Context Request:', {
      hasPrompt: !!userPrompt,
      promptLength: userPrompt?.length || 0,
      analysisId,
      imageCount: imageUrls?.length || 0
    });

    // Step 2: Test Direct Database Access First
    console.log('🔍 Testing direct database access...');
    const { data: testEntries, error: testError } = await supabaseClient
      .from('knowledge_entries')
      .select('id, title, category')
      .limit(3);

    if (testError) {
      console.error('❌ Direct database access failed:', testError);
      throw new Error(`Database access failed: ${testError.message}`);
    }

    console.log('✅ Direct database access successful:', testEntries?.length || 0, 'entries found');
    if (testEntries && testEntries.length > 0) {
      console.log('Sample entries:', testEntries.map(e => e.title));
    }

    // Step 3: Extract search terms from user prompt
    const searchTerms = extractUXSearchTerms(userPrompt || '');
    console.log('🔍 Extracted UX search terms:', searchTerms);

    // Step 4: Process search terms with progressive threshold fallback
    const allKnowledgeEntries: KnowledgeEntry[] = [];
    const processedTerms: string[] = [];
    const thresholds = [0.3, 0.2, 0.1, 0.05]; // Progressive fallback thresholds
    
    for (const term of searchTerms.slice(0, 5)) { // Process more terms
      try {
        console.log(`🔗 Processing search term: "${term}"`);
        
        // Generate embedding for this term
        const embedding = await generateEmbedding(term, openaiKey);
        console.log(`✅ Generated embedding for "${term}" (${embedding.length} dimensions)`);
        console.log(`📊 Embedding sample values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
        
        let entriesFound = false;
        
        // Try progressive thresholds until we find matches
        for (const threshold of thresholds) {
          console.log(`🔍 Trying threshold ${threshold} for term "${term}"`);
          
          const { data: entries, error } = await supabaseClient.rpc('match_knowledge', {
            query_embedding: embedding,
            match_threshold: threshold,
            match_count: 5
          });

          if (error) {
            console.error(`❌ RPC error for term "${term}" with threshold ${threshold}:`, error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            continue;
          }

          if (entries && entries.length > 0) {
            console.log(`✅ Found ${entries.length} entries for "${term}" with threshold ${threshold}:`);
            entries.forEach((entry: any, idx: number) => {
              console.log(`  ${idx + 1}. "${entry.title}" (similarity: ${entry.similarity?.toFixed(4) || 'N/A'})`);
            });
            
            // Transform entries to match expected format
            const transformedEntries = entries.map((entry: any) => ({
              id: entry.id,
              title: entry.title,
              content: entry.content,
              source: entry.source || 'UX Research Database',
              category: entry.category,
              similarity: entry.similarity || 0,
              tags: entry.tags || []
            }));
            
            allKnowledgeEntries.push(...transformedEntries);
            processedTerms.push(term);
            entriesFound = true;
            break; // Stop trying lower thresholds for this term
          } else {
            console.log(`ℹ️ No entries found for "${term}" with threshold ${threshold}`);
          }
        }

        if (!entriesFound) {
          console.log(`⚠️ No entries found for "${term}" with any threshold`);
          
          // Fallback: Try direct database search as backup
          console.log(`🔄 Attempting fallback search for "${term}"`);
          const { data: fallbackEntries, error: fallbackError } = await supabaseClient
            .from('knowledge_entries')
            .select('id, title, content, category, tags')
            .or(`title.ilike.%${term}%,content.ilike.%${term}%`)
            .limit(2);

          if (!fallbackError && fallbackEntries && fallbackEntries.length > 0) {
            console.log(`✅ Fallback search found ${fallbackEntries.length} entries for "${term}"`);
            const fallbackTransformed = fallbackEntries.map((entry: any) => ({
              id: entry.id,
              title: entry.title,
              content: entry.content,
              source: 'UX Research Database',
              category: entry.category,
              similarity: 0.1, // Low similarity for fallback results
              tags: entry.tags || []
            }));
            allKnowledgeEntries.push(...fallbackTransformed);
            processedTerms.push(term);
          }
        }

      } catch (error) {
        console.error(`❌ Error processing term "${term}":`, error);
        continue;
      }
    }

    // Step 5: If still no results, try a broader fallback query
    if (allKnowledgeEntries.length === 0) {
      console.log('🔄 No entries found with any search terms, trying broad fallback...');
      const { data: broadEntries, error: broadError } = await supabaseClient
        .from('knowledge_entries')
        .select('id, title, content, category, tags')
        .limit(3);

      if (!broadError && broadEntries && broadEntries.length > 0) {
        console.log(`✅ Broad fallback found ${broadEntries.length} entries`);
        const broadTransformed = broadEntries.map((entry: any) => ({
          id: entry.id,
          title: entry.title,
          content: entry.content,
          source: 'UX Research Database',
          category: entry.category,
          similarity: 0.05, // Very low similarity for broad fallback
          tags: entry.tags || []
        }));
        allKnowledgeEntries.push(...broadTransformed);
        processedTerms.push('general UX knowledge');
      }
    }

    // Step 6: Remove duplicates and sort by similarity
    const uniqueEntries = removeDuplicateEntries(allKnowledgeEntries);
    console.log(`📊 Total unique knowledge entries found: ${uniqueEntries.length}`);
    
    if (uniqueEntries.length > 0) {
      console.log('📈 Entries by similarity:');
      uniqueEntries.forEach((entry, idx) => {
        console.log(`  ${idx + 1}. "${entry.title}" (${((entry.similarity || 0) * 100).toFixed(1)}%)`);
      });
    }

    // Step 7: Separate relevant patterns from competitor insights
    const relevantPatterns = uniqueEntries.filter(entry => 
      entry.category !== 'competitor-insights'
    );
    const competitorInsights = uniqueEntries.filter(entry => 
      entry.category === 'competitor-insights'
    );

    // Step 8: Build enhanced prompt with research context
    const enhancedPrompt = buildEnhancedPrompt(userPrompt || '', uniqueEntries);

    // Step 9: Build research citations
    const researchCitations = uniqueEntries.map(entry => 
      `${entry.title} - ${entry.source} (${((entry.similarity || 0) * 100).toFixed(1)}% match)`
    );

    // Step 10: Infer industry context
    const industryContext = inferIndustryContext(userPrompt);

    // Step 11: Prepare final RAG response
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
    console.error('Error stack:', error.stack);
    
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

// Generate embeddings using OpenAI with better error handling
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  console.log(`🔗 Generating embedding for: "${text.substring(0, 50)}..."`);
  
  try {
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
      console.error('OpenAI API Error Response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.data || !result.data[0] || !result.data[0].embedding) {
      console.error('Invalid OpenAI response structure:', result);
      throw new Error('Invalid embedding response from OpenAI');
    }
    
    const embedding = result.data[0].embedding;
    console.log(`✅ Successfully generated embedding with ${embedding.length} dimensions`);
    
    return embedding;
  } catch (error) {
    console.error('Error in generateEmbedding:', error);
    throw error;
  }
}

// Enhanced UX search terms extraction
function extractUXSearchTerms(userPrompt: string): string[] {
  const terms = new Set<string>();
  
  // Always include fundamental UX terms
  terms.add('UX best practices');
  terms.add('user experience design');
  
  const lowerPrompt = userPrompt.toLowerCase();
  
  // Enhanced keyword detection
  const keywordMappings = {
    'button': ['button design', 'button usability', 'CTA design'],
    'form': ['form design', 'form usability', 'form validation'],
    'navigation': ['navigation design', 'menu design', 'user navigation'],
    'accessibility': ['accessibility guidelines', 'color contrast', 'WCAG compliance'],
    'conversion': ['conversion optimization', 'call to action', 'conversion rate'],
    'mobile': ['mobile design', 'responsive design', 'mobile UX'],
    'layout': ['layout design', 'page layout', 'visual hierarchy'],
    'color': ['color theory', 'color psychology', 'brand colors'],
    'typography': ['typography design', 'font selection', 'readability'],
    'search': ['search functionality', 'search UX', 'search interface']
  };
  
  // Add terms based on keywords found in prompt
  for (const [keyword, relatedTerms] of Object.entries(keywordMappings)) {
    if (lowerPrompt.includes(keyword)) {
      relatedTerms.forEach(term => terms.add(term));
    }
  }
  
  // Add the original prompt as a search term if reasonable length
  if (userPrompt.length > 10 && userPrompt.length < 200) {
    terms.add(userPrompt);
  }
  
  const termsArray = Array.from(terms);
  console.log(`🔍 Generated ${termsArray.length} search terms from prompt analysis`);
  
  return termsArray;
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

// Enhanced prompt building with better context
function buildEnhancedPrompt(userPrompt: string, knowledgeEntries: KnowledgeEntry[]): string {
  let prompt = `You are an expert UX analyst with access to research-backed insights.\n\n`;
  
  if (userPrompt.trim()) {
    prompt += `PRIMARY REQUEST: ${userPrompt.trim()}\n\n`;
  }
  
  if (knowledgeEntries.length > 0) {
    prompt += `RESEARCH-BACKED CONTEXT:\n`;
    prompt += `Your analysis should be informed by these ${knowledgeEntries.length} research insights:\n\n`;
    
    knowledgeEntries.forEach((entry, i) => {
      const similarityPercentage = ((entry.similarity || 0) * 100).toFixed(1);
      prompt += `${i + 1}. **${entry.title}** (${similarityPercentage}% relevance)\n`;
      prompt += `   Content: ${entry.content.substring(0, 300)}...\n`;
      prompt += `   Source: ${entry.source}\n`;
      prompt += `   Category: ${entry.category}\n\n`;
    });
    
    prompt += `ANALYSIS INSTRUCTIONS:\n`;
    prompt += `- Ground all recommendations in the provided research insights\n`;
    prompt += `- Cite specific sources when making claims\n`;
    prompt += `- Provide actionable, research-backed recommendations\n`;
    prompt += `- Prioritize insights with higher relevance scores\n\n`;
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
  
  const industryKeywords = {
    'ecommerce': ['ecommerce', 'shop', 'cart', 'checkout', 'product', 'purchase'],
    'saas': ['saas', 'software', 'dashboard', 'app', 'platform'],
    'fintech': ['fintech', 'finance', 'banking', 'payment', 'money'],
    'healthcare': ['healthcare', 'medical', 'patient', 'doctor', 'health'],
    'education': ['education', 'learning', 'course', 'student', 'teach']
  };
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => p.includes(keyword))) {
      return industry;
    }
  }
  
  return 'general';
}
