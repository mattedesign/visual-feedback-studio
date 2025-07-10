import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🎯 Goblin GPT Analyzer - Fallback Analysis Engine v1.0');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, imageUrls, prompt, persona, chatMode, conversationHistory, originalAnalysis, saveInitialOnly, initialContent } = await req.json();

    const actualChatMode = chatMode === true;
    
    console.log(`🎯 GPT Processing request - Session: ${sessionId?.substring(0, 8)}, Persona: ${persona}, Chat: ${actualChatMode}, HasImages: ${!!imageUrls}`);

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured');
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
              model_used: 'gpt-4.1-2025-04-14',
              processing_time_ms: 0,
              metadata: {
                used_persona: persona,
                is_initial_analysis: true,
                save_initial_only: true,
                fallback_model: true
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
            message: 'Initial message saved successfully (GPT fallback)',
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

    // Process images for GPT vision
    const messages = [];
    
    console.log('🔍 GPT IMAGE PROCESSING:', {
      actualChatMode,
      hasImageUrls: !!imageUrls,
      imageUrlsType: typeof imageUrls,
      imageUrlsIsArray: Array.isArray(imageUrls),
      imageUrlsLength: Array.isArray(imageUrls) ? imageUrls.length : 'not array'
    });
    
    if (!actualChatMode && imageUrls) {
      // Normalize imageUrls structure (same logic as Claude analyzer)
      let normalizedImageUrls = [];
      
      if (Array.isArray(imageUrls)) {
        normalizedImageUrls = imageUrls;
      } else if (typeof imageUrls === 'string') {
        normalizedImageUrls = [imageUrls];
      } else if (typeof imageUrls === 'object' && imageUrls) {
        if (imageUrls.url || imageUrls.file_path || imageUrls.storage_url) {
          normalizedImageUrls = [imageUrls];
        } else {
          const possibleArrays = Object.values(imageUrls).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            normalizedImageUrls = possibleArrays[0];
          }
        }
      }
      
      console.log(`📸 Normalized ${normalizedImageUrls.length} image URLs for GPT`);
      
      // Build content array with images (GPT format)
      const content = [];
      
      for (let i = 0; i < Math.min(normalizedImageUrls.length, 3); i++) {
        const imageItem = normalizedImageUrls[i];
        
        let imageUrl = null;
        if (typeof imageItem === 'string') {
          imageUrl = imageItem;
        } else if (typeof imageItem === 'object' && imageItem) {
          imageUrl = imageItem.url || imageItem.file_path || imageItem.storage_url || imageItem.src || imageItem.href;
        }
        
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
          content.push({
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            }
          });
          console.log(`✅ Added image ${i + 1} to GPT request`);
        }
      }
      
      // Build enhanced prompt using unified prompt system
      const promptResponse = await fetch(`${supabaseUrl}/functions/v1/goblin-unified-prompt-system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          persona: persona,
          goal: prompt || 'Analyze this interface for UX improvements',
          imageCount: content.length - 1, // Subtract 1 since we haven't added text yet
          mode: actualChatMode ? 'chat' : 'analysis',
          confidence: 2,
          visionResults: [],
          chatMode: actualChatMode,
          conversationHistory: conversationHistory ? [{ role: 'assistant', content: conversationHistory }] : [],
          previousContext: originalAnalysis || null
        })
      });

      let enhancedPrompt = prompt;
      if (promptResponse.ok) {
        const promptData = await promptResponse.json();
        enhancedPrompt = promptData.prompt || prompt;
        console.log(`✅ Using unified prompt system for persona: ${persona}`);
      } else {
        console.warn(`⚠️ Unified prompt system failed, using fallback for persona: ${persona}`);
        enhancedPrompt = buildPrompt(persona, prompt, actualChatMode, conversationHistory, originalAnalysis);
      }

      // Add text prompt
      content.push({
        type: "text",
        text: enhancedPrompt
      });
      
      messages.push({
        role: "user",
        content: content
      });
      
    } else {
      // Text-only mode for chat - use unified prompt system
      const promptResponse = await fetch(`${supabaseUrl}/functions/v1/goblin-unified-prompt-system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          persona: persona,
          goal: prompt || 'Analyze this interface for UX improvements',
          imageCount: 0,
          mode: actualChatMode ? 'chat' : 'analysis',
          confidence: 2,
          visionResults: [],
          chatMode: actualChatMode,
          conversationHistory: conversationHistory ? [{ role: 'assistant', content: conversationHistory }] : [],
          previousContext: originalAnalysis || null
        })
      });

      let enhancedPrompt = prompt;
      if (promptResponse.ok) {
        const promptData = await promptResponse.json();
        enhancedPrompt = promptData.prompt || prompt;
        console.log(`✅ Using unified prompt system for persona: ${persona}`);
      } else {
        console.warn(`⚠️ Unified prompt system failed, using fallback for persona: ${persona}`);
        enhancedPrompt = buildPrompt(persona, prompt, actualChatMode, conversationHistory, originalAnalysis);
      }

      messages.push({
        role: "user",
        content: enhancedPrompt
      });
    }

    console.log('🚀 Calling GPT API...');

    // Call OpenAI GPT API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: messages,
        max_tokens: 4000,
        temperature: persona === 'clarity' ? 0.3 : 0.7,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GPT API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    
    console.log("🧠 GPT raw response:", JSON.stringify(responseData, null, 2));
    
    const summaryText = responseData.choices?.[0]?.message?.content || '⚠️ No summary returned';
    
    if (!summaryText || summaryText === '⚠️ No summary returned') {
      throw new Error('GPT returned no content.');
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log('✅ GPT analysis completed');

    // Handle conversation persistence (same as Claude)
    if (sessionId && userId && actualChatMode) {
      try {
        console.log(`💬 Starting chat persistence - Session: ${sessionId.substring(0, 8)}`);
        
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
            model_used: 'gpt-4.1-2025-04-14',
            processing_time_ms: processingTime,
            metadata: {
              used_persona: persona,
              is_chat_response: true,
              fallback_model: true
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

    // Parse structured response for non-chat mode
    let parsedData: any = {};
    if (!actualChatMode) {
      try {
        const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
          console.log('✅ Parsed structured data:', Object.keys(parsedData));
        } else {
          // Fallback: create structured data from text
          parsedData = {
            analysis: summaryText,
            recommendations: [
              "Improve interface clarity and user guidance",
              "Enhance visual hierarchy for better content scanning",
              "Optimize user flow and navigation patterns"
            ],
            biggestGripe: "Your interface needs some clarity improvements!",
            whatMakesGoblinHappy: "Clear, obvious design that doesn't make users think",
            goblinWisdom: "The best UX is invisible - users should focus on their goals, not figuring out your interface",
            goblinPrediction: "Once you fix the confusing parts, users will complete tasks faster and with less frustration"
          };
        }
      } catch (parseError) {
        console.error('❌ Failed to parse structured data:', parseError);
        parsedData = {
          analysis: summaryText,
          recommendations: [
            "Improve interface clarity and user guidance",
            "Enhance visual hierarchy for better content scanning",
            "Optimize user flow and navigation patterns"
          ],
          biggestGripe: "Your interface needs some clarity improvements!",
          whatMakesGoblinHappy: "Clear, obvious design that doesn't make users think",
          goblinWisdom: "The best UX is invisible",
          goblinPrediction: "Fix the UX issues and watch user satisfaction improve"
        };
      }
    }

    // Handle initial analysis persistence (non-chat mode)
    if (sessionId && userId && !actualChatMode) {
      try {
        console.log('💾 Saving initial analysis to database');
        
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
              model_used: 'gpt-4.1-2025-04-14',
              processing_time_ms: processingTime,
              metadata: {
                used_persona: persona,
                is_initial_analysis: true,
                parsed_data: parsedData,
                fallback_model: true
              }
            });

          if (initialError) {
            console.error('❌ Failed to save initial analysis:', initialError);
          } else {
            console.log('✅ Initial analysis saved (GPT fallback)');
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
        modelUsed: 'gpt-4.1-2025-04-14',
        fallbackModel: true,
        analysisData: actualChatMode ? { analysis: summaryText } : parsedData,
        rawResponse: summaryText,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ GPT analyzer failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        modelUsed: 'gpt-4.1-2025-04-14',
        fallbackModel: true,
        timestamp: new Date().toISOString(),
        stage: 'gpt_analysis'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Unified prompt builder (same as Claude analyzer)
function buildPrompt(persona: string, userPrompt: string, chatMode: boolean, conversationHistory?: string, originalAnalysis?: any): string {
  let systemInstructions = "";
  
  if (persona === 'clarity') {
    systemInstructions = `You are Clarity, the UX Goblin - a sharp-tongued but brilliant UX critic who helps users improve their designs. You're honest, direct, and sometimes sarcastic, but always helpful.

Key traits:
- Direct and honest feedback, no sugarcoating
- Use goblin-like expressions occasionally ("goblin wisdom", "makes the goblin happy/grumpy")
- Focus on practical, actionable insights
- Spot usability issues quickly
- Care deeply about user experience

Your analysis should be structured and include:
- What's working well
- What needs improvement
- Specific actionable recommendations
- Goblin wisdom/predictions about user behavior`;
  } else {
    systemInstructions = `You are a UX analysis assistant with the "${persona}" persona. Provide thorough, professional analysis focused on practical improvements.`;
  }

  if (chatMode && conversationHistory) {
    return `${systemInstructions}

Previous conversation context:
${conversationHistory}

Original analysis context: ${originalAnalysis ? JSON.stringify(originalAnalysis) : 'None'}

Current user question: ${userPrompt}

Respond as the goblin persona, continuing the conversation naturally.`;
  } else if (chatMode && originalAnalysis) {
    return `${systemInstructions}

You're continuing a conversation about this analysis:
${JSON.stringify(originalAnalysis)}

User's follow-up question: ${userPrompt}

Respond as the goblin persona, building on the previous analysis.`;
  } else {
    return `${systemInstructions}

User context: ${userPrompt}

Please analyze the provided interface images and provide structured feedback. Return a JSON object with:
{
  "analysis": "Main analysis text",
  "recommendations": ["actionable recommendation 1", "recommendation 2", "recommendation 3"],
  "biggestGripe": "What annoys the goblin most",
  "whatMakesGoblinHappy": "What the goblin likes",
  "goblinWisdom": "Key insight or prediction",
  "goblinPrediction": "What will happen if changes are made"
}`;
  }
}