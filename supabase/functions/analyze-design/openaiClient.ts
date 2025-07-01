
import { AnnotationData } from './types.ts';

export async function analyzeWithOpenAI(
  base64Image: string,
  mimeType: string,
  prompt: string,
  apiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<AnnotationData[]> {
  console.log('🚀 Calling OpenAI API for comprehensive analysis with proper image correlation...');
  
  try {
    const messages = [
      {
        role: 'system',
        content: `You are a UX/UI design expert. Analyze the provided design and return 12-16 specific, actionable insights in JSON format. Each insight must be a precise annotation with screen coordinates that EXACTLY correspond to the visual element being analyzed.

CRITICAL CORRELATION REQUIREMENTS:
- Each annotation's x,y coordinates MUST point to the exact visual element being analyzed
- The feedback MUST describe what is specifically located at those coordinates
- Never place generic feedback at random coordinates
- Ensure spatial accuracy between annotation position and described element

MANDATORY JSON STRUCTURE:
{
  "annotations": [
    {
      "x": <precise number 0-100 pointing to the exact element>,
      "y": <precise number 0-100 pointing to the exact element>, 
      "feedback": "<specific feedback about the element at these exact coordinates>",
      "category": "<one of: ux, visual, accessibility, conversion, content>",
      "severity": "<one of: critical, suggested, enhancement>",
      "business_impact": "<specific business impact>",
      "implementation_effort": "<one of: low, medium, high>",
      "imageIndex": 0
    }
  ]
}

COORDINATE ACCURACY RULES:
- Header elements: y: 5-15
- Navigation: y: 15-25  
- Main content: y: 25-75
- Footer: y: 75-95
- Left sidebar: x: 5-25
- Center content: x: 25-75
- Right sidebar: x: 75-95

IMPORTANT: Your response must be valid JSON only.`
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 4000,
        temperature: 0.1, // Lower temperature for more consistent positioning
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('❌ No content received from OpenAI');
      throw new Error('No content received from OpenAI API');
    }

    console.log('✅ Raw OpenAI response received, parsing...');
    
    try {
      const parsed = JSON.parse(content);
      const annotations = parsed.annotations || [];
      
      // Validate each annotation has proper correlation
      const validatedAnnotations = annotations.map((annotation: any, index: number) => {
        // Ensure coordinates are numbers and within bounds
        const x = Math.max(0, Math.min(100, Number(annotation.x) || 50));
        const y = Math.max(0, Math.min(100, Number(annotation.y) || 50));
        
        return {
          ...annotation,
          x,
          y,
          id: `ai-${index + 1}`,
          imageIndex: annotation.imageIndex || 0,
          // Ensure feedback mentions the coordinates for correlation verification
          feedback: annotation.feedback + ` (Located at ${x.toFixed(1)}%, ${y.toFixed(1)}% in the design)`
        };
      });

      console.log(`✅ Successfully processed ${validatedAnnotations.length} annotations with coordinate validation`);
      return validatedAnnotations;
      
    } catch (parseError) {
      console.error('❌ Error parsing OpenAI JSON response:', parseError);
      console.error('❌ Raw content:', content);
      throw new Error('Failed to parse OpenAI JSON response');
    }
    
  } catch (error) {
    console.error('❌ OpenAI analysis failed:', error);
    throw error;
  }
}
