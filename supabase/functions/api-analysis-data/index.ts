import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`API Analysis Data request: ${req.method} ${req.url}`)

    // Validate API key from header
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role for API key validation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Hash the provided API key to match against stored hash
    const keyHash = await hashAPIKey(apiKey)
    
    // Validate API key and get permissions
    const { data: validationData, error: validationError } = await supabaseAdmin
      .rpc('validate_api_key', { p_key_hash: keyHash })

    if (validationError || !validationData || validationData.length === 0) {
      console.error('API key validation failed:', validationError)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const keyInfo = validationData[0]
    if (!keyInfo.is_valid) {
      return new Response(
        JSON.stringify({ error: 'API key is expired or inactive' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check rate limiting
    const { data: rateLimitOk } = await supabaseAdmin
      .rpc('check_api_rate_limit', {
        p_api_key_id: keyInfo.api_key_id,
        p_rate_limit: keyInfo.rate_limit_per_hour
      })

    if (!rateLimitOk) {
      await logAPIUsage(supabaseAdmin, keyInfo.api_key_id, req, 429)
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user-scoped Supabase client
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { 
            'Authorization': `Bearer ${await createUserJWT(keyInfo.user_id)}`,
          },
        },
      }
    )

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    let responseData
    let statusCode = 200

    switch (req.method) {
      case 'GET':
        if (path === 'analyses') {
          responseData = await getAnalyses(supabaseUser, url.searchParams, keyInfo.permissions)
        } else if (path === 'analysis') {
          const analysisId = url.searchParams.get('id')
          if (!analysisId) {
            statusCode = 400
            responseData = { error: 'Analysis ID is required' }
          } else {
            responseData = await getAnalysis(supabaseUser, analysisId, keyInfo.permissions)
          }
        } else if (path === 'results') {
          const analysisId = url.searchParams.get('analysis_id')
          if (!analysisId) {
            statusCode = 400
            responseData = { error: 'Analysis ID is required' }
          } else {
            responseData = await getAnalysisResults(supabaseUser, analysisId, keyInfo.permissions)
          }
        } else {
          statusCode = 404
          responseData = { error: 'Endpoint not found' }
        }
        break

      default:
        statusCode = 405
        responseData = { error: 'Method not allowed' }
    }

    // Log API usage
    await logAPIUsage(supabaseAdmin, keyInfo.api_key_id, req, statusCode)

    return new Response(
      JSON.stringify(responseData),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('API Analysis Data error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getAnalyses(supabase: any, searchParams: URLSearchParams, permissions: any) {
  if (!permissions.read) {
    return { error: 'Read permission required' }
  }

  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')
  const status = searchParams.get('status')

  let query = supabase
    .from('analyses')
    .select('id, title, description, status, design_type, business_goals, target_audience, created_at, updated_at, analysis_completed_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching analyses:', error)
    return { error: 'Failed to fetch analyses' }
  }

  return {
    analyses: data || [],
    pagination: {
      limit,
      offset,
      total: count
    }
  }
}

async function getAnalysis(supabase: any, analysisId: string, permissions: any) {
  if (!permissions.read) {
    return { error: 'Read permission required' }
  }

  const { data, error } = await supabase
    .from('analyses')
    .select(`
      id, title, description, status, design_type, business_goals, target_audience, 
      created_at, updated_at, analysis_completed_at, ai_model_used,
      business_impact_score, revenue_potential_annual, revenue_confidence_level,
      implementation_timeline_weeks, competitive_position_score
    `)
    .eq('id', analysisId)
    .single()

  if (error) {
    console.error('Error fetching analysis:', error)
    return { error: 'Analysis not found' }
  }

  return { analysis: data }
}

async function getAnalysisResults(supabase: any, analysisId: string, permissions: any) {
  if (!permissions.read) {
    return { error: 'Read permission required' }
  }

  const { data, error } = await supabase
    .from('analysis_results')
    .select(`
      id, annotations, processing_time_ms, created_at,
      visual_intelligence, google_vision_data, enhanced_context,
      well_done_data, quality_scores, synthesis_metadata
    `)
    .eq('analysis_id', analysisId)
    .single()

  if (error) {
    console.error('Error fetching analysis results:', error)
    return { error: 'Analysis results not found' }
  }

  return { results: data }
}

async function logAPIUsage(supabase: any, apiKeyId: string, req: Request, statusCode: number) {
  const url = new URL(req.url)
  const endpoint = url.pathname
  const method = req.method

  await supabase.rpc('log_api_usage', {
    p_api_key_id: apiKeyId,
    p_endpoint: endpoint,
    p_method: method,
    p_status_code: statusCode,
    p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    p_user_agent: req.headers.get('user-agent')
  })
}

async function hashAPIKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
}

async function createUserJWT(userId: string): Promise<string> {
  // Create a minimal JWT for user authentication
  // Note: In production, you'd want to use proper JWT signing
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    sub: userId,
    role: 'authenticated',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  }))
  
  // Use service role key as signing secret (simplified for demo)
  const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const signatureData = header + '.' + payload
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signatureData))
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
  
  return `${header}.${payload}.${signatureB64}`
}