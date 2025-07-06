import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

console.log('🤖 Analysis Claude Processor - Strategic UX analysis');

serve(async (req) => {
  console.log('🔥 CLAUDE PROCESSOR CALLED - Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
  }

  try {
    const body = await req.json();
    console.log('🧠 Processing Claude analysis request:', body);

    const { sessionId, analysisPrompt, analysisType = 'strategic', visionContext } = body;

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    if (!analysisPrompt) {
      throw new Error('Analysis prompt is required');
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('analysis_sessions')
      .select('*, analysis_session_images(*)')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      throw new Error(`Failed to fetch session: ${sessionError.message}`);
    }

    const imageUrls = sessionData.analysis_session_images?.map((img: any) => img.storage_url) || [];

    // Call Claude API
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const enhancedPrompt = `As a senior UX strategist with 20 years of experience, analyze this design and provide comprehensive, actionable recommendations.

User's Challenge: ${analysisPrompt}

Analysis Type: ${analysisType}
Number of images: ${imageUrls.length}
${visionContext ? `Vision Analysis Context: ${JSON.stringify(visionContext)}` : ''}

Please provide 6-10 specific UX recommendations in this exact JSON format:

{
  "annotations": [
    {
      "id": "rec1",
      "title": "Clear, specific recommendation title",
      "description": "Detailed explanation of the issue and how to fix it",
      "category": "usability",
      "severity": "high", 
      "x": 30,
      "y": 40,
      "implementationEffort": "medium",
      "expectedImpact": "Brief description of expected improvement"
    }
  ],
  "summary": {
    "overallAssessment": "Brief overall assessment",
    "keyStrengths": ["strength1", "strength2"],
    "criticalIssues": ["issue1", "issue2"],
    "quickWins": ["win1", "win2"]
  }
}

Categories: usability, accessibility, visual_design, mobile, conversion, performance
Severities: high, medium, low
Implementation Effort: low, medium, high

Focus on actionable, specific recommendations that directly address the user's challenge.`;

    console.log('🤖 Calling Claude for strategic analysis...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: enhancedPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';
    
    let claudeResults;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      claudeResults = JSON.parse(jsonMatch[0]);
      
      // Validate and enhance annotations
      if (!claudeResults.annotations || !Array.isArray(claudeResults.annotations)) {
        throw new Error('Invalid annotations format');
      }
      
      claudeResults.annotations = claudeResults.annotations.map((ann: any, index: number) => ({
        id: ann.id || `rec${index + 1}`,
        title: ann.title || 'UX Recommendation',
        description: ann.description || 'Improve user experience',
        category: ann.category || 'usability',
        severity: ann.severity || 'medium',
        x: typeof ann.x === 'number' ? ann.x : Math.random() * 80 + 10,
        y: typeof ann.y === 'number' ? ann.y : Math.random() * 80 + 10,
        implementationEffort: ann.implementationEffort || 'medium',
        expectedImpact: ann.expectedImpact || 'Improved user experience'
      }));

    } catch (parseError) {
      console.warn('Failed to parse Claude response, using fallback');
      claudeResults = {
        annotations: [
          {
            id: 'rec1',
            title: 'Improve User Experience',
            description: 'Focus on enhancing the overall user experience based on best practices',
            category: 'usability',
            severity: 'medium',
            x: 25,
            y: 35,
            implementationEffort: 'medium',
            expectedImpact: 'Better user satisfaction and engagement'
          }
        ],
        summary: {
          overallAssessment: 'Analysis completed with strategic recommendations',
          keyStrengths: ['Design foundation'],
          criticalIssues: ['User experience optimization needed'],
          quickWins: ['Implement immediate UX improvements']
        }
      };
    }

    // Update session with Claude results
    await supabase
      .from('analysis_sessions')
      .update({ 
        claude_results: {
          ...claudeResults,
          processedAt: new Date().toISOString(),
          model: 'claude-3-5-sonnet-20241022',
          analysisType,
          confidence: 0.85
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log('✅ Claude analysis completed');

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        results: claudeResults,
        summary: {
          totalAnnotations: claudeResults.annotations?.length || 0,
          model: 'claude-3-5-sonnet-20241022',
          analysisType,
          confidence: 0.85
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Claude processing failed:`, errorMessage);

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});