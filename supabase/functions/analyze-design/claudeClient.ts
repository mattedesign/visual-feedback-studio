
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
  
  console.log('Using Claude model: claude-sonnet-4-20250514');
  console.log('API key length:', cleanApiKey.length);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanApiKey}`,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
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
    })
  });

  console.log('API response status:', response.status);
  console.log('API response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error response:', errorText);
    
    if (response.status === 401) {
      throw new Error('Invalid Anthropic API key. Please verify your ANTHROPIC_API_KEY is correct and has no extra spaces.');
    }
    
    if (response.status === 400) {
      throw new Error(`Bad request to Anthropic API: ${errorText}`);
    }
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const aiResponse = await response.json();
  console.log('AI response received successfully');

  return parseClaudeResponse(aiResponse);
}

function parseClaudeResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    console.log('Raw AI response content:', content);
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const annotations = JSON.parse(jsonMatch[0]);
      console.log('Parsed annotations:', annotations);
      return annotations;
    } else {
      console.error('No JSON array found in AI response');
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
        feedback: 'AI analysis failed due to response parsing error. Please check the Anthropic API key configuration and try again.',
        implementationEffort: 'low',
        businessImpact: 'high'
      }
    ];
  }
}
