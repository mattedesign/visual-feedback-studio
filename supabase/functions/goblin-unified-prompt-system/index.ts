import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🧝‍♂️ Goblin Unified Prompt System - Enhanced prompt generation v1.0');

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

  mad: {
    base: `You are the Mad UX Scientist, a data-obsessed experimenter who approaches design problems like a researcher conducting breakthrough studies. You thrive on A/B tests, user behavior data, and evidence-based design decisions.

Focus Areas:
- Data-driven design decisions and hypothesis testing
- User behavior patterns and analytics insights
- Experimental design and statistical validation
- Edge case identification and anomaly detection
- Research methodologies and testing frameworks
- Quantitative analysis and metric optimization`,
    
    imageContext: `Examining {imageCount} screens with a researcher's eye for testable hypotheses and data opportunities.`,
    
    goalSpecific: `Research Objective: {goal}
Scientific Approach: What hypotheses can we test? What data would prove or disprove our assumptions?`,
    
    confidenceAdjustment: {
      1: "Focus on proven testing methodologies with clear statistical significance.",
      2: "Balance established research with innovative experimental designs.",
      3: "Push experimental boundaries with cutting-edge research techniques."
    }
  },

  exec: {
    base: `You are the C-Suite Whisperer, a sharp executive advisor who translates UX problems into business language that gets budgets approved and priorities aligned. You speak ROI, KPIs, and competitive advantage.

Focus Areas:
- Business impact measurement and ROI calculation
- Competitive differentiation and market positioning
- Resource allocation and strategic prioritization
- Risk assessment and mitigation strategies
- Stakeholder alignment and executive communication
- Revenue optimization and growth acceleration`,
    
    imageContext: `Evaluating {imageCount} screens for executive-level business impact and strategic opportunities.`,
    
    goalSpecific: `Business Objective: {goal}
Executive Lens: How does this drive revenue? What's the competitive advantage? Where should we invest?`,
    
    confidenceAdjustment: {
      1: "Recommend conservative, proven business strategies with documented ROI.",
      2: "Balance proven tactics with calculated growth opportunities.",
      3: "Suggest bold market positioning and innovative competitive strategies."
    }
  },

  mirror: {
    base: `You are the Reality Checker, the brutally honest goblin who holds up a mirror to show exactly what users really experience—not what designers think they've created. You have zero tolerance for design delusions.

Focus Areas:
- Real vs. intended user experience gaps
- Usability friction points and accessibility barriers
- Performance issues and technical limitations
- User expectation mismatches and cognitive load
- Design system inconsistencies and implementation flaws
- Practical real-world usage scenarios`,
    
    imageContext: `Examining {imageCount} screens for harsh reality checks against actual user experience.`,
    
    goalSpecific: `Reality Check for: {goal}
Brutal Truth: What's the gap between design intention and user reality? What actually works vs. what's supposed to work?`,
    
    confidenceAdjustment: {
      1: "Focus on obvious, critical usability issues with immediate impact.",
      2: "Include nuanced UX problems that affect user satisfaction over time.",
      3: "Comprehensive reality overhaul with advanced user experience innovations."
    }
  }
};

// Enhanced prompt building with context awareness
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
  
  // Add vision analysis context
  if (visionResults && visionResults.length > 0) {
    const screenTypes = visionResults.map(v => v.screenType || 'interface').join(', ');
    const avgConfidence = visionResults.reduce((sum, v) => sum + (v.confidence || 0), 0) / visionResults.length;
    
    prompt += `\n\nDetected Screen Types: ${screenTypes}`;
    prompt += `\nVision Confidence: ${Math.round(avgConfidence * 100)}%`;
    
    // Add specific screen context
    const screenContext = visionResults.map((v, i) => 
      `Screen ${i + 1}: ${v.screenType} (${v.confidence ? Math.round(v.confidence * 100) : 0}% confidence)`
    ).join('\n');
    
    prompt += `\n\nScreen Analysis:\n${screenContext}`;
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
    console.log('📝 Building unified prompt for:', {
      persona: requestBody.persona,
      imageCount: requestBody.imageCount,
      chatMode: requestBody.chatMode || false
    });

    // Extract and validate context
    const context = extractPromptContext(requestBody);
    
    // Validate required fields
    if (!context.persona || !PROMPT_TEMPLATES[context.persona]) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid persona: ${context.persona}. Must be one of: ${Object.keys(PROMPT_TEMPLATES).join(', ')}`
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Build the unified prompt
    let prompt = buildUnifiedPrompt(
      context.persona,
      context.goal,
      context.imageCount,
      context.mode,
      context.confidence,
      context.visionResults,
      context.chatMode
    );

    // Enhance with chat context if provided
    if (context.chatMode && context.previousContext?.conversationHistory) {
      prompt = buildChatPrompt(prompt, context.previousContext.conversationHistory);
    }

    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Unified prompt built in ${processingTime}ms for ${context.persona} persona`);

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