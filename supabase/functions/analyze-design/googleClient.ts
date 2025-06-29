
import { AnnotationData } from './types.ts';

export async function analyzeWithGoogle(
  base64Image: string,
  mimeType: string,
  prompt: string,
  googleCredentials: string,
  model?: string
): Promise<AnnotationData[]> {
  console.log('=== Google Vision Analysis Started ===');
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
      throw new Error('Invalid response from Google Vision API');
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

    console.log(`✅ Google Vision analysis completed successfully with ${annotations.length} annotations`);
    return annotations;

  } catch (error) {
    console.error('❌ Google Vision analysis failed:', error);
    throw new Error(`Google Vision analysis failed: ${error.message}`);
  }
}

async function getAccessToken(credentials: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/generative-language',
    aud: 'https://www.googleapis.com/auth/generative-language',
    exp: now + 3600,
    iat: now
  };

  // Create JWT header
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  // Create signature (simplified - in production, use proper JWT library)
  const data = `${encodedHeader}.${encodedPayload}`;
  
  // For now, return a placeholder - you'll need to implement proper JWT signing
  // In a real implementation, you'd use the private key from credentials.private_key
  throw new Error('JWT signing not implemented. Please use Google Cloud Vision API directly or implement proper JWT signing.');
}
