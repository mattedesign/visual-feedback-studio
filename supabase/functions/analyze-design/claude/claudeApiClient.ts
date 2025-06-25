

export async function callClaudeApi(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  apiKey: string,
  model: string
): Promise<any> {
  
  // Clean and validate API key
  const cleanApiKey = apiKey.trim().replace(/[\r\n\t]/g, '');
  console.log('Claude API key validation:', {
    exists: !!cleanApiKey,
    length: cleanApiKey.length,
    startsCorrectly: cleanApiKey.startsWith('sk-ant-'),
    hasWhitespace: cleanApiKey !== apiKey
  });
  
  if (!cleanApiKey) {
    throw new Error('Claude API key is empty or undefined');
  }
  
  if (!cleanApiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid Claude API key format. Must start with "sk-ant-"');
  }
  
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

  console.log(`Making request to ${model}`, {
    imageSize: base64Image.length,
    mimeType,
    promptLength: systemPrompt.length,
    authHeaderPreview: `Bearer ${cleanApiKey.substring(0, 15)}...`
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanApiKey}`,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestPayload)
  });

  console.log(`API response: ${response.status} ${response.statusText}`);

  const responseText = await response.text();
  console.log('Response size:', responseText.length);
  
  if (!response.ok) {
    console.error('API error response:', responseText.substring(0, 500));
    console.error('Request headers used:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanApiKey.substring(0, 15)}...`,
      'anthropic-version': '2023-06-01'
    });
    
    let errorDetails;
    try {
      errorDetails = JSON.parse(responseText);
    } catch {
      errorDetails = { message: responseText };
    }
    
    // Simplified error categorization
    if (response.status === 401) {
      throw new Error(`Authentication failed: Invalid API key`);
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
    console.log(`Successful response from ${model}`, {
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

