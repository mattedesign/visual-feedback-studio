export async function callClaudeApi(
  base64Image: string,
  mimeType: string,
  systemPrompt: string,
  apiKey: string,
  model: string
): Promise<any> {
  
  // Enhanced API key debugging
  console.log('🔍 DETAILED CLAUDE API KEY DEBUG:');
  console.log('=================================');
  
  if (!apiKey) {
    console.error('❌ Claude API key is completely missing');
    throw new Error('Claude API key is empty or undefined');
  }
  
  const originalLength = apiKey.length;
  const cleanApiKey = apiKey.trim().replace(/[\r\n\t]/g, '');
  const preview = cleanApiKey.substring(0, 15);
  const hasWhitespace = apiKey !== cleanApiKey || /\s/.test(apiKey);
  const hasSpecialChars = /[\r\n\t\f\v]/.test(apiKey);
  const startsCorrectly = cleanApiKey.startsWith('sk-ant-');
  
  console.log(`   Original length: ${originalLength}`);
  console.log(`   Clean length: ${cleanApiKey.length}`);
  console.log(`   Preview: "${preview}..."`);
  console.log(`   Starts with 'sk-ant-': ${startsCorrectly ? '✅' : '❌'}`);
  console.log(`   Has whitespace: ${hasWhitespace ? '⚠️  YES' : '✅ NO'}`);
  console.log(`   Has special chars: ${hasSpecialChars ? '⚠️  YES' : '✅ NO'}`);
  
  if (hasWhitespace) {
    console.log(`   ⚠️  WHITESPACE DETECTED - this may cause authentication failure`);
    console.log(`   Original vs Clean: "${apiKey.substring(0, 20)}..." vs "${cleanApiKey.substring(0, 20)}..."`);
  }
  
  if (!startsCorrectly) {
    console.error(`   ❌ INVALID FORMAT - key should start with 'sk-ant-' but starts with '${cleanApiKey.substring(0, 8)}'`);
    throw new Error('Invalid Claude API key format. Must start with "sk-ant-"');
  }
  
  // Test authorization header format
  const authHeader = `Bearer ${cleanApiKey}`;
  console.log(`   Authorization header: "Bearer ${preview}..."`);
  console.log(`   Auth header length: ${authHeader.length}`);

  // 🎯 ENHANCED SYSTEM PROMPT WITH ANNOTATION CORRELATION
  const enhancedSystemPrompt = `You are a UX/UI design expert. Analyze the provided design and return 12-16 specific, actionable insights in JSON format. Each insight must be a precise annotation with screen coordinates that EXACTLY correspond to the visual element being analyzed.

🚨 CRITICAL CORRELATION REQUIREMENTS 🚨
- Each annotation's x,y coordinates MUST point to the exact visual element being analyzed
- The feedback MUST describe what is specifically located at those coordinates  
- Never place generic feedback at random coordinates
- Ensure spatial accuracy between annotation position and described element

🎯 COORDINATE ACCURACY RULES 🎯
- Header elements: y: 5-15
- Navigation: y: 15-25  
- Main content: y: 25-75
- Footer: y: 75-95
- Left sidebar: x: 5-25
- Center content: x: 25-75
- Right sidebar: x: 75-95

🎨 SPATIAL DISTRIBUTION REQUIREMENTS 🎨
- Spread annotations across the entire design
- Don't cluster all annotations in one area
- Ensure each annotation points to a distinct visual element
- Balance feedback across different regions of the interface

${systemPrompt}

🔄 MANDATORY JSON RESPONSE FORMAT 🔄
Your response must be valid JSON only with this exact structure:
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

⚠️ COORDINATE VALIDATION REQUIREMENTS ⚠️
- Verify each x,y coordinate points to an actual visual element
- Include element description in feedback (e.g., "The navigation menu at...")
- Ensure coordinates make logical sense for the described element
- No generic feedback at arbitrary coordinates`;
  
  // Simplified request payload with enhanced prompt
  const requestPayload = {
    model: model,
    max_tokens: 4000, // Increased for more detailed responses
    temperature: 0.1, // Lower temperature for more consistent positioning
    system: "You are a UX/UI design analysis expert. Always respond with valid JSON containing precise annotations with accurate coordinate-to-element correlation.",
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: enhancedSystemPrompt
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

  console.log('🚀 Making Claude API request with enhanced annotation correlation...');
  console.log(`   Endpoint: https://api.anthropic.com/v1/messages`);
  console.log(`   Method: POST`);
  console.log(`   Content-Type: application/json`);
  console.log(`   Authorization: Bearer ${preview}...`);
  console.log(`   Anthropic-Version: 2023-06-01`);
  console.log(`   Model: ${model}`);
  console.log(`   Image size: ${base64Image.length} characters`);
  console.log(`   Enhanced prompt length: ${enhancedSystemPrompt.length} characters`);
  console.log(`   Temperature: 0.1 (for consistent positioning)`);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanApiKey}`,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(requestPayload)
  });

  console.log('📡 Claude API response received:');
  console.log(`   Status: ${response.status} ${response.statusText}`);
  console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

  const responseText = await response.text();
  console.log(`   Response size: ${responseText.length} characters`);
  
  if (!response.ok) {
    console.error('❌ Claude API error details:');
    console.error(`   Status: ${response.status} ${response.statusText}`);
    console.error(`   Response body: ${responseText.substring(0, 500)}`);
    console.error(`   Model used: ${model}`);
    console.error(`   Auth header sent: Bearer ${preview}...`);
    console.error(`   API key format valid: ${startsCorrectly}`);
    console.error(`   API key clean: ${!hasWhitespace && !hasSpecialChars}`);
    
    let errorDetails;
    try {
      errorDetails = JSON.parse(responseText);
    } catch {
      errorDetails = { message: responseText };
    }
    
    // ✅ ENHANCED: 401 Authentication failure analysis with recovery suggestions
    if (response.status === 401) {
      console.error('🔑 COMPREHENSIVE 401 AUTHENTICATION FAILURE ANALYSIS:');
      console.error('='.repeat(60));
      console.error(`   API key exists: ${!!cleanApiKey}`);
      console.error(`   API key length: ${cleanApiKey.length}`);
      console.error(`   API key format valid: ${startsCorrectly ? '✅ VALID' : '❌ INVALID'}`);
      console.error(`   API key preview: "${preview}..."`);
      console.error(`   Authorization header: "Bearer ${preview}..."`);
      console.error(`   Has whitespace issues: ${hasWhitespace ? '⚠️  YES' : '✅ NO'}`);
      console.error(`   Has special chars: ${hasSpecialChars ? '⚠️  YES' : '✅ NO'}`);
      console.error(`   Model attempted: ${model}`);
      console.error(`   Error response: ${JSON.stringify(errorDetails, null, 2)}`);
      console.error('='.repeat(60));
      console.error('💡 RECOVERY SUGGESTIONS:');
      console.error('   1. Verify ANTHROPIC_API_KEY in Supabase secrets');
      console.error('   2. Regenerate API key in Anthropic Console');
      console.error('   3. Check for whitespace/formatting issues');
      console.error('   4. Ensure API key has proper permissions');
      console.error('='.repeat(60));
      throw new Error(`Claude API authentication failed (401): Invalid or expired API key. Please verify ANTHROPIC_API_KEY in Supabase secrets.`);
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
    console.log(`✅ Successful response from ${model}`, {
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

  // 🎯 ENHANCED ANNOTATION VALIDATION AND CORRELATION
  console.log('🔍 Processing Claude response for annotation correlation...');
  
  try {
    const responseContent = aiResponse.content[0].text;
    console.log('Raw Claude response content:', responseContent.substring(0, 200) + '...');
    
    // Parse the JSON response from Claude
    const parsed = JSON.parse(responseContent);
    const annotations = parsed.annotations || [];
    
    console.log(`📊 Processing ${annotations.length} annotations for coordinate validation...`);
    
    // Validate and enhance each annotation for proper correlation
    const validatedAnnotations = annotations.map((annotation: any, index: number) => {
      // Ensure coordinates are numbers and within bounds
      const x = Math.max(2, Math.min(98, Number(annotation.x) || 50));
      const y = Math.max(2, Math.min(98, Number(annotation.y) || 50));
      
      // Enhance feedback with coordinate reference for correlation verification
      const enhancedFeedback = annotation.feedback + 
        ` (Located at ${x.toFixed(1)}%, ${y.toFixed(1)}% in the design)`;
      
      const validatedAnnotation = {
        ...annotation,
        x,
        y,
        id: `ai-${index + 1}`,
        imageIndex: annotation.imageIndex || 0,
        feedback: enhancedFeedback
      };
      
      console.log(`✅ Validated annotation ${index + 1}:`, {
        id: validatedAnnotation.id,
        coordinates: { x, y },
        category: annotation.category,
        severity: annotation.severity,
        feedbackLength: enhancedFeedback.length
      });
      
      return validatedAnnotation;
    });

    console.log(`🎯 Successfully processed ${validatedAnnotations.length} annotations with coordinate validation`);
    
    // Return enhanced response with validated annotations
    return {
      ...aiResponse,
      content: [{
        ...aiResponse.content[0],
        text: JSON.stringify({ annotations: validatedAnnotations })
      }]
    };
    
  } catch (annotationError) {
    console.error('❌ Error processing annotations for correlation:', annotationError);
    console.error('❌ Raw response content:', aiResponse.content[0].text.substring(0, 500));
    
    // Return original response if annotation processing fails
    console.log('⚠️ Falling back to original response due to processing error');
    return aiResponse;
  }
}