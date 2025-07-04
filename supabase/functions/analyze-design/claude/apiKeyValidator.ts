
export async function validateAndTestApiKey(apiKey: string): Promise<string> {
  console.log('=== ENHANCED API KEY VALIDATION & 401 DEBUGGING (v2) ===');
  console.log('🕐 Validation timestamp:', new Date().toISOString());
  
  if (!apiKey) {
    console.error('❌ CRITICAL: ANTHROPIC_API_KEY environment variable not found');
    throw new Error('ANTHROPIC_API_KEY is not configured in Supabase secrets. Please add your Claude API key.');
  }

  // Enhanced API key cleaning and validation with detailed debugging
  const originalKey = apiKey;
  const cleanApiKey = apiKey.trim().replace(/[\r\n\t\f\v\s]/g, '');
  
  console.log('🔍 DETAILED API KEY ANALYSIS:', {
    originalExists: !!originalKey,
    originalLength: originalKey.length,
    cleanLength: cleanApiKey.length,
    startsWithPrefix: cleanApiKey.startsWith('sk-ant-'),
    hasWhitespace: originalKey !== cleanApiKey,
    hasLineBreaks: /[\r\n]/.test(originalKey),
    hasTabs: /[\t]/.test(originalKey),
    hasSpecialChars: /[\f\v]/.test(originalKey),
    preview: cleanApiKey.substring(0, 20) + '***',
    endsWithAlphanumeric: /[a-zA-Z0-9]$/.test(cleanApiKey),
    keyStructure: cleanApiKey.substring(0, 7) + '***' + cleanApiKey.substring(cleanApiKey.length - 4)
  });
  
  // Enhanced validation checks
  if (!cleanApiKey.startsWith('sk-ant-')) {
    console.error('❌ INVALID API KEY FORMAT:', {
      expected: 'sk-ant-...',
      actual: cleanApiKey.substring(0, 10) + '...',
      suggestion: 'Verify API key was copied correctly from Anthropic Console'
    });
    throw new Error('Invalid Anthropic API key format. API key must start with "sk-ant-". Please regenerate your key from the Anthropic Console.');
  }
  
  if (cleanApiKey.length < 60) {
    console.error('❌ API KEY TOO SHORT:', {
      length: cleanApiKey.length,
      minimum: 60,
      suggestion: 'API key appears incomplete - check for truncation during copy/paste'
    });
    throw new Error(`Anthropic API key too short: ${cleanApiKey.length} chars (expected 60+). Please regenerate your key.`);
  }

  if (cleanApiKey.length > 200) {
    console.error('❌ API KEY TOO LONG:', {
      length: cleanApiKey.length,
      maximum: 200,
      suggestion: 'API key appears corrupted - may contain extra characters'
    });
    throw new Error(`Anthropic API key too long: ${cleanApiKey.length} chars (expected <200). Please regenerate your key.`);
  }

  // Test API key with lightweight request to verify authentication
  console.log('🧪 TESTING API KEY AUTHENTICATION...');
  try {
    const testController = new AbortController();
    const timeoutId = setTimeout(() => testController.abort(), 15000); // 15 second timeout

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
        messages: [{ role: 'user', content: 'Hi' }]
      }),
      signal: testController.signal
    });

    clearTimeout(timeoutId);

    console.log('🔍 API KEY TEST RESPONSE:', {
      status: testResponse.status,
      statusText: testResponse.statusText,
      contentType: testResponse.headers.get('content-type'),
      timestamp: new Date().toISOString()
    });

    if (testResponse.status === 401) {
      const errorBody = await testResponse.text();
      console.error('❌ 401 AUTHENTICATION FAILED:', {
        status: testResponse.status,
        body: errorBody.substring(0, 500),
        suggestion: 'API key is invalid, expired, or revoked'
      });
      throw new Error('Claude API authentication failed. Your API key is invalid, expired, or has been revoked. Please regenerate a new API key from the Anthropic Console.');
    }

    if (testResponse.status === 403) {
      const errorBody = await testResponse.text();
      console.error('❌ 403 FORBIDDEN:', {
        status: testResponse.status,
        body: errorBody.substring(0, 500),
        suggestion: 'API key may not have required permissions'
      });
      throw new Error('Claude API access forbidden. Your API key may not have the required permissions or your account may need verification.');
    }

    if (testResponse.status === 429) {
      console.warn('⚠️ 429 RATE LIMITED - API key is valid but rate limited');
      return cleanApiKey; // Key is valid, just rate limited
    }

    if (testResponse.status >= 200 && testResponse.status < 300) {
      console.log('✅ API KEY AUTHENTICATION SUCCESSFUL');
      console.log('🎉 Claude API is ready for use');
      return cleanApiKey;
    }

    if (testResponse.status === 400) {
      // 400 can indicate the key is valid but our test request is malformed
      console.log('✅ API KEY APPEARS VALID (400 likely due to test request format)');
      return cleanApiKey;
    }

    // Handle other error statuses
    const errorBody = await testResponse.text();
    console.warn('⚠️ UNEXPECTED RESPONSE:', {
      status: testResponse.status,
      body: errorBody.substring(0, 300),
      suggestion: 'Unexpected response from Anthropic API'
    });
    
    if (testResponse.status >= 500) {
      console.log('⚠️ Server error from Anthropic - proceeding with validated key');
      return cleanApiKey;
    }

    throw new Error(`Unexpected response from Claude API: ${testResponse.status} ${testResponse.statusText}`);

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('⚠️ API KEY TEST TIMEOUT - proceeding with format validation');
      return cleanApiKey;
    }

    if (error.message.includes('authentication') || error.message.includes('API key')) {
      // Re-throw authentication errors
      throw error;
    }

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
