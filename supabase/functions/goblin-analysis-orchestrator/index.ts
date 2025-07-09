import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🧝‍♂️ Goblin Analysis Orchestrator - Multi-persona UX analysis');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let requestBody;
  let sessionId;

  try {
    // Parse request body with error handling
    try {
      requestBody = await req.json();
      console.log('📥 Received request body:', requestBody);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid request body - must be valid JSON',
          details: parseError.message
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate sessionId
    sessionId = requestBody?.sessionId;
    if (!sessionId) {
      console.error('❌ Missing sessionId in request');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'sessionId is required',
          received: requestBody
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('goblin_analysis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error(`Session not found: ${sessionError?.message}`);
    }

    const { persona_type: persona, analysis_mode: mode, goal_description: goal, confidence_level: confidence } = session;

    // ✅ SIMPLIFIED: Use dedicated get-images-by-session function instead of manual URL construction
    console.log('📸 Fetching images via get-images-by-session function...');
    
    const imagesResponse = await supabase.functions.invoke('get-images-by-session', {
      body: { sessionId }
    });

    if (imagesResponse.error) {
      throw new Error(`Failed to fetch images: ${imagesResponse.error.message}`);
    }

    const imageUrls = imagesResponse.data?.validImages || [];
    
    if (imageUrls.length === 0) {
      throw new Error('No images found for analysis session');
    }

    // ✅ FIXED: Extract simple URL strings for Claude
    const validImageUrls = imageUrls
      .filter(img => img && (img.url || img.file_path))
      .map(img => img.url || img.file_path); // Extract just the URL string

    if (validImageUrls.length === 0) {
      throw new Error(`No valid image URLs found. Please check image storage and accessibility.`);
    }

    console.log(`✅ Found ${validImageUrls.length} valid images for analysis`);
    console.log('📸 Extracted URLs for Claude:', validImageUrls.slice(0, 2)); // Log first 2 URLs

    console.log('🎯 Orchestrating goblin analysis:', {
      sessionId: sessionId?.substring(0, 8),
      persona,
      mode,
      imageCount: imageUrls.length,
      goalLength: goal?.length
    });

    // Update session status
    await supabase
      .from('goblin_analysis_sessions')
      .update({ status: 'processing' })
      .eq('id', sessionId);

    // Step 1: Process images with Google Vision
    console.log('👁️ Processing images with Google Vision...');
    const visionResults = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      const imageData = imageUrls[i];
      console.log(`🔍 Processing image ${i + 1}/${imageUrls.length}: ${imageData.file_name}`);
      
      try {
        const visionResult = await supabase.functions.invoke('goblin-vision-screen-detector', {
          body: { 
            imageUrl: imageData.file_path,
            order: imageData.upload_order
          }
        });
        
        if (visionResult.error) {
          console.warn(`⚠️ Vision failed for image ${i + 1}:`, visionResult.error);
          visionResults.push({
            order: imageData.upload_order,
            screenType: 'interface',
            confidence: 0,
            error: visionResult.error.message
          });
        } else {
          visionResults.push(visionResult.data);
          console.log(`✅ Vision completed for image ${i + 1}: ${visionResult.data?.screenType}`);
        }
        
        // Update image with vision metadata
        await supabase
          .from('goblin_analysis_images')
          .update({ 
            screen_type: visionResult.data?.screenType || 'interface',
            vision_metadata: visionResult.data
          })
          .eq('id', imageData.id);
          
      } catch (error) {
        console.warn(`⚠️ Vision processing failed for image ${i + 1}:`, error.message);
        visionResults.push({
          order: imageData.upload_order || i + 1,
          screenType: 'interface',
          confidence: 0,
          error: error.message
        });
      }
    }

    // Step 2: Build persona-specific prompt
    const promptResult = await supabase.functions.invoke('goblin-persona-prompt-builder', {
      body: { 
        persona, 
        goal, 
        imageCount: validImageUrls.length,
        mode, 
        confidence,
        visionResults
      }
    });

    if (promptResult.error) {
      throw new Error(`Prompt building failed: ${promptResult.error.message}`);
    }

    // Step 3: Analyze with Claude - FIXED: Enhanced validation and error recovery
    console.log('🤖 Calling Claude analyzer with verified parameters...');
    console.log(`📊 Sending ${validImageUrls.length} image URLs to Claude analyzer`);
    
    // ✅ SIMPLIFIED: URLs are already validated above, pass them through directly
    
    // ✅ ENHANCED: Claude analysis with detailed parameter logging
    const claudeRequestBody = {
      sessionId,
      imageUrls: validImageUrls,  // Now contains simple URL strings
      prompt: promptResult.data.prompt,
      persona,
      chatMode: false  // ✅ CRITICAL: Explicitly set to false for image processing
    };
    
    console.log('🤖 Calling Claude analyzer with request body:', {
      sessionId: sessionId?.substring(0, 8),
      imageUrlCount: validImageUrls.length,
      imageUrlSamples: validImageUrls.slice(0, 2), // Log first 2 URLs for verification
      imageUrlsType: typeof validImageUrls[0], // Should be 'string'
      promptLength: promptResult.data.prompt?.length,
      persona,
      chatMode: false
    });
    
    const analysisResult = await supabase.functions.invoke('goblin-model-claude-analyzer', {
      body: claudeRequestBody
    });

    if (analysisResult.error) {
      throw new Error(`Claude analysis failed: ${analysisResult.error.message}`);
    }

    // Step 3: Synthesize results
    const synthesisResult = await supabase.functions.invoke('goblin-model-synthesis', {
      body: {
        sessionId,
        persona,
        analysisData: analysisResult.data,
        goal,
        imageCount: validImageUrls.length
      }
    });

    if (synthesisResult.error) {
      throw new Error(`Result synthesis failed: ${synthesisResult.error.message}`);
    }

    // Step 4: Save final results
    await supabase
      .from('goblin_analysis_results')
      .insert({
        session_id: sessionId,
        persona_feedback: synthesisResult.data.personaFeedback,
        synthesis_summary: synthesisResult.data.summary,
        priority_matrix: synthesisResult.data.priorityMatrix,
        annotations: synthesisResult.data.annotations,
        model_metadata: {
          model: 'claude-sonnet-4-20250514',
          persona,
          confidence,
          processedAt: new Date().toISOString()
        },
        processing_time_ms: Date.now() - new Date(promptResult.data.startTime).getTime(),
        goblin_gripe_level: persona === 'clarity' ? synthesisResult.data.gripeLevel : null
      });

    // Update session to completed
    await supabase
      .from('goblin_analysis_sessions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log('✅ Goblin analysis orchestration completed');

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        persona,
        results: synthesisResult.data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Goblin orchestration failed:', error);

    // Try to update session status to error if we have a valid sessionId
    if (sessionId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        console.log(`🔄 Updating session ${sessionId} status to failed`);
        await supabase
          .from('goblin_analysis_sessions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);
        
        console.log(`✅ Session ${sessionId} marked as failed`);
      } catch (updateError) {
        console.error('Failed to update session status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        sessionId: sessionId || null,
        timestamp: new Date().toISOString(),
        stage: 'orchestration'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});