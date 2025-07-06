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

  // 🧪 SIMPLIFIED SYSTEM PROMPT - Testing for actual image analysis
  const simplifiedSystemPrompt = `Look at this design image and analyze what you see.

Identify 12-16 specific visual elements and provide actionable UX insights for each.

Describe exactly what you see at each location:
- Headers, navigation, buttons, forms
- Text content, images, layouts
- Colors, typography, spacing issues
- Usability problems or improvements

Return only JSON with this structure:
{
  "annotations": [
    {
      "x": 50,
      "y": 20,
      "feedback": "I can see a [specific element] at this location. [Specific improvement recommendation]",
      "category": "ux",
      "severity": "suggested",
      "business_impact": "medium",
      "implementation_effort": "medium",
      "imageIndex": 0
    }
  ]
}

Be specific about what you actually see in the image and provide unique feedback for each annotation.

ANALYSIS CONTEXT: ${systemPrompt}`;
  
  // 🔧 ENHANCED REQUEST PAYLOAD WITH IMAGE VALIDATION
  const requestPayload = {
    model: model,
    max_tokens: 3000,
    temperature: 0.3, // Slightly higher for more creative analysis
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: simplifiedSystemPrompt
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

  // Add validation before sending
  console.log('🔍 Pre-flight validation:');
  console.log(`   Image data length: ${base64Image.length}`);
  console.log(`   MIME type: ${mimeType}`);
  console.log(`   Model: ${model}`);
  console.log(`   Expected response: JSON with 12-16 annotations`);

  console.log('🚀 Making Claude API request with enhanced annotation correlation...');
  console.log(`   Endpoint: https://api.anthropic.com/v1/messages`);
  console.log(`   Method: POST`);
  console.log(`   Content-Type: application/json`);
  console.log(`   Authorization: Bearer ${preview}...`);
  console.log(`   Anthropic-Version: 2023-06-01`);
  console.log(`   Model: ${model}`);
  console.log(`   Image size: ${base64Image.length} characters`);
  console.log(`   Simplified prompt length: ${simplifiedSystemPrompt.length} characters`);
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
      console.error('💡 ENHANCED RECOVERY SUGGESTIONS:');
      console.error('   1. Verify ANTHROPIC_API_KEY in Supabase secrets is correctly set');
      console.error('   2. Regenerate API key in Anthropic Console (old key may be expired)');
      console.error('   3. Check for whitespace/formatting issues in the API key');
      console.error('   4. Ensure API key has proper permissions for the requested model');
      console.error('   5. Try with Claude 3.5 Haiku model first (most stable for auth)');
      console.error('   6. Check if your Anthropic account has access to the requested model');
      console.error('='.repeat(60));
      throw new Error(`Claude API authentication failed (401): Invalid or expired API key. Model: ${model}. Please verify and regenerate ANTHROPIC_API_KEY in Supabase secrets.`);
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

  // 🎯 SIMPLIFIED RESPONSE PROCESSING
  try {
    const responseContent = aiResponse.content[0].text;
    console.log('📝 Raw Claude response:', responseContent.substring(0, 500) + '...');
    
    // Try to parse as JSON
    let parsed;
    try {
      parsed = JSON.parse(responseContent);
    } catch (parseError) {
      // If response isn't JSON, try to extract JSON from text
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in Claude response');
      }
    }
    
    const annotations = parsed.annotations || [];
    
    if (annotations.length === 0) {
      throw new Error('Claude returned no annotations');
    }
    
    // Validate each annotation has required fields
    const validatedAnnotations = annotations.map((annotation: any, index: number) => {
      if (!annotation.feedback || annotation.feedback.length < 10) {
        throw new Error(`Annotation ${index + 1} has insufficient feedback`);
      }
      
      return {
        ...annotation,
        x: Math.max(2, Math.min(98, Number(annotation.x) || 50)),
        y: Math.max(2, Math.min(98, Number(annotation.y) || 50)),
        id: `ai-${index + 1}`,
        imageIndex: annotation.imageIndex || 0
      };
    });
    
    console.log(`✅ Successfully processed ${validatedAnnotations.length} annotations`);
    
    return {
      ...aiResponse,
      content: [{
        ...aiResponse.content[0],
        text: JSON.stringify({ annotations: validatedAnnotations })
      }]
    };
    
  } catch (processingError) {
    console.error('❌ Response processing failed:', processingError);
    throw new Error(`Failed to process Claude response: ${processingError.message}`);
  }
}