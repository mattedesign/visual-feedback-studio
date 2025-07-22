import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

serve(async (req) => {
  console.log('🔴 DEBUG_FIGMANT: Function entry point reached');
  console.log('🔴 DEBUG_FIGMANT: Request method:', req.method);

  if (req.method === 'OPTIONS') {
    console.log('🔴 DEBUG_FIGMANT: Returning CORS response');
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Validate API key if provided
    const apiKey = req.headers.get('x-api-key');
    if (apiKey) {
      console.log('🔴 DEBUG_FIGMANT: API key provided, validating...');
      // Hash the provided API key
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Validate API key
      const { data: keyData, error: keyError } = await supabase.rpc('validate_api_key', { p_key_hash: keyHash });
      
      if (keyError || !keyData || keyData.length === 0 || !keyData[0].is_valid) {
        console.log('🔴 DEBUG_FIGMANT: Invalid API key');
        return new Response(
          JSON.stringify({ error: 'Invalid API key' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('🔴 DEBUG_FIGMANT: API key validated successfully');
    }

    const { session_id, context_id } = await req.json()

    if (!session_id) {
      throw new Error('Session ID is required')
    }

    console.log('🔴 DEBUG_FIGMANT: Starting analysis for session:', session_id);

    console.log('Starting analysis for session:', session_id)

    // Get session and images
    const { data: session, error: sessionError } = await supabase
      .from('figmant_analysis_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError) throw sessionError

    const { data: images, error: imagesError } = await supabase
      .from('figmant_session_images')
      .select('*')
      .eq('session_id', session_id)
      .order('upload_order', { ascending: true })

    if (imagesError) throw imagesError

    if (!images || images.length === 0) {
      throw new Error('No images found for analysis')
    }

    console.log(`Found ${images.length} images to analyze`)

    // Get user context if context_id is provided
    let userContext = null
    if (context_id) {
      console.log('🔴 DEBUG_FIGMANT: Fetching user context:', context_id);
      const { data: contextData, error: contextError } = await supabase
        .from('figmant_user_contexts')
        .select('*')
        .eq('id', context_id)
        .single()
      
      if (contextError) {
        console.log('🔴 DEBUG_FIGMANT: Context fetch error:', contextError);
      } else {
        userContext = contextData
        console.log('🔴 DEBUG_FIGMANT: User context loaded successfully');
      }
    }

    // Get Google Vision API key
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
    if (!googleVisionApiKey) {
      throw new Error('Google Vision API key not configured')
    }

    // Process each image with Google Vision
    const visionResults = []
    for (const image of images) {
      try {
        // Get image URL
        const { data: urlData } = supabase.storage
          .from('analysis-images')
          .getPublicUrl(image.file_path)

        // Call Google Vision API
        const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [{
              image: {
                source: {
                  imageUri: urlData.publicUrl
                }
              },
              features: [
                { type: 'TEXT_DETECTION', maxResults: 50 },
                { type: 'LABEL_DETECTION', maxResults: 20 },
                { type: 'IMAGE_PROPERTIES' },
                { type: 'OBJECT_LOCALIZATION', maxResults: 20 }
              ]
            }]
          })
        })

        const visionData = await visionResponse.json()
        visionResults.push({
          image_id: image.id,
          file_name: image.file_name,
          vision_data: visionData.responses?.[0] || {}
        })

        // Update image with vision data
        await supabase
          .from('figmant_session_images')
          .update({ google_vision_data: visionData.responses?.[0] || {} })
          .eq('id', image.id)

      } catch (error) {
        console.error(`Error processing image ${image.file_name}:`, error)
        visionResults.push({
          image_id: image.id,
          file_name: image.file_name,
          vision_data: {},
          error: error.message
        })
      }
    }

    // Get Claude API key
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured')
    }

    // Prepare Claude analysis prompt with user context
    const contextSection = userContext ? `

USER CONTEXT & BUSINESS GOALS:
- Business Type: ${userContext.business_type || 'Not specified'}
- Target Audience: ${userContext.target_audience || 'Not specified'}
- Primary Goal: ${userContext.primary_goal || 'Not specified'}
- Specific Challenges: ${userContext.specific_challenges ? JSON.stringify(userContext.specific_challenges) : 'None specified'}
- Current Metrics: ${userContext.current_metrics ? JSON.stringify(userContext.current_metrics) : 'None provided'}
- Admired Companies: ${userContext.admired_companies?.join(', ') || 'None specified'}
- Design Constraints: ${userContext.design_constraints?.join(', ') || 'None specified'}

IMPORTANT: Please tailor your analysis to specifically address the user's business type, primary goals, and challenges mentioned above. Focus on how the design helps or hinders their specific objectives.
` : '';

    const analysisPrompt = `You are a Senior UX Designer analyzing design images. 

Session Details:
- Title: ${session.title}
- Design Type: ${session.design_type || 'Web/Mobile Interface'}
- Business Goals: ${session.business_goals?.join(', ') || 'Not specified'}
${contextSection}
Images Analyzed: ${images.length}

Google Vision Data Summary:
${visionResults.map(result => `
Image: ${result.file_name}
- Text detected: ${result.vision_data.textAnnotations?.length || 0} text elements
- Objects detected: ${result.vision_data.localizedObjectAnnotations?.length || 0} objects  
- Labels detected: ${result.vision_data.labelAnnotations?.length || 0} labels
`).join('\n')}

Please provide a comprehensive UX analysis focusing on:

1. **First Impressions**: What stands out immediately
2. **Visual Hierarchy**: How well does the design guide the user's eye
3. **Usability Issues**: Specific problems that could affect user experience
4. **Accessibility Concerns**: WCAG compliance and inclusive design issues
5. **Conversion Optimization**: Opportunities to improve business goals${userContext ? ' (especially ' + userContext.primary_goal + ')' : ''}
6. **Mobile Responsiveness**: Considerations for different screen sizes
7. **Design Consistency**: Patterns, spacing, typography consistency
${userContext ? '8. **Business-Specific Impact**: How the design affects your specific business type and target audience' : ''}

For each issue identified, provide:
- Severity level (Critical/High/Medium/Low)
- Specific location/element affected
- User impact description
- Actionable recommendation
- Implementation difficulty (Easy/Medium/Hard)
${userContext ? '- Business relevance (how this affects your specific goals and challenges)' : ''}

Format your response as structured JSON with clear categories and actionable insights.`

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })
    })

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`)
    }

    const claudeData = await claudeResponse.json()
    const analysisText = claudeData.content?.[0]?.text

    if (!analysisText) {
      throw new Error('No analysis content received from Claude')
    }

    // Parse Claude response (try to extract JSON, fallback to text)
    let claudeAnalysis
    try {
      // Try to find JSON in the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        claudeAnalysis = JSON.parse(jsonMatch[0])
      } else {
        claudeAnalysis = { raw_analysis: analysisText }
      }
    } catch (error) {
      claudeAnalysis = { raw_analysis: analysisText }
    }

    // Save analysis results
    const { data: resultData, error: resultError } = await supabase
      .from('figmant_analysis_results')
      .insert({
        session_id: session_id,
        user_id: session.user_id,
        context_id: context_id || null,
        claude_analysis: claudeAnalysis,
        google_vision_summary: {
          total_images: images.length,
          vision_results: visionResults
        },
        processing_time_ms: Date.now() - new Date(session.created_at).getTime()
      })
      .select()
      .single()

    if (resultError) throw resultError

    // Update session status
    await supabase
      .from('figmant_analysis_sessions')
      .update({ status: 'completed' })
      .eq('id', session_id)

    console.log('Analysis completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        result_id: resultData.id,
        message: 'Analysis completed successfully'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Analysis error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Analysis failed'
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