
import { AnnotationData } from './types.ts';

export async function analyzeWithClaude(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  anthropicApiKey: string
): Promise<AnnotationData[]> {
  console.log('=== Starting Claude API Analysis ===');
  
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  // Clean and validate API key
  const cleanApiKey = anthropicApiKey.trim();
  console.log('API key validation:', {
    exists: !!cleanApiKey,
    length: cleanApiKey.length,
    startsWithPrefix: cleanApiKey.startsWith('sk-ant-'),
    endsCorrectly: cleanApiKey.endsWith('AAA') || cleanApiKey.length >= 100
  });
  
  if (!cleanApiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid Anthropic API key format. API key should start with sk-ant-');
  }
  
  if (cleanApiKey.length < 90) {
    throw new Error('Anthropic API key appears to be incomplete or truncated');
  }

  // Test API key with a simple request first
  console.log('Testing API key with simple request...');
  try {
    await testApiKey(cleanApiKey);
    console.log('API key test successful');
  } catch (error) {
    console.error('API key test failed:', error.message);
    throw new Error(`API key authentication failed: ${error.message}`);
  }

  // Models to try in order of preference
  const models = [
    'claude-3-5-haiku-20241022',
    'claude-3-haiku-20240307',
    'claude-3-sonnet-20240229'
  ];

  let lastError;
  
  for (const model of models) {
    try {
      console.log(`Attempting analysis with model: ${model}`);
      const result = await callClaudeWithModel(base64Image, mimeType, systemPrompt, cleanApiKey, model);
      console.log(`Analysis successful with model: ${model}`);
      return result;
    } catch (error) {
      console.error(`Model ${model} failed:`, error.message);
      lastError = error;
      
      // If it's an auth error, don't try other models
      if (error.message.includes('authentication') || error.message.includes('Invalid bearer token')) {
        throw error;
      }
      
      // Continue to next model for other errors
      continue;
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('All Claude models failed');
}

async function testApiKey(apiKey: string): Promise<void> {
  const testPayload = {
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 10,
    messages: [
      {
        role: 'user',
        content: 'Hello'
      }
    ]
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(testPayload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetails;
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      errorDetails = { message: errorText };
    }
    
    if (response.status === 401) {
      throw new Error(`Authentication failed: ${errorDetails.error?.message || 'Invalid API key'}`);
    }
    
    throw new Error(`API test failed (${response.status}): ${errorDetails.error?.message || errorText}`);
  }
}

async function callClaudeWithModel(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  apiKey: string,
  model: string
): Promise<AnnotationData[]> {
  const requestPayload = {
    model: model,
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
              data: base64Image
            }
          }
        ]
      }
    ]
  };

  console.log(`Making request to ${model} with image size: ${base64Image.length} chars`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01',
      'User-Agent': 'Supabase-Edge-Function/1.0'
    },
    body: JSON.stringify(requestPayload)
  });

  console.log(`API response: ${response.status} ${response.statusText}`);

  const responseText = await response.text();
  
  if (!response.ok) {
    console.error('API error response:', responseText);
    
    let errorDetails;
    try {
      errorDetails = JSON.parse(responseText);
    } catch {
      errorDetails = { message: responseText };
    }
    
    if (response.status === 401) {
      throw new Error(`Invalid bearer token. Please verify your ANTHROPIC_API_KEY is correct and active.`);
    }
    
    if (response.status === 400) {
      const errorMsg = errorDetails?.error?.message || responseText;
      throw new Error(`Bad request: ${errorMsg}`);
    }
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    if (response.status === 403) {
      throw new Error(`Forbidden: Your API key may not have access to model ${model}`);
    }
    
    const errorMsg = errorDetails?.error?.message || responseText;
    throw new Error(`API error (${response.status}): ${errorMsg}`);
  }

  let aiResponse;
  try {
    aiResponse = JSON.parse(responseText);
    console.log(`Successful response from ${model}, content length:`, aiResponse.content?.[0]?.text?.length || 0);
  } catch (parseError) {
    console.error('Failed to parse response:', parseError);
    throw new Error('Failed to parse API response as JSON');
  }

  return parseClaudeResponse(aiResponse);
}

function parseClaudeResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    console.log('Raw AI response content preview:', content.substring(0, 200));
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const annotations = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed annotations:', annotations.length);
      
      // Validate annotations structure
      const validAnnotations = annotations.filter((ann: any) => 
        typeof ann.x === 'number' && 
        typeof ann.y === 'number' && 
        ann.category && 
        ann.severity && 
        ann.feedback
      );
      
      if (validAnnotations.length === 0) {
        throw new Error('No valid annotations found in response');
      }
      
      return validAnnotations;
    } else {
      console.error('No JSON array found in AI response');
      console.log('Full content for debugging:', content);
      throw new Error('No JSON array found in response');
    }
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    // Return a helpful error annotation
    return [
      {
        x: 50,
        y: 30,
        category: 'ux',
        severity: 'critical', 
        feedback: `AI analysis failed: ${parseError.message}. This may be due to API configuration issues. Please verify your Anthropic API key and try again.`,
        implementationEffort: 'low',
        businessImpact: 'high'
      }
    ];
  }
}
