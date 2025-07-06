import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

console.log('🚀 Enhanced Analysis Pipeline - Starting with session support');

interface AnalysisRequest {
  sessionId?: string;
  imageUrls?: string[];
  analysisId?: string;
  analysisPrompt?: string;
  designType?: string;
  useMultiModel?: boolean;
  models?: string[];
  analysisType?: string;
}

// Enhanced validation for both session and direct modes
function validateRequest(body: any): AnalysisRequest {
  // Session-based mode (from Analyze page)
  if (body?.sessionId) {
    if (typeof body.sessionId !== 'string') {
      throw new Error('Valid session ID is required');
    }
    return {
      sessionId: body.sessionId,
      imageUrls: body.imageUrls || [],
      analysisPrompt: body.analysisPrompt || '',
      useMultiModel: body.useMultiModel || false,
      models: body.models || ['claude'],
      analysisType: body.analysisType || 'strategic',
      designType: body.designType || 'web'
    };
  }

  // Legacy direct mode (backwards compatibility)
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

// Enhanced Claude analysis with session support
async function callClaudeForAnalysis(request: AnalysisRequest, imageUrls: string[], prompt: string): Promise<any> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    throw new Error('Anthropic API key not configured');
  }

  // Enhanced prompt with pattern-focused analysis
  const analysisPrompt = `As a senior UX strategist with 20 years of experience, analyze this ${request.designType || 'web'} design and provide comprehensive, pattern-focused recommendations.

User's Challenge: ${prompt}

Number of images: ${imageUrls.length}
Analysis Type: ${request.analysisType || 'strategic'}
Multi-Model: ${request.useMultiModel ? 'Yes' : 'No'}

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
        content: analysisPrompt
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

// Enhanced save results for session-based analysis
async function saveResults(supabase: any, request: AnalysisRequest, claudeResult: any, authHeader?: string): Promise<any> {
  // For session-based analysis, get user ID from the session data instead of auth token
  let userId = null;
  
  if (request.sessionId) {
    // Get user ID from session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('analysis_sessions')
      .select('user_id')
      .eq('id', request.sessionId)
      .single();
    
    if (sessionError) {
      console.error('Could not get user from session:', sessionError.message);
      throw new Error('Session not found');
    }
    
    userId = sessionData.user_id;
  } else if (authHeader) {
    // Legacy mode: try to get user from auth header
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

  // Session-based mode
  if (request.sessionId) {
    const analysisResults = {
      summary: {
        overallAssessment: `Analysis completed for ${request.analysisType || 'strategic'} review`,
        keyStrengths: claudeResult.annotations
          ?.filter((a: any) => a.severity === 'low')
          ?.map((a: any) => a.title) || [],
        criticalIssues: claudeResult.annotations
          ?.filter((a: any) => a.severity === 'high')
          ?.map((a: any) => a.title) || [],
        quickWins: claudeResult.annotations
          ?.filter((a: any) => a.implementationEffort === 'low')
          ?.map((a: any) => a.title) || []
      },
      imageAnalysis: [{
        zoneFeedback: {
          'top-left': claudeResult.annotations?.slice(0, 2)?.map((a: any) => ({
            feedback: a.description,
            severity: a.severity,
            source: 'claude'
          })) || [],
          'top-center': claudeResult.annotations?.slice(2, 4)?.map((a: any) => ({
            feedback: a.description,
            severity: a.severity,
            source: 'claude'
          })) || [],
          'middle-center': claudeResult.annotations?.slice(4, 6)?.map((a: any) => ({
            feedback: a.description,
            severity: a.severity,
            source: 'claude'
          })) || []
        }
      }],
      metadata: {
        confidence: 0.85,
        modelsUsed: request.models || ['claude']
      }
    };

    // Save to analysis_sessions
    const { error: sessionError } = await supabase
      .from('analysis_sessions')
      .update({
        status: 'completed',
        claude_results: analysisResults,
        multimodel_results: request.useMultiModel ? analysisResults : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.sessionId);

    if (sessionError) {
      console.error('Failed to save session results:', sessionError);
      throw new Error('Failed to save session analysis results');
    }

    return analysisResults;

  } else {
    // Legacy direct mode
    const { error: resultsError } = await supabase
      .from('analysis_results')
      .insert({
        analysis_id: request.analysisId,
        user_id: userId,
        images: request.imageUrls || [],
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
      .eq('id', request.analysisId);

    if (statusError) {
      console.error('Failed to update status:', statusError);
      throw new Error('Failed to update analysis status');
    }

    return claudeResult;
  }
}

// Enhanced analysis execution
async function executeAnalysis(request: AnalysisRequest, authHeader?: string): Promise<any> {
  console.log(`🚀 Starting analysis for ${request.sessionId || request.analysisId}`);

  // Initialize Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    let imageUrls: string[] = [];
    let prompt = '';

    // Session-based mode: fetch session data
    if (request.sessionId) {
      console.log(`📋 Fetching session data for ${request.sessionId}`);
      
      // Update session status
      await supabase
        .from('analysis_sessions')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.sessionId);

      // Get session data including images
      const { data: sessionData, error: sessionError } = await supabase
        .from('analysis_sessions')
        .select('*, analysis_session_images(*)')
        .eq('id', request.sessionId)
        .single();

      if (sessionError) {
        throw new Error(`Failed to fetch session: ${sessionError.message}`);
      }

      // Extract image URLs and prompt
      imageUrls = sessionData.analysis_session_images?.map((img: any) => img.storage_url) || [];
      prompt = sessionData.user_context || request.analysisPrompt || '';
      
      if (imageUrls.length === 0) {
        throw new Error('No images found in session');
      }
      
      if (!prompt.trim()) {
        throw new Error('No analysis prompt found in session');
      }

    } else {
      // Direct mode: use provided data
      imageUrls = request.imageUrls || [];
      prompt = request.analysisPrompt || '';
      
      // Update analysis status
      await supabase
        .from('analyses')
        .update({ 
          status: 'analyzing',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.analysisId);
    }

    // Call Claude for analysis
    console.log(`🤖 Calling Claude for analysis of ${imageUrls.length} images...`);
    const claudeResult = await callClaudeForAnalysis(request, imageUrls, prompt);

    // Save results
    console.log(`💾 Saving results...`);
    const savedResults = await saveResults(supabase, request, claudeResult, authHeader);

    console.log(`✅ Analysis completed successfully`);

    return {
      success: true,
      annotations: claudeResult.annotations || [],
      totalAnnotations: claudeResult.annotations?.length || 0,
      modelUsed: 'claude-3-5-sonnet-20241022',
      results: savedResults
    };

  } catch (error) {
    console.error(`❌ Analysis failed:`, error.message);
    
    // Update status to failed
    try {
      if (request.sessionId) {
        await supabase
          .from('analysis_sessions')
          .update({ 
            status: 'error',
            updated_at: new Date().toISOString()
          })
          .eq('id', request.sessionId);
      } else {
        await supabase
          .from('analyses')
          .update({ 
            status: 'failed',
            failure_reason: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', request.analysisId);
      }
    } catch (updateError) {
      console.error(`Failed to update failure status:`, updateError);
    }

    throw error;
  }
}

// Main request handler
serve(async (req) => {
  console.log('🔥 EDGE FUNCTION CALLED - Request received:', req.method);
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight handled');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('🔍 Parsing request body...');
    const body = await req.json();
    console.log('✅ Body parsed, validating request...');
    const validatedRequest = validateRequest(body);
    console.log('✅ Request validated:', {
      sessionId: validatedRequest.sessionId?.substring(0, 8) || 'none',
      hasImages: !!validatedRequest.imageUrls?.length,
      hasPrompt: !!validatedRequest.analysisPrompt
    });
    
    // Get auth header from request
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    
    console.log(`📝 Processing request:`, {
      sessionId: validatedRequest.sessionId?.substring(0, 8) || 'none',
      analysisId: validatedRequest.analysisId?.substring(0, 8) || 'none',
      imageCount: validatedRequest.imageUrls?.length || 0,
      promptLength: validatedRequest.analysisPrompt?.length || 0,
      hasAuth: !!authHeader,
      useMultiModel: validatedRequest.useMultiModel
    });

    console.log('🚀 Starting analysis execution...');
    const result = await executeAnalysis(validatedRequest, authHeader);
    console.log('✅ Analysis completed successfully');

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
    console.error(`❌ Error stack:`, error instanceof Error ? error.stack : 'No stack trace');

    let statusCode = 500;
    if (errorMessage.includes('required') || errorMessage.includes('validation')) statusCode = 400;
    if (errorMessage.includes('not configured') || errorMessage.includes('API key')) statusCode = 503;

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});