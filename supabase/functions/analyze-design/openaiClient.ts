
export async function analyzeWithOpenAI(
  base64Image: string,
  mimeType: string,
  prompt: string,
  apiKey: string,
  requestedModel?: string
) {
  console.log('=== OpenAI Client Started ===');
  
  // Enhanced API key debugging
  console.log('🔍 DETAILED OPENAI API KEY DEBUG:');
  console.log('================================');
  
  if (!apiKey) {
    console.error('❌ OpenAI API key is completely missing');
    throw new Error('OpenAI API key is empty or undefined');
  }
  
  const originalLength = apiKey.length;
  const cleanApiKey = apiKey.trim().replace(/[\r\n\t]/g, '');
  const preview = cleanApiKey.substring(0, 10);
  const hasWhitespace = apiKey !== cleanApiKey || /\s/.test(apiKey);
  const hasSpecialChars = /[\r\n\t\f\v]/.test(apiKey);
  const startsCorrectly = cleanApiKey.startsWith('sk-');
  
  console.log(`   Original length: ${originalLength}`);
  console.log(`   Clean length: ${cleanApiKey.length}`);
  console.log(`   Preview: "${preview}..."`);
  console.log(`   Starts with 'sk-': ${startsCorrectly ? '✅' : '❌'}`);
  console.log(`   Has whitespace: ${hasWhitespace ? '⚠️  YES' : '✅ NO'}`);
  console.log(`   Has special chars: ${hasSpecialChars ? '⚠️  YES' : '✅ NO'}`);
  
  if (hasWhitespace) {
    console.log(`   ⚠️  WHITESPACE DETECTED - this may cause authentication failure`);
    console.log(`   Original vs Clean: "${apiKey.substring(0, 15)}..." vs "${cleanApiKey.substring(0, 15)}..."`);
  }
  
  if (!startsCorrectly) {
    console.error(`   ❌ INVALID FORMAT - key should start with 'sk-' but starts with '${cleanApiKey.substring(0, 5)}'`);
    throw new Error('Invalid OpenAI API key format. Must start with "sk-"');
  }
  
  // Test authorization header format  
  const authHeader = `Bearer ${cleanApiKey}`;
  console.log(`   Authorization header: "Bearer ${preview}..."`);
  console.log(`   Auth header length: ${authHeader.length}`);
  
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
    console.log('🚀 Making OpenAI API request...');
    console.log(`   Endpoint: https://api.openai.com/v1/chat/completions`);
    console.log(`   Method: POST`);
    console.log(`   Content-Type: application/json`);
    console.log(`   Authorization: Bearer ${preview}...`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanApiKey}`,
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
        max_tokens: model.includes('o3') || model.includes('o4') ? 8000 : 4000,
        temperature: 0.3,
      }),
    });

    console.log('📡 OpenAI API response received:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error details:');
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Response body: ${errorText.substring(0, 500)}`);
      console.error(`   Model used: ${model}`);
      console.error(`   Auth header sent: Bearer ${preview}...`);
      console.error(`   API key format valid: ${startsCorrectly}`);
      console.error(`   API key clean: ${!hasWhitespace && !hasSpecialChars}`);
      
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
        
        // Enhanced authentication error handling
        if (response.status === 401) {
          console.error('🔑 AUTHENTICATION FAILURE ANALYSIS:');
          console.error(`   API key exists: ${!!cleanApiKey}`);
          console.error(`   API key length: ${cleanApiKey.length}`);
          console.error(`   API key format: ${startsCorrectly ? 'VALID' : 'INVALID'}`);
          console.error(`   API key preview: ${preview}...`);
          console.error(`   Header format: Bearer ${preview}...`);
          errorMessage = `Authentication failed: ${errorMessage}. Check API key configuration.`;
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

    // ✅ CRITICAL FIX: Enhanced JSON parsing with proper feedback extraction
    let annotations;
    try {
      // First, try to extract JSON from the content
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      
      console.log('🔍 FEEDBACK EXTRACTION DEBUG - Attempting to parse JSON:', {
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
      
      console.log('✅ JSON parsing successful:', {
        annotationCount: annotations.length,
        firstAnnotationKeys: annotations[0] ? Object.keys(annotations[0]) : []
      });

      // ✅ CRITICAL DEBUG: Log raw annotation structure before processing
      console.log('🔍 RAW ANNOTATIONS FROM OPENAI:', annotations.slice(0, 2).map((ann, i) => ({
        index: i,
        rawAnnotation: ann,
        availableProperties: Object.keys(ann),
        titleValue: ann.title,
        descriptionValue: ann.description,
        businessImpactValue: ann.businessImpact,
        quickFixValue: ann.quickFix,
        feedbackValue: ann.feedback
      })));
      
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Content to parse:', content);
      
      // Fallback: try to create a simple annotation if parsing fails
      annotations = [{
        x: 50,
        y: 50,
        category: 'ux',
        severity: 'suggested',
        title: 'Analysis Response Issue',
        description: 'Analysis completed but response format needs attention. Please review the overall design for UX improvements.',
        businessImpact: 'Medium impact on user experience',
        quickFix: 'Review and improve response parsing',
        implementationEffort: 'medium',
        imageIndex: 0
      }];
      
      console.log('Using fallback annotation due to parsing error');
    }

    // ✅ CRITICAL FIX: Enhanced validation with proper feedback extraction
    const validatedAnnotations = annotations.map((annotation, index) => {
      console.log(`🔍 PROCESSING ANNOTATION ${index + 1}:`, {
        rawAnnotation: annotation,
        title: annotation.title,
        description: annotation.description,
        businessImpact: annotation.businessImpact,
        quickFix: annotation.quickFix,
        existingFeedback: annotation.feedback
      });

      // ✅ ENHANCED FEEDBACK EXTRACTION - Build comprehensive feedback from AI response
      let comprehensiveFeedback = '';
      
      // Primary: Use description as main feedback content
      if (annotation.description && typeof annotation.description === 'string' && annotation.description.trim().length > 0) {
        comprehensiveFeedback = annotation.description.trim();
        console.log(`✅ Using description as primary feedback: "${comprehensiveFeedback.substring(0, 100)}..."`);
      }
      // Secondary: Use title if no description
      else if (annotation.title && typeof annotation.title === 'string' && annotation.title.trim().length > 0) {
        comprehensiveFeedback = annotation.title.trim();
        console.log(`✅ Using title as feedback: "${comprehensiveFeedback.substring(0, 100)}..."`);
      }
      // Tertiary: Use existing feedback field
      else if (annotation.feedback && typeof annotation.feedback === 'string' && annotation.feedback.trim().length > 0) {
        comprehensiveFeedback = annotation.feedback.trim();
        console.log(`✅ Using existing feedback field: "${comprehensiveFeedback.substring(0, 100)}..."`);
      }
      // Fallback: Create basic feedback
      else {
        comprehensiveFeedback = `UX improvement needed in ${annotation.category || 'general'} area`;
        console.log(`⚠️ Using fallback feedback: "${comprehensiveFeedback}"`);
      }

      // ✅ ENHANCE FEEDBACK: Add business impact and quick fix if available
      if (annotation.businessImpact && typeof annotation.businessImpact === 'string' && annotation.businessImpact.trim().length > 0) {
        if (!comprehensiveFeedback.toLowerCase().includes(annotation.businessImpact.toLowerCase().substring(0, 20))) {
          comprehensiveFeedback += ` Impact: ${annotation.businessImpact.trim()}`;
        }
      }
      
      if (annotation.quickFix && typeof annotation.quickFix === 'string' && annotation.quickFix.trim().length > 0) {
        if (!comprehensiveFeedback.toLowerCase().includes(annotation.quickFix.toLowerCase().substring(0, 20))) {
          comprehensiveFeedback += ` Quick Fix: ${annotation.quickFix.trim()}`;
        }
      }

      console.log(`✅ FINAL COMPREHENSIVE FEEDBACK FOR ANNOTATION ${index + 1}:`, {
        feedbackLength: comprehensiveFeedback.length,
        feedbackPreview: comprehensiveFeedback.substring(0, 150) + '...',
        sources: {
          usedDescription: !!(annotation.description && comprehensiveFeedback.includes(annotation.description)),
          usedTitle: !!(annotation.title && comprehensiveFeedback.includes(annotation.title)),
          usedBusinessImpact: !!(annotation.businessImpact && comprehensiveFeedback.includes(annotation.businessImpact)),
          usedQuickFix: !!(annotation.quickFix && comprehensiveFeedback.includes(annotation.quickFix))
        }
      });

      const validated = {
        x: typeof annotation.x === 'number' ? annotation.x : 50,
        y: typeof annotation.y === 'number' ? annotation.y : 50,
        category: ['ux', 'visual', 'accessibility', 'conversion', 'brand'].includes(annotation.category) 
          ? annotation.category : 'ux',
        severity: ['critical', 'suggested', 'enhancement'].includes(annotation.severity) 
          ? annotation.severity : 'suggested',
        feedback: comprehensiveFeedback, // ✅ FIXED: Use the extracted comprehensive feedback
        implementationEffort: ['low', 'medium', 'high'].includes(annotation.implementationEffort) 
          ? annotation.implementationEffort : 'medium',
        businessImpact: ['low', 'medium', 'high'].includes(annotation.businessImpact) 
          ? annotation.businessImpact : 'medium',
        imageIndex: typeof annotation.imageIndex === 'number' ? annotation.imageIndex : 0
      };
      
      console.log(`✅ VALIDATED ANNOTATION ${index + 1}:`, {
        feedbackLength: validated.feedback.length,
        feedbackIsPlaceholder: validated.feedback === 'Feedback not provided' || validated.feedback.startsWith('UX improvement needed'),
        feedbackPreview: validated.feedback.substring(0, 100) + '...'
      });
      
      return validated;
    });

    console.log('=== OpenAI Client Completed Successfully ===');
    console.log('Final annotation count:', validatedAnnotations.length);
    console.log('Model used:', data.model || model);
    
    // ✅ FINAL VALIDATION: Ensure no annotations have placeholder feedback
    const annotationsWithPlaceholders = validatedAnnotations.filter(a => 
      a.feedback === 'Feedback not provided' || 
      a.feedback.startsWith('UX improvement needed') ||
      a.feedback.length < 20
    );
    
    if (annotationsWithPlaceholders.length > 0) {
      console.warn(`⚠️ WARNING: ${annotationsWithPlaceholders.length} annotations still have placeholder feedback:`, 
        annotationsWithPlaceholders.map(a => ({ feedback: a.feedback, x: a.x, y: a.y }))
      );
    } else {
      console.log('✅ SUCCESS: All annotations have meaningful feedback content');
    }
    
    return validatedAnnotations;

  } catch (error) {
    console.error('=== OpenAI Client Error ===');
    console.error('Error details:', error);
    console.error('Model attempted:', model);
    console.error('API key debug info:', {
      keyExists: !!cleanApiKey,
      keyLength: cleanApiKey?.length || 0,
      keyStart: cleanApiKey?.substring(0, 10) || 'N/A',
      keyFormat: startsCorrectly ? 'VALID' : 'INVALID',
      hasWhitespace,
      hasSpecialChars
    });
    throw error;
  }
}
