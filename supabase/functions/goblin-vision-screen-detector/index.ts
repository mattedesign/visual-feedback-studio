import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🔍 Goblin Vision Screen Detector - Google Vision API integration');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrls, sessionId } = await req.json();

    console.log('👁️ Analyzing screens with Google Vision:', {
      sessionId: sessionId?.substring(0, 8),
      imageCount: imageUrls?.length
    });

    const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    if (!googleVisionApiKey) {
      throw new Error('Google Vision API key not configured');
    }

    const screenAnalysis = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      
      try {
        console.log(`🔍 Analyzing image ${i + 1}/${imageUrls.length}`);
        
        const visionResponse = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [{
                image: {
                  source: { imageUri: imageUrl }
                },
                features: [
                  { type: 'TEXT_DETECTION', maxResults: 10 },
                  { type: 'LABEL_DETECTION', maxResults: 20 }
                ]
              }]
            })
          }
        );

        if (!visionResponse.ok) {
          console.warn(`Vision API failed for image ${i + 1}:`, visionResponse.statusText);
          screenAnalysis.push({
            imageUrl,
            screenType: 'unknown',
            confidence: 0.1,
            detectedText: [],
            labels: [],
            error: `Vision API error: ${visionResponse.statusText}`
          });
          continue;
        }

        const visionData = await visionResponse.json();
        const response = visionData.responses[0];

        // Extract text and labels
        const detectedText = response.textAnnotations?.map(t => t.description) || [];
        const labels = response.labelAnnotations?.map(l => ({
          description: l.description,
          score: l.score
        })) || [];

        // Determine screen type based on detected content
        const screenType = determineScreenType(detectedText, labels);
        const confidence = calculateConfidence(screenType, detectedText, labels);

        screenAnalysis.push({
          imageUrl,
          screenType,
          confidence,
          detectedText: detectedText.slice(0, 5), // Limit to first 5 text elements
          labels: labels.slice(0, 10), // Limit to top 10 labels
          metadata: {
            textCount: detectedText.length,
            labelCount: labels.length,
            processedAt: new Date().toISOString()
          }
        });

        console.log(`✅ Image ${i + 1} analyzed: ${screenType} (${Math.round(confidence * 100)}% confidence)`);

      } catch (imageError) {
        console.error(`Failed to analyze image ${i + 1}:`, imageError);
        screenAnalysis.push({
          imageUrl,
          screenType: 'unknown',
          confidence: 0.1,
          detectedText: [],
          labels: [],
          error: imageError.message
        });
      }
    }

    // Generate summary insights
    const summary = {
      totalImages: imageUrls.length,
      screenTypes: [...new Set(screenAnalysis.map(s => s.screenType))],
      averageConfidence: screenAnalysis.reduce((sum, s) => sum + s.confidence, 0) / screenAnalysis.length,
      detectedFlow: determineUserFlow(screenAnalysis)
    };

    console.log('🎯 Screen detection completed:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        screenAnalysis,
        summary,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Goblin vision detection failed:', error);

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function determineScreenType(textElements: string[], labels: any[]): string {
  const allText = textElements.join(' ').toLowerCase();
  const labelDescriptions = labels.map(l => l.description.toLowerCase());

  // Check for specific UI patterns
  if (allText.includes('sign in') || allText.includes('log in') || allText.includes('login')) {
    return 'login';
  }
  
  if (allText.includes('sign up') || allText.includes('register') || allText.includes('create account')) {
    return 'signup';
  }
  
  if (allText.includes('checkout') || allText.includes('payment') || allText.includes('billing')) {
    return 'checkout';
  }
  
  if (allText.includes('dashboard') || labelDescriptions.includes('dashboard')) {
    return 'dashboard';
  }
  
  if (allText.includes('onboarding') || allText.includes('welcome') || allText.includes('get started')) {
    return 'onboarding';
  }
  
  if (allText.includes('profile') || allText.includes('account') || allText.includes('settings')) {
    return 'profile';
  }
  
  if (allText.includes('product') || allText.includes('item') || allText.includes('buy')) {
    return 'product';
  }
  
  if (allText.includes('search') || allText.includes('results') || allText.includes('filter')) {
    return 'search';
  }
  
  if (allText.includes('cart') || allText.includes('basket') || allText.includes('shopping')) {
    return 'cart';
  }
  
  if (allText.includes('contact') || allText.includes('support') || allText.includes('help')) {
    return 'contact';
  }
  
  // Check for mobile vs desktop indicators
  if (labelDescriptions.includes('mobile phone') || labelDescriptions.includes('smartphone')) {
    return 'mobile_app';
  }
  
  // Default based on content density
  if (textElements.length > 20) {
    return 'content_heavy';
  } else if (textElements.length < 5) {
    return 'minimal';
  }
  
  return 'general';
}

function calculateConfidence(screenType: string, textElements: string[], labels: any[]): number {
  let confidence = 0.3; // Base confidence
  
  const allText = textElements.join(' ').toLowerCase();
  const labelDescriptions = labels.map(l => l.description.toLowerCase());
  
  // Increase confidence based on specific matches
  const typeKeywords = {
    login: ['sign in', 'log in', 'password', 'username'],
    signup: ['sign up', 'register', 'create account', 'join'],
    checkout: ['checkout', 'payment', 'billing', 'total', 'price'],
    dashboard: ['dashboard', 'overview', 'analytics', 'stats'],
    onboarding: ['welcome', 'get started', 'step 1', 'tutorial'],
    profile: ['profile', 'account', 'settings', 'preferences'],
    product: ['product', 'buy now', 'add to cart', 'price'],
    search: ['search', 'results', 'filter', 'sort by'],
    cart: ['cart', 'basket', 'checkout', 'remove item'],
    contact: ['contact', 'support', 'help', 'email us']
  };
  
  const keywords = typeKeywords[screenType] || [];
  const matchCount = keywords.filter(keyword => allText.includes(keyword)).length;
  
  confidence += (matchCount / keywords.length) * 0.5;
  
  // Boost confidence if we have relevant labels
  const relevantLabels = labels.filter(l => l.score > 0.7).length;
  confidence += Math.min(relevantLabels / 10, 0.2);
  
  return Math.min(confidence, 0.95); // Cap at 95%
}

function determineUserFlow(screenAnalysis: any[]): string[] {
  const flow = screenAnalysis.map(s => s.screenType);
  
  // Common flow patterns
  if (flow.includes('login') && flow.includes('dashboard')) {
    return ['authentication_flow'];
  }
  
  if (flow.includes('product') && flow.includes('cart') && flow.includes('checkout')) {
    return ['purchase_flow'];
  }
  
  if (flow.includes('signup') && flow.includes('onboarding')) {
    return ['user_acquisition_flow'];
  }
  
  return ['general_navigation'];
}