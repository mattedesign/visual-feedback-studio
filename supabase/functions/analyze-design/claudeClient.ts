
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

  // Enhanced API key validation and cleaning
  const cleanApiKey = anthropicApiKey.trim().replace(/[\r\n\t]/g, '');
  console.log('API key validation:', {
    exists: !!cleanApiKey,
    length: cleanApiKey.length,
    startsWithPrefix: cleanApiKey.startsWith('sk-ant-'),
    hasValidStructure: /^sk-ant-api03-[A-Za-z0-9_-]+AAA$/.test(cleanApiKey)
  });
  
  if (!cleanApiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid Anthropic API key format. API key should start with sk-ant-');
  }
  
  if (cleanApiKey.length < 90) {
    throw new Error('Anthropic API key appears to be incomplete or truncated');
  }

  // Validate base64 image data
  if (!base64Image || base64Image.length === 0) {
    throw new Error('Invalid image data: base64 string is empty');
  }

  // Enhanced base64 validation
  try {
    // Test if it's valid base64
    atob(base64Image.substring(0, 100)); // Test first 100 chars
  } catch (error) {
    throw new Error('Invalid base64 image data encoding');
  }

  // Test API key with enhanced validation
  console.log('Testing API key with enhanced validation...');
  try {
    await testApiKeyEnhanced(cleanApiKey);
    console.log('API key test successful');
  } catch (error) {
    console.error('API key test failed:', error.message);
    throw new Error(`API key authentication failed: ${error.message}`);
  }

  // Updated models list with latest Claude 4 models
  const models = [
    'claude-3-5-sonnet-20241022',  // Most reliable current model
    'claude-3-haiku-20240307',     // Fastest fallback
    'claude-3-sonnet-20240229'     // Additional fallback
  ];

  let lastError;
  
  for (const model of models) {
    try {
      console.log(`Attempting analysis with model: ${model}`);
      const result = await callClaudeWithModelEnhanced(base64Image, mimeType, systemPrompt, cleanApiKey, model);
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

async function testApiKeyEnhanced(apiKey: string): Promise<void> {
  const testPayload = {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 10,
    messages: [
      {
        role: 'user',
        content: 'Hello'
      }
    ]
  };

  console.log('Making enhanced API key test request...');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01',
      'User-Agent': 'Supabase-Edge-Function/2.0'
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
      throw new Error(`Access forbidden: ${errorDetails.error?.message || 'API key may not have required permissions'}`);
    }
    
    throw new Error(`API test failed (${response.status}): ${errorDetails.error?.message || errorText}`);
  }

  // Validate response structure
  const responseData = await response.json();
  if (!responseData.content || !Array.isArray(responseData.content)) {
    throw new Error('Invalid API response structure');
  }
  
  console.log('API key test completed successfully with valid response structure');
}

async function callClaudeWithModelEnhanced(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  apiKey: string,
  model: string
): Promise<AnnotationData[]> {
  
  // Enhanced request payload with better error handling
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
    ],
    // Add system message for better consistency
    system: "You are an expert UX analyst. Always return your analysis as a valid JSON array of annotation objects."
  };

  console.log(`Making enhanced request to ${model}`, {
    imageSize: base64Image.length,
    mimeType,
    promptLength: systemPrompt.length
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01',
      'User-Agent': 'Supabase-Edge-Function/2.0',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestPayload)
  });

  console.log(`Enhanced API response: ${response.status} ${response.statusText}`);

  const responseText = await response.text();
  console.log('Response size:', responseText.length);
  
  if (!response.ok) {
    console.error('Enhanced API error response:', responseText.substring(0, 500));
    
    let errorDetails;
    try {
      errorDetails = JSON.parse(responseText);
    } catch {
      errorDetails = { message: responseText };
    }
    
    // Enhanced error categorization
    if (response.status === 401) {
      throw new Error(`Invalid bearer token. API key authentication failed.`);
    }
    
    if (response.status === 400) {
      const errorMsg = errorDetails?.error?.message || responseText;
      if (errorMsg.includes('base64')) {
        throw new Error(`Image encoding error: ${errorMsg}`);
      }
      throw new Error(`Bad request: ${errorMsg}`);
    }
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    if (response.status === 403) {
      throw new Error(`Forbidden: Your API key may not have access to model ${model}`);
    }
    
    if (response.status >= 500) {
      throw new Error(`Server error (${response.status}): Anthropic API is temporarily unavailable`);
    }
    
    const errorMsg = errorDetails?.error?.message || responseText;
    throw new Error(`API error (${response.status}): ${errorMsg}`);
  }

  let aiResponse;
  try {
    aiResponse = JSON.parse(responseText);
    console.log(`Successful response from ${model}`, {
      contentLength: aiResponse.content?.[0]?.text?.length || 0,
      usage: aiResponse.usage
    });
  } catch (parseError) {
    console.error('Failed to parse response:', parseError);
    console.error('Response preview:', responseText.substring(0, 200));
    throw new Error('Failed to parse API response as JSON');
  }

  // Enhanced response validation
  if (!aiResponse.content || !Array.isArray(aiResponse.content) || aiResponse.content.length === 0) {
    throw new Error('Invalid response structure: missing content array');
  }

  if (!aiResponse.content[0].text) {
    throw new Error('Invalid response structure: missing text content');
  }

  return parseClaudeResponseEnhanced(aiResponse);
}

function parseClaudeResponseEnhanced(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    console.log('Raw AI response content preview:', content.substring(0, 300));
    
    // Enhanced JSON extraction with multiple patterns
    let jsonMatch = content.match(/\[[\s\S]*?\]/);
    
    if (!jsonMatch) {
      // Try alternative patterns
      jsonMatch = content.match(/```json\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }
    
    if (!jsonMatch) {
      // Try finding JSON between specific markers
      const startMarkers = ['annotations:', 'result:', '['];
      const endMarkers = [']', 'end', '```'];
      
      for (const start of startMarkers) {
        const startIndex = content.toLowerCase().indexOf(start);
        if (startIndex !== -1) {
          const substring = content.substring(startIndex);
          const arrayMatch = substring.match(/\[[\s\S]*?\]/);
          if (arrayMatch) {
            jsonMatch = arrayMatch;
            break;
          }
        }
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
      
      // Enhanced validation with detailed feedback
      const validAnnotations = annotations.filter((ann: any, index: number) => {
        const isValid = typeof ann.x === 'number' && 
                       typeof ann.y === 'number' && 
                       ann.category && 
                       ann.severity && 
                       ann.feedback;
        
        if (!isValid) {
          console.warn(`Invalid annotation at index ${index}:`, ann);
        }
        
        return isValid;
      });
      
      if (validAnnotations.length === 0) {
        throw new Error('No valid annotations found in response - all annotations missing required fields');
      }
      
      console.log(`Returning ${validAnnotations.length} valid annotations out of ${annotations.length} total`);
      return validAnnotations;
    } else {
      console.error('No JSON array found in AI response');
      console.log('Full content for debugging:', content);
      throw new Error('No JSON array found in response - AI may have returned text instead of structured data');
    }
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    console.error('Response structure:', Object.keys(aiResponse));
    
    // Return a helpful error annotation with enhanced details
    return [
      {
        x: 50,
        y: 30,
        category: 'ux',
        severity: 'critical', 
        feedback: `AI analysis failed due to response parsing error: ${parseError.message}. This may indicate an API configuration issue or the AI returned an unexpected format. Please try again or check your API key configuration.`,
        implementationEffort: 'low',
        businessImpact: 'high'
      }
    ];
  }
}
