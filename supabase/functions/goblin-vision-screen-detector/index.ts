import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced error handling and circuit breaker
const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 1000,
  timeoutMs: 15000
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Vision API timeout')), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

const SCREEN_PATTERNS = {
  dashboard: ['dashboard', 'analytics', 'metrics', 'chart', 'data', 'graph', 'statistics', 'performance', 'kpi', 'overview', 'insights', 'reports', 'sales', 'revenue', 'customers', 'orders', 'traffic', 'conversions'],
  admin: ['admin', 'management', 'control panel', 'settings', 'configuration', 'users', 'permissions', 'system', 'database', 'logs', 'monitoring'],
  checkout: ['checkout', 'payment', 'billing', 'cart', 'purchase', 'buy now', 'credit card', 'order', 'total', 'shipping', 'delivery'],
  onboarding: ['welcome', 'get started', 'setup', 'tutorial', 'introduction', 'guide', 'wizard', 'step', 'complete', 'progress'],
  signup: ['sign up', 'register', 'create account', 'join', 'email', 'password', 'verify', 'confirm'],
  login: ['sign in', 'login', 'log in', 'welcome back', 'password', 'forgot', 'remember', 'username'],
  profile: ['profile', 'account', 'settings', 'preferences', 'personal', 'user', 'edit', 'update', 'manage'],
  listing: ['list', 'results', 'search', 'filter', 'sort', 'browse', 'catalog', 'products', 'items', 'gallery'],
  form: ['form', 'input', 'submit', 'contact', 'field', 'required', 'textarea', 'select', 'checkbox', 'radio'],
  landing: ['hero', 'cta', 'features', 'testimonial', 'pricing', 'demo', 'benefits', 'solution', 'product'],
  ecommerce: ['shop', 'store', 'product', 'price', 'add to cart', 'wishlist', 'compare', 'reviews', 'rating'],
  social: ['feed', 'post', 'comment', 'like', 'share', 'follow', 'profile', 'timeline', 'notification'],
  messaging: ['chat', 'message', 'conversation', 'inbox', 'send', 'reply', 'thread', 'notification'],
  content: ['article', 'blog', 'news', 'read', 'content', 'story', 'author', 'publish', 'edit'],
  interface: ['interface', 'screen', 'page', 'view', 'app', 'website'] // default fallback
}

