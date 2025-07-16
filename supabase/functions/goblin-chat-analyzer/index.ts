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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, images, persona } = await req.json();

    console.log(`🎯 Goblin Chat Analyzer: Processing message for session ${sessionId}`, {
      messageLength: message?.length,
      imagesCount: images?.length,
      persona
    });

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('goblin_analysis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      throw new Error(`Session not found: ${sessionError?.message}`);
    }

    // Get conversation history from refinement history
    const { data: conversationHistory } = await supabase
      .from('goblin_refinement_history')
      .select('role, content, created_at, metadata')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20); // Last 20 messages for context

    // Get latest analysis data for context
    const { data: analysisData } = await supabase
      .from('goblin_analysis_results')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build context from existing analysis
    const analysisContext = analysisData?.persona_feedback || {};
    const personaType = sessionData?.persona_type || 'strategic';

    // Format conversation history for better context
    const conversationContext = conversationHistory?.length > 0 
      ? conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n\n')
      : 'This is the start of our conversation.';

    // Create enhanced prompt for chat analysis
    const systemPrompt = `You are Figmant's UX Analysis AI, specialized in ${personaType} analysis. You're helping analyze UI/UX designs through interactive conversation.

## Current Analysis Context:
- Session: ${sessionData?.title || 'UX Analysis'}
- Persona: ${personaType}
- Images: ${images?.length || 0} uploaded
- Previous Analysis: ${analysisContext ? 'Available' : 'None yet'}

## Your Capabilities:
1. **UX Analysis**: Provide detailed usability, accessibility, and design feedback
2. **Create Annotations**: When users ask about specific areas, create precise annotations with coordinates (0-100 scale)
3. **Business Impact**: Connect design issues to business metrics and ROI
4. **Actionable Insights**: Give specific, implementable recommendations

## Response Guidelines:
- Be conversational and helpful
- Provide specific, actionable feedback
- Reference the uploaded images when relevant
- Create annotations for specific UI elements when asked
- Connect UX issues to business impact

## JSON Response Format:
Always respond with ONLY a valid JSON object:
{
  "content": "Your conversational response text",
  "type": "text",
  "annotation": {
    "x": 25,
    "y": 15,
    "width": 30,
    "height": 20,
    "label": "Navigation Issue",
    "feedback_type": "usability",
    "description": "Detailed description of the issue",
    "confidence": 0.85
  },
  "insights": [
    {
      "category": "usability",
      "title": "Clear insight title",
      "description": "Detailed description",
      "priority": "high",
      "confidence_score": 0.9,
      "recommendation": "Specific action to take",
      "impact": "Expected business impact",
      "effort": "low"
    }
  ]
}

## Previous Conversation:
${conversationContext}

## User's Current Message:
"${message}"

Analyze the user's message and respond helpfully. If they're asking about specific UI elements or areas, consider creating an annotation. Focus on being practical and actionable.`;

    // Prepare content for Claude API
    const messageContent = [
      {
        type: 'text',
        text: systemPrompt
      }
    ];

    // Add images if provided
    if (images && images.length > 0) {
      console.log(`📸 Processing ${images.length} images for Claude vision analysis`);
      
      for (const image of images) {
        try {
          // Get the image URL (could be storage URL or direct URL)
          let imageUrl = image.url || image.file_path;
          
          // If it's a storage path, convert to signed URL
          if (imageUrl && !imageUrl.startsWith('http')) {
            const { data: signedUrlData } = await supabase.storage
              .from('analysis-images')
              .createSignedUrl(imageUrl, 3600); // 1 hour expiry
            
            if (signedUrlData?.signedUrl) {
              imageUrl = signedUrlData.signedUrl;
            }
          }

          if (imageUrl) {
            // Fetch the image and convert to base64
            const imageResponse = await fetch(imageUrl);
            if (imageResponse.ok) {
              const imageBuffer = await imageResponse.arrayBuffer();
              const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
              
              // Determine media type for Claude
              let mediaType = 'image/jpeg';
              if (contentType.includes('png')) mediaType = 'image/png';
              else if (contentType.includes('gif')) mediaType = 'image/gif';
              else if (contentType.includes('webp')) mediaType = 'image/webp';
              
              // Check file size (Claude has a 20MB limit per image)
              const fileSizeKB = imageBuffer.byteLength / 1024;
              console.log(`📏 Image size: ${fileSizeKB.toFixed(1)}KB`);
              
              if (fileSizeKB > 20000) { // 20MB limit
                console.warn(`⚠️ Image too large (${fileSizeKB.toFixed(1)}KB), skipping`);
                continue;
              }
              
              // Convert to base64 efficiently for large images
              const uint8Array = new Uint8Array(imageBuffer);
              let imageBase64 = '';
              
              // Process in chunks to avoid stack overflow
              const chunkSize = 32768; // 32KB chunks
              for (let i = 0; i < uint8Array.length; i += chunkSize) {
                const chunk = uint8Array.subarray(i, i + chunkSize);
                imageBase64 += String.fromCharCode.apply(null, Array.from(chunk));
              }
              
              const base64Data = btoa(imageBase64);
              
              messageContent.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data
                }
              });
              
              console.log(`✅ Image ${image.name || 'unnamed'} processed for Claude (${mediaType}, ${fileSizeKB.toFixed(1)}KB)`);
            } else {
              console.warn(`⚠️ Failed to fetch image: ${imageResponse.status} ${imageUrl}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing image ${image.name}:`, error);
          // Continue with other images if one fails
        }
      }
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: messageContent
          }
        ]
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Claude API error ${response.status}:`, errorBody);
      throw new Error(`Claude API error: ${response.status} - ${errorBody}`);
    }

    const claudeResult = await response.json();
    const content = claudeResult.content[0].text;

    console.log(`🤖 Claude response: ${content.substring(0, 200)}...`);

    // Try to parse JSON response
    let parsedResponse;
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback to simple text response
        parsedResponse = {
          content: content,
          type: 'text'
        };
      }
    } catch (error) {
      console.warn('Failed to parse Claude JSON, using text response');
      parsedResponse = {
        content: content,
        type: 'text'
      };
    }

    // Store the chat message in the refinement history
    const messageData = {
      session_id: sessionId,
      user_id: sessionData?.user_id,
      role: 'user',
      content: message,
      message_order: (conversationHistory?.length || 0) + 1,
      model_used: 'claude-sonnet-4-20250514',
      processing_time_ms: Date.now(),
      metadata: {
        message_type: 'chat',
        images_count: images?.length || 0
      }
    };

    await supabase
      .from('goblin_refinement_history')
      .insert(messageData);

    // Store AI response
    const responseData = {
      session_id: sessionId,
      user_id: sessionData?.user_id,
      role: 'assistant',
      content: parsedResponse.content,
      message_order: (conversationHistory?.length || 0) + 2,
      model_used: 'claude-sonnet-4-20250514',
      processing_time_ms: Date.now(),
      metadata: {
        message_type: parsedResponse.type,
        annotation_created: !!parsedResponse.annotation,
        insights_generated: parsedResponse.insights?.length || 0,
        ...parsedResponse
      }
    };

    await supabase
      .from('goblin_refinement_history')
      .insert(responseData);

    console.log(`✅ Chat analysis complete for session ${sessionId}`);

    return new Response(
      JSON.stringify({
        success: true,
        response: parsedResponse,
        processing_time_ms: Date.now()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Goblin Chat Analyzer Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack
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