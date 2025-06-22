
import { AnnotationData } from './types.ts';

export async function analyzeWithClaude(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  anthropicApiKey: string
): Promise<AnnotationData[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anthropicApiKey}`,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
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

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error:', errorText);
    throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
  }

  const aiResponse = await response.json();
  console.log('AI response received');

  return parseClaudeResponse(aiResponse);
}

function parseClaudeResponse(aiResponse: any): AnnotationData[] {
  try {
    const content = aiResponse.content[0].text;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON array found in response');
    }
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError);
    // Return a sample annotation if parsing fails
    return [
      {
        x: 50,
        y: 30,
        category: 'ux',
        severity: 'suggested',
        feedback: 'AI analysis completed, but response formatting needs adjustment. Please try again.',
        implementationEffort: 'medium',
        businessImpact: 'medium'
      }
    ];
  }
}
