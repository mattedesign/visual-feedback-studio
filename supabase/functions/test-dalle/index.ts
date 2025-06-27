
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { issue } = await req.json()
    
    console.log('Received DALL-E request for issue:', issue)
    
    if (!issue) {
      return new Response(
        JSON.stringify({ success: false, error: 'Issue description required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Calling DALL-E 3 API...')
    
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Professional UI/UX design solution for: ${issue}. Modern, clean, accessible design with proper contrast and visual hierarchy. Clean interface mockup, professional design, user-friendly layout.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    })

    if (!dalleResponse.ok) {
      const errorData = await dalleResponse.json().catch(() => ({ error: 'Unknown error' }))
      console.error('DALL-E API error:', errorData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `DALL-E API error: ${errorData.error?.message || dalleResponse.statusText}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const dalleData = await dalleResponse.json()
    console.log('DALL-E response received:', dalleData)
    
    if (dalleData.data && dalleData.data[0] && dalleData.data[0].url) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          imageUrl: dalleData.data[0].url,
          prompt: dalleData.data[0].revised_prompt || `Professional UI/UX design solution for: ${issue}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.error('Invalid DALL-E response:', dalleData)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No image generated', 
          details: dalleData 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Server error: ${error.message}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
