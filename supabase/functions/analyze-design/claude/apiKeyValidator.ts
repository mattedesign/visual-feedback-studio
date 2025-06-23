
export async function validateAndTestApiKey(apiKey: string): Promise<string> {
  console.log('=== API Key Validation ===');
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  // Basic API key cleaning and validation
  const cleanApiKey = apiKey.trim().replace(/[\r\n\t]/g, '');
  console.log('Basic API key validation:', {
    exists: !!cleanApiKey,
    length: cleanApiKey.length,
    startsWithPrefix: cleanApiKey.startsWith('sk-ant-')
  });
  
  if (!cleanApiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid Anthropic API key format. API key should start with sk-ant-');
  }
  
  if (cleanApiKey.length < 50) {
    throw new Error('Anthropic API key appears to be too short');
  }

  // Test API key with a simple text-only request first
  console.log('Testing API key with simple text request...');
  try {
    await testApiKeySimple(cleanApiKey);
    console.log('API key test successful');
  } catch (error) {
    console.error('API key test failed:', error.message);
    throw new Error(`API key authentication failed: ${error.message}`);
  }

  return cleanApiKey;
}

async function testApiKeySimple(apiKey: string): Promise<void> {
  const testPayload = {
    model: 'claude-3-haiku-20240307',
    max_tokens: 10,
    messages: [
      {
        role: 'user',
        content: 'Hello'
      }
    ]
  };

  console.log('Making simple API test request...');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(testPayload)
  });

  console.log(`API test response: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API test error response:', errorText);
    
    let errorDetails;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = { message: errorText };
    }
    
    if (response.status === 401) {
      throw new Error(`Authentication failed: ${errorDetails.error?.message || 'Invalid API key'}`);
    }
    
    if (response.status === 403) {
      throw new Error(`Access forbidden: ${errorDetails.error?.message || 'API key lacks permissions'}`);
    }
    
    throw new Error(`API test failed (${response.status}): ${errorDetails.error?.message || errorText}`);
  }

  console.log('Simple API key test completed successfully');
}
