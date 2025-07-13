import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🧝‍♂️ Goblin Unified Prompt System - Enhanced prompt generation v1.1 with robust validation');

// Unified prompt templates for different personas and contexts
const PROMPT_TEMPLATES = {
  strategic: {
    base: `You are the Strategic Goblin, a cunning UX strategist who sees the big picture with ruthless clarity. Analyze this interface with a focus on business impact, user journey optimization, and competitive positioning.

Focus Areas:
- Business goals alignment and KPI impact
- User journey friction points and conversion barriers  
- Competitive advantages and market positioning
- Revenue optimization opportunities
- Strategic feature prioritization`,
    
    imageContext: `Analyzing {imageCount} interface screens with strategic focus.`,
    
    goalSpecific: `Primary Goal: {goal}
Strategic Lens: How does every element serve this goal? What's missing? What's working against it?`,
    
    confidenceAdjustment: {
      1: "Provide conservative, low-risk recommendations.",
      2: "Balance innovation with proven patterns.",
      3: "Push boundaries with bold strategic moves."
    }
  },

  clarity: {
    base: `You are the Clarity Goblin, obsessed with crystal-clear communication and intuitive user experiences. Your mission is to eliminate confusion, reduce cognitive load, and make interfaces so obvious that users never have to think.

Focus Areas:
- Information hierarchy and visual clarity
- Cognitive load reduction and mental models
- User comprehension and task completion ease
- Error prevention and recovery patterns
- Accessibility and inclusive design principles`,
    
    imageContext: `Examining {imageCount} screens for clarity violations and communication breakdowns.`,
    
    goalSpecific: `Clarity Objective: {goal}
Critical Question: Can users achieve this goal without confusion, hesitation, or mistakes?`,
    
    confidenceAdjustment: {
      1: "Focus on obvious clarity issues first.",
      2: "Address both surface and deeper clarity problems.", 
      3: "Redesign for maximum clarity and user comprehension."
    }
  },

  conversion: {
    base: `You are the Conversion Goblin, laser-focused on driving user actions and maximizing business outcomes. Every pixel should serve the conversion funnel, every interaction should move users closer to the desired action.

Focus Areas:
- Conversion funnel optimization and drop-off analysis
- Call-to-action effectiveness and placement
- Trust signals and credibility indicators
- Urgency and scarcity psychological triggers
- A/B test recommendations and hypothesis generation`,
    
    imageContext: `Analyzing {imageCount} screens for conversion optimization opportunities.`,
    
    goalSpecific: `Conversion Target: {goal}
Ruthless Focus: What's preventing users from completing this action? What would double the conversion rate?`,
    
    confidenceAdjustment: {
      1: "Implement proven conversion tactics safely.",
      2: "Test innovative approaches with calculated risks.",
      3: "Radical conversion optimization experiments."
    }
  },

  mirror: {
    base: `You are the Mirror of Intent, a reflective coach focused on revealing the gap between design intentions and user perceptions. Your role is to help designers see their work through fresh, unbiased eyes and question their assumptions.

Focus Areas:
- Intent vs perception analysis and assumption gaps
- Cognitive bias detection in design decisions
- User mental model alignment and expectation gaps
- Accessibility and inclusive design blind spots
- Honest self-reflection prompts and awareness building`,
    
    imageContext: `Reflecting on {imageCount} interface screens through the lens of user perception vs designer intent.`,
    
    goalSpecific: `Reflection Goal: {goal}
Critical Questions: What assumptions might you be making? How might users perceive this differently than you intend?`,
    
    confidenceAdjustment: {
      1: "Gentle reflection on obvious assumption gaps.",
      2: "Deeper questioning of design decisions and user perspectives.",
      3: "Challenge fundamental assumptions and reveal hidden biases."
    }
  },

  mad: {
    base: `You are the Mad UX Scientist, a brilliant but unconventional researcher who approaches design problems with experimental thinking and wild creativity. Your mission is to break patterns, test assumptions, and discover UX solutions others wouldn't dare try.

Focus Areas:
- Unconventional interaction patterns and experimental approaches
- A/B testing hypotheses and behavioral experiments
- Pattern-breaking design solutions that surprise users
- Creative problem-solving through design thinking methods
- Innovative features that differentiate from competitors`,
    
    imageContext: `Experimenting with {imageCount} interface screens through mad science lens.`,
    
    goalSpecific: `Experimental Hypothesis: {goal}
Mad Science Question: What if we completely flipped conventional wisdom? What wild experiments could test new approaches?`,
    
    confidenceAdjustment: {
      1: "Safe experiments with proven unconventional methods.",
      2: "Bold experiments that challenge design norms creatively.",
      3: "Revolutionary experiments that redefine user interaction patterns."
    }
  },

  exec: {
    base: `You are the Executive UX Advisor, a C-suite focused analyst who translates design decisions into business impact. Your mission is to provide executive-level insights that connect UX improvements to measurable business outcomes and ROI.

Focus Areas:
- Business impact metrics and ROI of UX improvements
- Strategic priorities and resource allocation recommendations
- Stakeholder communication and executive reporting
- Competitive market positioning through design
- Risk assessment and implementation timelines`,
    
    imageContext: `Evaluating {imageCount} interface screens from executive business perspective.`,
    
    goalSpecific: `Business Objective: {goal}
Executive Lens: What's the business case? How does this impact our bottom line and competitive position?`,
    
    confidenceAdjustment: {
      1: "Conservative recommendations with proven ROI.",
      2: "Strategic investments with calculated business risk.",
      3: "Bold strategic moves that transform market position."
    }
  }
};

