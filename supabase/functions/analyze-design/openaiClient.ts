
import { AnnotationData } from './types.ts';

export async function analyzeWithOpenAI(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  openaiApiKey: string
): Promise<AnnotationData[]> {
  console.log('=== Starting OpenAI API Analysis ===');
  
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  // Basic API key validation
  const cleanApiKey = openaiApiKey.trim().replace(/[\r\n\t]/g, '');
  console.log('OpenAI API key validation:', {
    exists: !!cleanApiKey,
    length: cleanApiKey.length,
    startsWithPrefix: cleanApiKey.startsWith('sk-')
  });
  
  if (!cleanApiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format. API key should start with sk-');
  }
  
  if (cleanApiKey.length < 40) {
    throw new Error('OpenAI API key appears to be too short');
  }

  // Use the most capable OpenAI model first
  const models = [
    'gpt-4o',          // Most capable vision model
    'gpt-4o-mini'      // Fallback cost-effective option
  ];

  let lastError;
  
  for (const model of models) {
    try {
      console.log(`Attempting analysis with OpenAI model: ${model}`);
      const result = await callOpenAIWithModel(base64Image, mimeType, systemPrompt, cleanApiKey, model);
      console.log(`Analysis successful with OpenAI model: ${model}`);
      return result;
    } catch (error) {
      console.error(`OpenAI model ${model} failed:`, error.message);
      lastError = error;
      
      // If it's an auth error, don't try other models
      if (error.message.includes('authentication') || 
          error.message.includes('Incorrect API key') ||
          error.message.includes('401')) {
        throw error;
      }
      
      // Continue to next model for other errors
      continue;
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('All OpenAI models failed');
}

async function callOpenAIWithModel(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  apiKey: string,
  model: string
): Promise<AnnotationData[]> {
  
  const requestPayload = {
    model: model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Please analyze this design image and provide annotations as specified in the system prompt.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 3000
  };

  console.log(`Making request to OpenAI ${model}`, {
    imageSize: base64Image.length,
    mimeType,
    promptLength: systemPrompt.length
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestPayload)
  });

  console.log(`OpenAI API response: ${response.status} ${response.statusText}`);

  const responseText = await response.text();
  console.log('Response size:', responseText.length);
  
  if (!response.ok) {
    console.error('OpenAI API error response:', responseText.substring(0, 500));
    
    let errorDetails;
    try {
      errorDetails = JSON.parse(responseText);
    } catch {
      errorDetails = { message: responseText };
    }
    
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
      throw new Error(`Server error: OpenAI API temporarily unavailable`);
    }
    
    const errorMsg = errorDetails?.error?.message || responseText;
    throw new Error(`API error (${response.status}): ${errorMsg.substring(0, 200)}`);
  }

  let aiResponse;
  try {
    aiResponse = JSON.parse(responseText);
    console.log(`Successful response from OpenAI ${model}`, {
      contentLength: aiResponse.choices?.[0]?.message?.content?.length || 0
    });
  } catch (parseError) {
    console.error('Failed to parse OpenAI response:', parseError);
    console.error('Response preview:', responseText.substring(0, 200));
    throw new Error('Failed to parse API response as JSON');
  }

  // Basic response validation
  if (!aiResponse.choices || !Array.isArray(aiResponse.choices) || aiResponse.choices.length === 0) {
    throw new Error('Invalid response structure: missing choices array');
  }

  if (!aiResponse.choices[0].message?.content) {
    throw new Error('Invalid response structure: missing message content');
  }

  return parseOpenAIResponse(aiResponse);
}

function parseOpenAIResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.choices[0].message.content;
    console.log('Raw OpenAI response content preview:', content.substring(0, 300));
    
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
      console.error('No JSON array found in OpenAI response');
      console.log('Full content for debugging:', content.substring(0, 500));
      throw new Error('No JSON array found in response');
    }
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    
    // Return a helpful error annotation
    return [
      {
        x: 50,
        y: 30,
        category: 'ux',
        severity: 'critical', 
        feedback: `OpenAI analysis failed: ${parseError.message}. Please try again.`,
        implementationEffort: 'low',
        businessImpact: 'high'
      }
    ];
  }
}
