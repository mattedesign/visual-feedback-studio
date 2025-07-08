import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    const { sessionId, imageUrls, prompt, persona, systemPrompt, visionResults, chatMode, conversationHistory, originalAnalysis } = await req.json();

    console.log('🧠 Processing Claude analysis:', {
      sessionId: sessionId?.substring(0, 8),
      persona,
      chatMode: !!chatMode,
      imageCount: imageUrls?.length,
      promptLength: prompt?.length,
      hasVisionResults: !!visionResults,
      hasConversationHistory: !!conversationHistory
    });

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Initialize Supabase client for conversation persistence
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get authorization header to identify user
    const authHeader = req.headers.get('authorization');
    const startTime = Date.now();

    // Skip image processing for chat mode
    const imageContent = [];
    if (!chatMode && imageUrls && Array.isArray(imageUrls)) {
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

    // Build enhanced prompt with vision context or chat context
    const enhancedPrompt = chatMode 
      ? buildChatPrompt(persona, prompt, conversationHistory, originalAnalysis)
      : buildPersonaPrompt(persona, prompt, imageUrls?.length || 0, visionResults);

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
    const processingTime = Date.now() - startTime;

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

    // Handle conversation persistence for chat mode AND initial message storage
    if (sessionId && authHeader) {
      try {
        console.log('💾 Persisting conversation to database with persona:', persona);
        
        // Set up Supabase auth for the request
        await supabase.auth.setSession({
          access_token: authHeader.replace('Bearer ', ''),
          refresh_token: ''
        });

        // Get current user to store user_id
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if this is the first time we're storing conversation history for this session
          const { data: existingMessages, error: checkError } = await supabase
            .from('goblin_refinement_history')
            .select('id')
            .eq('session_id', sessionId)
            .limit(1);

          const isFirstConversation = !existingMessages || existingMessages.length === 0;

          if (isFirstConversation && !chatMode) {
            // This is the initial analysis - store it as the first message
            console.log('🎯 Storing initial analysis as first conversation message');
            
            await supabase
              .from('goblin_refinement_history')
              .insert({
                session_id: sessionId,
                user_id: user.id,
                message_order: 1,
                role: 'clarity',
                content: content,
                conversation_stage: 'initial',
                model_used: 'claude-sonnet-4-20250514',
                processing_time_ms: processingTime,
                metadata: {
                  original_analysis_data: analysisData,
                  used_persona: persona,
                  is_initial_analysis: true
                }
              });
            
            console.log('✅ Initial analysis stored as conversation seed');
          } else if (chatMode) {
            // This is a chat interaction - continue conversation
            console.log('💬 Storing chat interaction');
            
            // Get the next message order number for this session
            const { data: lastMessage } = await supabase
              .from('goblin_refinement_history')
              .select('message_order')
              .eq('session_id', sessionId)
              .order('message_order', { ascending: false })
              .limit(1)
              .single();

            const nextOrder = (lastMessage?.message_order || 0) + 1;

            // Store user message first
            const userInsertResult = await supabase
              .from('goblin_refinement_history')
              .insert({
                session_id: sessionId,
                user_id: user.id,
                message_order: nextOrder,
                role: 'user',
                content: prompt,
                conversation_stage: determineConversationStage(nextOrder),
                model_used: 'claude-sonnet-4-20250514',
                processing_time_ms: 0
              });

            if (userInsertResult.error) {
              console.error('Failed to insert user message:', userInsertResult.error);
            } else {
              console.log('✅ User message stored successfully for persona:', persona);
            }

            // Analyze response for intelligence scoring
            const intelligenceScoring = await analyzeResponseIntelligence(content, prompt, persona, supabase);

            // Store AI response with intelligence metadata
            const aiInsertResult = await supabase
              .from('goblin_refinement_history')
              .insert({
                session_id: sessionId,
                user_id: user.id,
                message_order: nextOrder + 1,
                role: 'clarity',
                content: content,
                conversation_stage: determineConversationStage(nextOrder + 1),
                refinement_score: intelligenceScoring.refinement_score,
                parsed_problems: intelligenceScoring.parsed_problems,
                suggested_fixes: intelligenceScoring.suggested_fixes,
                reasoning: intelligenceScoring.reasoning,
                model_used: 'claude-sonnet-4-20250514',
                processing_time_ms: processingTime,
                metadata: {
                  original_analysis_data: analysisData,
                  scoring_metadata: intelligenceScoring.metadata,
                  used_persona: persona
                }
              });

            if (aiInsertResult.error) {
              console.error('Failed to insert AI message:', aiInsertResult.error);
            } else {
              console.log('✅ AI response stored successfully for persona:', persona);
            }

            console.log('✅ Chat conversation turn persisted successfully');
          }
        }
      } catch (persistError) {
        console.error('⚠️ Failed to persist conversation:', persistError);
        // Continue without blocking the response
      }
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

function buildChatPrompt(persona: string, userMessage: string, conversationHistory?: string, originalAnalysis?: any): string {
  const context = originalAnalysis ? `
Original Analysis Context:
- Analysis: ${originalAnalysis.analysis || 'N/A'}
- Biggest Gripe: ${originalAnalysis.biggestGripe || 'N/A'}
- Goblin Wisdom: ${originalAnalysis.goblinWisdom || 'N/A'}
` : '';

  const history = conversationHistory ? `
Previous Conversation:
${conversationHistory}

` : '';

  switch (persona) {
    case 'clarity':
      return `You are Clarity, a brutally honest UX goblin who's been trapped in design systems for centuries. You're sassy, direct, but ultimately helpful.

${context}
${history}

The user just asked: "${userMessage}"

Respond in character as Clarity the goblin. Be direct, sassy, but provide genuinely useful feedback. Keep it conversational and reference the original analysis if relevant. Don't repeat yourself - build on the conversation.

Stay in character and be helpful while maintaining your goblin personality.`;

    case 'mirror':
      return `You are Mirror, a reflective UX coach helping designers gain self-awareness about their work. You ask probing questions and guide discovery through thoughtful inquiry.

${context}
${history}

The user just asked: "${userMessage}"

Respond as a thoughtful, reflective coach. Ask insightful questions that help the user discover deeper truths about their design. Reference the original analysis to build on insights. Keep it conversational and supportive while challenging assumptions.`;

    case 'strategic':
      return `You are a senior UX strategist with 20 years of experience. Provide strategic, research-backed analysis focusing on business impact and user outcomes.

${context}
${history}

The user just asked: "${userMessage}"

Respond as an experienced strategist. Focus on business impact, ROI, and strategic decision-making. Reference the original analysis to provide deeper strategic insights. Keep it professional yet conversational.`;

    case 'mad':
      return `You are the Mad UX Scientist - you love wild experiments and unconventional approaches. Think outside the box and suggest creative solutions!

${context}
${history}

The user just asked: "${userMessage}"

Respond with experimental enthusiasm! Suggest creative, unconventional approaches to UX problems. Reference the original analysis to build on experimental ideas. Keep it energetic and innovative.`;

    case 'executive':
      return `You are an executive-focused UX advisor. Focus on ROI, business metrics, and bottom-line impact. You speak the language of leadership and strategic decision-making.

${context}
${history}

The user just asked: "${userMessage}"

Respond as an executive advisor. Focus on business outcomes, KPIs, and strategic value. Reference the original analysis to provide executive-level insights. Keep it strategic and results-oriented.`;

    default:
      return `You are a ${persona} UX advisor continuing a conversation.

${context}
${history}

The user just asked: "${userMessage}"

Respond helpfully in character, building on the previous conversation context.`;
  }
}

// Helper function to determine conversation stage based on message order
function determineConversationStage(messageOrder: number): string {
  if (messageOrder <= 2) return 'initial';
  if (messageOrder <= 6) return 'clarification';  
  if (messageOrder <= 12) return 'refinement';
  return 'resolution';
}

// Advanced intelligence scoring function
async function analyzeResponseIntelligence(content: string, userPrompt: string, persona: string, supabase: any) {
  const scoringStartTime = Date.now();
  
  try {
    console.log('🧠 Analyzing response intelligence for scoring...');
    
    // Parse problems mentioned in the user prompt
    const parsedProblems = extractProblemsFromPrompt(userPrompt);
    
    // Extract suggested fixes from the AI response
    const suggestedFixes = extractFixesFromResponse(content);
    
    // Calculate refinement score based on content analysis
    const refinementScore = calculateRefinementScore(content, userPrompt, persona);
    
    // Generate reasoning for the score
    const reasoning = generateReasoning(content, userPrompt, refinementScore);
    
    const processingTime = Date.now() - scoringStartTime;
    
    return {
      refinement_score: refinementScore,
      parsed_problems: parsedProblems,
      suggested_fixes: suggestedFixes,
      reasoning,
      metadata: {
        scoring_method: 'heuristic_analysis',
        processing_time_ms: processingTime,
        content_length: content.length,
        problem_count: parsedProblems.length,
        fix_count: suggestedFixes.length
      }
    };
  } catch (error) {
    console.error('⚠️ Intelligence scoring failed:', error);
    return {
      refinement_score: 0.5, // Neutral score on error
      parsed_problems: [],
      suggested_fixes: [],
      reasoning: 'Scoring analysis failed, using default values',
      metadata: { error: error.message }
    };
  }
}

// Extract UX problems from user prompts
function extractProblemsFromPrompt(prompt: string): any[] {
  const problems = [];
  const lowerPrompt = prompt.toLowerCase();
  
  // Common UX problem indicators
  const problemPatterns = [
    { pattern: /confus(ed|ing)/g, type: 'confusion', severity: 'medium' },
    { pattern: /frustrat(ed|ing)/g, type: 'frustration', severity: 'high' },
    { pattern: /difficult|hard to/g, type: 'usability', severity: 'medium' },
    { pattern: /can't find|cannot find/g, type: 'findability', severity: 'high' },
    { pattern: /slow|loading/g, type: 'performance', severity: 'medium' },
    { pattern: /error|broken/g, type: 'functionality', severity: 'high' },
    { pattern: /unclear|ambiguous/g, type: 'clarity', severity: 'medium' }
  ];
  
  problemPatterns.forEach(({ pattern, type, severity }) => {
    const matches = prompt.match(pattern);
    if (matches) {
      problems.push({
        type,
        severity,
        description: matches[0],
        context: extractContextAroundMatch(prompt, matches[0])
      });
    }
  });
  
  return problems;
}

// Extract actionable fixes from AI responses
function extractFixesFromResponse(content: string): any[] {
  const fixes = [];
  const lines = content.split('\n');
  
  // Look for recommendation patterns
  const recommendationPatterns = [
    /^[-•*]\s+(.+)/,  // Bullet points
    /recommend\w*:\s*(.+)/i,  // "Recommend:" statements
    /should\s+(.+)/i,  // "Should" statements
    /consider\s+(.+)/i,  // "Consider" statements
    /try\s+(.+)/i  // "Try" statements
  ];
  
  lines.forEach((line, index) => {
    recommendationPatterns.forEach(pattern => {
      const match = line.match(pattern);
      if (match && match[1] && match[1].length > 10) {
        fixes.push({
          type: 'recommendation',
          description: match[1].trim(),
          confidence: calculateFixConfidence(match[1]),
          line_number: index + 1
        });
      }
    });
  });
  
  return fixes.slice(0, 10); // Limit to top 10 fixes
}

// Calculate refinement score based on content quality
function calculateRefinementScore(content: string, userPrompt: string, persona: string): number {
  let score = 0.5; // Base score
  
  // Content length factor (longer, more detailed responses score higher)
  const lengthFactor = Math.min(content.length / 1000, 1) * 0.2;
  score += lengthFactor;
  
  // Specificity factor (specific terms and examples boost score)
  const specificityTerms = ['specifically', 'for example', 'such as', 'in particular', 'consider', 'recommend'];
  const specificityCount = specificityTerms.filter(term => 
    content.toLowerCase().includes(term)
  ).length;
  const specificityFactor = Math.min(specificityCount / 5, 1) * 0.2;
  score += specificityFactor;
  
  // Actionability factor (actionable language boosts score)
  const actionableTerms = ['should', 'could', 'try', 'implement', 'change', 'improve', 'fix'];
  const actionableCount = actionableTerms.filter(term =>
    content.toLowerCase().includes(term)
  ).length;
  const actionableFactor = Math.min(actionableCount / 3, 1) * 0.2;
  score += actionableFactor;
  
  // Persona-specific adjustments
  if (persona === 'clarity') {
    // Clarity gets bonus for sassiness and directness
    const clarityTerms = ['honestly', 'truth', 'reality', 'actually', 'really'];
    const clarityCount = clarityTerms.filter(term =>
      content.toLowerCase().includes(term)
    ).length;
    score += Math.min(clarityCount / 3, 1) * 0.1;
  }
  
  // Cap score between 0 and 1
  return Math.max(0, Math.min(1, score));
}

// Generate reasoning for the intelligence score
function generateReasoning(content: string, userPrompt: string, score: number): string {
  const factors = [];
  
  if (score > 0.8) {
    factors.push('Response demonstrates high specificity and actionable guidance');
  } else if (score > 0.6) {
    factors.push('Response provides solid recommendations with good detail');
  } else if (score > 0.4) {
    factors.push('Response addresses the query with moderate depth');
  } else {
    factors.push('Response provides basic feedback but could be more detailed');
  }
  
  if (content.length > 800) {
    factors.push('Comprehensive response length');
  }
  
  const recommendationCount = (content.match(/recommend|should|consider|try/gi) || []).length;
  if (recommendationCount > 3) {
    factors.push('Multiple actionable recommendations provided');
  }
  
  return factors.join('; ');
}

// Helper function to extract context around matched text
function extractContextAroundMatch(text: string, match: string): string {
  const matchIndex = text.toLowerCase().indexOf(match.toLowerCase());
  if (matchIndex === -1) return match;
  
  const start = Math.max(0, matchIndex - 30);
  const end = Math.min(text.length, matchIndex + match.length + 30);
  
  return text.substring(start, end).trim();
}

// Calculate confidence score for extracted fixes
function calculateFixConfidence(fixText: string): number {
  let confidence = 0.5;
  
  // Specific action words boost confidence
  const actionWords = ['implement', 'change', 'modify', 'adjust', 'redesign'];
  if (actionWords.some(word => fixText.toLowerCase().includes(word))) {
    confidence += 0.3;
  }
  
  // Specific measurements or examples boost confidence
  if (fixText.match(/\d+/)) {
    confidence += 0.2;
  }
  
  return Math.min(1, confidence);
}