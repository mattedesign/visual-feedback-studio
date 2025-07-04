import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Testing Claude API Authentication v2');
    console.log('🕐 Test timestamp:', new Date().toISOString());

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicApiKey) {
      console.error('❌ ANTHROPIC_API_KEY not found in environment variables');
      return new Response(JSON.stringify({
        success: false,
        error: 'ANTHROPIC_API_KEY not configured',
        recommendation: 'Please add your Claude API key to Supabase secrets',
        actionRequired: 'ADD_API_KEY'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Clean the API key
    const cleanApiKey = anthropicApiKey.trim().replace(/[\r\n\t\f\v\s]/g, '');
    
    console.log('🔍 API Key Analysis:', {
      length: cleanApiKey.length,
      startsCorrectly: cleanApiKey.startsWith('sk-ant-'),
      structure: cleanApiKey.substring(0, 7) + '***' + cleanApiKey.substring(cleanApiKey.length - 4)
    });

    // Test the API key
    console.log('🧪 Making test request to Claude API...');
    
    const testController = new AbortController();
    const timeoutId = setTimeout(() => testController.abort(), 15000);

    const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': cleanApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Test' }]
      }),
      signal: testController.signal
    });

    clearTimeout(timeoutId);

    console.log('📊 Test Response:', {
      status: testResponse.status,
      statusText: testResponse.statusText,
      headers: Object.fromEntries(testResponse.headers.entries())
    });

    const responseBody = await testResponse.text();
    console.log('📄 Response body (first 300 chars):', responseBody.substring(0, 300));

    // Analyze the response
    if (testResponse.status === 200) {
      console.log('✅ SUCCESS: Claude API key is working correctly');
      return new Response(JSON.stringify({
        success: true,
        status: 'API_KEY_VALID',
        message: 'Claude API key is working correctly',
        apiKeyStatus: 'VALID',
        recommendation: 'Your Claude API key is working. The issue may be elsewhere in the analysis pipeline.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (testResponse.status === 401) {
      console.error('❌ AUTHENTICATION FAILED: API key is invalid');
      return new Response(JSON.stringify({
        success: false,
        status: 'AUTHENTICATION_FAILED',
        error: 'Claude API key is invalid or expired',
        apiKeyStatus: 'INVALID',
        recommendation: 'Your Claude API key is invalid, expired, or revoked. Please regenerate a new API key.',
        actionRequired: 'REGENERATE_API_KEY',
        instructions: [
          '1. Go to https://console.anthropic.com/settings/keys',
          '2. Create a new API key',
          '3. Copy the new key',
          '4. Update the ANTHROPIC_API_KEY secret in Supabase'
        ]
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (testResponse.status === 403) {
      console.error('❌ FORBIDDEN: API key lacks permissions');
      return new Response(JSON.stringify({
        success: false,
        status: 'PERMISSION_DENIED',
        error: 'Claude API key lacks required permissions',
        apiKeyStatus: 'INSUFFICIENT_PERMISSIONS',
        recommendation: 'Your API key may not have the required permissions or your account may need verification.',
        actionRequired: 'CHECK_PERMISSIONS'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (testResponse.status === 429) {
      console.warn('⚠️ RATE LIMITED: API key is valid but rate limited');
      return new Response(JSON.stringify({
        success: true,
        status: 'RATE_LIMITED',
        message: 'Claude API key is valid but currently rate limited',
        apiKeyStatus: 'VALID_BUT_RATE_LIMITED',
        recommendation: 'Your API key is working but you are currently rate limited. Wait a moment and try again.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Other status codes
    console.warn(`⚠️ UNEXPECTED STATUS: ${testResponse.status}`);
    return new Response(JSON.stringify({
      success: false,
      status: 'UNEXPECTED_RESPONSE',
      error: `Unexpected response: ${testResponse.status} ${testResponse.statusText}`,
      apiKeyStatus: 'UNKNOWN',
      recommendation: 'Received an unexpected response from Claude API. Check the Anthropic status page.',
      responseBody: responseBody.substring(0, 500)
    }), {
      status: testResponse.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    
    if (error.name === 'AbortError') {
      return new Response(JSON.stringify({
        success: false,
        status: 'TIMEOUT',
        error: 'Request to Claude API timed out',
        recommendation: 'Network timeout occurred. Check your internet connection or try again later.'
      }), {
        status: 408,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      status: 'TEST_ERROR',
      error: error.message,
      recommendation: 'An error occurred while testing the API key. Check the logs for more details.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
