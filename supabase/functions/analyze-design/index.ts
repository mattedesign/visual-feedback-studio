import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

console.log('🚀 Simplified Analysis Pipeline - Starting');

interface SimpleRequest {
  imageUrls: string[];
  analysisId: string;
  analysisPrompt: string;
  designType?: string;
}

// Simple validation
function validateRequest(body: any): SimpleRequest {
  if (!body?.imageUrls || !Array.isArray(body.imageUrls) || body.imageUrls.length === 0) {
    throw new Error('At least one image URL is required');
  }

  if (!body?.analysisId || typeof body.analysisId !== 'string') {
    throw new Error('Valid analysis ID is required');
  }

  if (!body?.analysisPrompt || typeof body.analysisPrompt !== 'string' || body.analysisPrompt.trim().length < 10) {
    throw new Error('Analysis prompt must be at least 10 characters');
  }

  return {
    imageUrls: body.imageUrls,
    analysisId: body.analysisId,
    analysisPrompt: body.analysisPrompt.trim(),
    designType: body.designType || 'web'
  };
}

// Simple Claude analysis
async function callClaudeForAnalysis(request: SimpleRequest): Promise<any> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    throw new Error('Anthropic API key not configured');
  }

  // Simple prompt focused on basic UX analysis
  const prompt = `As a UX expert, analyze this ${request.designType} design and provide specific, actionable recommendations.

User's Challenge: ${request.analysisPrompt}

Number of images: ${request.imageUrls.length}

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
  ]
}

Categories: usability, accessibility, visual_design, mobile, conversion, performance
Severities: high, medium, low
Implementation Effort: low, medium, high

Focus on actionable, specific recommendations that directly address the user's challenge.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anthropicApiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '';
  
  try {
    // Extract JSON from Claude's response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    // Validate annotations
    if (!result.annotations || !Array.isArray(result.annotations)) {
      throw new Error('Invalid annotations format');
    }
    
    // Ensure each annotation has required fields
    result.annotations = result.annotations.map((ann: any, index: number) => ({
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

    return result;
    
  } catch (parseError) {
    console.warn('Failed to parse Claude response, using fallback');
    return {
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
      ]
    };
  }
}

// Save results to database
async function saveResults(supabase: any, analysisId: string, claudeResult: any, request: SimpleRequest): Promise<void> {
  // Get current user
  const authHeader = Deno.env.get('AUTHORIZATION');
  let userId = null;
  
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    } catch (error) {
      console.warn('Could not get user from token:', error.message);
    }
  }

  if (!userId) {
    throw new Error('User authentication required');
  }

  // Save analysis results
  const { error: resultsError } = await supabase
    .from('analysis_results')
    .insert({
      analysis_id: analysisId,
      user_id: userId,
      images: request.imageUrls,
      annotations: claudeResult.annotations || [],
      analysis_context: request.analysisPrompt,
      ai_model_used: 'claude-3-5-sonnet-20241022',
      total_annotations: claudeResult.annotations?.length || 0,
      validation_status: 'completed'
    });

  if (resultsError) {
    console.error('Failed to save results:', resultsError);
    throw new Error('Failed to save analysis results');
  }

  // Update analysis status
  const { error: statusError } = await supabase
    .from('analyses')
    .update({ 
      status: 'completed',
      analysis_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', analysisId);

  if (statusError) {
    console.error('Failed to update status:', statusError);
    throw new Error('Failed to update analysis status');
  }
}

// Main analysis function
async function executeSimpleAnalysis(request: SimpleRequest): Promise<any> {
  console.log(`🚀 Starting simple analysis for ${request.analysisId}`);

  // Initialize Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Update status to analyzing
    await supabase
      .from('analyses')
      .update({ 
        status: 'analyzing',
        updated_at: new Date().toISOString()
      })
      .eq('id', request.analysisId);

    // Call Claude for analysis
    console.log(`🤖 Calling Claude for analysis...`);
    const claudeResult = await callClaudeForAnalysis(request);

    // Save results
    console.log(`💾 Saving results...`);
    await saveResults(supabase, request.analysisId, claudeResult, request);

    console.log(`✅ Analysis completed successfully`);

    return {
      success: true,
      annotations: claudeResult.annotations || [],
      totalAnnotations: claudeResult.annotations?.length || 0,
      modelUsed: 'claude-3-5-sonnet-20241022'
    };

  } catch (error) {
    console.error(`❌ Analysis failed:`, error.message);
    
    // Update status to failed
    try {
      await supabase
        .from('analyses')
        .update({ 
          status: 'failed',
          failure_reason: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', request.analysisId);
    } catch (updateError) {
      console.error(`Failed to update failure status:`, updateError);
    }

    throw error;
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const body = await req.json();
    const validatedRequest = validateRequest(body);
    
    console.log(`📝 Processing request:`, {
      analysisId: validatedRequest.analysisId.substring(0, 8),
      imageCount: validatedRequest.imageUrls.length,
      promptLength: validatedRequest.analysisPrompt.length
    });

    const result = await executeSimpleAnalysis(validatedRequest);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Request failed:`, errorMessage);

    let statusCode = 500;
    if (errorMessage.includes('required') || errorMessage.includes('validation')) statusCode = 400;
    if (errorMessage.includes('not configured') || errorMessage.includes('API key')) statusCode = 503;

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});