// Template validation function - ENHANCED
function validateTemplate(persona: string): boolean {
  const template = PROMPT_TEMPLATES[persona];
  if (!template) return false;
  
  const requiredFields = ['base', 'imageContext', 'goalSpecific', 'confidenceAdjustment'];
  const hasAllFields = requiredFields.every(field => template[field]);
  const hasValidConfidence = template.confidenceAdjustment && 
    template.confidenceAdjustment[1] && 
    template.confidenceAdjustment[2] && 
    template.confidenceAdjustment[3];
  
  return hasAllFields && hasValidConfidence;
}

// Add enhanced persona validation
function validateAllPersonas(): { isValid: boolean; missingPersonas: string[] } {
  const requiredPersonas = ['strategic', 'clarity', 'mirror', 'mad', 'exec'];
  const missingPersonas = requiredPersonas.filter(persona => !PROMPT_TEMPLATES[persona]);
  
  return {
    isValid: missingPersonas.length === 0,
    missingPersonas
  };
}

// Parameter logging and validation
function logAndValidateParams(params: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  console.log('🔍 Parameter validation for:', {
    persona: params.persona,
    goal: params.goal?.substring(0, 50) + '...',
    imageCount: params.imageCount,
    mode: params.mode,
    confidence: params.confidence,
    chatMode: params.chatMode,
    hasVisionResults: Array.isArray(params.visionResults),
    visionResultsCount: params.visionResults?.length || 0
  });
  
  // Validate persona
  if (!params.persona || typeof params.persona !== 'string') {
    errors.push('Missing or invalid persona parameter');
  } else if (!PROMPT_TEMPLATES[params.persona.toLowerCase()]) {
    errors.push(`Invalid persona "${params.persona}". Available: ${Object.keys(PROMPT_TEMPLATES).join(', ')}`);
  } else if (!validateTemplate(params.persona.toLowerCase())) {
    errors.push(`Template validation failed for persona "${params.persona}"`);
  }
  
  // Validate image count
  if (params.imageCount !== undefined && (isNaN(params.imageCount) || params.imageCount < 0)) {
    errors.push('Invalid imageCount - must be a non-negative number');
  }
  
  // Validate confidence level
  if (params.confidence !== undefined && (isNaN(params.confidence) || params.confidence < 1 || params.confidence > 3)) {
    errors.push('Invalid confidence level - must be 1, 2, or 3');
  }
  
  // Validate mode
  const validModes = ['single', 'comprehensive', 'quick'];
  if (params.mode && !validModes.includes(params.mode.toLowerCase())) {
    errors.push(`Invalid mode "${params.mode}". Valid modes: ${validModes.join(', ')}`);
  }
  
  // Validate vision results structure
  if (params.visionResults && !Array.isArray(params.visionResults)) {
    errors.push('visionResults must be an array');
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ Parameter validation errors:', errors);
  } else {
    console.log('✅ All parameters valid');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Enhanced prompt building with context awareness and robust error handling
function buildUnifiedPrompt(
  persona: string, 
  goal: string, 
  imageCount: number, 
  mode: string, 
  confidence: number,
  visionResults: any[],
  chatMode: boolean = false
): string {
  const template = PROMPT_TEMPLATES[persona] || PROMPT_TEMPLATES.strategic;
  
  let prompt = template.base;
  
  // Add image context
  prompt += "\n\n" + template.imageContext.replace('{imageCount}', imageCount.toString());
  
  // Add enhanced vision analysis context with interface classification
  if (visionResults && visionResults.length > 0) {
    const screenTypes = visionResults.map(v => v.screenType || 'interface').join(', ');
    const avgConfidence = visionResults.reduce((sum, v) => sum + (v.confidence || 0), 0) / visionResults.length;
    const interfaceCategories = visionResults.map(v => v.interfaceCategory || 'general').join(', ');
    
    prompt += `\n\nDetected Screen Types: ${screenTypes}`;
    prompt += `\nInterface Categories: ${interfaceCategories}`;
    prompt += `\nVision Confidence: ${Math.round(avgConfidence * 100)}%`;
    
    // Add detailed screen context with interface understanding
    const screenContext = visionResults.map((v, i) => {
      let context = `Screen ${i + 1}: ${v.screenType} (${v.confidence ? Math.round(v.confidence * 100) : 0}% confidence)`;
      
      if (v.interfaceCategory) {
        context += `\n  Interface Category: ${v.interfaceCategory}`;
      }
      
      if (v.context) {
        context += `\n  Primary Purpose: ${v.context.primaryPurpose}`;
        if (v.context.keyElements && v.context.keyElements.length > 0) {
          context += `\n  Key Elements: ${v.context.keyElements.join(', ')}`;
        }
        if (v.context.userActions && v.context.userActions.length > 0) {
          context += `\n  User Actions: ${v.context.userActions.join(', ')}`;
        }
        if (v.context.businessValue && v.context.businessValue.length > 0) {
          context += `\n  Business Value: ${v.context.businessValue.join(', ')}`;
        }
      }
      
      if (v.detectedText) {
        const textPreview = v.detectedText.substring(0, 100);
        context += `\n  Detected Text: "${textPreview}${v.detectedText.length > 100 ? '...' : ''}"`;
      }
      
      return context;
    }).join('\n\n');
    
    prompt += `\n\nDetailed Screen Analysis:\n${screenContext}`;
    
    // Add persona-specific interface guidance
    if (persona === 'exec' || persona === 'mad') {
      prompt += `\n\nIMPORTANT: Focus your analysis ONLY on the actual interface elements, data, and functionality visible in these specific screens. Do not make assumptions about features, workflows, or capabilities not shown in the images.`;
    }
  }
  
  // Add goal-specific guidance
  if (goal && goal.trim()) {
    prompt += "\n\n" + template.goalSpecific
      .replace('{goal}', goal)
      .replace('{persona}', persona);
  }
  
  // Add confidence level adjustment
  const confidenceGuidance = template.confidenceAdjustment[confidence] || template.confidenceAdjustment[2];
  prompt += `\n\nConfidence Level ${confidence}: ${confidenceGuidance}`;
  
  // Add mode-specific instructions
  if (mode === 'comprehensive') {
    prompt += `\n\nMode: Comprehensive Analysis
Provide detailed analysis across all focus areas with specific recommendations, examples, and implementation guidance.`;
  } else if (mode === 'quick') {
    prompt += `\n\nMode: Quick Scan
Focus on the top 3 most critical issues with actionable next steps.`;
  }
  
  // Chat mode adjustments
  if (chatMode) {
    prompt += `\n\nChat Mode: Conversational Analysis
Respond in a conversational tone, ready to dive deeper into specific aspects based on follow-up questions. Keep responses focused and actionable.`;
  } else {
    prompt += `\n\nAnalysis Mode: Comprehensive Report
Provide a structured analysis with clear sections, actionable recommendations, and prioritized next steps.`;
  }
  
  // Add output format requirements
  prompt += `\n\nOutput Requirements:
- Lead with your biggest concern or opportunity
- Provide specific, actionable recommendations
- Include concrete examples where helpful
- Prioritize by impact and implementation difficulty
- Maintain your goblin personality while being professional
- Focus on user value and business outcomes`;
  
  return prompt;
}

// Enhanced context extraction
function extractPromptContext(requestBody: any): any {
  const {
    persona = 'strategic',
    goal = '',
    imageCount = 0,
    mode = 'single',
    confidence = 2,
    visionResults = [],
    chatMode = false,
    previousContext = null
  } = requestBody;
  
  return {
    persona: persona.toLowerCase(),
    goal: goal.trim(),
    imageCount: Math.max(0, parseInt(imageCount) || 0),
    mode: mode.toLowerCase(),
    confidence: Math.max(1, Math.min(3, parseInt(confidence) || 2)),
    visionResults: Array.isArray(visionResults) ? visionResults : [],
    chatMode: Boolean(chatMode),
    previousContext
  };
}

// Chat context building for follow-up conversations
function buildChatPrompt(basePrompt: string, conversationHistory: any[]): string {
  if (!conversationHistory || conversationHistory.length === 0) {
    return basePrompt;
  }
  
  let chatPrompt = basePrompt;
  chatPrompt += "\n\n=== Conversation Context ===\n";
  
  // Add last few exchanges for context
  const recentHistory = conversationHistory.slice(-3);
  for (const exchange of recentHistory) {
    if (exchange.role === 'user') {
      chatPrompt += `\nUser: ${exchange.content}`;
    } else if (exchange.role === 'assistant') {
      chatPrompt += `\nYour previous response: ${exchange.content.substring(0, 200)}...`;
    }
  }
  
  chatPrompt += "\n\nContinue the conversation, building on previous context while maintaining your goblin persona.";
  
  return chatPrompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const requestBody = await req.json();
    console.log('📝 Raw request received:', {
      hasPersona: !!requestBody.persona,
      personaType: requestBody.persona,
      rawBody: Object.keys(requestBody)
    });

    // Comprehensive parameter validation
    const validation = logAndValidateParams(requestBody);
    if (!validation.isValid) {
      console.error('🚨 Parameter validation failed:', validation.errors);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request parameters',
          validationErrors: validation.errors,
          availablePersonas: Object.keys(PROMPT_TEMPLATES)
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract and validate context with defensive programming
    const context = extractPromptContext(requestBody);
    
    console.log('🔧 Context extraction result:', {
      extractedPersona: context.persona,
      hasTemplate: !!PROMPT_TEMPLATES[context.persona],
      templateValid: validateTemplate(context.persona),
      processedImageCount: context.imageCount,
      processedConfidence: context.confidence,
      processedMode: context.mode
    });
    
    // Additional validation for Mirror persona specifically
    if (context.persona === 'mirror') {
      console.log('🪞 Mirror persona specific validation');
      const mirrorTemplate = PROMPT_TEMPLATES.mirror;
      
      if (!mirrorTemplate) {
        console.error('❌ Mirror template missing from PROMPT_TEMPLATES');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Mirror persona template not found',
            fallback: 'strategic'
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (!validateTemplate('mirror')) {
        console.error('❌ Mirror template validation failed');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Mirror persona template is malformed',
            fallback: 'strategic'
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log('✅ Mirror persona validation passed');
    }

    // Final template existence check with fallback
    if (!context.persona || !PROMPT_TEMPLATES[context.persona]) {
      console.warn(`⚠️ Invalid persona "${context.persona}", falling back to strategic`);
      context.persona = 'strategic';
    }

    // Build the unified prompt with error handling
    let prompt;
    try {
      prompt = buildUnifiedPrompt(
        context.persona,
        context.goal,
        context.imageCount,
        context.mode,
        context.confidence,
        context.visionResults,
        context.chatMode
      );
      
      console.log('🏗️ Prompt building successful:', {
        persona: context.persona,
        promptLength: prompt.length,
        hasGoal: !!context.goal,
        hasVisionResults: context.visionResults.length > 0
      });
    } catch (buildError) {
      console.error('❌ Prompt building failed:', buildError);
      
      // Fallback to strategic persona
      console.log('🔄 Attempting fallback to strategic persona');
      prompt = buildUnifiedPrompt(
        'strategic',
        context.goal,
        context.imageCount,
        context.mode,
        context.confidence,
        context.visionResults,
        context.chatMode
      );
      context.persona = 'strategic';
      context.fallbackUsed = true;
    }

    // Enhance with chat context if provided
    if (context.chatMode && context.previousContext?.conversationHistory) {
      try {
        prompt = buildChatPrompt(prompt, context.previousContext.conversationHistory);
        console.log('💬 Chat context added successfully');
      } catch (chatError) {
        console.warn('⚠️ Chat context enhancement failed:', chatError);
        // Continue without chat context
      }
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Unified prompt completed in ${processingTime}ms for ${context.persona} persona`);

    return new Response(
      JSON.stringify({
        success: true,
        prompt,
        context: {
          persona: context.persona,
          goal: context.goal,
          imageCount: context.imageCount,
          mode: context.mode,
          confidence: context.confidence,
          chatMode: context.chatMode,
          promptLength: prompt.length,
          processingTimeMs: processingTime,
          systemVersion: '1.0'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Unified prompt building failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        processingTimeMs: processingTime,
        fallback: true
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});