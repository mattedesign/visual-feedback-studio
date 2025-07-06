
import { AnnotationData } from './types.ts';

export async function analyzeWithGoogle(
  base64Image: string,
  mimeType: string,
  prompt: string,
  googleCredentials: string,
  model?: string
): Promise<AnnotationData[]> {
  console.log('=== Google Gemini Analysis Started ===');
  console.log('Model:', model || 'gemini-1.5-pro');
  console.log('Image type:', mimeType);
  console.log('Prompt length:', prompt.length);

  try {
    // Parse Google Cloud credentials
    const credentials = JSON.parse(googleCredentials);
    console.log('Google credentials parsed successfully');

    // Get access token using service account
    const accessToken = await getAccessToken(credentials);
    console.log('Google access token obtained');

    const selectedModel = model || 'gemini-1.5-pro';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent`;

    const requestBody = {
      contents: [{
        parts: [
          {
            text: `${prompt}

Please analyze this design image and provide your response in the following JSON format:
{
  "annotations": [
    {
      "id": "unique_id",
      "x": percentage_x_coordinate,
      "y": percentage_y_coordinate,
      "category": "usability|accessibility|visual_design|performance|mobile_ux|conversion",
      "severity": "high|medium|low",
      "title": "Brief title",
      "feedback": "Detailed feedback",
      "recommendation": "Specific recommendation"
    }
  ]
}

Focus on UX issues and provide specific, actionable recommendations.`
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
        responseSchema: {
          type: "object",
          properties: {
            annotations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  x: { type: "number" },
                  y: { type: "number" },
                  category: { type: "string" },
                  severity: { type: "string" },
                  title: { type: "string" },
                  feedback: { type: "string" },
                  recommendation: { type: "string" }
                },
                required: ["id", "x", "y", "category", "severity", "title", "feedback", "recommendation"]
              }
            }
          },
          required: ["annotations"]
        }
      }
    };

    console.log('Making request to Google Generative AI API...');
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
      console.error('Google API error response:', errorText);
      throw new Error(`Google API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Google API response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Invalid response structure from Google:', data);
      throw new Error('Invalid response from Google Gemini API');
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    console.log('Raw Google response:', textResponse.substring(0, 200) + '...');

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textResponse);
    } catch (parseError) {
      console.error('Failed to parse Google response as JSON:', parseError);
      // Try to extract JSON from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract valid JSON from Google response');
      }
    }

    if (!parsedResponse.annotations || !Array.isArray(parsedResponse.annotations)) {
      console.error('No annotations in parsed response:', parsedResponse);
      throw new Error('Google response does not contain annotations array');
    }

    const annotations: AnnotationData[] = parsedResponse.annotations.map((annotation: any, index: number) => ({
      id: annotation.id || `google_${index + 1}`,
      x: Math.max(0, Math.min(100, annotation.x || 50)),
      y: Math.max(0, Math.min(100, annotation.y || 50)),
      category: annotation.category || 'usability',
      severity: annotation.severity || 'medium',
      title: annotation.title || 'Design Issue',
      feedback: annotation.feedback || 'No feedback provided',
      recommendation: annotation.recommendation || 'No recommendation provided'
    }));

    console.log(`✅ Google Gemini analysis completed successfully with ${annotations.length} annotations`);
    return annotations;

  } catch (error) {
    console.error('❌ Google Gemini analysis failed:', error);
    throw new Error(`Google Gemini analysis failed: ${error.message}`);
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
      scope: 'https://www.googleapis.com/auth/generative-language',
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
    return tokenData.access_token;

  } catch (error) {
    console.error('❌ Access token generation failed:', error);
    throw new Error(`Access token generation failed: ${error.message}`);
  }
}
