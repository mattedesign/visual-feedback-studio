
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

console.log('🎨 Figmant Analysis Pipeline - Comprehensive UX Analysis v3.2');

serve(async (req) => {
  console.log('🔴 DEBUG_FIGMANT: Function entry point reached');
  console.log('🔴 DEBUG_FIGMANT: Request method:', req.method);

  if (req.method === 'OPTIONS') {
    console.log('🔴 DEBUG_FIGMANT: Returning CORS response');
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔴 DEBUG_FIGMANT: Starting analysis pipeline');
    
    // Environment check
    const envCheck = {
      hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      hasAnthropicKey: !!Deno.env.get('ANTHROPIC_API_KEY'),
      hasGoogleVisionKey: !!Deno.env.get('GOOGLE_VISION_API_KEY'),
      timestamp: new Date().toISOString()
    };
    console.log('🔴 DEBUG_FIGMANT: Environment check:', envCheck);

    // Initialize Supabase clients - dual client approach for proper JWT validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Check for JWT authentication first
    const authHeader = req.headers.get('Authorization');
    let authenticatedUserId = null;
    
    if (authHeader) {
      console.log('🔴 DEBUG_FIGMANT: JWT authentication provided');
      const token = authHeader.replace('Bearer ', '');
      
      // Create auth client for JWT validation
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      });
      
      // Verify the user
      const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
      
      if (userError || !userData.user) {
        console.error('🔴 DEBUG_FIGMANT: JWT authentication failed, checking if this is a plugin session...', userError);
        // Don't immediately return error - might be a plugin request with session validation
      } else {
        console.log('🔴 DEBUG_FIGMANT: JWT authentication successful for user:', userData.user.id);
        authenticatedUserId = userData.user.id;
      }
    }
    
    // Create service client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate API key if provided (alternative auth method)
    const apiKey = req.headers.get('x-api-key');
    if (apiKey && !authHeader) {
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
    
    // For plugin requests, we'll validate session ownership instead of requiring JWT
    const isPluginRequest = !apiKey; // If no API key, assume it's a plugin request

    // Parse request body
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('📥 Raw request body:', bodyText);
      
      if (!bodyText) {
        throw new Error('Request body is empty');
      }
      
      requestBody = JSON.parse(bodyText);
      console.log('📥 Parsed request body:', requestBody);
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract sessionId with multiple possible field names
    const sessionId = requestBody.session_id || requestBody.sessionId;
    
    const requestInfo = {
      sessionId: sessionId,
      timestamp: new Date().toISOString()
    };
    console.log('📥 Received request:', requestInfo);

    if (!sessionId) {
      console.error('❌ Missing sessionId in request');
      return new Response(
        JSON.stringify({ 
          error: 'sessionId is required',
          received: requestBody,
          expectedFields: ['session_id', 'sessionId']
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔴 DEBUG_FIGMANT: Starting analysis for session:', sessionId);

    console.log('Starting analysis for session:', sessionId)

    // Get session and images
    const { data: session, error: sessionError } = await supabase
      .from('figmant_analysis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      console.error('❌ Session lookup error:', sessionError);
      throw new Error(`Session not found: ${sessionError.message}`);
    }

    if (!session) {
      throw new Error('Session not found');
    }

    console.log('✅ Found session:', session.id);

    // For plugin requests without JWT, validate session ownership using the session's user_id
    if (isPluginRequest && !authenticatedUserId) {
      console.log('🔴 DEBUG_FIGMANT: Plugin request - validating session without JWT');
      // Plugin requests are authenticated via the session itself - 
      // if someone can provide a valid session_id, they can analyze it
      // This matches the upload API behavior
    } else if (authenticatedUserId && session.user_id !== authenticatedUserId) {
      console.error('🔴 DEBUG_FIGMANT: Session belongs to different user');
      return new Response(
        JSON.stringify({ error: 'Session access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: images, error: imagesError } = await supabase
      .from('figmant_session_images')
      .select('*')
      .eq('session_id', sessionId)
      .order('upload_order', { ascending: true })

    if (imagesError) {
      console.error('❌ Images lookup error:', imagesError);
      throw new Error(`Failed to get images: ${imagesError.message}`);
    }

    if (!images || images.length === 0) {
      throw new Error('No images found for analysis')
    }

    console.log(`✅ Found ${images.length} images to analyze`)

    // Update session status to processing
    await supabase
      .from('figmant_analysis_sessions')
      .update({ status: 'processing' })
      .eq('id', sessionId);

    // Get Google Vision API key
    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
    if (!googleVisionApiKey) {
      throw new Error('Google Vision API key not configured')
    }

    // Process each image with Google Vision
    const visionResults = []
    for (const image of images) {
      try {
        console.log(`🔍 Processing vision for: ${image.file_name}`);
        
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

    console.log('✅ Vision processing complete');

    // Get Claude API key
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured')
    }

    // Prepare Claude analysis prompt with images
    const imageContent = []
    
    // Add each image as base64 content for Claude
    for (const image of images) {
      try {
        // Get image URL
        const { data: urlData } = supabase.storage
          .from('analysis-images')
          .getPublicUrl(image.file_path)
        
        // Fetch and convert image to base64
        const imageResponse = await fetch(urlData.publicUrl)
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
        
        imageContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: base64Image
          }
        })
      } catch (error) {
        console.error(`Error loading image ${image.file_name} for Claude:`, error)
      }
    }

    const analysisPrompt = `You are a Senior UX Designer analyzing design images. 

Session Details:
- Title: ${session.title}
- Design Type: ${session.design_type || 'Web/Mobile Interface'}
- Business Goals: ${session.business_goals?.join(', ') || 'Not specified'}

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
5. **Conversion Optimization**: Opportunities to improve business goals
6. **Mobile Responsiveness**: Considerations for different screen sizes
7. **Design Consistency**: Patterns, spacing, typography consistency

For each issue identified, provide:
- Severity level (Critical/High/Medium/Low)
- Specific location/element affected
- User impact description
- Actionable recommendation
- Implementation difficulty (Easy/Medium/Hard)

Format your response as structured JSON with clear categories and actionable insights.`

    console.log('🧠 Calling Claude API...');

    // Prepare the message content with both text and images
    const messageContent = [
      { type: "text", text: analysisPrompt },
      ...imageContent
    ]

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: messageContent
        }]
      })
    })

    if (!claudeResponse.ok) {
      const claudeErrorText = await claudeResponse.text();
      console.error('❌ Claude API error:', claudeErrorText);
      throw new Error(`Claude API error: ${claudeResponse.status} - ${claudeErrorText}`)
    }

    const claudeData = await claudeResponse.json()
    const analysisText = claudeData.content?.[0]?.text

    if (!analysisText) {
      throw new Error('No analysis content received from Claude')
    }

    console.log('✅ Claude analysis received');

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
        session_id: sessionId,
        user_id: session.user_id,
        claude_analysis: claudeAnalysis,
        google_vision_summary: {
          total_images: images.length,
          vision_results: visionResults
        },
        processing_time_ms: Date.now() - new Date(session.created_at).getTime()
      })
      .select()
      .single()

    if (resultError) {
      console.error('❌ Result save error:', resultError);
      throw new Error(`Failed to save results: ${resultError.message}`);
    }

    // Update session status
    await supabase
      .from('figmant_analysis_sessions')
      .update({ status: 'completed' })
      .eq('id', sessionId)

    console.log('✅ Analysis completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        result_id: resultData.id,
        session_id: sessionId,
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
    console.error('❌ Analysis error:', error)
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
