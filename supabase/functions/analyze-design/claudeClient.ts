
import { AnnotationData } from './types.ts';

export async function analyzeWithClaude(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  anthropicApiKey: string
): Promise<AnnotationData[]> {
  console.log('=== Starting Simplified Claude API Analysis ===');
  
  if (!anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  // Basic API key cleaning and validation
  const cleanApiKey = anthropicApiKey.trim().replace(/[\r\n\t]/g, '');
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

  // Validate base64 image data
  if (!base64Image || base64Image.length === 0) {
    throw new Error('Invalid image data: base64 string is empty');
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

  // Use basic, widely available Claude models
  const models = [
    'claude-3-haiku-20240307',     // Most basic model, should work with all keys
    'claude-3-sonnet-20240229',    // Fallback basic model
    'claude-3-5-haiku-20241022'    // Newer model as last resort
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
      if (error.message.includes('authentication') || 
          error.message.includes('Invalid bearer token') ||
          error.message.includes('401')) {
        throw error;
      }
      
      // Continue to next model for other errors
      continue;
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('All Claude models failed');
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

async function callClaudeWithModel(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  apiKey: string,
  model: string
): Promise<AnnotationData[]> {
  
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
    promptLength: systemPrompt.length
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestPayload)
  });

  console.log(`API response: ${response.status} ${response.statusText}`);

  const responseText = await response.text();
  console.log('Response size:', responseText.length);
  
  if (!response.ok) {
    console.error('API error response:', responseText.substring(0, 500));
    
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

  return parseClaudeResponse(aiResponse);
}

function parseClaudeResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    console.log('Raw AI response content preview:', content.substring(0, 300));
    
    // Look for JSON array in the response
    let jsonMatch = content.match(/\[[\s\S]*?\]/);
    
    if (!jsonMatch) {
      // Try alternative patterns
      jsonMatch = content.match(/```json\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }
    
    if (jsonMatch) {
      let annotations;
      try {
        annotations = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Attempted to parse:', jsonMatch[0].substring(0, 200));
        throw new Error('Invalid JSON format in AI response');
      }
      
      console.log('Successfully parsed annotations:', annotations.length);
      
      // Basic validation
      const validAnnotations = annotations.filter((ann: any) => {
        return typeof ann.x === 'number' && 
               typeof ann.y === 'number' && 
               ann.category && 
               ann.severity && 
               ann.feedback;
      });
      
      if (validAnnotations.length === 0) {
        throw new Error('No valid annotations found in response');
      }
      
      console.log(`Returning ${validAnnotations.length} valid annotations`);
      return validAnnotations;
    } else {
      console.error('No JSON array found in AI response');
      console.log('Full content for debugging:', content.substring(0, 500));
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
        feedback: `AI analysis failed: ${parseError.message}. Please try again.`,
        implementationEffort: 'low',
        businessImpact: 'high'
      }
    ];
  }
}
