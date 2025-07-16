import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Configuration for image processing
const MAX_IMAGES = 3; // Limit to 3 images for better performance
const MAX_IMAGE_SIZE_MB = 15; // 15MB limit per image (under Claude's 20MB)
const IMAGE_FETCH_TIMEOUT = 15000; // 15 second timeout
const ANALYSIS_TIMEOUT = 45000; // 45 second timeout for Claude

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, images, persona } = await req.json();

    console.log(`🎯 Goblin Chat Analyzer V2: Processing message for session ${sessionId}`, {
      messageLength: message?.length,
      imagesCount: images?.length,
      persona,
      timestamp: new Date().toISOString()
    });

    // Validation
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    if (!message?.trim()) {
      throw new Error('Message content is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get session data with better error handling
    const { data: sessionData, error: sessionError } = await supabase
      .from('goblin_analysis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('❌ Session lookup failed:', sessionError);
      throw new Error(`Session not found or inaccessible: ${sessionError.message}`);
    }

    if (!sessionData) {
      throw new Error('Session data is empty');
    }

    // Get conversation history (limited for performance)
    const { data: conversationHistory } = await supabase
      .from('goblin_refinement_history')
      .select('role, content, created_at, metadata')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10); // Reduced to last 10 messages for better performance

    // Get latest analysis data for context
    const { data: analysisData } = await supabase
      .from('goblin_analysis_results')
      .select('persona_feedback')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build enhanced system prompt
    const personaType = sessionData?.persona_type || persona || 'clarity';
    const analysisContext = analysisData?.persona_feedback || {};
    
    // Format conversation history more efficiently
    const recentContext = conversationHistory?.length > 0 
      ? conversationHistory.slice(-6).map((msg: any) => `${msg.role}: ${msg.content.substring(0, 200)}`).join('\n\n')
      : 'This is the start of our conversation.';

    const systemPrompt = `You are Figmant's UX Analysis AI, specialized in ${personaType} analysis. You're helping analyze UI/UX designs through interactive conversation.

## Current Context:
- Session: ${sessionData?.title || 'UX Analysis'}
- Persona: ${personaType}
- Images: ${Math.min(images?.length || 0, MAX_IMAGES)} uploaded
- Analysis Available: ${analysisContext ? 'Yes' : 'No'}

## Response Guidelines:
- Be conversational and actionable
- Reference uploaded images when relevant
- Provide specific, implementable recommendations
- Create annotations for UI elements when asked (coordinates 0-100 scale)

## JSON Response Format (REQUIRED):
{
  "content": "Your helpful response",
  "type": "text",
  "annotation": {
    "x": 25, "y": 15, "width": 30, "height": 20,
    "label": "Issue Name", "feedback_type": "usability",
    "description": "Clear description", "confidence": 0.85
  },
  "insights": [{
    "category": "usability", "title": "Clear title",
    "description": "Specific description", "priority": "high",
    "confidence_score": 0.9, "recommendation": "Action to take"
  }]
}

## Recent Conversation:
${recentContext}

## User's Message:
"${message.substring(0, 500)}"

Analyze and respond in valid JSON format only.`;

    // Prepare content for Claude API
    const messageContent = [
      {
        type: 'text',
        text: systemPrompt
      }
    ];

    // Process images with improved error handling and limits
    if (images && images.length > 0) {
      console.log(`📸 Processing up to ${MAX_IMAGES} images for analysis`);
      
      const imagesToProcess = images.slice(0, MAX_IMAGES); // Limit images
      let processedCount = 0;
      
      for (const image of imagesToProcess) {
        try {
          let imageUrl = image.url || image.file_path;
          
          if (!imageUrl) {
            console.warn(`⚠️ Skipping image with no URL: ${image.name || 'unnamed'}`);
            continue;
          }

          console.log(`🔍 Processing image: ${image.name || 'unnamed'} - ${imageUrl.substring(0, 80)}...`);
          
          // Handle different URL types more robustly
          if (imageUrl.includes('token=')) {
            console.log('✅ Using existing signed URL');
          } else if (!imageUrl.startsWith('http')) {
            // Storage path - convert to signed URL
            const { data: signedUrlData, error: signError } = await supabase.storage
              .from('analysis-images')
              .createSignedUrl(imageUrl, 3600);
            
            if (signError || !signedUrlData?.signedUrl) {
              console.warn(`⚠️ Failed to create signed URL for ${imageUrl}: ${signError?.message}`);
              continue;
            }
            
            imageUrl = signedUrlData.signedUrl;
            console.log('✅ Generated signed URL');
          }

          // Fetch image with timeout and size check
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT);
          
          try {
            const imageResponse = await fetch(imageUrl, { 
              signal: controller.signal,
              headers: { 'User-Agent': 'Goblin-UX-Analyzer/2.0' }
            });
            
            clearTimeout(timeoutId);
            
            if (!imageResponse.ok) {
              console.warn(`⚠️ Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
              continue;
            }

            const imageBuffer = await imageResponse.arrayBuffer();
            const fileSizeMB = imageBuffer.byteLength / (1024 * 1024);
            
            console.log(`📏 Image size: ${fileSizeMB.toFixed(1)}MB`);
            
            if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
              console.warn(`⚠️ Image too large (${fileSizeMB.toFixed(1)}MB), skipping`);
              continue;
            }

            // Determine content type
            const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            let mediaType = 'image/jpeg';
            if (contentType.includes('png')) mediaType = 'image/png';
            else if (contentType.includes('webp')) mediaType = 'image/webp';

            // Convert to base64 efficiently
            const uint8Array = new Uint8Array(imageBuffer);
            const base64Data = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
            
            messageContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            });
            
            processedCount++;
            console.log(`✅ Image ${processedCount} processed: ${mediaType}, ${fileSizeMB.toFixed(1)}MB`);
            
          } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              console.warn(`⚠️ Image fetch timeout: ${image.name || 'unnamed'}`);
            } else {
              console.warn(`⚠️ Image fetch error: ${fetchError.message}`);
            }
            continue;
          }
          
        } catch (error) {
          console.error(`❌ Error processing image ${image.name || 'unnamed'}:`, error.message);
          continue;
        }
      }
      
      console.log(`✅ Successfully processed ${processedCount}/${imagesToProcess.length} images`);
    }

    // Call Claude API with timeout
    console.log('🤖 Calling Claude API...');
    const claudeStartTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT);
    
    let claudeResponse;
    try {
      claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey!,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500, // Reduced for faster response
          messages: [{ role: 'user', content: messageContent }],
          temperature: 0.7
        })
      });
      
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Analysis timed out. Please try again with fewer images or a shorter message.');
      }
      throw new Error(`Claude API request failed: ${fetchError.message}`);
    }

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text().catch(() => 'Unknown error');
      console.error(`Claude API error ${claudeResponse.status}:`, errorBody);
      throw new Error(`Claude API error (${claudeResponse.status}): ${errorBody.substring(0, 200)}`);
    }

    const claudeResult = await claudeResponse.json();
    const content = claudeResult.content?.[0]?.text;
    
    if (!content) {
      throw new Error('Empty response from Claude API');
    }

    const claudeProcessingTime = Date.now() - claudeStartTime;
    console.log(`🤖 Claude response received in ${claudeProcessingTime}ms`);

    // Parse JSON response with better error handling
    let parsedResponse;
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (!parsedResponse.content) {
          parsedResponse.content = content;
        }
        if (!parsedResponse.type) {
          parsedResponse.type = 'text';
        }
      } else {
        // Fallback for non-JSON responses
        parsedResponse = {
          content: content,
          type: 'text'
        };
      }
    } catch (parseError) {
      console.warn('JSON parse failed, using text response:', parseError.message);
      parsedResponse = {
        content: content,
        type: 'text'
      };
    }

    // Store conversation in database (async, don't wait)
    const conversationLength = conversationHistory?.length || 0;
    const storePromises = [
      // User message
      supabase.from('goblin_refinement_history').insert({
        session_id: sessionId,
        user_id: sessionData?.user_id,
        role: 'user',
        content: message,
        message_order: conversationLength + 1,
        model_used: 'claude-sonnet-4-20250514',
        processing_time_ms: claudeProcessingTime,
        metadata: {
          message_type: 'chat',
          images_count: processedCount,
          version: 'v2'
        }
      }),
      // AI response
      supabase.from('goblin_refinement_history').insert({
        session_id: sessionId,
        user_id: sessionData?.user_id,
        role: 'assistant',
        content: parsedResponse.content,
        message_order: conversationLength + 2,
        model_used: 'claude-sonnet-4-20250514',
        processing_time_ms: claudeProcessingTime,
        metadata: {
          message_type: parsedResponse.type,
          annotation_created: !!parsedResponse.annotation,
          insights_generated: parsedResponse.insights?.length || 0,
          version: 'v2',
          ...parsedResponse
        }
      })
    ];

    // Fire and forget database storage
    Promise.all(storePromises).catch(error => {
      console.error('⚠️ Failed to store conversation:', error);
    });

    const totalProcessingTime = Date.now() - startTime;
    console.log(`✅ Chat analysis complete in ${totalProcessingTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        response: parsedResponse,
        processing_time_ms: totalProcessingTime,
        claude_time_ms: claudeProcessingTime,
        images_processed: processedCount,
        version: 'v2'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('❌ Goblin Chat Analyzer V2 Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
        processing_time_ms: totalTime,
        version: 'v2'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});