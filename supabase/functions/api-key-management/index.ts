import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface APIKeyRequest {
  name: string;
  permissions?: {
    read?: boolean;
    write?: boolean;
    webhook?: boolean;
  };
  rateLimit?: number;
  expiresAt?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Authentication failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`API Key Management request from user: ${user.id}, method: ${req.method}`)

    switch (req.method) {
      case 'POST':
        return await createAPIKey(req, supabaseClient, user.id)
      case 'GET':
        return await listAPIKeys(supabaseClient, user.id)
      case 'DELETE':
        return await deleteAPIKey(req, supabaseClient, user.id)
      case 'PUT':
        return await updateAPIKey(req, supabaseClient, user.id)
      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('API Key Management error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function createAPIKey(req: Request, supabase: any, userId: string) {
  const body: APIKeyRequest = await req.json()
  
  if (!body.name || body.name.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'API key name is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Generate a secure API key
  const apiKey = generateAPIKey()
  const keyHash = await hashAPIKey(apiKey)
  const keyPrefix = apiKey.substring(0, 8)

  const permissions = {
    read: body.permissions?.read ?? true,
    write: body.permissions?.write ?? false,
    webhook: body.permissions?.webhook ?? false
  }

  const apiKeyData = {
    user_id: userId,
    name: body.name.trim(),
    key_hash: keyHash,
    key_prefix: keyPrefix,
    permissions,
    rate_limit_per_hour: body.rateLimit ?? 100,
    expires_at: body.expiresAt ? new Date(body.expiresAt).toISOString() : null
  }

  console.log('Creating API key for user:', userId, 'with name:', body.name)

  const { data, error } = await supabase
    .from('api_keys')
    .insert(apiKeyData)
    .select()
    .single()

  if (error) {
    console.error('Error creating API key:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create API key' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Return the API key only once (for security)
  const response = {
    id: data.id,
    name: data.name,
    key: apiKey, // Only returned on creation
    key_prefix: data.key_prefix,
    permissions: data.permissions,
    rate_limit_per_hour: data.rate_limit_per_hour,
    expires_at: data.expires_at,
    created_at: data.created_at
  }

  console.log('API key created successfully:', data.id)

  return new Response(
    JSON.stringify(response),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function listAPIKeys(supabase: any, userId: string) {
  console.log('Listing API keys for user:', userId)

  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, key_prefix, permissions, rate_limit_per_hour, last_used_at, expires_at, is_active, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error listing API keys:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to list API keys' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log(`Found ${data?.length || 0} API keys for user`)

  return new Response(
    JSON.stringify({ api_keys: data || [] }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function deleteAPIKey(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url)
  const keyId = url.searchParams.get('id')

  if (!keyId) {
    return new Response(
      JSON.stringify({ error: 'API key ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('Deleting API key:', keyId, 'for user:', userId)

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting API key:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete API key' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('API key deleted successfully')

  return new Response(
    JSON.stringify({ message: 'API key deleted successfully' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function updateAPIKey(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url)
  const keyId = url.searchParams.get('id')
  
  if (!keyId) {
    return new Response(
      JSON.stringify({ error: 'API key ID is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const body = await req.json()
  const updates: any = {}

  // Only allow updating specific fields
  if (body.name !== undefined) updates.name = body.name
  if (body.is_active !== undefined) updates.is_active = body.is_active
  if (body.rate_limit_per_hour !== undefined) updates.rate_limit_per_hour = body.rate_limit_per_hour
  if (body.permissions !== undefined) updates.permissions = body.permissions
  if (body.expires_at !== undefined) {
    updates.expires_at = body.expires_at ? new Date(body.expires_at).toISOString() : null
  }

  console.log('Updating API key:', keyId, 'for user:', userId)

  const { data, error } = await supabase
    .from('api_keys')
    .update(updates)
    .eq('id', keyId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating API key:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update API key' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('API key updated successfully')

  return new Response(
    JSON.stringify(data),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function generateAPIKey(): string {
  // Generate a cryptographically secure API key
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return 'fgm_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

async function hashAPIKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
}