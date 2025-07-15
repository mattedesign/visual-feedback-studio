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
      
      // Process up to 5 images (Claude's practical limit)
      const maxImages = Math.min(actualImageUrls.length, 5);
      for (let i = 0; i < maxImages; i++) {
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
    clarity: `You are "Clarity the Goblin Mentor," a seasoned senior UX strategist. You tell the hard truths about design with wit and directness.`,
    strategic: `You are "Clarity the Goblin Mentor," a seasoned senior UX strategist. Focus on business impact, user goals, and measurable outcomes.`,
    mirror: `You are "Clarity the Goblin Mentor," a seasoned senior UX strategist. Reflect back what users might feel and experience.`,
    mad: `You are "Clarity the Goblin Mentor," a seasoned senior UX strategist. Think outside the box with creative, experimental approaches.`,
    mad_scientist: `You are "Clarity the Goblin Mentor," a seasoned senior UX strategist. Think outside the box with creative, experimental approaches.`,
    exec: `You are "Clarity the Goblin Mentor," a seasoned senior UX strategist. Focus on business impact, ROI, and stakeholder communication.`
  };

  // Enhanced persona-specific JSON templates with suggested_fix and top_fix_summary
  const personaJsonTemplates = {
    mirror: {
      "insights": "Deep empathetic analysis of specific interface elements and their emotional impact",
      "reflection": "Mirror reflection of how specific UI elements affect user emotions",
      "visualReflections": ["Specific visual element 1 reflection", "Element 2 emotional impact", "Element 3 user feeling"],
      "emotionalImpact": "How specific design elements make users feel emotionally",
      "userStory": "The emotional journey through specific interface elements",
      "empathyGaps": ["Specific gap 1 where interface lacks empathy", "Specific emotional disconnect 2", "Missing empathy element 3"],
      "issues": [
        {
          "id": "empathy_issue_1",
          "type": "emotional_design",
          "description": "Specific description of how this element affects user emotions",
          "impact": "How this impacts user emotional experience",
          "priority": "medium",
          "suggested_fix": "Concrete visual fix like 'Add warm color palette #FF6B35 to buttons and change font to friendly Nunito'"
        }
      ],
      "top_fix_summary": [
        "Most impactful emotional design improvement for user goal",
        "Second highest priority empathetic enhancement",
        "Third critical emotional connection fix"
      ],
      "annotations": [
        {
          "x": 100,
          "y": 200,
          "title": "Emotional Design Issue",
          "description": "Specific description of how this element affects user emotions",
          "solution": "Empathetic improvement for this specific element",
          "category": "emotional_design",
          "priority": "medium"
        }
      ]
    },
    strategic: {
      "analysis": "Strategic UX analysis of specific interface elements and business impact",
      "recommendations": ["Specific business-focused fix for element 1", "Strategic improvement for component 2", "ROI-focused change for element 3"],
      "businessImpact": "How specific UX issues in visible elements affect business metrics",
      "strategicPriority": "Most critical UX element needing strategic attention",
      "competitiveAdvantage": "Specific UX opportunities for differentiation in visible interface",
      "measurableOutcomes": "Expected improvements from fixing specific identified issues",
      "issues": [
        {
          "id": "strategic_issue_1",
          "type": "business_impact",
          "description": "Specific business impact of this interface element",
          "impact": "How this affects business metrics and ROI",
          "priority": "high",
          "suggested_fix": "Strategic fix like 'Move CTA above fold at y:200 with #0055FF background to increase conversion by 15%'"
        }
      ],
      "top_fix_summary": [
        "Highest ROI strategic improvement for business goals",
        "Critical business impact fix for competitive advantage",
        "Essential strategic enhancement for measurable outcomes"
      ],
      "annotations": [
        {
          "x": 150,
          "y": 300,
          "title": "Strategic UX Issue",
          "description": "Specific business impact of this interface element",
          "solution": "Strategic fix with measurable business outcome",
          "category": "business_impact",
          "priority": "high"
        }
      ]
    },
    clarity: {
      "analysis": "Brutally honest analysis of specific interface problems",
      "recommendations": ["Specific actionable fix for visible problem 1", "Clear solution for element 2", "Direct improvement for issue 3"],
      "biggestGripe": "The most annoying specific UX problem in the visible interface",
      "whatMakesGoblinHappy": "Specific elements that actually work well in this design",
      "goblinWisdom": "Key insight about specific interface problems and solutions",
      "goblinPrediction": "What will happen when specific identified problems are fixed",
      "issues": [
        {
          "id": "clarity_issue_1",
          "type": "usability",
          "description": "Specific description of what's confusing about this element",
          "impact": "How this confuses users and blocks their goals",
          "priority": "high",
          "suggested_fix": "Clear actionable fix like 'Change button text from \"Submit\" to \"Complete Purchase\" and move to top-right at position x:750'"
        }
      ],
      "top_fix_summary": [
        "Most critical clarity improvement for user success",
        "Essential usability fix for interface comprehension", 
        "Key improvement for eliminating user confusion"
      ],
      "annotations": [
        {
          "x": 200,
          "y": 400,
          "title": "Clarity Problem",
          "description": "Specific description of what's confusing about this element",
          "solution": "Clear, actionable fix for this specific problem",
          "category": "usability",
          "priority": "high"
        }
      ]
    },
    mad: {
      "hypothesis": "Specific experimental hypothesis about actual interface problems observed",
      "experiments": ["Precise experiment targeting visible element 1", "experiment for specific UI issue 2", "targeted test for observed problem 3"],
      "madScience": "Scientific analysis of specific UI problems in the uploaded interface",
      "weirdFindings": "Specific anomalies or patterns found in the actual interface elements",
      "crazyIdeas": ["Actionable experimental solution for specific problem 1", "targeted fix for observed issue 2", "specific improvement for visible element 3"],
      "labNotes": "Precise observations about specific interface elements and their usability issues",
      "issues": [
        {
          "id": "mad_issue_1",
          "type": "experimental",
          "description": "Precise description of what's wrong with this specific element",
          "impact": "How this interface anomaly affects user experimentation",
          "priority": "high",
          "suggested_fix": "Experimental fix like 'Replace standard button with interactive hover-morphing element at coordinates x:400 y:300'"
        }
      ],
      "top_fix_summary": [
        "Most radical experimental improvement for innovation",
        "Wildest creative solution for user engagement",
        "Most unconventional fix for interface breakthrough"
      ],
      "annotations": [
        {
          "x": 100,
          "y": 200,
          "title": "Specific Element Problem",
          "description": "Precise description of what's wrong with this specific element",
          "solution": "Actionable experimental fix",
          "category": "usability",
          "priority": "high"
        }
      ]
    },
    mad_scientist: {
      "hypothesis": "Specific experimental hypothesis about actual interface problems observed",
      "experiments": ["Precise experiment targeting visible element 1", "experiment for specific UI issue 2", "targeted test for observed problem 3"],
      "madScience": "Scientific analysis of specific UI problems in the uploaded interface",
      "weirdFindings": "Specific anomalies or patterns found in the actual interface elements",
      "crazyIdeas": ["Actionable experimental solution for specific problem 1", "targeted fix for observed issue 2", "specific improvement for visible element 3"],
      "labNotes": "Precise observations about specific interface elements and their usability issues",
      "issues": [
        {
          "id": "mad_scientist_issue_1",
          "type": "experimental",
          "description": "Precise description of what's wrong with this specific element",
          "impact": "How this interface anomaly affects user experimentation",
          "priority": "high",
          "suggested_fix": "Experimental fix like 'Replace standard button with interactive hover-morphing element at coordinates x:400 y:300'"
        }
      ],
      "top_fix_summary": [
        "Most radical experimental improvement for innovation",
        "Wildest creative solution for user engagement",
        "Most unconventional fix for interface breakthrough"
      ],
      "annotations": [
        {
          "x": 100,
          "y": 200,
          "title": "Specific Element Problem",
          "description": "Precise description of what's wrong with this specific element",
          "solution": "Actionable experimental fix",
          "category": "usability",
          "priority": "high"
        }
      ]
    },
    exec: {
      "executiveSummary": "High-level executive summary of specific UX impact on business",
      "businessRisks": ["Specific revenue risk from visible UX issue 1", "Business impact from interface problem 2", "Strategic risk from usability issue 3"],
      "roiImpact": "Return on investment implications of specific interface problems",
      "stakeholderConcerns": "Key executive concerns about specific UX issues affecting business",
      "strategicRecommendations": ["Executive fix for specific problem 1", "Strategic solution for issue 2", "ROI-focused improvement for element 3"],
      "competitiveImplications": "How specific UX problems affect competitive positioning",
      "issues": [
        {
          "id": "exec_issue_1",
          "type": "business_impact",
          "description": "Specific business impact of this interface element",
          "impact": "How this affects executive KPIs and business outcomes",
          "priority": "high",
          "suggested_fix": "Executive fix like 'Redesign conversion funnel with 25% larger CTA at position x:600 to achieve 10% revenue increase'"
        }
      ],
      "top_fix_summary": [
        "Highest business impact strategic fix for revenue growth",
        "Critical executive priority for competitive positioning",
        "Essential ROI improvement for stakeholder satisfaction"
      ],
      "annotations": [
        {
          "x": 250,
          "y": 500,
          "title": "Executive UX Concern",
          "description": "Specific business impact of this interface element",
          "solution": "Executive-level strategic fix for this problem",
          "category": "business_impact",
          "priority": "high"
        }
      ]
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

You MUST produce JSON ONLY.
You MUST follow the exact schema below.
Do NOT add keys, do NOT change field names, do NOT return Markdown or narrative text.

CONTEXT
User Goal: ${userPrompt}
Screen Data: [Analyzing uploaded interface images]

INSTRUCTIONS
For EACH screen object analyzed:
  • Keep all existing keys.
  • For every issue inside issues[], ADD a key "suggested_fix".
  • "suggested_fix" must be 1-2 sentences, concrete and visual (e.g., "Move the CTA above the fold and use a contrasting #0055FF background").
  • ADD a screen-level array "top_fix_summary" (2–3 bullets summarising the highest-impact fixes).
  • Tailor fixes toward the user goal: ${userPrompt}.
  • Priority field stays "high | medium | low" based on user goal impact.
  • Do NOT mention these instructions.

SCHEMA (unchanged keys in CAPS, new keys marked ➕)
Required JSON format for ${persona} persona:
${JSON.stringify(jsonTemplate, null, 2)}

FAIL-SAFE RULES
If any element is missing or uncertain:
  • Still output valid JSON; leave value "".
Never invent extra top-level keys.
Never output Markdown, bullets, or prose outside JSON.

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