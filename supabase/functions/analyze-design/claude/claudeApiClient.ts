
export async function callClaudeApi(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  apiKey: string,
  model: string
): Promise<any> {
  
  // Enhanced API key debugging
  console.log('🔍 DETAILED CLAUDE API KEY DEBUG:');
  console.log('=================================');
  
  if (!apiKey) {
    console.error('❌ Claude API key is completely missing');
    throw new Error('Claude API key is empty or undefined');
  }
  
  const originalLength = apiKey.length;
  const cleanApiKey = apiKey.trim().replace(/[\r\n\t]/g, '');
  const preview = cleanApiKey.substring(0, 15);
  const hasWhitespace = apiKey !== cleanApiKey || /\s/.test(apiKey);
  const hasSpecialChars = /[\r\n\t\f\v]/.test(apiKey);
  const startsCorrectly = cleanApiKey.startsWith('sk-ant-');
  
  console.log(`   Original length: ${originalLength}`);
  console.log(`   Clean length: ${cleanApiKey.length}`);
  console.log(`   Preview: "${preview}..."`);
  console.log(`   Starts with 'sk-ant-': ${startsCorrectly ? '✅' : '❌'}`);
  console.log(`   Has whitespace: ${hasWhitespace ? '⚠️  YES' : '✅ NO'}`);
  console.log(`   Has special chars: ${hasSpecialChars ? '⚠️  YES' : '✅ NO'}`);
  
  if (hasWhitespace) {
    console.log(`   ⚠️  WHITESPACE DETECTED - this may cause authentication failure`);
    console.log(`   Original vs Clean: "${apiKey.substring(0, 20)}..." vs "${cleanApiKey.substring(0, 20)}..."`);
  }
  
  if (!startsCorrectly) {
    console.error(`   ❌ INVALID FORMAT - key should start with 'sk-ant-' but starts with '${cleanApiKey.substring(0, 8)}'`);
    throw new Error('Invalid Claude API key format. Must start with "sk-ant-"');
  }
  
  // Test authorization header format
  const authHeader = `Bearer ${cleanApiKey}`;
  console.log(`   Authorization header: "Bearer ${preview}..."`);
  console.log(`   Auth header length: ${authHeader.length}`);
  
  // Simplified request payload
  const requestPayload = {
    model: model,
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: systemPrompt
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Image
            }
          }
        ]
      }
    ]
  };

  console.log('🚀 Making Claude API request...');
  console.log(`   Endpoint: https://api.anthropic.com/v1/messages`);
  console.log(`   Method: POST`);
  console.log(`   Content-Type: application/json`);
  console.log(`   Authorization: Bearer ${preview}...`);
  console.log(`   Anthropic-Version: 2023-06-01`);
  console.log(`   Model: ${model}`);
  console.log(`   Image size: ${base64Image.length} characters`);
  console.log(`   Prompt length: ${systemPrompt.length} characters`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanApiKey}`,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestPayload)
  });

  console.log('📡 Claude API response received:');
  console.log(`   Status: ${response.status} ${response.statusText}`);
  console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

  const responseText = await response.text();
  console.log(`   Response size: ${responseText.length} characters`);
  
  if (!response.ok) {
    console.error('❌ Claude API error details:');
    console.error(`   Status: ${response.status} ${response.statusText}`);
    console.error(`   Response body: ${responseText.substring(0, 500)}`);
    console.error(`   Model used: ${model}`);
    console.error(`   Auth header sent: Bearer ${preview}...`);
    console.error(`   API key format valid: ${startsCorrectly}`);
    console.error(`   API key clean: ${!hasWhitespace && !hasSpecialChars}`);
    
    let errorDetails;
    try {
      errorDetails = JSON.parse(responseText);
    } catch {
      errorDetails = { message: responseText };
    }
    
    // Enhanced error categorization with debugging
    if (response.status === 401) {
      console.error('🔑 AUTHENTICATION FAILURE ANALYSIS:');
      console.error(`   API key exists: ${!!cleanApiKey}`);
      console.error(`   API key length: ${cleanApiKey.length}`);
      console.error(`   API key format: ${startsCorrectly ? 'VALID' : 'INVALID'}`);
      console.error(`   API key preview: ${preview}...`);
      console.error(`   Header format: Bearer ${preview}...`);
      console.error(`   Error details: ${JSON.stringify(errorDetails)}`);
      throw new Error(`Authentication failed: Invalid API key. Check your Claude API key configuration.`);
    }
    
    if (response.status === 400) {
      const errorMsg = errorDetails?.error?.message || responseText;
      throw new Error(`Bad request: ${errorMsg.substring(0, 200)}`);
    }
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    if (response.status === 403) {
      throw new Error(`Access denied: API key may not have access to model ${model}`);
    }
    
    if (response.status >= 500) {
      throw new Error(`Server error: Anthropic API temporarily unavailable`);
    }
    
    const errorMsg = errorDetails?.error?.message || responseText;
    throw new Error(`API error (${response.status}): ${errorMsg.substring(0, 200)}`);
  }

  let aiResponse;
  try {
    aiResponse = JSON.parse(responseText);
    console.log(`✅ Successful response from ${model}`, {
      contentLength: aiResponse.content?.[0]?.text?.length || 0
    });
  } catch (parseError) {
    console.error('Failed to parse response:', parseError);
    console.error('Response preview:', responseText.substring(0, 200));
    throw new Error('Failed to parse API response as JSON');
  }

  // Basic response validation
  if (!aiResponse.content || !Array.isArray(aiResponse.content) || aiResponse.content.length === 0) {
    throw new Error('Invalid response structure: missing content array');
  }

  if (!aiResponse.content[0].text) {
    throw new Error('Invalid response structure: missing text content');
  }

  return aiResponse;
}
