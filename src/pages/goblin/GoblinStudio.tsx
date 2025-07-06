import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { sessionId } = await req.json()
    console.log('🎯 Goblin Orchestrator starting for session:', sessionId)

    // Update session status
    const { error: updateError } = await supabaseClient
      .from('goblin_analysis_sessions')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', sessionId)

    if (updateError) throw updateError

    // Get session details
    const { data: session, error: sessionError } = await supabaseClient
      .from('goblin_analysis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError) throw sessionError
    console.log('📋 Session details:', { 
      persona: session.persona_type, 
      mode: session.analysis_mode,
      goal: session.goal_description 
    })

    // Get images for this session
    const { data: images, error: imagesError } = await supabaseClient
      .from('goblin_analysis_images')
      .select('*')
      .eq('session_id', sessionId)
      .order('upload_order')

    if (imagesError) throw imagesError

    console.log(`📸 Found ${images.length} images to analyze`)

    // STEP 1: Vision Detection for each image
    const screenDetections = []
    for (const image of images) {
      try {
        console.log(`🔍 Calling goblin-vision-screen-detector for image ${image.upload_order}`)
        
        const visionResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/goblin-vision-screen-detector`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: image.file_path,
              order: image.upload_order
            })
          }
        )

        if (!visionResponse.ok) {
          console.error(`❌ Vision detector HTTP error for image ${image.upload_order}: ${visionResponse.status}`)
          throw new Error(`Vision detector returned ${visionResponse.status}`)
        }

        const visionData = await visionResponse.json()
        console.log(`📥 Vision response for image ${image.upload_order}:`, JSON.stringify(visionData))
        
        if (visionData.success) {
          console.log(`✅ Vision detection successful for image ${image.upload_order}: ${visionData.screenType} (${visionData.confidence})`)
          screenDetections.push({
            ...visionData,
            imageId: image.id
          })
        } else {
          console.error(`⚠️ Vision detection failed for image ${image.upload_order}:`, visionData.error)
          // Use fallback but continue processing
          screenDetections.push({
            order: image.upload_order,
            screenType: visionData.fallback?.screenType || 'interface',
            confidence: 0,
            error: visionData.error,
            metadata: visionData.fallback?.metadata || { labels: [], topScores: [] },
            imageId: image.id
          })
        }

        // Update image with vision metadata (even if failed)
        await supabaseClient
          .from('goblin_analysis_images')
          .update({ 
            screen_type: visionData.screenType || visionData.fallback?.screenType || 'interface',
            vision_metadata: visionData
          })
          .eq('id', image.id)

      } catch (visionError) {
        console.error(`❌ Vision detection error for image ${image.id}:`, visionError.message)
        
        // Add fallback detection
        screenDetections.push({
          order: image.upload_order,
          screenType: 'interface',
          confidence: 0,
          error: visionError.message,
          metadata: { labels: [], topScores: [] },
          imageId: image.id
        })
        
        // Still update the image record
        await supabaseClient
          .from('goblin_analysis_images')
          .update({ 
            screen_type: 'interface',
            vision_metadata: { error: visionError.message }
          })
          .eq('id', image.id)
      }
    }

    console.log(`✅ Vision detection phase complete. Processed ${screenDetections.length} images`)
    console.log('📊 Detection summary:', screenDetections.map(d => ({
      order: d.order,
      type: d.screenType,
      confidence: d.confidence,
      hasError: !!d.error
    })))

    // STEP 2: Build prompts with persona
    console.log('📝 Building goblin prompts...')
    const promptResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/goblin-persona-prompt-builder`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona: session.persona_type,
          mode: session.analysis_mode,
          goal: session.goal_description,
          confidence: session.confidence_level,
          screenTypes: screenDetections
        })
      }
    )

    if (!promptResponse.ok) {
      const errorText = await promptResponse.text()
      console.error('❌ Prompt building failed:', errorText)
      throw new Error('Prompt building failed')
    }

    const promptData = await promptResponse.json()
    console.log('✅ Prompts built successfully:', promptData)

    // STEP 3: Claude Analysis
    console.log('🤖 Starting Claude analysis...')
    const claudeResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/goblin-model-claude-analyzer`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptData.prompt,
          systemMessage: promptData.systemMessage,
          imageUrls: images.map(img => img.file_path),
          persona: session.persona_type,
          metadata: {
            screenTypes: screenDetections,
            sessionId: sessionId
          }
        })
      }
    )

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error('❌ Claude analysis failed:', errorText)
      throw new Error('Claude analysis failed')
    }

    const claudeData = await claudeResponse.json()
    console.log('✅ Claude analysis complete:', JSON.stringify(claudeData).substring(0, 500))

    // STEP 4: Synthesis (if multiple images or always for consistency)
    let finalResults = claudeData
    
    console.log('🔄 Synthesizing results...')
    const synthesisResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/goblin-model-synthesis`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claudeResults: claudeData,
          screenDetections,
          persona: session.persona_type
        })
      }
    )

    if (synthesisResponse.ok) {
      finalResults = await synthesisResponse.json()
      console.log('✅ Synthesis complete:', JSON.stringify(finalResults).substring(0, 500))
    } else {
      console.error('⚠️ Synthesis failed, using Claude results directly')
    }

    // Prepare the results data with better structure
    const resultsData = {
      session_id: sessionId,
      persona_feedback: finalResults.feedback || {
        [session.persona_type]: {
          content: finalResults.result?.content || finalResults.analysis || 'Analysis completed',
          timestamp: new Date().toISOString()
        }
      },
      synthesis_summary: finalResults.summary || `${session.persona_type} analysis for ${session.goal_description}`,
      priority_matrix: finalResults.priorities || {
        whatWorks: [],
        whatHurts: [],
        whatNext: []
      },
      annotations: finalResults.annotations || [],
      model_metadata: {
        model: 'claude-3-sonnet',
        persona: session.persona_type,
        screenDetections,
        processingSteps: {
          visionDetection: screenDetections.length > 0,
          promptBuilding: !!promptData,
          claudeAnalysis: !!claudeData,
          synthesis: !!finalResults
        },
        ...finalResults.metadata
      },
      processing_time_ms: Date.now() - new Date(session.created_at).getTime(),
      goblin_gripe_level: session.persona_type === 'clarity' ? 
        (finalResults.gripeLevel || 'medium') : null
    }

    console.log('💾 Saving results:', JSON.stringify(resultsData).substring(0, 500))

    // Save results
    const { error: resultsError } = await supabaseClient
      .from('goblin_analysis_results')
      .insert(resultsData)

    if (resultsError) {
      console.error('❌ Failed to save results:', resultsError)
      throw resultsError
    }

    // Update session to completed
    await supabaseClient
      .from('goblin_analysis_sessions')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    console.log('🎉 Goblin analysis complete!')

    return new Response(JSON.stringify({
      success: true,
      sessionId,
      message: '🎉 Goblin analysis complete!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Goblin orchestrator error:', error)
    console.error('Stack trace:', error.stack)
    
    // Update session to failed
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      const body = await req.json().catch(() => ({ sessionId: null }))
      
      if (body.sessionId) {
        await supabaseClient
          .from('goblin_analysis_sessions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', body.sessionId)
      }
    } catch (e) {
      console.error('Failed to update session status:', e)
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      stage: 'goblin-orchestration',
      details: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})