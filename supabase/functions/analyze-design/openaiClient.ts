
export async function analyzeWithOpenAI(
  base64Image: string,
  mimeType: string,
  prompt: string,
  apiKey: string,
  requestedModel?: string
) {
  console.log('=== OpenAI Client Started ===');
  
  // Default to the flagship model if no specific model is requested
  const model = requestedModel || 'gpt-4.1-2025-04-14';
  
  console.log('Request configuration:', {
    imageSize: base64Image.length,
    mimeType,
    promptLength: prompt.length,
    model,
    requestedModel: requestedModel || 'default'
  });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
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
        ],
        max_tokens: model.includes('o3') || model.includes('o4') ? 8000 : 4000, // Higher limits for reasoning models
        temperature: 0.3,
      }),
    });

    console.log('OpenAI API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        model: model
      });
      
      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
        
        // Check for model-specific errors
        if (errorData.error?.code === 'model_not_found' || 
            errorMessage.includes('model') && errorMessage.includes('does not exist')) {
          console.log(`Model ${model} not available, will try fallback if configured`);
          throw new Error(`Model ${model} not available: ${errorMessage}`);
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('OpenAI API response received:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length || 0,
      hasContent: !!data.choices?.[0]?.message?.content,
      model: data.model || model,
      usage: data.usage
    });

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response structure from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('Raw OpenAI content preview:', content.substring(0, 200) + '...');

    // Enhanced JSON parsing with better error handling
    let annotations;
    try {
      // First, try to extract JSON from the content
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      console.log('Attempting to parse JSON:', {
        hasJsonMatch: !!jsonMatch,
        jsonStringLength: jsonString.length,
        startsWithBracket: jsonString.startsWith('['),
        endsWithBracket: jsonString.endsWith(']')
      });
      
      annotations = JSON.parse(jsonString);
      
      if (!Array.isArray(annotations)) {
        console.error('Parsed result is not an array:', typeof annotations);
        throw new Error('Expected an array of annotations');
      }
      
      console.log('JSON parsing successful:', {
        annotationCount: annotations.length,
        firstAnnotationKeys: annotations[0] ? Object.keys(annotations[0]) : []
      });
      
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Content to parse:', content);
      
      // Fallback: try to create a simple annotation if parsing fails
      annotations = [{
        x: 50,
        y: 50,
        category: 'ux',
        severity: 'suggested',
        feedback: 'Analysis completed but response format needs attention. Please review the overall design for UX improvements.',
        implementationEffort: 'medium',
        businessImpact: 'medium',
        imageIndex: 0
      }];
      
      console.log('Using fallback annotation due to parsing error');
    }

    // Validate annotation structure
    const validatedAnnotations = annotations.map((annotation, index) => {
      const validated = {
        x: typeof annotation.x === 'number' ? annotation.x : 50,
        y: typeof annotation.y === 'number' ? annotation.y : 50,
        category: ['ux', 'visual', 'accessibility', 'conversion', 'brand'].includes(annotation.category) 
          ? annotation.category : 'ux',
        severity: ['critical', 'suggested', 'enhancement'].includes(annotation.severity) 
          ? annotation.severity : 'suggested',
        feedback: typeof annotation.feedback === 'string' ? annotation.feedback : 'Feedback not provided',
        implementationEffort: ['low', 'medium', 'high'].includes(annotation.implementationEffort) 
          ? annotation.implementationEffort : 'medium',
        businessImpact: ['low', 'medium', 'high'].includes(annotation.businessImpact) 
          ? annotation.businessImpact : 'medium',
        imageIndex: typeof annotation.imageIndex === 'number' ? annotation.imageIndex : 0
      };
      
      if (JSON.stringify(validated) !== JSON.stringify(annotation)) {
        console.log(`Annotation ${index} was validated/corrected`);
      }
      
      return validated;
    });

    console.log('=== OpenAI Client Completed Successfully ===');
    console.log('Final annotation count:', validatedAnnotations.length);
    console.log('Model used:', data.model || model);
    
    return validatedAnnotations;

  } catch (error) {
    console.error('=== OpenAI Client Error ===');
    console.error('Error details:', error);
    console.error('Model attempted:', model);
    throw error;
  }
}
