
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
  const googleCredentials = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
  
  if (!googleCredentials) {
    throw new Error('Google Cloud credentials not configured');
  }

  try {
    // Parse the service account credentials
    const credentials = JSON.parse(googleCredentials);
    console.log('🔍 Google Vision: Credentials parsed successfully');
    
    // Get access token using service account
    const accessToken = await getAccessToken(credentials);
    console.log('🔍 Google Vision: Access token obtained');

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

    const apiUrl = 'https://vision.googleapis.com/v1/images:annotate';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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

  } catch (parseError) {
    console.error('❌ Google Vision: Failed to parse credentials or make request:', parseError);
    throw new Error(`Google Vision setup failed: ${parseError.message}`);
  }
}

async function getAccessToken(credentials: any): Promise<string> {
  try {
    // Create JWT header
    const jwtHeader = {
      alg: 'RS256',
      typ: 'JWT'
    };

    // Create JWT payload
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      iss: credentials.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-vision',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 hour
      iat: now
    };

    // Encode header and payload
    const encodedHeader = btoa(JSON.stringify(jwtHeader))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    
    const encodedPayload = btoa(JSON.stringify(jwtPayload))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Create the unsigned token
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    // Import the private key
    const privateKeyPem = credentials.private_key;
    const privateKeyFormatted = privateKeyPem
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\n/g, '');

    // Convert base64 to ArrayBuffer
    const privateKeyBuffer = Uint8Array.from(atob(privateKeyFormatted), c => c.charCodeAt(0));

    // Import the key for signing
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    );

    // Sign the token
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(unsignedToken)
    );

    // Encode signature
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Create the signed JWT
    const signedJWT = `${unsignedToken}.${encodedSignature}`;

    console.log('🔍 Google Vision: JWT created successfully');

    // Exchange JWT for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: signedJWT
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Google Vision: Access token received');
    
    return tokenData.access_token;

  } catch (error) {
    console.error('❌ Google Vision: Access token generation failed:', error);
    throw new Error(`Access token generation failed: ${error.message}`);
  }
}
