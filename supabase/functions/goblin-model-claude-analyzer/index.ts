import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    const actualChatMode = chatMode === true; // Default to false (non-chat mode) for image processing
    
    console.log(`🎯 Processing request - Session: ${sessionId?.substring(0, 8)}, Persona: ${persona}, Chat: ${actualChatMode}`);

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
      
      console.log(`📸 Processing ${normalizedImageUrls.length} images for session ${sessionId?.substring(0, 8)}`);
      
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
          
          console.log(`📊 Image ${i + 1}: ${sizeInMB.toFixed(2)}MB, ${contentType}`);
          
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
      
      console.log(`✅ Image processing completed - ${imageContent.length}/${normalizedImageUrls.length} images processed`);
    }

    // Build enhanced prompt
    const enhancedPrompt = buildPrompt(persona, prompt, actualChatMode, conversationHistory, originalAnalysis);
    
    // Build message content
    const messageContent = [
      { type: 'text', text: enhancedPrompt },
      ...imageContent
    ];

    // Log what we're sending to Claude
    console.log(`🎯 Preparing Claude request - ${imageContent.length} images, ${enhancedPrompt.length} chars`);

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
          console.error('❌ Failed to save AI message:', aiError);
        } else {
          console.log(`✅ AI message saved - Order: ${nextOrder + 1}, Time: ${processingTime}ms`);
        }

      } catch (persistError) {
        console.error('❌ Failed to persist conversation:', persistError);
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