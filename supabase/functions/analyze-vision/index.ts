
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

interface VisionError {
  type: 'credentials' | 'image_access' | 'api_error' | 'timeout' | 'unknown';
  message: string;
  details?: any;
  retryable?: boolean;
}

serve(async (req) => {
  const requestId = crypto.randomUUID().substring(0, 8);
  const startTime = Date.now();
  
  console.log(`🔍 [${requestId}] Vision API: Request received at ${new Date().toISOString()}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`🔍 [${requestId}] CORS preflight request handled`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request with validation
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse request body:`, parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { image, features, provider = 'google' }: VisionRequest = requestBody;
    
    console.log(`🔍 [${requestId}] Request details:`, {
      provider,
      featuresCount: features?.length || 0,
      features: features?.slice(0, 3) || [], // Log first 3 features only
      imageLength: image?.length || 0,
      hasImage: !!image
    });

    // Comprehensive input validation
    if (!image || typeof image !== 'string') {
      throw new Error('Missing or invalid image parameter (must be base64 string)');
    }
    
    if (!features || !Array.isArray(features) || features.length === 0) {
      throw new Error('Missing or invalid features parameter (must be non-empty array)');
    }

    // Validate base64 image format
    if (!image.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
      throw new Error('Invalid base64 image format');
    }

    console.log(`🔍 [${requestId}] Input validation passed`);

    if (provider === 'google') {
      const result = await handleGoogleVisionWithRetry(image, features, requestId, 3);
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ [${requestId}] Vision API completed successfully in ${processingTime}ms`);
      
      return new Response(
        JSON.stringify(result),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Vision API error after ${processingTime}ms:`, {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      type: error.constructor.name
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        requestId,
        processingTime,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleGoogleVisionWithRetry(
  base64Image: string, 
  features: string[], 
  requestId: string, 
  maxRetries: number
): Promise<any> {
  let lastError: VisionError | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔁 [${requestId}] Attempt ${attempt}/${maxRetries} for Google Vision`);
    
    try {
      const result = await handleGoogleVision(base64Image, features, requestId);
      
      if (attempt > 1) {
        console.log(`✅ [${requestId}] Succeeded on retry attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = categorizeError(error);
      
      console.warn(`⚠️ [${requestId}] Attempt ${attempt} failed:`, {
        type: lastError.type,
        message: lastError.message,
        retryable: lastError.retryable
      });
      
      // Don't retry non-retryable errors
      if (!lastError.retryable || attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`⏳ [${requestId}] Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed
  console.error(`❌ [${requestId}] All ${maxRetries} attempts failed. Last error:`, lastError);
  throw new Error(`Google Vision failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

function categorizeError(error: any): VisionError {
  const message = error.message || String(error);
  
  // Credentials errors
  if (message.includes('credentials') || message.includes('authentication') || 
      message.includes('API key') || message.includes('unauthorized')) {
    return {
      type: 'credentials',
      message: 'Google Cloud credentials issue',
      details: message,
      retryable: false
    };
  }
  
  // Image access errors
  if (message.includes('image') && (message.includes('fetch') || message.includes('access') || 
      message.includes('download') || message.includes('base64'))) {
    return {
      type: 'image_access',
      message: 'Failed to access or process image',
      details: message,
      retryable: true
    };
  }
  
  // API errors
  if (message.includes('API') || message.includes('quota') || message.includes('limit')) {
    return {
      type: 'api_error',
      message: 'Google Vision API error',
      details: message,
      retryable: message.includes('quota') || message.includes('rate')
    };
  }
  
  // Timeout errors
  if (message.includes('timeout') || message.includes('abort')) {
    return {
      type: 'timeout',
      message: 'Request timeout',
      details: message,
      retryable: true
    };
  }
  
  // Default to unknown but retryable
  return {
    type: 'unknown',
    message: message,
    retryable: true
  };
}

async function handleGoogleVision(
  base64Image: string, 
  features: string[], 
  requestId: string
): Promise<any> {
  console.log(`🔍 [${requestId}] Starting Google Vision processing`);
  
  // Step 1: Validate and parse credentials
  const googleCredentials = Deno.env.get('GOOGLE_CLOUD_CREDENTIALS');
  
  if (!googleCredentials) {
    console.error(`❌ [${requestId}] Google Cloud credentials not found in environment`);
    throw new Error('Google Cloud credentials not configured');
  }

  console.log(`🔍 [${requestId}] Credentials found, length: ${googleCredentials.length}`);

  let credentials;
  try {
    credentials = JSON.parse(googleCredentials);
    console.log(`🔍 [${requestId}] Credentials parsed successfully`);
    
    // Validate required fields
    const requiredFields = ['client_email', 'private_key', 'project_id'];
    const missingFields = requiredFields.filter(field => !credentials[field]);
    
    if (missingFields.length > 0) {
      console.error(`❌ [${requestId}] Missing credential fields:`, missingFields);
      throw new Error(`Missing required credential fields: ${missingFields.join(', ')}`);
    }
    
    console.log(`🔍 [${requestId}] Credential validation passed for project: ${credentials.project_id}`);
    
  } catch (parseError) {
    console.error(`❌ [${requestId}] Failed to parse Google Cloud credentials:`, parseError);
    throw new Error(`Invalid Google Cloud credentials format: ${parseError.message}`);
  }

  try {
    // Step 2: Validate image data
    console.log(`🔍 [${requestId}] Validating image data (length: ${base64Image.length})`);
    
    if (base64Image.length < 100) {
      throw new Error('Image data too small - possibly corrupted');
    }
    
    if (base64Image.length > 20 * 1024 * 1024) { // 20MB limit
      throw new Error('Image data too large - exceeds 20MB limit');
    }
    
    // Step 3: Get access token with timeout
    console.log(`🔍 [${requestId}] Obtaining access token...`);
    const tokenStartTime = Date.now();
    
    const accessToken = await Promise.race([
      getAccessTokenWithLogging(credentials, requestId),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Access token request timeout')), 30000)
      )
    ]) as string;
    
    const tokenTime = Date.now() - tokenStartTime;
    console.log(`✅ [${requestId}] Access token obtained in ${tokenTime}ms`);

    // Step 4: Prepare vision features
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
          console.warn(`⚠️ [${requestId}] Unknown feature type: ${feature}, using as-is`);
          return { type: feature };
      }
    });

    console.log(`🔍 [${requestId}] Mapped ${features.length} features:`, 
      visionFeatures.map(f => f.type));

    // Step 5: Prepare request body
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

    console.log(`🔍 [${requestId}] Prepared request body with ${requestBody.requests.length} image(s)`);

    // Step 6: Make Vision API call with timeout
    const apiUrl = 'https://vision.googleapis.com/v1/images:annotate';
    const apiStartTime = Date.now();
    
    console.log(`🚀 [${requestId}] Making Google Vision API request to ${apiUrl}`);
    
    const response = await Promise.race([
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Vision API request timeout')), 60000)
      )
    ]) as Response;

    const apiTime = Date.now() - apiStartTime;
    console.log(`📡 [${requestId}] Google Vision API responded in ${apiTime}ms with status: ${response.status}`);

    // Step 7: Handle response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [${requestId}] Google Vision API error (${response.status}):`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        errorPreview: errorText.substring(0, 500)
      });
      
      throw new Error(`Google Vision API request failed: ${response.status} - ${errorText}`);
    }

    // Step 8: Parse response
    const responseText = await response.text();
    console.log(`📄 [${requestId}] Received response text (length: ${responseText.length})`);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse Vision API response:`, parseError);
      throw new Error(`Invalid JSON response from Vision API: ${parseError.message}`);
    }

    // Step 9: Validate response structure
    if (!data.responses || !Array.isArray(data.responses)) {
      console.error(`❌ [${requestId}] Invalid response structure:`, data);
      throw new Error('Invalid response structure from Google Vision API');
    }

    const firstResponse = data.responses[0];
    if (firstResponse?.error) {
      const visionError = firstResponse.error;
      console.error(`❌ [${requestId}] Google Vision API returned error:`, visionError);
      throw new Error(`Google Vision API error: ${visionError.message} (Code: ${visionError.code})`);
    }

    // Step 10: Log success metrics
    const totalTime = Date.now() - apiStartTime + apiTime;
    console.log(`✅ [${requestId}] Google Vision processing completed successfully:`, {
      totalProcessingTime: totalTime,
      tokenTime,
      apiTime,
      hasTextAnnotations: !!firstResponse?.textAnnotations,
      hasObjectAnnotations: !!firstResponse?.localizedObjectAnnotations,
      hasImageProperties: !!firstResponse?.imagePropertiesAnnotation,
      hasLabelAnnotations: !!firstResponse?.labelAnnotations,
      responseSize: responseText.length
    });

    return firstResponse || {};

  } catch (error) {
    console.error(`❌ [${requestId}] Google Vision processing failed:`, {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      type: error.constructor.name
    });
    throw error;
  }
}

async function getAccessTokenWithLogging(credentials: any, requestId: string): Promise<string> {
  try {
    console.log(`🔑 [${requestId}] Creating JWT for service account: ${credentials.client_email}`);
    
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

    console.log(`🔑 [${requestId}] JWT payload created with expiry: ${new Date((now + 3600) * 1000).toISOString()}`);

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
    if (!privateKeyPem || !privateKeyPem.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format in credentials');
    }
    
    console.log(`🔑 [${requestId}] Processing private key (length: ${privateKeyPem.length})`);
    
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

    console.log(`🔑 [${requestId}] JWT created and signed successfully`);

    // Exchange JWT for access token
    console.log(`🔑 [${requestId}] Exchanging JWT for access token...`);
    
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
      console.error(`❌ [${requestId}] Token exchange failed:`, {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText.substring(0, 500)
      });
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log(`✅ [${requestId}] Access token received successfully`);
    
    if (!tokenData.access_token) {
      console.error(`❌ [${requestId}] No access token in response:`, tokenData);
      throw new Error('No access token received from Google OAuth');
    }
    
    return tokenData.access_token;

  } catch (error) {
    console.error(`❌ [${requestId}] Access token generation failed:`, {
      message: error.message,
      stack: error.stack?.substring(0, 300),
      type: error.constructor.name
    });
    throw new Error(`Access token generation failed: ${error.message}`);
  }
}
