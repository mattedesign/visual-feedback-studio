import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🤖 Goblin Claude Analyzer - Real Claude API integration');

// Chunked base64 conversion to avoid stack overflow on large images
async function convertToBase64Chunked(arrayBuffer: ArrayBuffer): Promise<string> {
  const uint8Array = new Uint8Array(arrayBuffer);
  const chunkSize = 1024 * 8; // 8KB chunks to avoid stack overflow
  let binaryString = '';
  
  // Convert to binary string in chunks
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  // Convert the complete binary string to base64
  return btoa(binaryString);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, imageUrls, prompt, persona, systemPrompt, visionResults } = await req.json();

    console.log('🧠 Processing Claude analysis:', {
      sessionId: sessionId?.substring(0, 8),
      persona,
      imageCount: imageUrls?.length,
      promptLength: prompt?.length,
      hasVisionResults: !!visionResults
    });

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Fetch and convert images to base64 with chunked processing
    const imageContent = [];
    if (imageUrls && Array.isArray(imageUrls)) {
      console.log('🖼️ Processing images for Claude vision...');
      
      for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        try {
          console.log(`📥 Fetching image ${i + 1}: ${imageUrl}`);
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
          }
          
          // Early validation: Check image size
          const contentLength = imageResponse.headers.get('content-length');
          if (contentLength) {
            const sizeInMB = parseInt(contentLength) / (1024 * 1024);
            if (sizeInMB > 20) {
              console.warn(`⚠️ Image ${i + 1} is very large (${sizeInMB.toFixed(2)}MB), skipping`);
              continue;
            }
          }
          
          const arrayBuffer = await imageResponse.arrayBuffer();
          
          // Validate actual size after download
          const actualSizeInMB = arrayBuffer.byteLength / (1024 * 1024);
          if (actualSizeInMB > 20) {
            console.warn(`⚠️ Image ${i + 1} actual size too large (${actualSizeInMB.toFixed(2)}MB), skipping`);
            continue;
          }
          
          // Chunked base64 conversion to avoid stack overflow
          const base64 = await convertToBase64Chunked(arrayBuffer);
          
          // Determine media type from response or URL
          const contentType = imageResponse.headers.get('content-type') || 'image/png';
          
          imageContent.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: contentType,
              data: base64
            }
          });
          
          console.log(`✅ Image ${i + 1} converted to base64 (${Math.round(base64.length / 1024)}KB)`);
          
          // Clear memory after each image
          if (typeof globalThis.gc === 'function') {
            globalThis.gc();
          }
          
        } catch (error) {
          console.error(`❌ Failed to process image ${i + 1}:`, error);
          // Continue with other images - don't let one bad image kill the whole analysis
        }
      }
    }

    // Build enhanced prompt with vision context
    const enhancedPrompt = buildPersonaPrompt(persona, prompt, imageUrls?.length || 0, visionResults);

    // Build message content array with text and images
    const messageContent = [
      {
        type: 'text',
        text: enhancedPrompt
      },
      ...imageContent
    ];

    console.log('🚀 Calling Claude Sonnet 4 for multimodal analysis...', {
      textLength: enhancedPrompt.length,
      imageCount: imageContent.length
    });

    let response;
    let fallbackUsed = false;

    try {
      // First attempt: Full multimodal analysis
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          temperature: persona === 'clarity' ? 0.3 : 0.7,
          messages: [{
            role: 'user',
            content: messageContent
          }]
        })
      });
    } catch (error) {
      console.warn('⚠️ Multimodal Claude call failed, trying text-only fallback:', error);
      
      // Fallback: Text-only analysis with vision summary
      const fallbackPrompt = `${enhancedPrompt}\n\nNote: Visual analysis was attempted but failed. Please provide text-based UX analysis based on the goal and context provided.`;
      
      try {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicApiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            temperature: persona === 'clarity' ? 0.3 : 0.7,
            messages: [{
              role: 'user',
              content: fallbackPrompt
            }]
          })
        });
        fallbackUsed = true;
        console.log('✅ Text-only fallback succeeded');
      } catch (fallbackError) {
        throw new Error(`Both multimodal and text-only Claude calls failed: ${fallbackError.message}`);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';
    
    console.log('✅ Claude analysis completed, processing response...');

    // Parse and structure the response
    let analysisData;
    try {
      // Try to extract JSON from Claude's response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: structure the raw text response
        analysisData = {
          analysis: content,
          recommendations: extractRecommendations(content),
          severity: assessSeverity(content, persona),
          goblinAttitude: persona === 'clarity' ? extractGoblinAttitude(content) : null
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse structured response, using raw text');
      analysisData = {
        analysis: content,
        recommendations: [],
        severity: 'medium',
        goblinAttitude: persona === 'clarity' ? 'grumpy' : null
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        persona,
        modelUsed: 'claude-sonnet-4-20250514',
        fallbackUsed,
        analysisData,
        rawResponse: content,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Claude analysis failed:', error);

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

function buildPersonaPrompt(persona: string, userGoal: string, imageCount: number, visionResults?: any[]): string {
  const baseContext = `
User's Goal: ${userGoal}
Number of screens analyzed: ${imageCount}
Analysis Mode: ${imageCount > 1 ? 'User Journey' : 'Single Screen'}

${visionResults && visionResults.length > 0 ? `
Google Vision Analysis Context:
${visionResults.map((result, i) => `
Image ${i + 1}: Detected as "${result.screenType || 'interface'}" with confidence ${result.confidence || 0}
${result.textDetection ? `Text found: ${result.textDetection.slice(0, 200)}...` : 'No text detected'}
`).join('')}
` : ''}

IMPORTANT: You can now SEE the actual screenshots. Analyze what you visually observe in the images provided, not just the text description.
`;

  switch (persona) {
    case 'clarity':
      return `You are Clarity, a brutally honest UX goblin who's been trapped in design systems for centuries. You're sassy, direct, but ultimately helpful. You see what users ACTUALLY experience vs what designers THINK they're creating.

${baseContext}

Look at the actual screenshots provided and tell me what you REALLY see. Don't sugarcoat it. Point out specific visual elements, layout issues, confusing UI patterns, and usability problems you can directly observe.

Respond in character as Clarity the goblin. Be direct and sassy, but provide genuinely useful feedback. Structure your response as JSON:

{
  "analysis": "Your brutally honest visual analysis in goblin voice - describe exactly what you see",
  "recommendations": ["Specific visual fixes you can see are needed"],
  "gripeLevel": "low|medium|rage-cranked",
  "goblinWisdom": "One piece of hard-earned UX truth based on what you observed",
  "visualObservations": ["Specific things you can see in the screenshots that need fixing"]
}

Remember: You can actually SEE the screens now. Base your feedback on the visual reality, not assumptions.`;

    case 'strategic':
      return `You are a senior UX strategist with 20 years of experience. Provide strategic, research-backed analysis focusing on business impact and user outcomes.

${baseContext}

Examine the screenshots provided and analyze the strategic implications of what you observe. Look at the visual hierarchy, user flow, conversion elements, and overall user experience patterns.

Provide comprehensive strategic analysis in JSON format:

{
  "analysis": "Strategic assessment based on visual observation of the screens",
  "recommendations": ["Strategic improvements with business rationale based on what you see"],
  "priorities": ["High-impact visual changes to focus on first"],
  "metrics": ["Key metrics to track improvement"],
  "visualStrategy": ["Strategic observations about the visual design and layout"]
}`;

    case 'mirror':
      return `You are a reflective UX coach helping designers gain self-awareness about their work. Ask probing questions and guide discovery.

${baseContext}

Look at the screenshots and help the designer reflect on what they've created. Point out visual patterns, design decisions, and their potential impact on users.

Respond as a thoughtful coach in JSON format:

{
  "analysis": "Reflective questions and observations based on visual analysis",
  "recommendations": ["Self-reflection prompts based on what you observe"],
  "insights": ["Key realizations about the visual design to explore"],
  "nextSteps": ["Ways to improve based on visual observations"],
  "reflectiveQuestions": ["Questions about specific visual elements you can see"]
}`;

    case 'mad':
      return `You are the Mad UX Scientist - you love wild experiments and unconventional approaches. Think outside the box!

${baseContext}

Examine these screenshots with your mad scientist eyes! What crazy experiments could improve these interfaces? What unconventional approaches do you see potential for?

Respond with experimental enthusiasm in JSON format:

{
  "analysis": "Experimental analysis of what you visually observe",
  "recommendations": ["Unconventional solutions based on visual analysis"],
  "experiments": ["Specific A/B tests or wild approaches based on what you see"],
  "wildCard": "One completely unexpected visual suggestion",
  "madObservations": ["Crazy insights from looking at the actual screens"]
}`;

    case 'executive':
    default:
      return `You are an executive-focused UX advisor. Focus on ROI, business metrics, and bottom-line impact.

${baseContext}

Analyze these screenshots from a business perspective. What visual elements support or hinder business goals? What changes would drive better conversion and user engagement?

Provide business-focused analysis in JSON format:

{
  "analysis": "Business impact assessment of visual elements you observe",
  "recommendations": ["Changes with clear ROI based on visual analysis"],
  "metrics": ["KPIs to measure success of visual improvements"],
  "timeline": ["Implementation phases for visual improvements"],
  "businessVisualImpact": ["How specific visual elements affect business outcomes"]
}`;
  }
}

function extractRecommendations(content: string): string[] {
  const lines = content.split('\n');
  const recommendations = lines
    .filter(line => line.trim().match(/^[-•*]\s+/) || line.toLowerCase().includes('recommend'))
    .map(line => line.trim().replace(/^[-•*]\s+/, ''))
    .filter(rec => rec.length > 10);
  
  return recommendations.length > 0 ? recommendations : ['Focus on improving user experience based on the analysis above'];
}

function assessSeverity(content: string, persona: string): string {
  const lowerContent = content.toLowerCase();
  
  if (persona === 'clarity') {
    if (lowerContent.includes('rage') || lowerContent.includes('terrible') || lowerContent.includes('disaster')) {
      return 'rage-cranked';
    }
    if (lowerContent.includes('annoying') || lowerContent.includes('frustrating') || lowerContent.includes('confusing')) {
      return 'medium';
    }
    return 'low';
  }
  
  if (lowerContent.includes('critical') || lowerContent.includes('urgent') || lowerContent.includes('severe')) {
    return 'high';
  }
  if (lowerContent.includes('important') || lowerContent.includes('significant')) {
    return 'medium';
  }
  return 'low';
}

function extractGoblinAttitude(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('rage') || lowerContent.includes('furious') || lowerContent.includes('livid')) {
    return 'enraged';
  }
  if (lowerContent.includes('annoyed') || lowerContent.includes('frustrated') || lowerContent.includes('grumpy')) {
    return 'grumpy';
  }
  if (lowerContent.includes('pleased') || lowerContent.includes('impressed') || lowerContent.includes('good job')) {
    return 'pleased';
  }
  
  return 'sarcastic'; // Default goblin mood
}