
import { AnnotationData } from './types.ts';

export async function analyzeWithOpenAI(
  base64Image: string,
  mimeType: string,
  prompt: string,
  apiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<AnnotationData[]> {
  console.log('🚀 Calling OpenAI API for comprehensive analysis with 16-19 insights requirement...');
  
  try {
    // Build the messages array with the enhanced prompt
    const messages = [
      {
        role: 'system',
        content: `You are a UX/UI design expert. Analyze the provided design and return 16-19 specific, actionable insights in JSON format. Each insight must be a precise annotation with screen coordinates.

CRITICAL: You must return exactly this JSON structure:
{
  "annotations": [
    {
      "x": <number between 0-100>,
      "y": <number between 0-100>, 
      "feedback": "<specific actionable feedback>",
      "category": "<one of: usability, accessibility, visual-design, conversion, content, navigation, mobile>",
      "severity": "<one of: high, medium, low>",
      "business_impact": "<specific business impact>",
      "implementation_effort": "<one of: low, medium, high>"
    }
  ]
}

Requirements:
- Return 16-19 annotations minimum
- Each annotation must have valid x,y coordinates (0-100)
- Feedback must be specific and actionable
- Categories must match the exact list provided
- Focus on practical, implementable improvements`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
              detail: 'high'
            }
          }
        ]
      }
    ];

    console.log('🔄 Making OpenAI API request...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 4000,
        temperature: 0.1,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenAI API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI API response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('📝 OpenAI response content length:', content.length);

    try {
      const parsedResponse = JSON.parse(content);
      console.log('✅ Successfully parsed OpenAI JSON response');
      
      if (!parsedResponse.annotations || !Array.isArray(parsedResponse.annotations)) {
        console.error('❌ Response missing annotations array:', parsedResponse);
        throw new Error('Response missing annotations array');
      }

      const annotations = parsedResponse.annotations.map((annotation: any, index: number) => ({
        x: typeof annotation.x === 'number' ? annotation.x : 50,
        y: typeof annotation.y === 'number' ? annotation.y : 10 + (index * 5),
        feedback: annotation.feedback || `Insight ${index + 1}`,
        category: annotation.category || 'usability',
        severity: annotation.severity || 'medium',
        business_impact: annotation.business_impact || 'Moderate impact on user experience',
        implementation_effort: annotation.implementation_effort || 'medium'
      }));

      console.log(`✅ OpenAI analysis completed: ${annotations.length} annotations extracted`);
      return annotations;

    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI JSON response:', parseError);
      console.error('Raw content:', content);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }

  } catch (error) {
    console.error('❌ OpenAI client error:', error);
    throw error;
  }
}
