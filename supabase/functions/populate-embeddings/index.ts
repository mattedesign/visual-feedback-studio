
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
    console.log('=== Embedding Population Started ===');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all knowledge entries where embedding is null
    console.log('Fetching knowledge entries with null embeddings...');
    const { data: entries, error: fetchError } = await supabaseClient
      .from('knowledge_entries')
      .select('id, title, content')
      .is('embedding', null);

    if (fetchError) {
      console.error('Error fetching entries:', fetchError);
      throw new Error(`Failed to fetch entries: ${fetchError.message}`);
    }

    if (!entries || entries.length === 0) {
      console.log('No entries found with null embeddings');
      return new Response(JSON.stringify({
        success: true,
        message: 'No entries found with null embeddings',
        processed: 0,
        failed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${entries.length} entries to process`);

    // Process entries in batches to avoid rate limits
    const batchSize = 5; // Process 5 at a time to be safe with OpenAI rate limits
    const delay = 1000; // 1 second delay between batches
    
    let processed = 0;
    let failed = 0;
    const failedEntries = [];

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(entries.length / batchSize)}`);

      // Process batch in parallel
      const batchPromises = batch.map(async (entry) => {
        try {
          console.log(`Generating embedding for entry: ${entry.title}`);
          
          // Combine title and content for embedding
          const textToEmbed = `${entry.title} ${entry.content}`;
          
          // Generate embedding
          const embedding = await generateEmbedding(textToEmbed);
          
          // Update the entry with the embedding
          const { error: updateError } = await supabaseClient
            .from('knowledge_entries')
            .update({
              embedding: `[${embedding.join(',')}]`,
              updated_at: new Date().toISOString()
            })
            .eq('id', entry.id);

          if (updateError) {
            console.error(`Failed to update entry ${entry.id}:`, updateError);
            throw new Error(`Update failed: ${updateError.message}`);
          }

          console.log(`✅ Successfully processed: ${entry.title}`);
          return { success: true, id: entry.id, title: entry.title };
          
        } catch (error) {
          console.error(`❌ Failed to process entry ${entry.id}:`, error);
          return { success: false, id: entry.id, title: entry.title, error: error.message };
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      
      // Count results
      batchResults.forEach(result => {
        if (result.success) {
          processed++;
        } else {
          failed++;
          failedEntries.push({
            id: result.id,
            title: result.title,
            error: result.error
          });
        }
      });

      // Add delay between batches (except for the last batch)
      if (i + batchSize < entries.length) {
        console.log(`Waiting ${delay}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log('=== Embedding Population Completed ===');
    console.log(`Total processed: ${processed}`);
    console.log(`Total failed: ${failed}`);

    const response = {
      success: true,
      message: `Embedding population completed`,
      totalEntries: entries.length,
      processed,
      failed,
      failedEntries: failed > 0 ? failedEntries : undefined
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Embedding Population Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: 'Failed to populate embeddings'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.data || !result.data[0] || !result.data[0].embedding) {
      throw new Error('Invalid embedding response from OpenAI');
    }

    return result.data[0].embedding;
    
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}
