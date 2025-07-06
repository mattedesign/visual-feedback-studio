import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SCREEN_PATTERNS = {
  dashboard: ['dashboard', 'analytics', 'metrics', 'chart', 'data', 'graph', 'statistics'],
  checkout: ['checkout', 'payment', 'billing', 'cart', 'purchase', 'buy now', 'credit card'],
  onboarding: ['welcome', 'get started', 'setup', 'tutorial', 'introduction', 'guide'],
  signup: ['sign up', 'register', 'create account', 'join', 'email', 'password'],
  login: ['sign in', 'login', 'log in', 'welcome back', 'password', 'forgot'],
  profile: ['profile', 'account', 'settings', 'preferences', 'personal', 'user'],
  listing: ['list', 'results', 'search', 'filter', 'sort', 'browse', 'catalog'],
  form: ['form', 'input', 'submit', 'contact', 'field', 'required', 'textarea'],
  landing: ['hero', 'cta', 'features', 'testimonial', 'pricing', 'demo'],
  interface: ['interface', 'screen', 'page', 'view'] // default fallback
}

async function detectGoblinScreenType(imageUrl: string) {
  console.log('🔍 detectGoblinScreenType called with:', imageUrl)
  
  try {
    // Check if API key exists
    const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY')
    if (!apiKey) {
      console.error('❌ GOOGLE_VISION_API_KEY not found in environment')
      throw new Error('GOOGLE_VISION_API_KEY not configured')
    }
    
    console.log('✅ API key found, making Vision API request...')
    
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`
    const requestBody = {
      requests: [{
        image: { 
          source: { imageUri: imageUrl } 
        },
        features: [
          { type: 'TEXT_DETECTION', maxResults: 20 },
          { type: 'LABEL_DETECTION', maxResults: 10 }
        ]
      }]
    }
    
    console.log('📤 Sending request to Vision API...')
    
    const visionResponse = await fetch(visionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 Vision API response status:', visionResponse.status)

    // Check if response is OK
    if (!visionResponse.ok) {
      const errorText = await visionResponse.text()
      console.error('❌ Google Vision API error response:', errorText)
      throw new Error(`Vision API failed: ${visionResponse.status} - ${errorText}`)
    }

    const visionData = await visionResponse.json()
    console.log('📦 Vision API response received:', JSON.stringify(visionData).substring(0, 200))
    
    // Check for API errors in response
    if (visionData.error) {
      console.error('❌ Vision API error in response:', visionData.error)
      throw new Error(visionData.error.message || 'Vision API error')
    }

    const response = visionData.responses?.[0]
    if (!response) {
      console.warn('⚠️ No response data from Vision API')
      return { 
        screenType: 'interface', 
        confidence: 0, 
        detectedText: '',
        error: 'No response from Vision API' 
      }
    }

    // Extract text and labels
    const detectedText = response.textAnnotations?.[0]?.description?.toLowerCase() || ''
    const labels = response.labelAnnotations?.map((l: any) => l.description.toLowerCase()) || []
    
    console.log('📝 Detected text length:', detectedText.length)
    console.log('📝 Detected text preview:', detectedText.substring(0, 100))
    console.log('🏷️ Detected labels:', labels)
    
    // Score each screen type
    const typeScores: { [key: string]: number } = {}
    
    for (const [screenType, patterns] of Object.entries(SCREEN_PATTERNS)) {
      let score = 0
      
      // Check text patterns
      for (const pattern of patterns) {
        if (detectedText.includes(pattern)) {
          score += 2 // Text matches are weighted higher
        }
        
        // Check labels too
        for (const label of labels) {
          if (label.includes(pattern)) {
            score += 1
          }
        }
      }
      
      typeScores[screenType] = score
    }

    // Find best match
    const sortedScores = Object.entries(typeScores).sort(([,a], [,b]) => b - a)
    const [screenType, score] = sortedScores[0] || ['interface', 0]
    const confidence = score > 0 ? Math.min(score / 6, 1) : 0

    console.log('🎯 Screen type detected:', screenType, 'confidence:', confidence)
    console.log('📊 All scores:', typeScores)

    return {
      screenType: confidence > 0.3 ? screenType : 'interface',
      confidence,
      detectedText: detectedText.substring(0, 200),
      metadata: {
        labels: labels.slice(0, 5),
        topScores: sortedScores.slice(0, 3).map(([type, score]) => ({ type, score }))
      }
    }

  } catch (error) {
    console.error('❌ Goblin vision detection failed with error:', error.message)
    console.error('Stack trace:', error.stack)
    
    // Return a fallback result instead of throwing
    return { 
      screenType: 'interface', 
      confidence: 0, 
      detectedText: '',
      error: error.message,
      metadata: {
        labels: [],
        topScores: []
      }
    }
  }
}

serve(async (req) => {
  console.log('🚀 Goblin Vision Detector received request')
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    console.log('📨 Request body:', JSON.stringify(body))
    
    const { imageUrl, order } = body
    
    // Validate input
    if (!imageUrl) {
      console.error('❌ No imageUrl provided in request')
      throw new Error('imageUrl is required')
    }
    
    console.log(`👁️ Goblin Vision analyzing image ${order || 1}: ${imageUrl}`)

    // Call the detection function
    const detection = await detectGoblinScreenType(imageUrl)
    console.log('🔍 Detection complete:', detection)

    const response = {
      success: true,
      order: order || 1,
      ...detection
    }
    
    console.log('✅ Sending successful response:', JSON.stringify(response))

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('❌ Goblin screen detection endpoint failed:', error.message)
    console.error('Stack trace:', error.stack)
    
    const errorResponse = {
      success: false,
      error: error.message,
      fallback: { 
        screenType: 'interface', 
        confidence: 0,
        metadata: {
          labels: [],
          topScores: []
        }
      }
    }
    
    console.log('❌ Sending error response:', JSON.stringify(errorResponse))
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 even for errors so the orchestrator can continue
    })
  }
})