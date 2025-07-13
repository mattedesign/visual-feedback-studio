import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🤖 Goblin Claude Analyzer - Streamlined v4');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, imageUrls, prompt, persona, chatMode, conversationHistory, originalAnalysis, saveInitialOnly, initialContent } = await req.json();

    // Add persona mapping to fix frontend/backend persona name mismatches
    const personaMapping: { [key: string]: string } = {
      'mad': 'mad',
      'exec': 'exec',
      'strategic': 'strategic', 
      'clarity': 'clarity',
      'mirror': 'mirror'
    };

    // Normalize persona name
    const normalizedPersona = personaMapping[persona] || persona;
    console.log(`🎭 Persona mapping: ${persona} → ${normalizedPersona}`);

    // CRITICAL FIX: Ensure chatMode is properly defaulted for image processing
    const actualChatMode = chatMode === true;
    
    console.log(`🎯 Processing request - Session: ${sessionId?.substring(0, 8)}, Persona: ${normalizedPersona}, Chat: ${actualChatMode}, HasImages: ${!!imageUrls}, ImageCount: ${imageUrls?.length || 0}`);

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user info from auth header
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (user && !userError) {
          userId = user.id;
          console.log(`✅ User authenticated: ${userId.substring(0, 8)}`);
        } else {
          console.warn('⚠️ Authentication failed:', userError?.message);
        }
      } catch (authError) {
        console.error('❌ Authentication error:', authError);
      }
    }

    // Special handling for saveInitialOnly mode
    if (saveInitialOnly && initialContent && sessionId && userId) {
      console.log(`💾 Saving initial message - Session: ${sessionId.substring(0, 8)}, Length: ${initialContent.length}`);
      
      try {
        // Check if initial message already exists
        const { data: existingMessages } = await supabase
          .from('goblin_refinement_history')
          .select('id')
          .eq('session_id', sessionId)
          .eq('conversation_stage', 'initial')
          .limit(1);

        if (!existingMessages || existingMessages.length === 0) {
          const { data: insertResult, error: insertError } = await supabase
            .from('goblin_refinement_history')
            .insert({
              session_id: sessionId,
              user_id: userId,
              message_order: 1,
              role: 'clarity',
              content: initialContent,
              conversation_stage: 'initial',
              model_used: 'claude-sonnet-4-20250514',
              processing_time_ms: 0,
              metadata: {
                used_persona: normalizedPersona,
                is_initial_analysis: true,
                save_initial_only: true
              }
            })
            .select();

          if (insertError) {
            console.error('❌ Failed to insert initial message:', insertError);
            throw insertError;
          }

          console.log('✅ Initial message saved successfully');
        } else {
          console.log('ℹ️ Initial message already exists, skipping');
        }

        return new Response(
          JSON.stringify({
            success: true,
            sessionId,
            persona: normalizedPersona,
            message: 'Initial message saved successfully',
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('❌ Save initial failed:', error);
        throw error;
      }
    }

    const startTime = Date.now();

    // FIXED: Image processing for both analysis and chat modes
    const imageContent = [];
    let actualImageUrls = imageUrls;
    
    // If in chat mode and no imageUrls provided, fetch from database
    if (actualChatMode && sessionId && (!imageUrls || !Array.isArray(imageUrls))) {
      console.log(`🔍 Chat mode - fetching images from database for session: ${sessionId.substring(0, 8)}`);
      
      try {
        const { data: sessionImages, error: imagesError } = await supabase
          .from('goblin_analysis_images')
          .select('file_path, file_name')
          .eq('session_id', sessionId)
          .order('upload_order', { ascending: true });

        if (imagesError) {
          console.warn('⚠️ Failed to fetch session images:', imagesError);
        } else if (sessionImages && sessionImages.length > 0) {
          actualImageUrls = sessionImages.map(img => img.file_path);
          console.log(`✅ Found ${actualImageUrls.length} images in database for chat mode`);
        } else {
          console.log('📭 No images found in database for this session');
        }
      } catch (error) {
        console.error('❌ Error fetching session images:', error);
      }
    }
    
    if (actualImageUrls && Array.isArray(actualImageUrls)) {
      console.log(`📸 Processing ${actualImageUrls.length} images`);
      
      for (let i = 0; i < Math.min(actualImageUrls.length, 3); i++) {
        const imageItem = actualImageUrls[i];
        let imageUrl = null;
        
        // Simple URL extraction
        if (typeof imageItem === 'string') {
          imageUrl = imageItem;
        } else if (imageItem && typeof imageItem === 'object') {
          imageUrl = imageItem.url || imageItem.file_path || imageItem.storage_url;
        }
        
        if (!imageUrl || typeof imageUrl !== 'string') {
          console.warn(`❌ Invalid image URL at index ${i}`);
          continue;
        }

        try {
          console.log(`🔄 Fetching image ${i + 1}: ${imageUrl.substring(0, 50)}...`);
          
          // FIXED: Add timeout and better error handling
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const imageResponse = await fetch(imageUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Figmant-Goblin-Analyzer/1.0'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!imageResponse.ok) {
            console.warn(`❌ Failed to fetch image ${i + 1}: ${imageResponse.status}`);
            continue;
          }

          // FIXED: Process in chunks to avoid memory issues
          const arrayBuffer = await imageResponse.arrayBuffer();
          
          // Check file size (max 10MB)
          if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
            console.warn(`❌ Image ${i + 1} too large: ${arrayBuffer.byteLength} bytes`);
            continue;
          }
          
          // FIXED: Process in chunks to avoid stack overflow
          const uint8Array = new Uint8Array(arrayBuffer);
          let binaryString = '';
          
          // Process in small chunks to avoid stack overflow
          const chunkSize = 1024;
          for (let k = 0; k < uint8Array.length; k += chunkSize) {
            const chunk = uint8Array.slice(k, k + chunkSize);
            // Use loop instead of apply to avoid stack overflow
            for (let j = 0; j < chunk.length; j++) {
              binaryString += String.fromCharCode(chunk[j]);
            }
          }
          
          const base64 = btoa(binaryString);
          const contentType = imageResponse.headers.get('content-type') || 'image/png';

          imageContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: contentType,
              data: base64
            }
          });
          
          console.log(`✅ Image ${i + 1} processed: ${base64.length} chars`);
          
        } catch (error) {
          console.error(`❌ Failed to process image ${i + 1}:`, error.message);
        }
      }
      
      console.log(`🎉 Image processing complete: ${imageContent.length}/${actualImageUrls.length} successful`);
    }

    // Build enhanced prompt
    const enhancedPrompt = buildPrompt(normalizedPersona, prompt, actualChatMode, conversationHistory, originalAnalysis);
    
    console.log("🧙‍♂️ Sending message to Claude with", imageContent.length, "images");

    // ✅ FIX: Correct message structure - images and text in same content array
    const messages = [{
      role: "user",
      content: [...imageContent, { type: "text", text: enhancedPrompt }]
    }];

    console.log('🚀 Calling Claude API...');

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: normalizedPersona === 'clarity' ? 0.3 : 0.7,
        messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    
    console.log("🧠 Claude raw response:", JSON.stringify(responseData, null, 2));
    
    const summaryText = responseData.content?.map(c => c.text).join('\n') || '⚠️ No summary returned';
    
    if (!summaryText || summaryText === '⚠️ No summary returned') {
      throw new Error('Claude returned no content.');
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Claude analysis completed');

    // Handle conversation persistence SIMPLIFIED
    if (sessionId && userId && actualChatMode) {
      try {
        console.log(`💬 Starting chat persistence - Session: ${sessionId.substring(0, 8)}`);
        
        // Get the current max message order for this session
        const { data: lastMessage } = await supabase
          .from('goblin_refinement_history')
          .select('message_order')
          .eq('session_id', sessionId)
          .order('message_order', { ascending: false })
          .limit(1)
          .single();

        const nextOrder = (lastMessage?.message_order || 0) + 1;

        // Insert user message
        const { error: userError } = await supabase
          .from('goblin_refinement_history')
          .insert({
            session_id: sessionId,
            user_id: userId,
            message_order: nextOrder,
            role: 'user',
            content: prompt,
            conversation_stage: 'chat',
            model_used: 'user-input',
            processing_time_ms: 0
          });

        if (userError) {
          console.error('❌ Failed to save user message:', userError);
        } else {
          console.log(`✅ User message saved - Order: ${nextOrder}`);
        }

        // Insert AI response
        const { error: aiError } = await supabase
          .from('goblin_refinement_history')
          .insert({
            session_id: sessionId,
            user_id: userId,
            message_order: nextOrder + 1,
            role: 'clarity',
             content: summaryText,
            conversation_stage: 'chat',
            model_used: 'claude-sonnet-4-20250514',
            processing_time_ms: processingTime,
            metadata: {
              used_persona: normalizedPersona,
              is_chat_response: true
            }
          });

        if (aiError) {
          console.error('❌ Failed to save AI message:', aiError);
        } else {
          console.log(`✅ AI message saved - Order: ${nextOrder + 1}, Time: ${processingTime}ms`);
        }

      } catch (persistError) {
        console.error('❌ Failed to persist conversation:', persistError);
      }
    }

    // Parse structured response for non-chat mode with persona-specific validation
    let parsedData: any = {};
    if (!actualChatMode) {
      try {
        // Enhanced JSON extraction - clean markdown code blocks and find valid JSON
        let cleanedText = summaryText;
        
        // Remove markdown code blocks that might contain invalid JSON
        cleanedText = cleanedText.replace(/```json\s*[\s\S]*?\s*```/g, '');
        cleanedText = cleanedText.replace(/```[\s\S]*?```/g, '');
        
        // Try multiple JSON extraction approaches
        let jsonString = null;
        
        // Method 1: Look for JSON objects (most common)
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          // Find the largest valid JSON object
          const startIndex = cleanedText.indexOf('{');
          if (startIndex !== -1) {
            let braceCount = 0;
            let endIndex = startIndex;
            
            for (let i = startIndex; i < cleanedText.length; i++) {
              if (cleanedText[i] === '{') braceCount++;
              if (cleanedText[i] === '}') braceCount--;
              if (braceCount === 0) {
                endIndex = i;
                break;
              }
            }
            
            if (braceCount === 0) {
              jsonString = cleanedText.substring(startIndex, endIndex + 1);
            }
          }
        }
        
        if (jsonString) {
          const rawParsed = JSON.parse(jsonString);
          console.log('✅ Raw parsed data fields:', Object.keys(rawParsed));
          
          // Validate persona-specific fields and create fallback if needed
          parsedData = validateAndNormalizePersonaData(rawParsed, normalizedPersona, summaryText);
          console.log('✅ Validated structured data for persona:', normalizedPersona, 'Fields:', Object.keys(parsedData));
        } else {
          console.warn('❌ No valid JSON found in response, creating fallback data');
          parsedData = createPersonaFallbackData(normalizedPersona, summaryText);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse structured data:', parseError);
        console.error('❌ Raw response excerpt:', summaryText.substring(0, 500));
        parsedData = createPersonaFallbackData(normalizedPersona, summaryText);
      }
    }

    // For non-chat mode, only save to refinement history if called directly (not via orchestrator)
    // The orchestrator will handle saving the final results to goblin_analysis_results
    if (sessionId && userId && !actualChatMode) {
      try {
        console.log('💾 Saving initial analysis to conversation history only');
        
        // Check if initial message already exists
        const { data: existingMessages } = await supabase
          .from('goblin_refinement_history')
          .select('id')
          .eq('session_id', sessionId)
          .eq('conversation_stage', 'initial')
          .limit(1);

        if (!existingMessages || existingMessages.length === 0) {
          const { error: initialError } = await supabase
            .from('goblin_refinement_history')
            .insert({
              session_id: sessionId,
              user_id: userId,
              message_order: 1,
              role: 'clarity',
              content: summaryText,
              conversation_stage: 'initial',
              model_used: 'claude-sonnet-4-20250514',
              processing_time_ms: processingTime,
              metadata: {
                used_persona: normalizedPersona,
                is_initial_analysis: true,
                parsed_data: parsedData,
                note: 'Individual analyzer output - orchestrator will handle final results'
              }
            });

          if (initialError) {
            console.error('❌ Failed to save initial analysis:', initialError);
          } else {
            console.log('✅ Initial analysis saved to conversation history');
          }
        }
      } catch (persistError) {
        console.error('⚠️ Failed to persist initial analysis:', persistError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        persona: normalizedPersona,
        modelUsed: 'claude-sonnet-4-20250514',
        analysisData: actualChatMode ? { analysis: summaryText } : parsedData,
        rawResponse: summaryText,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Claude analysis failed:', error);

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// FIXED: Stricter JSON prompt (around line 400 in Claude analyzer)
function buildPrompt(persona: string, userPrompt: string, chatMode: boolean, conversationHistory?: string, originalAnalysis?: any): string {
  const personaInstructions = {
    clarity: `You are Clarity, the brutally honest UX goblin. You tell the hard truths about design with wit and directness.`,
    strategic: `You are a strategic UX analyst. Focus on business impact, user goals, and measurable outcomes.`,
    mirror: `You are an empathetic UX mirror. Reflect back what users might feel and experience.`,
    mad: `You are the Mad UX Scientist. Think outside the box with creative, experimental approaches.`,
    mad_scientist: `You are the Mad UX Scientist. Think outside the box with creative, experimental approaches.`,
    exec: `You are an executive UX lens. Focus on business impact, ROI, and stakeholder communication.`
  };

  // Persona-specific JSON templates
  const personaJsonTemplates = {
    mirror: {
      "insights": "Deep empathetic analysis of what users truly feel when using this interface",
      "reflection": "Mirror reflection of the user experience and emotional journey",
      "visualReflections": ["Visual element 1 reflection", "Visual element 2 reflection", "Visual element 3 reflection"],
      "emotionalImpact": "How this design makes users feel emotionally",
      "userStory": "The story this interface tells from a user's perspective",
      "empathyGaps": ["Gap 1 where user needs aren't met", "Gap 2", "Gap 3"]
    },
    strategic: {
      "analysis": "Strategic UX analysis focused on business impact",
      "recommendations": ["Business-focused recommendation 1", "recommendation 2", "recommendation 3"],
      "businessImpact": "How UX issues affect business metrics",
      "strategicPriority": "Most critical strategic UX priority",
      "competitiveAdvantage": "UX opportunities for competitive differentiation",
      "measurableOutcomes": "Expected measurable improvements"
    },
    clarity: {
      "analysis": "Brutally honest UX analysis of the interface",
      "recommendations": ["Specific actionable recommendation 1", "recommendation 2", "recommendation 3"],
      "biggestGripe": "The main UX problem that annoys you most",
      "whatMakesGoblinHappy": "What actually works well in this design",
      "goblinWisdom": "Your key insight or wisdom about the UX",
      "goblinPrediction": "What will happen if the user follows your advice"
    },
    mad: {
      "hypothesis": "Wild experimental UX hypothesis about the interface",
      "experiments": ["Crazy experiment 1", "experiment 2", "experiment 3"],
      "madScience": "Your mad scientist take on the UX problems",
      "weirdFindings": "Strange patterns or anomalies discovered in the interface",
      "crazyIdeas": ["Unconventional solution 1", "solution 2", "solution 3"],
      "labNotes": "Mad scientist notes on interface behavior and user patterns"
    },
    mad_scientist: {
      "hypothesis": "Wild experimental UX hypothesis about the interface",
      "experiments": ["Crazy experiment 1", "experiment 2", "experiment 3"],
      "madScience": "Your mad scientist take on the UX problems",
      "weirdFindings": "Strange patterns or anomalies discovered in the interface",
      "crazyIdeas": ["Unconventional solution 1", "solution 2", "solution 3"],
      "labNotes": "Mad scientist notes on interface behavior and user patterns"
    },
    exec: {
      "executiveSummary": "High-level executive summary of UX impact",
      "businessRisks": ["Business risk 1", "risk 2", "risk 3"],
      "roiImpact": "Return on investment implications of UX issues",
      "stakeholderConcerns": "Key concerns for executive stakeholders",
      "strategicRecommendations": ["Executive recommendation 1", "recommendation 2", "recommendation 3"],
      "competitiveImplications": "How UX affects competitive positioning"
    }
  };

  let basePrompt = personaInstructions[persona as keyof typeof personaInstructions] || personaInstructions.clarity;
  
  if (chatMode) {
    basePrompt += `\n\nYou are in chat mode. Respond conversationally to the user's question while maintaining your ${persona} persona.`;
    
    if (conversationHistory) {
      basePrompt += `\n\nConversation history:\n${conversationHistory}`;
    }
    
    if (originalAnalysis) {
      try {
        basePrompt += `\n\nOriginal analysis context: ${JSON.stringify(originalAnalysis).substring(0, 500)}...`;
      } catch (err) {
        basePrompt += `\n\nOriginal analysis context: [Complex analysis object - ${typeof originalAnalysis}]`;
      }
    }
    
    basePrompt += `\n\nUser's new question: ${userPrompt}`;
    basePrompt += `\n\nRespond in plain text as ${persona} would, maintaining your personality while being helpful and direct.`;
  } else {
    const jsonTemplate = personaJsonTemplates[persona as keyof typeof personaJsonTemplates] || personaJsonTemplates.clarity;
    
    basePrompt += `

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON
2. Do NOT include any text before or after the JSON
3. Do NOT use markdown code blocks like \`\`\`json
4. Your entire response must be parseable by JSON.parse()

Required JSON format for ${persona} persona:
${JSON.stringify(jsonTemplate, null, 2)}

User's request: ${userPrompt}

RESPONSE REQUIREMENTS:
- Start your response with {
- End your response with }
- Include ALL required fields from the template above
- Use valid JSON syntax only
- No additional text or explanations outside the JSON

Respond now with valid JSON only:`;
  }
  
  return basePrompt;
}

// Validation and normalization functions for persona-specific data
function validateAndNormalizePersonaData(rawData: any, persona: string, summaryText: string): any {
  console.log(`🔍 Validating ${persona} persona data. Raw fields:`, Object.keys(rawData));
  
  // Define expected fields for each persona
  const expectedFields = {
    mirror: ['insights', 'reflection', 'visualReflections', 'emotionalImpact', 'userStory', 'empathyGaps'],
    strategic: ['analysis', 'recommendations', 'businessImpact', 'strategicPriority', 'competitiveAdvantage', 'measurableOutcomes'],
    clarity: ['analysis', 'recommendations', 'biggestGripe', 'whatMakesGoblinHappy', 'goblinWisdom', 'goblinPrediction'],
    mad: ['hypothesis', 'experiments', 'madScience', 'weirdFindings', 'crazyIdeas', 'labNotes'],
    mad_scientist: ['hypothesis', 'experiments', 'madScience', 'weirdFindings', 'crazyIdeas', 'labNotes'],
    exec: ['executiveSummary', 'businessRisks', 'roiImpact', 'stakeholderConcerns', 'strategicRecommendations', 'competitiveImplications']
  };
  
  const expected = expectedFields[persona as keyof typeof expectedFields] || expectedFields.clarity;
  const hasExpectedFields = expected.every(field => rawData.hasOwnProperty(field));
  
  console.log(`🔍 Persona ${persona} validation:`, {
    expectedFields: expected,
    receivedFields: Object.keys(rawData),
    hasAllExpectedFields: hasExpectedFields,
    missingFields: expected.filter(field => !rawData.hasOwnProperty(field))
  });
  
  if (hasExpectedFields) {
    console.log(`✅ ${persona} data has all expected fields, using as-is`);
    return rawData;
  } else {
    // Try to map generic fields to persona-specific fields
    const mappedData = mapGenericToPersonaSpecific(rawData, persona, summaryText);
    console.log(`🔄 Mapped generic data to ${persona} format:`, Object.keys(mappedData));
    return mappedData;
  }
}

function mapGenericToPersonaSpecific(genericData: any, persona: string, summaryText: string): any {
  console.log(`🔄 Mapping generic data to ${persona} persona format`);
  
  if (persona === 'mirror') {
    return {
      insights: genericData.analysis || summaryText,
      reflection: genericData.goblinWisdom || genericData.analysis || "Reflecting on user experience through empathetic lens",
      visualReflections: Array.isArray(genericData.recommendations) ? genericData.recommendations.slice(0, 3) : [
        "Visual element needs empathetic consideration",
        "Interface should reflect user emotions",
        "Design lacks emotional connection"
      ],
      emotionalImpact: genericData.biggestGripe || "Users may feel confused or frustrated",
      userStory: genericData.goblinPrediction || "Users journey through this interface needs emotional consideration",
      empathyGaps: Array.isArray(genericData.recommendations) ? genericData.recommendations : [
        "Lack of emotional guidance",
        "Missing user sentiment indicators",
        "Insufficient empathetic feedback"
      ]
    };
  } else if (persona === 'strategic') {
    return {
      analysis: genericData.analysis || summaryText,
      recommendations: Array.isArray(genericData.recommendations) ? genericData.recommendations : [
        "Improve strategic user flow",
        "Enhance business goal alignment",
        "Optimize conversion opportunities"
      ],
      businessImpact: genericData.biggestGripe || "Current UX issues may impact business metrics",
      strategicPriority: genericData.goblinWisdom || "Focus on high-impact UX improvements",
      competitiveAdvantage: genericData.whatMakesGoblinHappy || "Opportunity to differentiate through superior UX",
      measurableOutcomes: genericData.goblinPrediction || "Expect improved user engagement and conversion"
    };
  } else if (persona === 'mad' || persona === 'mad_scientist') {
    return {
      hypothesis: genericData.analysis || genericData.hypothesis || summaryText,
      experiments: Array.isArray(genericData.experiments) ? genericData.experiments : 
                   Array.isArray(genericData.recommendations) ? genericData.recommendations : [
        "Try radical interface redesign",
        "Experiment with unconventional patterns",
        "Test wild user interaction approaches"
      ],
      madScience: genericData.madScience || genericData.goblinWisdom || "Mad scientist analysis of UX anomalies",
      weirdFindings: genericData.weirdFindings || genericData.biggestGripe || "Strange UX patterns discovered in the wild",
      crazyIdeas: Array.isArray(genericData.crazyIdeas) ? genericData.crazyIdeas :
                  Array.isArray(genericData.recommendations) ? genericData.recommendations.slice(0, 3) : [
        "Completely unconventional approach 1",
        "Wild experimental solution 2", 
        "Crazy but might work idea 3"
      ],
      labNotes: genericData.labNotes || genericData.goblinPrediction || "Experimental observations on user behavior patterns"
    };
  } else if (persona === 'exec') {
    return {
      executiveSummary: genericData.analysis || summaryText,
      businessRisks: Array.isArray(genericData.recommendations) ? genericData.recommendations : [
        "User experience friction impacts revenue",
        "Competitive disadvantage from poor UX",
        "Brand reputation risk from usability issues"
      ],
      roiImpact: genericData.biggestGripe || "Poor UX directly affects return on investment",
      stakeholderConcerns: genericData.goblinWisdom || "Executive stakeholders need UX clarity",
      strategicRecommendations: Array.isArray(genericData.recommendations) ? genericData.recommendations.slice(0, 3) : [
        "Prioritize high-impact UX improvements",
        "Invest in user experience optimization",
        "Align UX strategy with business goals"
      ],
      competitiveImplications: genericData.goblinPrediction || "UX improvements will enhance competitive position"
    };
  } else {
    // Default to clarity format
    return {
      analysis: genericData.analysis || summaryText,
      recommendations: Array.isArray(genericData.recommendations) ? genericData.recommendations : [
        "Improve interface clarity",
        "Enhance user guidance",
        "Optimize usability"
      ],
      biggestGripe: genericData.biggestGripe || "Interface needs clarity improvements",
      whatMakesGoblinHappy: genericData.whatMakesGoblinHappy || "Clear, intuitive design",
      goblinWisdom: genericData.goblinWisdom || "Best UX is invisible",
      goblinPrediction: genericData.goblinPrediction || "Fix UX issues for better user experience"
    };
  }
}

function createPersonaFallbackData(persona: string, summaryText: string): any {
  console.log(`🆘 Creating fallback data for ${persona} persona`);
  
  if (persona === 'mirror') {
    return {
      insights: summaryText || "Deep empathetic analysis of user experience",
      reflection: "Reflecting user emotions and journey through interface",
      visualReflections: [
        "Interface elements need emotional consideration",
        "Visual design should reflect user feelings",
        "Missing empathetic visual cues"
      ],
      emotionalImpact: "Users may experience confusion and frustration",
      userStory: "Users navigate with uncertainty, seeking emotional connection",
      empathyGaps: [
        "Lack of emotional guidance in interface",
        "Missing user sentiment feedback",
        "Insufficient empathetic design elements"
      ]
    };
  } else if (persona === 'strategic') {
    return {
      analysis: summaryText || "Strategic analysis of business impact",
      recommendations: [
        "Align UX with business objectives",
        "Optimize conversion funnel",
        "Improve strategic user pathways"
      ],
      businessImpact: "UX issues negatively affect business metrics",
      strategicPriority: "Focus on high-impact user experience improvements",
      competitiveAdvantage: "Superior UX creates competitive differentiation",
      measurableOutcomes: "Improved engagement, conversion, and retention"
    };
  } else if (persona === 'mad' || persona === 'mad_scientist') {
    return {
      hypothesis: summaryText || "Mad scientist hypothesis about interface chaos",
      experiments: [
        "Test radical interface overhaul",
        "Try completely unconventional navigation",
        "Experiment with impossible interaction patterns"
      ],
      madScience: "Wild scientific analysis of UX anomalies and pattern disruptions",
      weirdFindings: "Strange behavioral patterns and interface quirks discovered",
      crazyIdeas: [
        "Revolutionary interface concept that breaks all rules",
        "Experimental user flow that defies convention",
        "Insane but potentially brilliant UX solution"
      ],
      labNotes: "Mad scientist observations on user chaos and interface madness"
    };
  } else if (persona === 'exec') {
    return {
      executiveSummary: summaryText || "Executive overview of UX business impact",
      businessRisks: [
        "Revenue loss due to poor user experience",
        "Competitive disadvantage in marketplace",
        "Brand reputation damage from usability failures"
      ],
      roiImpact: "UX issues significantly impact return on investment and profitability",
      stakeholderConcerns: "Critical executive concerns about user experience affecting business outcomes",
      strategicRecommendations: [
        "Invest in comprehensive UX improvement initiative",
        "Prioritize user experience in business strategy",
        "Allocate resources for UX optimization"
      ],
      competitiveImplications: "Superior UX will create significant competitive advantage and market differentiation"
    };
  } else {
    return {
      analysis: summaryText || "Clarity analysis of interface",
      recommendations: [
        "Improve interface clarity and guidance",
        "Enhance visual hierarchy",
        "Optimize user flow patterns"
      ],
      biggestGripe: "Interface lacks clarity and intuitive design",
      whatMakesGoblinHappy: "Clear, obvious design that users understand",
      goblinWisdom: "Best UX is invisible - users focus on goals, not interface",
      goblinPrediction: "Clear UX improvements will reduce user frustration"
    };
  }
}