async function detectGoblinScreenType(imageUrl: string, retryCount = 0): Promise<any> {
  console.log(`🔍 detectGoblinScreenType called (attempt ${retryCount + 1}):`, imageUrl.substring(0, 100))
  
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
    
    const visionResponse = await withTimeout(
      fetch(visionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }),
      RETRY_CONFIG.timeoutMs
    );

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
    
    // Enhanced scoring algorithm with contextual weight
    const typeScores: { [key: string]: number } = {}
    
    for (const [screenType, patterns] of Object.entries(SCREEN_PATTERNS)) {
      let score = 0
      
      // Check text patterns with position weight
      for (const pattern of patterns) {
        const textOccurrences = (detectedText.match(new RegExp(pattern, 'gi')) || []).length;
        if (textOccurrences > 0) {
          // Higher weight for multiple occurrences and specific patterns
          score += textOccurrences * (pattern.length > 4 ? 3 : 2);
          
          // Bonus for early occurrence (likely header/title)
          if (detectedText.indexOf(pattern) < detectedText.length / 3) {
            score += 2;
          }
        }
        
        // Check labels with confidence weighting
        for (const label of labels) {
          if (label.includes(pattern) || pattern.includes(label)) {
            score += 1;
          }
        }
      }
      
      // Apply contextual bonuses
      if (screenType === 'dashboard' && (detectedText.includes('total') || detectedText.includes('view') || detectedText.includes('overview'))) {
        score += 3;
      }
      
      if (screenType === 'admin' && (detectedText.includes('manage') || detectedText.includes('control'))) {
        score += 2;
      }
      
      typeScores[screenType] = score
    }

    // Find best match
    const sortedScores = Object.entries(typeScores).sort(([,a], [,b]) => b - a)
    const [screenType, score] = sortedScores[0] || ['interface', 0]
    const confidence = score > 0 ? Math.min(score / 6, 1) : 0

    console.log('🎯 Screen type detected:', screenType, 'confidence:', confidence)
    console.log('📊 All scores:', typeScores)

    // Enhanced interface classification
    const interfaceCategory = classifyInterface(screenType, detectedText, labels);
    
    return {
      screenType: confidence > 0.2 ? screenType : 'interface',
      confidence,
      detectedText: detectedText.substring(0, 300),
      interfaceCategory,
      context: extractInterfaceContext(screenType, detectedText),
      metadata: {
        labels: labels.slice(0, 8),
        topScores: sortedScores.slice(0, 5).map(([type, score]) => ({ type, score })),
        textLength: detectedText.length,
        labelCount: labels.length
      }
    }

  } catch (error) {
    console.error(`❌ Goblin vision detection failed (attempt ${retryCount + 1}):`, error.message)
    console.error('Stack trace:', error.stack)
    
    // Retry logic for transient errors
    if (retryCount < RETRY_CONFIG.maxRetries && 
        (error.message.includes('timeout') || error.message.includes('network') || error.status >= 500)) {
      console.log(`🔄 Retrying vision detection in ${RETRY_CONFIG.retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
      return detectGoblinScreenType(imageUrl, retryCount + 1);
    }
    
    // Return a fallback result instead of throwing
    return { 
      screenType: 'interface', 
      confidence: 0, 
      detectedText: '',
      error: error.message,
      fallback: true,
      retryCount: retryCount + 1,
      metadata: {
        labels: [],
        topScores: []
      }
    }
  }
}

// Enhanced interface classification system
function classifyInterface(screenType: string, detectedText: string, labels: string[]): string {
  const businessKeywords = ['revenue', 'sales', 'profit', 'growth', 'customers', 'conversion', 'roi', 'metrics'];
  const technicalKeywords = ['api', 'database', 'system', 'logs', 'configuration', 'admin', 'monitoring'];
  const userKeywords = ['user', 'profile', 'account', 'personal', 'preferences', 'settings'];
  const contentKeywords = ['content', 'articles', 'posts', 'media', 'images', 'videos'];
  
  let category = 'general';
  
  // Business-focused interfaces
  if (businessKeywords.some(kw => detectedText.includes(kw)) || screenType === 'dashboard') {
    category = 'business';
  }
  // Technical/admin interfaces  
  else if (technicalKeywords.some(kw => detectedText.includes(kw)) || screenType === 'admin') {
    category = 'technical';
  }
  // User-focused interfaces
  else if (userKeywords.some(kw => detectedText.includes(kw)) || ['profile', 'signup', 'login'].includes(screenType)) {
    category = 'user';
  }
  // Content-focused interfaces
  else if (contentKeywords.some(kw => detectedText.includes(kw)) || ['content', 'social'].includes(screenType)) {
    category = 'content';
  }
  // E-commerce interfaces
  else if (['checkout', 'ecommerce', 'listing'].includes(screenType)) {
    category = 'commerce';
  }
  
  return category;
}

// Extract contextual information about the interface
function extractInterfaceContext(screenType: string, detectedText: string): any {
  const context: any = {
    primaryPurpose: screenType,
    keyElements: [],
    userActions: [],
    businessValue: []
  };
  
  // Extract key elements based on screen type
  switch (screenType) {
    case 'dashboard':
      context.keyElements = extractDashboardElements(detectedText);
      context.userActions = ['analyze', 'monitor', 'track', 'report'];
      context.businessValue = ['data-driven decisions', 'performance monitoring', 'trend analysis'];
      break;
      
    case 'admin':
      context.keyElements = extractAdminElements(detectedText);
      context.userActions = ['manage', 'configure', 'monitor', 'control'];
      context.businessValue = ['system efficiency', 'user management', 'security'];
      break;
      
    case 'checkout':
      context.keyElements = extractCheckoutElements(detectedText);
      context.userActions = ['purchase', 'pay', 'confirm', 'complete'];
      context.businessValue = ['revenue generation', 'conversion optimization', 'customer acquisition'];
      break;
      
    default:
      context.keyElements = extractGeneralElements(detectedText);
      context.userActions = ['navigate', 'interact', 'complete'];
      context.businessValue = ['user engagement', 'task completion'];
  }
  
  return context;
}

function extractDashboardElements(text: string): string[] {
  const elements = [];
  if (text.includes('chart') || text.includes('graph')) elements.push('data_visualization');
  if (text.includes('metric') || text.includes('kpi')) elements.push('key_metrics');
  if (text.includes('total') || text.includes('sum')) elements.push('summary_data');
  if (text.includes('revenue') || text.includes('sales')) elements.push('financial_data');
  if (text.includes('user') || text.includes('customer')) elements.push('user_analytics');
  return elements;
}

function extractAdminElements(text: string): string[] {
  const elements = [];
  if (text.includes('user') || text.includes('member')) elements.push('user_management');
  if (text.includes('setting') || text.includes('config')) elements.push('configuration');
  if (text.includes('permission') || text.includes('role')) elements.push('access_control');
  if (text.includes('log') || text.includes('activity')) elements.push('monitoring');
  return elements;
}

function extractCheckoutElements(text: string): string[] {
  const elements = [];
  if (text.includes('payment') || text.includes('card')) elements.push('payment_method');
  if (text.includes('shipping') || text.includes('delivery')) elements.push('fulfillment');
  if (text.includes('total') || text.includes('amount')) elements.push('order_summary');
  if (text.includes('address') || text.includes('billing')) elements.push('customer_info');
  return elements;
}

function extractGeneralElements(text: string): string[] {
  const elements = [];
  if (text.includes('button') || text.includes('click')) elements.push('interactive_elements');
  if (text.includes('form') || text.includes('input')) elements.push('data_entry');
  if (text.includes('menu') || text.includes('navigation')) elements.push('navigation');
  return elements;
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