import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log('🧹 Cleanup Stuck Sessions - Debug & Recovery Tool');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find sessions that have been stuck for more than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    
    const { data: stuckSessions, error: findError } = await supabase
      .from('figmant_analysis_sessions')
      .select(`
        id,
        title,
        status,
        created_at,
        updated_at,
        user_id,
        figmant_session_images(count)
      `)
      .in('status', ['pending', 'processing'])
      .lt('updated_at', tenMinutesAgo)
      .order('updated_at', { ascending: false })

    if (findError) {
      throw findError
    }

    console.log(`🔍 Found ${stuckSessions?.length || 0} stuck sessions`);

    const results = {
      total_stuck: stuckSessions?.length || 0,
      sessions_processed: [],
      sessions_with_images: [],
      sessions_without_images: [],
      cleanup_actions: []
    }

    if (stuckSessions && stuckSessions.length > 0) {
      for (const session of stuckSessions) {
        const sessionInfo = {
          id: session.id,
          title: session.title,
          status: session.status,
          created_at: session.created_at,
          updated_at: session.updated_at,
          minutes_stuck: Math.round((Date.now() - new Date(session.updated_at).getTime()) / (1000 * 60)),
          has_images: session.figmant_session_images?.[0]?.count > 0
        }

        results.sessions_processed.push(sessionInfo)

        // Check if session has images
        const { data: images, error: imagesError } = await supabase
          .from('figmant_session_images')
          .select('id, file_name, file_path')
          .eq('session_id', session.id)

        if (images && images.length > 0) {
          results.sessions_with_images.push({
            ...sessionInfo,
            image_count: images.length,
            images: images.map(img => ({ id: img.id, file_name: img.file_name }))
          })

          // For sessions with images that are stuck in pending, try to trigger analysis
          if (session.status === 'pending') {
            console.log(`🔄 Attempting to trigger analysis for session ${session.id}`)
            
            try {
              // Call the analysis function
              const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('figmant-analyze-design', {
                body: { sessionId: session.id }
              })

              if (analysisError) {
                console.error(`❌ Failed to trigger analysis for ${session.id}:`, analysisError)
                results.cleanup_actions.push({
                  session_id: session.id,
                  action: 'trigger_analysis',
                  status: 'failed',
                  error: analysisError.message
                })
              } else {
                console.log(`✅ Successfully triggered analysis for ${session.id}`)
                results.cleanup_actions.push({
                  session_id: session.id,
                  action: 'trigger_analysis',
                  status: 'success'
                })
              }
            } catch (error) {
              console.error(`❌ Error triggering analysis for ${session.id}:`, error)
              results.cleanup_actions.push({
                session_id: session.id,
                action: 'trigger_analysis',
                status: 'error',
                error: error.message
              })
            }
          }
        } else {
          results.sessions_without_images.push(sessionInfo)
          
          // Reset sessions without images back to draft
          const { error: updateError } = await supabase
            .from('figmant_analysis_sessions')
            .update({ 
              status: 'draft',
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id)

          if (updateError) {
            console.error(`❌ Failed to reset session ${session.id}:`, updateError)
          } else {
            console.log(`✅ Reset session ${session.id} to draft (no images)`)
            results.cleanup_actions.push({
              session_id: session.id,
              action: 'reset_to_draft',
              status: 'success',
              reason: 'no_images'
            })
          }
        }
      }
    }

    // Also check for any very old stuck sessions (over 1 hour) and mark as failed
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { data: veryOldSessions, error: oldError } = await supabase
      .from('figmant_analysis_sessions')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .in('status', ['pending', 'processing'])
      .lt('updated_at', oneHourAgo)
      .select('id, title')

    if (veryOldSessions && veryOldSessions.length > 0) {
      results.cleanup_actions.push({
        action: 'mark_old_as_failed',
        status: 'success',
        count: veryOldSessions.length,
        sessions: veryOldSessions.map(s => ({ id: s.id, title: s.title }))
      })
      console.log(`🕐 Marked ${veryOldSessions.length} very old sessions as failed`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        cleanup_summary: results
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})