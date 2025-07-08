import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🤖 Goblin Claude Analyzer - Enhanced Debug v3');

// Enhanced logging function
function logDebug(category: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🐛 [${category}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, imageUrls, prompt, persona, chatMode, conversationHistory, originalAnalysis, saveInitialOnly, initialContent } = await req.json();

    // CRITICAL FIX: Ensure chatMode is properly defaulted for image processing
    const actualChatMode = chatMode === true; // Default to false (non-chat mode) for image processing
    
    logDebug('INIT', 'Processing Claude analysis request', {
      sessionId: sessionId?.substring(0, 8),
      persona,
      chatMode: actualChatMode,
      chatModeRaw: chatMode,
      saveInitialOnly: !!saveInitialOnly,
      promptLength: prompt?.length,
      hasInitialContent: !!initialContent,
      hasImageUrls: !!imageUrls,
      imageUrlsLength: Array.isArray(imageUrls) ? imageUrls.length : 0,
      hasConversationHistory: !!conversationHistory,
      imageProcessingCondition: !actualChatMode && imageUrls && Array.isArray(imageUrls)
    });

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
          logDebug('AUTH', 'User authenticated successfully', { userId: userId.substring(0, 8) });
        } else {
          logDebug('AUTH', 'Authentication failed', { error: userError?.message });
        }
      } catch (authError) {
        logDebug('AUTH', 'Authentication error', { error: (authError as Error).message });
      }
    }

    // Special handling for saveInitialOnly mode
    if (saveInitialOnly && initialContent && sessionId && userId) {
      logDebug('PERSISTENCE', 'Saving initial message only', { sessionId: sessionId.substring(0, 8), contentLength: initialContent.length });
      
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

          logDebug('PERSISTENCE', 'Initial message saved successfully', { insertResult });
        } else {
          logDebug('PERSISTENCE', 'Initial message already exists, skipping');
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
        logDebug('PERSISTENCE', 'Save initial failed', { error: (error as Error).message });
        throw error;
      }
    }

    const startTime = Date.now();

    // ✅ ROBUST: Handle imageUrls safely - can be null, undefined, single object, or array
    const imageContent = [];
    if (!actualChatMode && imageUrls) {
      // Normalize imageUrls to always be an array
      let normalizedImageUrls = [];
      
      if (Array.isArray(imageUrls)) {
        normalizedImageUrls = imageUrls;
      } else if (typeof imageUrls === 'object' && imageUrls !== null) {
        // Single image object
        normalizedImageUrls = [imageUrls];
      } else if (typeof imageUrls === 'string') {
        // Single URL string
        normalizedImageUrls = [{ url: imageUrls, file_path: imageUrls }];
      }
      
      logDebug('IMAGE_PROCESSING', 'Starting robust image processing', {
        originalImageUrls: imageUrls,
        normalizedCount: normalizedImageUrls.length,
        actualChatMode,
        sessionId: sessionId?.substring(0, 8)
      });
      
      for (let i = 0; i < Math.min(normalizedImageUrls.length, 3); i++) {
        const imageItem = normalizedImageUrls[i];
        const imageUrl = imageItem?.url || imageItem?.file_path || imageItem;
        
        if (!imageUrl || typeof imageUrl !== 'string') {
          console.warn(`⚠️ Invalid image URL at index ${i}:`, imageItem);
          continue;
        }
        
        try {
          console.log(`📥 Fetching image ${i + 1}: ${imageUrl}`);
          
          // ✅ SIMPLIFIED: Use simple fetch - URLs are already properly constructed
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
          }
          
          const imageBlob = await imageResponse.blob();
          const contentType = imageResponse.headers.get('content-type') || 'image/png';
          
          // Convert blob to array buffer
          const arrayBuffer = await imageBlob.arrayBuffer();
          const sizeInMB = arrayBuffer.byteLength / (1024 * 1024);
          
          logDebug('IMAGE_PROCESSING', 'Image size check', { 
            imageIndex: i + 1, 
            sizeInMB: sizeInMB.toFixed(2),
            contentType 
          });
          
          if (sizeInMB > 20) {
            console.warn(`⚠️ Image ${i + 1} too large (${sizeInMB.toFixed(2)}MB), skipping`);
            continue;
          }
          
          // Convert to base64
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          imageContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: contentType,
              data: base64
            }
          });
          
          console.log(`✅ Image ${i + 1} processed successfully (${sizeInMB.toFixed(2)}MB, ${contentType})`);
          
        } catch (error) {
          console.error(`❌ Failed to process image ${i + 1}:`, error);
          continue;
        }
      }
      
      logDebug('IMAGE_PROCESSING', 'Image processing completed', { 
        totalImages: normalizedImageUrls.length,
        processedImages: imageContent.length,
        skippedImages: normalizedImageUrls.length - imageContent.length
      });
    }

    // Build enhanced prompt
    const enhancedPrompt = buildPrompt(persona, prompt, actualChatMode, conversationHistory, originalAnalysis);
    
    // Build message content
    const messageContent = [
      { type: 'text', text: enhancedPrompt },
      ...imageContent
    ];

    // Log what we're sending to Claude
    logDebug('CLAUDE_API', 'Preparing Claude request', {
      sessionId: sessionId?.substring(0, 8),
      persona,
      actualChatMode,
      imageCount: imageContent.length,
      messageContentLength: messageContent.length,
      promptLength: enhancedPrompt.length
    });

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
        messages: [{
          role: 'user',
          content: messageContent
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Claude analysis completed');

    // Handle conversation persistence SIMPLIFIED
    if (sessionId && userId && actualChatMode) {
      try {
        logDebug('PERSISTENCE', 'Starting chat message persistence', { sessionId: sessionId.substring(0, 8), userId: userId.substring(0, 8) });
        
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
          logDebug('PERSISTENCE', 'Failed to save user message', { error: userError.message, code: userError.code });
        } else {
          logDebug('PERSISTENCE', 'User message saved successfully', { messageOrder: nextOrder });
        }

        // Insert AI response
        const { error: aiError } = await supabase
          .from('goblin_refinement_history')
          .insert({
            session_id: sessionId,
            user_id: userId,
            message_order: nextOrder + 1,
            role: 'clarity',
            content: content,
            conversation_stage: 'chat',
            model_used: 'claude-sonnet-4-20250514',
            processing_time_ms: processingTime,
            metadata: {
              used_persona: persona,
              is_chat_response: true
            }
          });

        if (aiError) {
          logDebug('PERSISTENCE', 'Failed to save AI message', { error: aiError.message, code: aiError.code });
        } else {
          logDebug('PERSISTENCE', 'AI message saved successfully', { messageOrder: nextOrder + 1, processingTime });
        }

      } catch (persistError) {
        logDebug('PERSISTENCE', 'Failed to persist conversation', { error: (persistError as Error).message });
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
              content: content,
              conversation_stage: 'initial',
              model_used: 'claude-sonnet-4-20250514',
              processing_time_ms: processingTime,
              metadata: {
                used_persona: persona,
                is_initial_analysis: true
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
        analysisData: { analysis: content },
        rawResponse: content,
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

  let basePrompt = personaInstructions[persona as keyof typeof personaInstructions] || personaInstructions.clarity;
  
  if (chatMode && conversationHistory) {
    basePrompt += `\n\nConversation history:\n${conversationHistory}\n\nUser's new question: ${userPrompt}`;
    
    if (originalAnalysis) {
      try {
        basePrompt += `\n\nOriginal analysis context: ${JSON.stringify(originalAnalysis).substring(0, 500)}...`;
      } catch (err) {
        basePrompt += `\n\nOriginal analysis context: [Complex analysis object - ${typeof originalAnalysis}]`;
      }
    }
  } else {
    basePrompt += `\n\nUser's request: ${userPrompt}`;
  }

  return basePrompt;
}