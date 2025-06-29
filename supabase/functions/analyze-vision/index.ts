
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

interface VisionRequest {
  image: string;
  features: string[];
  provider?: string;
}

interface GoogleVisionFeature {
  type: string;
  maxResults?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Vision API: Request received');
    
    const { image, features, provider = 'google' }: VisionRequest = await req.json();
    
    if (!image || !features || features.length === 0) {
      throw new Error('Missing required parameters: image and features');
    }

    console.log('🔍 Vision API: Processing with provider:', provider);
    console.log('🔍 Vision API: Features requested:', features);

    if (provider === 'google') {
      return await handleGoogleVision(image, features);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

  } catch (error) {
    console.error('❌ Vision API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleGoogleVision(base64Image: string, features: string[]) {
  const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
  
  if (!apiKey) {
    throw new Error('Google Vision API key not configured');
  }

  // Map feature names to Google Vision API format
  const visionFeatures: GoogleVisionFeature[] = features.map(feature => {
    switch (feature) {
      case 'TEXT_DETECTION':
        return { type: 'TEXT_DETECTION' };
      case 'OBJECT_LOCALIZATION':
        return { type: 'OBJECT_LOCALIZATION', maxResults: 20 };
      case 'IMAGE_PROPERTIES':
        return { type: 'IMAGE_PROPERTIES' };
      case 'LABEL_DETECTION':
        return { type: 'LABEL_DETECTION', maxResults: 20 };
      default:
        return { type: feature };
    }
  });

  const requestBody = {
    requests: [
      {
        image: {
          content: base64Image
        },
        features: visionFeatures
      }
    ]
  };

  console.log('🔍 Google Vision: Making API request with features:', visionFeatures.map(f => f.type));

  const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Google Vision API error:', errorText);
    throw new Error(`Google Vision API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Google Vision: API response received');

  if (data.responses && data.responses[0] && data.responses[0].error) {
    const error = data.responses[0].error;
    throw new Error(`Google Vision API error: ${error.message} (Code: ${error.code})`);
  }

  // Return the first response (since we only sent one image)
  const result = data.responses[0] || {};
  
  return new Response(
    JSON.stringify(result),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
