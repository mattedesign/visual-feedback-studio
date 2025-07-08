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

    // Fetch images from database
    const { data: images, error: imagesError } = await supabase
      .from('goblin_analysis_images')
      .select('*')
      .eq('session_id', sessionId)
      .order('upload_order', { ascending: true });

    if (imagesError) {
      throw new Error(`Failed to fetch images: ${imagesError.message}`);
    }

    if (!images || images.length === 0) {
      throw new Error('No images found for analysis session');
    }

    // ✅ ENHANCED: Convert file paths to proper public URLs for Claude analyzer
    console.log('🔍 Raw images data from database:', JSON.stringify(images, null, 2));
    
    const imageUrls = images.map(img => {
      // If file_path is already a full URL, use it directly
      if (img.file_path.startsWith('http')) {
        console.log(`✅ Using existing full URL: ${img.file_path}`);
        return img.file_path;
      }
      
      // ✅ FIXED: Properly construct Supabase storage public URL
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      // Remove any leading slashes and ensure clean path
      let cleanPath = img.file_path.replace(/^\/+/, '');
      
      // If the path doesn't start with the expected bucket structure, fix it
      if (!cleanPath.startsWith('analysis-images/')) {
        // Handle case where path might be just the filename or partial path
        if (cleanPath.includes('/')) {
          // Extract just the filename if it's a complex path
          const pathParts = cleanPath.split('/');
          cleanPath = `analysis-images/${pathParts[pathParts.length - 1]}`;
        } else {
          // Just a filename, add bucket prefix
          cleanPath = `analysis-images/${cleanPath}`;
        }
      }
      
      const fullUrl = `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
      
      console.log(`🔗 Converting file path to URL: ${img.file_path} -> ${fullUrl}`);
      return fullUrl;
    });

    console.log('📋 Final imageUrls array being sent to Claude:', JSON.stringify(imageUrls, null, 2));
    console.log(`📊 Image count: ${imageUrls.length} images ready for analysis`);

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
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`🔍 Processing image ${i + 1}/${images.length}: ${image.file_name}`);
      
      try {
        const visionResult = await supabase.functions.invoke('goblin-vision-screen-detector', {
          body: { 
            imageUrl: image.file_path,
            order: image.upload_order
          }
        });
        
        if (visionResult.error) {
          console.warn(`⚠️ Vision failed for image ${i + 1}:`, visionResult.error);
          visionResults.push({
            order: image.upload_order,
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
          .eq('id', image.id);
          
      } catch (error) {
        console.warn(`⚠️ Vision processing failed for image ${i + 1}:`, error.message);
        visionResults.push({
          order: image.upload_order,
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
        imageCount: imageUrls.length, 
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
    console.log(`📊 Sending ${imageUrls.length} image URLs to Claude analyzer`);
    
    // ✅ ENHANCED: Validate imageUrls with detailed logging
    const validImageUrls = imageUrls.filter((url, index) => {
      const isValid = url && typeof url === 'string' && url.trim().length > 0;
      if (!isValid) {
        console.warn(`⚠️ Filtering out invalid image URL at index ${index}:`, url);
      } else {
        console.log(`✅ Valid image URL ${index + 1}: ${url}`);
      }
      return isValid;
    });

    if (validImageUrls.length === 0) {
      console.error('❌ No valid image URLs found!', {
        originalImageCount: images.length,
        originalImageUrls: imageUrls,
        allImagePaths: images.map(img => img.file_path)
      });
      throw new Error(`No valid image URLs found. Original count: ${imageUrls.length}, Valid count: ${validImageUrls.length}. Check image storage and URL construction.`);
    }

    console.log(`✅ Validated ${validImageUrls.length} image URLs for Claude analysis`);
    
    // ✅ ENHANCED: Claude analysis with detailed parameter logging
    const claudeRequestBody = {
      sessionId,
      imageUrls: validImageUrls,  // Use validated URLs
      prompt: promptResult.data.prompt,
      persona,
      chatMode: false  // ✅ CRITICAL: Explicitly set to false for image processing
    };
    
    console.log('🤖 Calling Claude analyzer with request body:', {
      sessionId: sessionId?.substring(0, 8),
      imageUrlCount: validImageUrls.length,
      imageUrlSamples: validImageUrls.slice(0, 2), // Log first 2 URLs for verification
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
        imageCount: imageUrls.length // ✅ NEW: Pass image count for annotation distribution
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