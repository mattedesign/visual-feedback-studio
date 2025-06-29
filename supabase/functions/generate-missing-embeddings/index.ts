
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmbeddingRequest {
  testMode?: boolean; // If true, process only 5 entries for testing
  batchSize?: number; // Override default batch size (default: 10)
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
}

interface OpenAIEmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 === GENERATE MISSING EMBEDDINGS FUNCTION START ===');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase configuration');
      throw new Error('Missing Supabase configuration');
    }

    if (!openaiApiKey) {
      console.error('❌ Missing OpenAI API key');
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request parameters
    const requestBody = await req.json().catch(() => ({}));
    const { testMode = false, batchSize = 10 }: EmbeddingRequest = requestBody;

    console.log('📋 Request parameters:', {
      testMode,
      batchSize,
      requestBody
    });

    // Find all knowledge entries missing embeddings
    console.log('🔍 Searching for knowledge entries missing embeddings...');
    
    let query = supabase
      .from('knowledge_entries')
      .select('id, title, content')
      .is('embedding', null)
      .order('created_at', { ascending: true });

    // If in test mode, limit to 5 entries
    if (testMode) {
      query = query.limit(5);
      console.log('🧪 Test mode enabled - processing max 5 entries');
    }

    const { data: missingEmbeddingEntries, error: fetchError } = await query;

    if (fetchError) {
      console.error('❌ Error fetching knowledge entries:', fetchError);
      throw new Error(`Failed to fetch knowledge entries: ${fetchError.message}`);
    }

    if (!missingEmbeddingEntries || missingEmbeddingEntries.length === 0) {
      console.log('✅ No knowledge entries missing embeddings found');
      return new Response(JSON.stringify({
        success: true,
        message: 'No knowledge entries missing embeddings',
        processed: 0,
        totalTokensUsed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📊 Found ${missingEmbeddingEntries.length} knowledge entries missing embeddings`);

    // Process entries in batches
    const batches: KnowledgeEntry[][] = [];
    for (let i = 0; i < missingEmbeddingEntries.length; i += batchSize) {
      batches.push(missingEmbeddingEntries.slice(i, i + batchSize));
    }

    console.log(`📦 Processing ${batches.length} batches of ${batchSize} entries each`);

    let totalProcessed = 0;
    let totalTokensUsed = 0;
    const results = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} entries)`);

      for (const entry of batch) {
        try {
          console.log(`📝 Generating embedding for entry: ${entry.id} - "${entry.title}"`);
          
          // Combine title and content for embedding
          const textForEmbedding = `${entry.title}\n\n${entry.content}`;
          
          // Generate embedding using OpenAI
          const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: textForEmbedding,
              model: 'text-embedding-3-small', // Cost-efficient model
            }),
          });

          if (!embeddingResponse.ok) {
            const errorText = await embeddingResponse.text();
            console.error(`❌ OpenAI API error for entry ${entry.id}:`, embeddingResponse.status, errorText);
            results.push({
              id: entry.id,
              title: entry.title,
              success: false,
              error: `OpenAI API error: ${embeddingResponse.status}`
            });
            continue;
          }

          const embeddingData: OpenAIEmbeddingResponse = await embeddingResponse.json();
          
          if (!embeddingData.data || !embeddingData.data[0] || !embeddingData.data[0].embedding) {
            console.error(`❌ Invalid embedding response for entry ${entry.id}:`, embeddingData);
            results.push({
              id: entry.id,
              title: entry.title,
              success: false,
              error: 'Invalid embedding response from OpenAI'
            });
            continue;
          }

          const embedding = embeddingData.data[0].embedding;
          totalTokensUsed += embeddingData.usage.total_tokens;

          console.log(`✅ Generated embedding for entry ${entry.id} (${embedding.length} dimensions, ${embeddingData.usage.total_tokens} tokens)`);

          // Update the knowledge entry with the embedding
          const { error: updateError } = await supabase
            .from('knowledge_entries')
            .update({ embedding: embedding })
            .eq('id', entry.id);

          if (updateError) {
            console.error(`❌ Error updating entry ${entry.id}:`, updateError);
            results.push({
              id: entry.id,
              title: entry.title,
              success: false,
              error: `Database update error: ${updateError.message}`
            });
            continue;
          }

          console.log(`💾 Successfully updated embedding for entry ${entry.id}`);
          totalProcessed++;
          
          results.push({
            id: entry.id,
            title: entry.title,
            success: true,
            tokensUsed: embeddingData.usage.total_tokens
          });

          // Small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ Unexpected error processing entry ${entry.id}:`, error);
          results.push({
            id: entry.id,
            title: entry.title,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Longer delay between batches to respect rate limits
      if (batchIndex < batches.length - 1) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log('📊 === EMBEDDING GENERATION COMPLETE ===');
    console.log(`✅ Successfully processed: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`🎯 Total tokens used: ${totalTokensUsed}`);

    // Log some failures for debugging
    if (failureCount > 0) {
      console.log('❌ Failed entries:', results.filter(r => !r.success).slice(0, 3));
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Embedding generation complete`,
      totalEntries: missingEmbeddingEntries.length,
      processed: successCount,
      failed: failureCount,
      totalTokensUsed,
      testMode,
      results: results.slice(0, 10) // Return first 10 results for review
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in generate-missing-embeddings function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to generate missing embeddings'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
