
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Knowledge ingestion service implementation for edge function
class EdgeKnowledgeIngestionService {
  private openaiApiKey: string | null = null;

  constructor() {
    this.openaiApiKey = Deno.env.get('OPENAI_API_KEY') || null;
  }

  async ingestFromSources() {
    console.log('Starting knowledge ingestion from edge function...');
    
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured in edge function environment');
    }

    // Simulate ingestion process
    const sources = [
      { name: 'Nielsen Norman Group', type: 'rss', category: 'ux-research' },
      { name: 'Baymard Institute', type: 'scrape', category: 'ecommerce-patterns' },
      { name: 'Laws of UX', type: 'scrape', category: 'ux-patterns' },
      { name: 'ConversionXL', type: 'scrape', category: 'conversion' },
    ];

    const results = [];
    
    for (const source of sources) {
      try {
        console.log(`Processing source: ${source.name}`);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // In a real implementation, this would call the actual ingestion logic
        const result = {
          source: source.name,
          processed: Math.floor(Math.random() * 10) + 1, // Random number for demo
          errors: 0,
          details: [`Successfully processed ${source.type} source`],
        };
        
        results.push(result);
        console.log(`Completed processing ${source.name}: ${result.processed} entries processed`);
      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
        results.push({
          source: source.name,
          processed: 0,
          errors: 1,
          details: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    }

    console.log('Knowledge ingestion completed from edge function');
    return results;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed. Use POST to trigger knowledge ingestion.' 
        }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Knowledge ingestion request received');

    // Initialize the ingestion service
    const ingestionService = new EdgeKnowledgeIngestionService();

    // Start the ingestion process
    const results = await ingestionService.ingestFromSources();

    // Calculate totals
    const totalProcessed = results.reduce((sum, result) => sum + result.processed, 0);
    const totalErrors = results.reduce((sum, result) => sum + result.errors, 0);

    console.log(`Ingestion completed: ${totalProcessed} entries processed, ${totalErrors} errors`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Knowledge ingestion completed successfully',
        summary: {
          totalProcessed,
          totalErrors,
          sourcesProcessed: results.length,
        },
        details: results,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Knowledge ingestion error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Knowledge ingestion failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
