import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestResult {
  model: string;
  status: 'success' | 'failed';
  error?: string;
  responseTime?: number;
}

console.log('🧪 Claude Authentication Test Function - Starting up');

serve(async (req) => {
  console.log('📨 Test request received:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicApiKey) {
      console.error('❌ ANTHROPIC_API_KEY not found in environment');
      return new Response(JSON.stringify({
        success: false,
        error: 'Anthropic API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Clean the API key
    const cleanApiKey = anthropicApiKey.trim().replace(/[\r\n\t]/g, '');
    const preview = cleanApiKey.substring(0, 15);
    
    console.log('🔍 API Key Analysis:', {
      exists: !!cleanApiKey,
      length: cleanApiKey.length,
      preview: preview + '...',
      startsCorrectly: cleanApiKey.startsWith('sk-ant-')
    });

    // Test models in order of reliability
    const testModels = [
      'claude-3-5-haiku-20241022',    // Most stable
      'claude-3-5-sonnet-20241022',   // Very stable
      'claude-3-opus-20240229',       // Established
      'claude-3-haiku-20240307'       // Legacy stable
    ];

    const results: TestResult[] = [];

    for (const model of testModels) {
      console.log(`🧪 Testing model: ${model}`);
      const startTime = Date.now();
      
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cleanApiKey}`,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Test auth' }]
          })
        });

        const responseTime = Date.now() - startTime;
        const responseText = await response.text();

        if (response.ok) {
          console.log(`✅ ${model}: SUCCESS (${responseTime}ms)`);
          results.push({
            model,
            status: 'success',
            responseTime
          });
        } else {
          console.error(`❌ ${model}: FAILED (${response.status}) - ${responseText.substring(0, 200)}`);
          results.push({
            model,
            status: 'failed',
            error: `${response.status}: ${responseText.substring(0, 100)}`
          });
        }
      } catch (error) {
        console.error(`❌ ${model}: ERROR - ${error.message}`);
        results.push({
          model,
          status: 'failed',
          error: error.message
        });
      }
    }

    const successfulModels = results.filter(r => r.status === 'success');
    const failedModels = results.filter(r => r.status === 'failed');

    console.log(`📊 Test Summary: ${successfulModels.length}/${testModels.length} models successful`);

    return new Response(JSON.stringify({
      success: successfulModels.length > 0,
      summary: {
        totalTested: testModels.length,
        successful: successfulModels.length,
        failed: failedModels.length
      },
      results,
      recommendation: successfulModels.length > 0 
        ? `Use ${successfulModels[0].model} for best reliability`
        : 'API key authentication failed for all models. Please regenerate your API key.',
      apiKeyAnalysis: {
        format: cleanApiKey.startsWith('sk-ant-') ? 'valid' : 'invalid',
        length: cleanApiKey.length,
        preview: preview + '...'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Test function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});