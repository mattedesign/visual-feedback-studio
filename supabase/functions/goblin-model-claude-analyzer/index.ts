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

    // CRITICAL FIX: Ensure chatMode is properly defaulted for image processing
    const actualChatMode = chatMode === true;
    
    console.log(`🎯 Processing request - Session: ${sessionId?.substring(0, 8)}, Persona: ${persona}, Chat: ${actualChatMode}, HasImages: ${!!imageUrls}`);

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
                used_persona: persona,
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
            persona,
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

    // ✅ ENHANCED: Handle imageUrls with comprehensive debugging and validation
    const imageContent = [];
    
    console.log('🔍 COMPREHENSIVE IMAGE DEBUGGING:', {
      actualChatMode,
      hasImageUrls: !!imageUrls,
      imageUrlsType: typeof imageUrls,
      imageUrlsIsArray: Array.isArray(imageUrls),
      imageUrlsLength: Array.isArray(imageUrls) ? imageUrls.length : 'not array',
      imageUrlsStringified: JSON.stringify(imageUrls, null, 2),
      imageUrlsKeys: typeof imageUrls === 'object' && imageUrls ? Object.keys(imageUrls) : 'not object'
    });
    
    if (!actualChatMode && imageUrls) {
      // ✅ ENHANCED: Better normalization of imageUrls structure
      let normalizedImageUrls = [];
      
      if (Array.isArray(imageUrls)) {
        normalizedImageUrls = imageUrls;
        console.log('📸 imageUrls is already an array');
      } else if (typeof imageUrls === 'string') {
        normalizedImageUrls = [imageUrls];
        console.log('📸 imageUrls is a string, wrapping in array');
      } else if (typeof imageUrls === 'object' && imageUrls) {
        // Handle object with potential nested structure
        if (imageUrls.url || imageUrls.file_path || imageUrls.storage_url) {
          normalizedImageUrls = [imageUrls];
          console.log('📸 imageUrls is an object with URL property');
        } else {
          // Try to find arrays or URL-like properties in the object
          const possibleArrays = Object.values(imageUrls).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            normalizedImageUrls = possibleArrays[0];
            console.log('📸 Found array within imageUrls object');
          } else {
            console.warn('❌ Could not normalize imageUrls object structure');
          }
        }
      } else {
        console.warn('❌ imageUrls has unexpected structure');
      }
      
      console.log('📸 Normalized image URLs:', {
        count: normalizedImageUrls.length,
        structure: normalizedImageUrls.map((item, idx) => ({
          index: idx,
          type: typeof item,
          isString: typeof item === 'string',
          hasUrl: item?.url ? 'yes' : 'no',
          hasFilePath: item?.file_path ? 'yes' : 'no',
          hasStorageUrl: item?.storage_url ? 'yes' : 'no',
          value: typeof item === 'string' ? item : JSON.stringify(item)
        }))
      });
      
      for (let i = 0; i < Math.min(normalizedImageUrls.length, 3); i++) {
        const imageItem = normalizedImageUrls[i];
        
        // ✅ ENHANCED: More comprehensive URL extraction
        let imageUrl = null;
        
        if (typeof imageItem === 'string') {
          imageUrl = imageItem;
        } else if (typeof imageItem === 'object' && imageItem) {
          // Try multiple possible URL properties
          imageUrl = imageItem.url || imageItem.file_path || imageItem.storage_url || imageItem.src || imageItem.href;
        }
        
        console.log(`📸 Processing image ${i + 1}:`, {
          originalItem: typeof imageItem === 'string' ? imageItem : JSON.stringify(imageItem),
          extractedUrl: imageUrl,
          urlValid: !!(imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0)
        });
        
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
          console.warn(`❌ Invalid or missing image URL at index ${i}:`, { imageItem, imageUrl });
          continue;
        }
        
        try {
          console.log(`🔄 Fetching image ${i + 1} from: ${imageUrl.substring(0, 100)}...`);
          
          const imageResponse = await fetch(imageUrl);
          
          console.log(`📡 Image ${i + 1} fetch response:`, {
            ok: imageResponse.ok,
            status: imageResponse.status,
            statusText: imageResponse.statusText,
            contentType: imageResponse.headers.get('content-type'),
            contentLength: imageResponse.headers.get('content-length')
          });
          
          if (!imageResponse.ok) {
            console.warn(`❌ Failed to fetch image ${i + 1}: ${imageResponse.status} ${imageResponse.statusText}`);
            continue;
          }
          
          const imageBlob = await imageResponse.blob();
          console.log(`📦 Image ${i + 1} blob size: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
          
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          const contentType = imageResponse.headers.get('content-type') || 'image/png';
          
          const imageContentItem = {
            type: 'image',
            source: {
              type: 'base64',
              media_type: contentType,
              data: base64
            }
          };
          
          imageContent.push(imageContentItem);
          
          console.log(`✅ Image ${i + 1} processed successfully:`, {
            contentType,
            base64Length: base64.length,
            mediaType: contentType
          });
          
        } catch (error) {
          console.error(`❌ Failed to process image ${i + 1}:`, {
            error: error.message,
            stack: error.stack,
            imageUrl: imageUrl.substring(0, 100)
          });
        }
      }
      
      // ✅ ENHANCED: Validation that images were actually processed
      console.log(`🎉 Image processing complete:`, {
        totalImagesAttempted: normalizedImageUrls.length,
        imagesSuccessfullyProcessed: imageContent.length,
        readyForClaude: imageContent.length > 0
      });
      
      if (normalizedImageUrls.length > 0 && imageContent.length === 0) {
        console.error('❌ CRITICAL: No images were successfully processed despite having image URLs!');
        console.error('❌ This means Claude will not receive any images to analyze!');
      }
    }

    // Build enhanced prompt
    const enhancedPrompt = buildPrompt(persona, prompt, actualChatMode, conversationHistory, originalAnalysis);
    
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
        temperature: persona === 'clarity' ? 0.3 : 0.7,
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
              used_persona: persona,
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
          parsedData = validateAndNormalizePersonaData(rawParsed, persona, summaryText);
          console.log('✅ Validated structured data for persona:', persona, 'Fields:', Object.keys(parsedData));
        } else {
          console.warn('❌ No valid JSON found in response, creating fallback data');
          parsedData = createPersonaFallbackData(persona, summaryText);
        }
      } catch (parseError) {
        console.error('❌ Failed to parse structured data:', parseError);
        console.error('❌ Raw response excerpt:', summaryText.substring(0, 500));
        parsedData = createPersonaFallbackData(persona, summaryText);
      }
    }

    // Handle initial analysis persistence (non-chat mode)
    if (sessionId && userId && !actualChatMode) {
      try {
        console.log('💾 Saving initial analysis to database');
        
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
                used_persona: persona,
                is_initial_analysis: true,
                parsed_data: parsedData
              }
            });

          if (initialError) {
            console.error('❌ Failed to save initial analysis:', initialError);
          } else {
            console.log('✅ Initial analysis saved');
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
        persona,
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

function buildPrompt(persona: string, userPrompt: string, chatMode: boolean, conversationHistory?: string, originalAnalysis?: any): string {
  const personaInstructions = {
    clarity: `You are Clarity, the brutally honest UX goblin. You tell the hard truths about design with wit and directness. Be specific, actionable, and don't sugarcoat issues.`,
    strategic: `You are a strategic UX analyst. Focus on business impact, user goals, and measurable outcomes. Provide strategic recommendations.`,
    mirror: `You are an empathetic UX mirror. Reflect back what users might feel and experience. Focus on emotional aspects of the design.`,
    mad: `You are the Mad UX Scientist. Think outside the box with creative, experimental approaches to UX problems.`,
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
    // Get persona-specific JSON template
    const jsonTemplate = personaJsonTemplates[persona as keyof typeof personaJsonTemplates] || personaJsonTemplates.clarity;
    
    basePrompt += `\n\nAnalyze the uploaded interface images and provide a structured response in JSON format with these exact fields for the ${persona} persona:
${JSON.stringify(jsonTemplate, null, 2)}

CRITICAL: Your response must be valid JSON that exactly matches the field names above. For the ${persona} persona, you MUST use these specific fields:
${Object.keys(jsonTemplate).map(key => `- "${key}"`).join('\n')}

User's request: ${userPrompt}

Be thorough, specific, and maintain your ${persona} personality throughout the analysis. Provide detailed insights for each required field.`;
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
  } else if (persona === 'mad') {
    return {
      hypothesis: genericData.analysis || summaryText,
      experiments: Array.isArray(genericData.recommendations) ? genericData.recommendations : [
        "Try radical interface redesign",
        "Experiment with unconventional patterns",
        "Test wild user interaction approaches"
      ],
      madScience: genericData.goblinWisdom || "Mad scientist analysis of UX anomalies",
      weirdFindings: genericData.biggestGripe || "Strange UX patterns discovered in the wild",
      crazyIdeas: Array.isArray(genericData.recommendations) ? genericData.recommendations.slice(0, 3) : [
        "Completely unconventional approach 1",
        "Wild experimental solution 2", 
        "Crazy but might work idea 3"
      ],
      labNotes: genericData.goblinPrediction || "Experimental observations on user behavior patterns"
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
  } else if (persona === 'mad') {
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