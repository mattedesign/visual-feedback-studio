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
    const { message, sessionId, images, conversationHistory } = await req.json();

    console.log(`🎯 Goblin Chat Analyzer: Processing message for session ${sessionId}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get session and analysis data
    const { data: sessionData } = await supabase
      .from('goblin_analysis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const { data: analysisData } = await supabase
      .from('goblin_analysis_results')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Build context from existing analysis
    const analysisContext = analysisData?.persona_feedback || {};
    const personaType = sessionData?.persona_type || 'strategic';

    // Create enhanced prompt for chat analysis
    const systemPrompt = `You are Figmant's UX Analysis AI, specialized in ${personaType} analysis. You're helping analyze UI/UX designs through interactive conversation.

## Current Analysis Context:
- Session: ${sessionData?.title || 'UX Analysis'}
- Persona: ${personaType}
- Images: ${images?.length || 0} uploaded
- Existing insights: ${JSON.stringify(analysisContext, null, 2)}

## Your Capabilities:
1. **Create Annotations**: When users ask about specific areas, create precise annotations with coordinates
2. **UX Analysis**: Provide detailed usability, accessibility, and design feedback
3. **Business Impact**: Connect design issues to business metrics and ROI
4. **Actionable Insights**: Give specific, implementable recommendations

## Response Format:
Always respond with a JSON object containing:
{
  "content": "Your response text",
  "type": "text|annotation|insight",
  "annotation": {
    "x": number (0-100),
    "y": number (0-100), 
    "width": number (0-100),
    "height": number (0-100),
    "label": "string",
    "feedback_type": "usability|accessibility|visual|content",
    "description": "string",
    "confidence": number (0-1)
  },
  "insights": [
    {
      "category": "usability|visual_design|accessibility|content",
      "title": "string",
      "description": "string",
      "priority": "high|medium|low",
      "confidence_score": number (0-1),
      "recommendation": "string",
      "impact": "string",
      "effort": "low|medium|high"
    }
  ]
}

## Conversation History:
${conversationHistory?.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') || 'None'}

## User Message:
${message}

Analyze the user's message and provide helpful UX feedback. If they're asking about a specific area, create an annotation. Always be practical and actionable.`;

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
              // Use Array.from to avoid stack overflow with large images
              const uint8Array = new Uint8Array(imageBuffer);
              const chunks = [];
              for (let i = 0; i < uint8Array.length; i += 8192) {
                chunks.push(String.fromCharCode.apply(null, uint8Array.subarray(i, i + 8192)));
              }
              const imageBase64 = btoa(chunks.join(''));
              
              messageContent.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg', // Claude supports jpeg, png, gif, webp
                  data: imageBase64
                }
              });
              
              console.log(`✅ Image ${image.name || 'unnamed'} processed for Claude`);
            } else {
              console.warn(`⚠️ Failed to fetch image: ${imageUrl}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error processing image ${image.name}:`, error);
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
        model: 'claude-3-5-haiku-20241022',
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
      model_used: 'claude-3-5-sonnet-chat',
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
      model_used: 'claude-3-5-sonnet-chat',
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