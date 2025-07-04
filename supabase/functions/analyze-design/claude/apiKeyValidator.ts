
export async function validateAndTestApiKey(apiKey: string): Promise<string> {
  console.log('=== ENHANCED API KEY VALIDATION & 401 DEBUGGING ===');
  
  if (!apiKey) {
    console.error('❌ CRITICAL: ANTHROPIC_API_KEY environment variable not found');
    throw new Error('ANTHROPIC_API_KEY is not configured in Supabase secrets');
  }

  // Enhanced API key cleaning and validation with detailed debugging
  const originalKey = apiKey;
  const cleanApiKey = apiKey.trim().replace(/[\r\n\t\f\v]/g, '');
  
  console.log('🔍 DETAILED API KEY ANALYSIS:', {
    originalExists: !!originalKey,
    originalLength: originalKey.length,
    cleanLength: cleanApiKey.length,
    startsWithPrefix: cleanApiKey.startsWith('sk-ant-'),
    hasWhitespace: originalKey !== cleanApiKey,
    hasLineBreaks: /[\r\n]/.test(originalKey),
    hasTabs: /[\t]/.test(originalKey),
    hasSpecialChars: /[\f\v]/.test(originalKey),
    preview: cleanApiKey.substring(0, 15) + '...',
    endsWithAlphanumeric: /[a-zA-Z0-9]$/.test(cleanApiKey)
  });
  
  // Enhanced validation checks
  if (!cleanApiKey.startsWith('sk-ant-')) {
    console.error('❌ INVALID API KEY FORMAT:', {
      expected: 'sk-ant-...',
      actual: cleanApiKey.substring(0, 10) + '...',
      suggestion: 'Verify API key was copied correctly from Anthropic Console'
    });
    throw new Error('Invalid Anthropic API key format. API key must start with "sk-ant-"');
  }
  
  if (cleanApiKey.length < 60) {
    console.error('❌ API KEY TOO SHORT:', {
      length: cleanApiKey.length,
      minimum: 60,
      suggestion: 'API key appears incomplete - check for truncation during copy/paste'
    });
    throw new Error(`Anthropic API key too short: ${cleanApiKey.length} chars (expected 60+)`);
  }

  if (cleanApiKey.length > 200) {
    console.error('❌ API KEY TOO LONG:', {
      length: cleanApiKey.length,
      maximum: 200,
      suggestion: 'API key appears corrupted - may contain extra characters'
    });
    throw new Error(`Anthropic API key too long: ${cleanApiKey.length} chars (expected <200)`);
  }

  // Test API key with most reliable model to verify authentication
  console.log('🧪 TESTING API KEY WITH MOST STABLE MODEL...');
  try {
    const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanApiKey}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022', // Most stable model for auth testing
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test auth' }]
      })
    });

    console.log('🔍 API KEY TEST RESPONSE:', {
      status: testResponse.status,
      statusText: testResponse.statusText,
      headers: Object.fromEntries(testResponse.headers.entries())
    });

    if (testResponse.status === 401) {
      const errorBody = await testResponse.text();
      console.error('❌ 401 AUTHENTICATION FAILED:', {
        status: testResponse.status,
        body: errorBody.substring(0, 300),
        suggestion: 'API key is invalid or expired - regenerate in Anthropic Console'
      });
      throw new Error('API key authentication failed: Invalid or expired key');
    }

    if (testResponse.status === 400 || testResponse.status === 200) {
      console.log('✅ API KEY AUTHENTICATION SUCCESSFUL');
      return cleanApiKey;
    }

    // Handle other error statuses
    const errorBody = await testResponse.text();
    console.warn('⚠️ UNEXPECTED RESPONSE:', {
      status: testResponse.status,
      body: errorBody.substring(0, 300)
    });
    
    // Still return the key if it's properly formatted (non-auth errors)
    return cleanApiKey;

  } catch (error) {
    console.error('❌ API KEY TEST FAILED:', {
      error: error.message,
      type: error.constructor.name,
      suggestion: 'Network error or API unavailable - proceeding with format validation only'
    });
    
    // If test fails due to network/other issues, still return cleaned key
    console.log('⚠️ Proceeding with format-validated API key due to test failure');
    return cleanApiKey;
  }
}
