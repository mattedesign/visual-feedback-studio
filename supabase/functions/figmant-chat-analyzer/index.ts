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
const MAX_IMAGES = 5; // Limit to 5 images for better performance
const MAX_IMAGE_SIZE_MB = 15; // 15MB limit per image
const IMAGE_FETCH_TIMEOUT = 15000; // 15 second timeout
const ANALYSIS_TIMEOUT = 45000; // 45 second timeout for Claude

serve(async (req) => {
  const startTime = Date.now();
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, includeImages = true } = await req.json();

    console.log(`🎯 Figmant Chat Analyzer: Processing message for session ${sessionId}`, {
      messageLength: message?.length,
      includeImages,
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

    // Get Figmant session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('figmant_analysis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('❌ Figmant session lookup failed:', sessionError);
      throw new Error(`Session not found: ${sessionError.message}`);
    }

    if (!sessionData) {
      throw new Error('Session data is empty');
    }

    // Get analysis results
    const { data: analysisResults, error: analysisError } = await supabase
      .from('figmant_analysis_results')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (analysisError) {
      console.error('❌ Analysis results lookup failed:', analysisError);
    }

    // Get session images
    const { data: sessionImages, error: imagesError } = await supabase
      .from('figmant_session_images')
      .select('*')
      .eq('session_id', sessionId)
      .order('upload_order', { ascending: true });

    if (imagesError) {
      console.error('❌ Session images lookup failed:', imagesError);
    }

    // Get conversation history from Figmant conversation table
    const { data: conversationHistory } = await supabase
      .from('figmant_conversation_history')
      .select('role, content, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(8); // Last 8 messages for context

    // Build enhanced system prompt with analysis context
    const analysisContext = analysisResults?.claude_analysis || {};
    const executiveSummary = analysisContext?.executiveSummary || 'No analysis summary available';
    const keyFindings = analysisContext?.keyFindings || [];
    const recommendations = analysisContext?.recommendations || [];
    
    // Format conversation history
    const recentContext = conversationHistory?.length > 0 
      ? conversationHistory.slice(-6).map((msg: any) => `${msg.role}: ${msg.content.substring(0, 200)}`).join('\n\n')
      : 'This is the start of our conversation about your UX analysis.';

    const systemPrompt = `You are Figmant's Senior UX Analysis AI, specialized in providing expert-level design insights and actionable recommendations. You're helping analyze and discuss the results of a comprehensive UX analysis.

## Analysis Context:
- Session: ${sessionData?.title || 'UX Analysis'}
- Design Type: ${sessionData?.design_type || 'Not specified'}
- Industry: ${sessionData?.industry || 'Not specified'}
- Business Goals: ${sessionData?.business_goals?.join(', ') || 'Not specified'}
- Images Analyzed: ${sessionImages?.length || 0}
- Analysis Complete: ${analysisResults ? 'Yes' : 'No'}

## Previous Analysis Summary:
${executiveSummary}

## Key Findings:
${keyFindings.map((finding: any, index: number) => `${index + 1}. ${finding.title || finding.issue}: ${finding.description || finding.recommendation}`).join('\n')}

## Current Recommendations:
${recommendations.map((rec: any, index: number) => `${index + 1}. ${rec.title || rec.category}: ${rec.description || rec.recommendation}`).join('\n')}

## Response Guidelines:
- Be conversational yet professional, like a Senior Principal Designer
- Reference specific findings from the analysis when relevant
- Provide actionable, specific recommendations with implementation steps
- When discussing images, reference them by filename when possible
- Focus on business impact and user experience improvements
- Offer follow-up questions to dive deeper into specific areas
- Prioritize recommendations by impact and effort when asked
- Use industry best practices and proven UX patterns

## Recent Conversation:
${recentContext}

## User's Message:
"${message.substring(0, 500)}"

Respond conversationally and helpfully, drawing from the analysis context to provide valuable insights and next steps.`;

    // Prepare content for Claude API
    const messageContent = [
      {
        type: 'text',
        text: systemPrompt
      }
    ];

    // Include images from existing analysis if requested and available
    let processedImagesCount = 0;
    if (includeImages && analysisResults && sessionImages && sessionImages.length > 0) {
      console.log(`📸 Including up to ${MAX_IMAGES} images from existing analysis`);
      
      const imagesToInclude = sessionImages.slice(0, MAX_IMAGES);
      
      for (const image of imagesToInclude) {
        try {
          let imageUrl = image.file_path;
          
          if (!imageUrl) {
            console.warn(`⚠️ Skipping image with no file path: ${image.file_name}`);
            continue;
          }

          console.log(`🔍 Including image from analysis: ${image.file_name}`);
          
          // Create signed URL if needed
          if (!imageUrl.startsWith('http')) {
            const { data: signedUrlData, error: signError } = await supabase.storage
              .from('analysis-images')
              .createSignedUrl(imageUrl, 3600);
            
            if (signError || !signedUrlData?.signedUrl) {
              console.warn(`⚠️ Failed to create signed URL for ${imageUrl}: ${signError?.message}`);
              continue;
            }
            
            imageUrl = signedUrlData.signedUrl;
            console.log('✅ Generated signed URL for image');
          }

          // Fetch image with timeout and size check
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT);
          
          try {
            const imageResponse = await fetch(imageUrl, { 
              signal: controller.signal,
              headers: { 'User-Agent': 'Figmant-Chat-Analyzer/1.0' }
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

            // Convert to base64 safely
            const uint8Array = new Uint8Array(imageBuffer);
            
            // Convert in chunks to avoid stack overflow
            let binaryString = '';
            const chunkSize = 8192;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.slice(i, i + chunkSize);
              binaryString += String.fromCharCode.apply(null, Array.from(chunk));
            }
            const base64Data = btoa(binaryString);
            
            messageContent.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Data
              }
            });
            
            processedImagesCount++;
            console.log(`✅ Image ${processedImagesCount} included: ${image.file_name}, ${mediaType}, ${fileSizeMB.toFixed(1)}MB`);
            
          } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              console.warn(`⚠️ Image fetch timeout: ${image.file_name}`);
            } else {
              console.warn(`⚠️ Image fetch error: ${fetchError.message}`);
            }
            continue;
          }
          
        } catch (error) {
          console.error(`❌ Error including image ${image.file_name}:`, error.message);
          continue;
        }
      }
      
      console.log(`✅ Successfully included ${processedImagesCount}/${imagesToInclude.length} images from analysis`);
    } else if (includeImages && !analysisResults) {
      console.log('⚠️ No analysis results available - chat will work without image context');
    }

    // Call Claude API with timeout
    console.log('🤖 Calling Claude API for conversational response...');
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
          max_tokens: 2000,
          messages: [{ role: 'user', content: messageContent }],
          temperature: 0.7
        })
      });
      
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Analysis timed out. Please try again with a shorter message.');
      }
      throw new Error(`Claude API request failed: ${fetchError.message}`);
    }

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text().catch(() => 'Unknown error');
      console.error(`Claude API error ${claudeResponse.status}:`, errorBody);
      throw new Error(`Claude API error (${claudeResponse.status}): ${errorBody.substring(0, 200)}`);
    }

    const claudeResult = await claudeResponse.json();
    const responseContent = claudeResult.content?.[0]?.text;
    
    if (!responseContent) {
      throw new Error('Empty response from Claude API');
    }

    const claudeProcessingTime = Date.now() - claudeStartTime;
    console.log(`🤖 Claude response received in ${claudeProcessingTime}ms`);

    // Store conversation in Figmant conversation table
    const conversationLength = conversationHistory?.length || 0;
    const storePromises = [
      // User message
      supabase.from('figmant_conversation_history').insert({
        session_id: sessionId,
        user_id: sessionData?.user_id,
        role: 'user',
        content: message,
        message_order: conversationLength + 1,
        model_used: 'claude-sonnet-4-20250514',
        processing_time_ms: claudeProcessingTime,
        metadata: {
          message_type: 'figmant_chat',
          images_count: processedImagesCount,
          session_type: 'figmant'
        }
      }),
      // AI response
      supabase.from('figmant_conversation_history').insert({
        session_id: sessionId,
        user_id: sessionData?.user_id,
        role: 'assistant',
        content: responseContent,
        message_order: conversationLength + 2,
        model_used: 'claude-sonnet-4-20250514',
        processing_time_ms: claudeProcessingTime,
        metadata: {
          message_type: 'figmant_chat',
          images_processed: processedImagesCount,
          session_type: 'figmant',
          analysis_referenced: !!analysisResults
        }
      })
    ];

    // Fire and forget database storage
    Promise.all(storePromises).catch(error => {
      console.error('⚠️ Failed to store conversation:', error);
    });

    const totalProcessingTime = Date.now() - startTime;
    console.log(`✅ Figmant chat analysis complete in ${totalProcessingTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        content: responseContent,
        processing_time_ms: totalProcessingTime,
        claude_time_ms: claudeProcessingTime,
        images_processed: processedImagesCount,
        analysis_available: !!analysisResults,
        session_title: sessionData?.title
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
    console.error('❌ Figmant Chat Analyzer Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
        processing_time_ms: totalTime
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