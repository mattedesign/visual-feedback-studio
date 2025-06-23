
import { AnnotationData } from './types.ts';

export async function analyzeWithClaude(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  anthropicApiKey: string
): Promise<AnnotationData[]> {
  console.log('Starting Claude API call with key:', anthropicApiKey ? 'Key provided' : 'No key provided');
  
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  // Trim any whitespace from the API key
  const cleanApiKey = anthropicApiKey.trim();
  
  // Enhanced API key validation and debugging
  console.log('Raw API key first 10 chars:', anthropicApiKey.substring(0, 10));
  console.log('Clean API key first 10 chars:', cleanApiKey.substring(0, 10));
  console.log('API key length (raw):', anthropicApiKey.length);
  console.log('API key length (clean):', cleanApiKey.length);
  console.log('API key starts with sk-ant-:', cleanApiKey.startsWith('sk-ant-'));
  console.log('API key has hidden characters:', anthropicApiKey !== cleanApiKey);
  
  // Check for common API key format issues
  if (!cleanApiKey.startsWith('sk-ant-')) {
    console.error('API key does not start with expected prefix sk-ant-');
    throw new Error('Invalid Anthropic API key format. API key should start with sk-ant-');
  }
  
  if (cleanApiKey.length < 50) {
    console.error('API key appears to be too short');
    throw new Error('Anthropic API key appears to be incomplete or truncated');
  }

  // Try with the latest Claude model
  console.log('Using Claude model: claude-3-5-haiku-20241022');

  // Enhanced request payload logging
  const requestPayload = {
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 4000,
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
              data: base64Image.substring(0, 50) + '...' // Log first 50 chars only for debugging
            }
          }
        ]
      }
    ]
  };

  console.log('Request payload (truncated):', JSON.stringify({
    ...requestPayload,
    messages: [{
      ...requestPayload.messages[0],
      content: requestPayload.messages[0].content.map((item: any) => 
        item.type === 'image' ? { ...item, source: { ...item.source, data: '[BASE64_DATA]' } } : item
      )
    }]
  }));

  const requestHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${cleanApiKey}`,
    'anthropic-version': '2023-06-01',
    'User-Agent': 'Supabase-Edge-Function/1.0'
  };

  console.log('Request headers (without auth):', {
    'Content-Type': requestHeaders['Content-Type'],
    'anthropic-version': requestHeaders['anthropic-version'],
    'User-Agent': requestHeaders['User-Agent'],
    'Authorization': `Bearer ${cleanApiKey.substring(0, 15)}...`
  });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestPayload)
    });

    console.log('API response status:', response.status);
    console.log('API response statusText:', response.statusText);
    console.log('API response headers:', Object.fromEntries(response.headers.entries()));

    // Get response text first for better error handling
    const responseText = await response.text();
    console.log('Raw API response body:', responseText);

    if (!response.ok) {
      console.error('Anthropic API error response:', responseText);
      
      // Parse error response for more details
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
        console.log('Parsed error details:', errorDetails);
      } catch (parseError) {
        console.error('Could not parse error response as JSON:', parseError);
      }
      
      if (response.status === 401) {
        const errorMsg = errorDetails?.error?.message || 'Authentication failed';
        throw new Error(`Invalid Anthropic API key: ${errorMsg}. Please verify your ANTHROPIC_API_KEY is correct and active.`);
      }
      
      if (response.status === 400) {
        const errorMsg = errorDetails?.error?.message || responseText;
        throw new Error(`Bad request to Anthropic API: ${errorMsg}`);
      }
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      if (response.status === 403) {
        throw new Error('Forbidden: Your API key may not have access to this model or feature.');
      }
      
      const errorMsg = errorDetails?.error?.message || responseText;
      throw new Error(`Anthropic API error (${response.status}): ${errorMsg}`);
    }

    // Parse successful response
    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
      console.log('AI response parsed successfully, content length:', aiResponse.content?.[0]?.text?.length || 0);
    } catch (parseError) {
      console.error('Failed to parse successful response:', parseError);
      throw new Error('Failed to parse API response as JSON');
    }

    return parseClaudeResponse(aiResponse);

  } catch (fetchError) {
    console.error('Fetch error details:', {
      name: fetchError.name,
      message: fetchError.message,
      cause: fetchError.cause
    });
    
    // Re-throw with more context
    if (fetchError.message.includes('Invalid Anthropic API key')) {
      throw fetchError; // Already has good error message
    }
    
    throw new Error(`Network or API error: ${fetchError.message}`);
  }
}

function parseClaudeResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    console.log('Raw AI response content length:', content.length);
    console.log('Raw AI response content preview:', content.substring(0, 200));
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const annotations = JSON.parse(jsonMatch[0]);
      console.log('Parsed annotations count:', annotations.length);
      console.log('First annotation sample:', annotations[0]);
      return annotations;
    } else {
      console.error('No JSON array found in AI response');
      console.log('Full content for debugging:', content);
      throw new Error('No JSON array found in response');
    }
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    // Return a helpful error annotation instead of a generic one
    return [
      {
        x: 50,
        y: 30,
        category: 'ux',
        severity: 'critical', 
        feedback: `AI analysis failed due to response parsing error: ${parseError.message}. Please check the Anthropic API key configuration and try again.`,
        implementationEffort: 'low',
        businessImpact: 'high'
      }
    ];
  }
}
