// Enhanced Edge Function Orchestration - Phase 1, Step 1.4
// Improved error handling, metadata injection, and reliability

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

console.log('🚀 Enhanced Analysis Pipeline v2 - Starting with advanced orchestration');

interface EnhancedAnalysisRequest {
  sessionId?: string;
  imageUrls?: string[];
  analysisId?: string;
  analysisPrompt?: string;
  designType?: string;
  useMultiModel?: boolean;
  models?: string[];
  analysisType?: string;
  enhancedMetadata?: {
    confidenceThreshold?: number;
    patternTrackingEnabled?: boolean;
    businessImpactEnabled?: boolean;
    screenDetectionEnabled?: boolean;
  };
}

interface ProcessingStage {
  name: string;
  startTime: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

class EnhancedOrchestrator {
  private supabase: any;
  private stages: ProcessingStage[] = [];
  private startTime: number;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.startTime = Date.now();
  }

  async executeAnalysisPipeline(request: EnhancedAnalysisRequest, authHeader?: string): Promise<any> {
    try {
      console.log('🎯 Starting enhanced analysis pipeline');
      
      // Stage 1: Request Validation & Preparation
      await this.executeStage('validation', async () => {
        return this.validateAndPrepareRequest(request);
      });

      // Stage 2: Session & User Context Resolution
      const sessionData = await this.executeStage('session_resolution', async () => {
        return this.resolveSessionContext(request, authHeader);
      });

      // Stage 3: Metadata Injection & Enhancement
      const enhancedRequest = await this.executeStage('metadata_injection', async () => {
        return this.injectEnhancedMetadata(request, sessionData);
      });

      // Stage 4: Vision Analysis (if enabled)
      const visionData = await this.executeStage('vision_analysis', async () => {
        return this.executeVisionAnalysis(enhancedRequest);
      });

      // Stage 5: AI Analysis with Enhanced Context
      const analysisResult = await this.executeStage('ai_analysis', async () => {
        return this.executeAIAnalysis(enhancedRequest, visionData);
      });

      // Stage 6: Result Enhancement & Storage
      const finalResult = await this.executeStage('result_processing', async () => {
        return this.processAndStoreResults(analysisResult, enhancedRequest, sessionData);
      });

      console.log('✅ Enhanced analysis pipeline completed successfully');
      return finalResult;

    } catch (error) {
      console.error('❌ Enhanced pipeline failed:', error);
      await this.handlePipelineFailure(error, request);
      throw error;
    }
  }

  private async executeStage(stageName: string, stageFunction: () => Promise<any>): Promise<any> {
    const stage: ProcessingStage = {
      name: stageName,
      startTime: Date.now(),
      status: 'processing'
    };
    
    this.stages.push(stage);
    console.log(`🔄 Executing stage: ${stageName}`);

    try {
      const result = await stageFunction();
      stage.status = 'completed';
      stage.result = result;
      
      const duration = Date.now() - stage.startTime;
      console.log(`✅ Stage ${stageName} completed in ${duration}ms`);
      
      return result;
    } catch (error) {
      stage.status = 'failed';
      stage.error = error.message;
      
      console.error(`❌ Stage ${stageName} failed:`, error);
      throw error;
    }
  }

  private async validateAndPrepareRequest(request: EnhancedAnalysisRequest): Promise<EnhancedAnalysisRequest> {
    // Enhanced validation with better error messages
    if (request.sessionId) {
      if (typeof request.sessionId !== 'string') {
        throw new Error('Enhanced validation failed: Valid session ID is required');
      }
    } else {
      if (!request.imageUrls || !Array.isArray(request.imageUrls) || request.imageUrls.length === 0) {
        throw new Error('Enhanced validation failed: At least one image URL is required');
      }
      if (!request.analysisId) {
        throw new Error('Enhanced validation failed: Valid analysis ID is required');
      }
    }

    // Set enhanced defaults
    return {
      ...request,
      enhancedMetadata: {
        confidenceThreshold: 0.7,
        patternTrackingEnabled: true,
        businessImpactEnabled: true,
        screenDetectionEnabled: true,
        ...request.enhancedMetadata
      }
    };
  }

  private async resolveSessionContext(request: EnhancedAnalysisRequest, authHeader?: string): Promise<any> {
    if (!request.sessionId) {
      // For direct mode, get user from auth header
      const userResult = authHeader ? await this.getUserFromAuth(authHeader) : null;
      return { userId: userResult?.id, mode: 'direct' };
    }

    // Session mode - get session data
    const { data: session, error } = await this.supabase
      .from('analysis_sessions')
      .select('*')
      .eq('id', request.sessionId)
      .single();

    if (error) {
      throw new Error(`Session resolution failed: ${error.message}`);
    }

    return { ...session, mode: 'session' };
  }

  private async injectEnhancedMetadata(request: EnhancedAnalysisRequest, sessionData: any): Promise<EnhancedAnalysisRequest> {
    // This is where we'd use the injectMetadata helper from Step 1.1
    // For now, return enhanced request with metadata placeholders
    return {
      ...request,
      enhancedMetadata: {
        ...request.enhancedMetadata,
        screenType: 'auto-detect',
        analysisContext: {
          sessionId: sessionData.id,
          userId: sessionData.userId,
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  private async executeVisionAnalysis(request: EnhancedAnalysisRequest): Promise<any> {
    if (!request.enhancedMetadata?.screenDetectionEnabled) {
      console.log('📷 Vision analysis disabled, skipping');
      return null;
    }

    console.log('📷 Executing enhanced vision analysis');
    
    // Enhanced vision analysis would go here
    // For now, return placeholder data
    return {
      labels: ['interface', 'web', 'application'],
      screenType: 'dashboard',
      confidence: 0.85,
      enrichmentData: {
        textDensity: 'medium',
        layoutType: 'multi-column',
        primaryColors: ['#2563eb', '#ffffff', '#f8fafc']
      }
    };
  }

  private async executeAIAnalysis(request: EnhancedAnalysisRequest, visionData: any): Promise<any> {
    console.log('🤖 Executing enhanced AI analysis');
    
    const enhancedPrompt = this.buildEnhancedPrompt(request, visionData);
    
    // Call Claude with enhanced context
    const claudeResponse = await this.callClaudeWithEnhancedContext(enhancedPrompt, request);
    
    return {
      ...claudeResponse,
      enhancedMetadata: {
        visionData,
        confidenceScores: this.calculateConfidenceScores(claudeResponse),
        patternViolations: this.detectPatternViolations(claudeResponse)
      }
    };
  }

  private buildEnhancedPrompt(request: EnhancedAnalysisRequest, visionData: any): string {
    let prompt = request.analysisPrompt || 'Analyze this design for UX improvements';
    
    if (visionData?.screenType) {
      prompt += `\n\nScreen Type Detected: ${visionData.screenType}`;
    }
    
    if (request.enhancedMetadata?.patternTrackingEnabled) {
      prompt += '\n\nPlease analyze for design pattern violations and include confidence scores for each recommendation.';
    }
    
    return prompt;
  }

  private async callClaudeWithEnhancedContext(prompt: string, request: EnhancedAnalysisRequest): Promise<any> {
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Enhanced Claude call with better error handling
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseClaudeResponse(data);

    } catch (error) {
      console.error('❌ Claude API call failed:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  private parseClaudeResponse(data: any): any {
    if (!data.content || !data.content[0]?.text) {
      throw new Error('Invalid Claude response format');
    }

    const responseText = data.content[0].text;
    
    // Try to parse JSON response
    try {
      return JSON.parse(responseText);
    } catch {
      // If not JSON, return structured format
      return {
        annotations: [],
        summary: responseText,
        confidence: 0.5
      };
    }
  }

  private calculateConfidenceScores(analysisResult: any): Record<string, number> {
    // Enhanced confidence calculation
    const scores: Record<string, number> = {};
    
    if (analysisResult.annotations) {
      analysisResult.annotations.forEach((annotation: any, index: number) => {
        scores[`annotation_${index}`] = annotation.confidence || 0.7;
      });
    }
    
    return scores;
  }

  private detectPatternViolations(analysisResult: any): string[] {
    // Pattern violation detection logic
    const violations: string[] = [];
    
    // This would use the DESIGN_PATTERNS from Step 1.2
    // For now, return placeholder
    return violations;
  }

  private async processAndStoreResults(analysisResult: any, request: EnhancedAnalysisRequest, sessionData: any): Promise<any> {
    console.log('💾 Processing and storing enhanced results');

    const enhancedResult = {
      ...analysisResult,
      processingStages: this.stages,
      totalProcessingTime: Date.now() - this.startTime,
      enhancedMetadata: {
        ...request.enhancedMetadata,
        stageTimings: this.stages.map(stage => ({
          name: stage.name,
          duration: stage.status === 'completed' ? (Date.now() - stage.startTime) : null,
          status: stage.status
        }))
      }
    };

    // Store results with enhanced metadata
    if (sessionData.mode === 'session') {
      await this.storeSessionResults(enhancedResult, request, sessionData);
    } else {
      await this.storeDirectResults(enhancedResult, request, sessionData);
    }

    return enhancedResult;
  }

  private async storeSessionResults(result: any, request: EnhancedAnalysisRequest, sessionData: any): Promise<void> {
    const { error } = await this.supabase
      .from('analysis_results')
      .insert({
        user_id: sessionData.userId,
        analysis_id: sessionData.id,
        annotations: result.annotations || [],
        enhanced_context: result.enhancedMetadata,
        confidence_metadata: result.enhancedMetadata?.confidenceScores || {},
        pattern_violations: result.enhancedMetadata?.patternViolations || [],
        screen_type_detected: result.enhancedMetadata?.visionData?.screenType,
        processing_time_ms: result.totalProcessingTime
      });

    if (error) {
      throw new Error(`Failed to store session results: ${error.message}`);
    }
  }

  private async storeDirectResults(result: any, request: EnhancedAnalysisRequest, sessionData: any): Promise<void> {
    const { error } = await this.supabase
      .from('analysis_results')
      .insert({
        user_id: sessionData.userId,
        analysis_id: request.analysisId,
        annotations: result.annotations || [],
        enhanced_context: result.enhancedMetadata,
        confidence_metadata: result.enhancedMetadata?.confidenceScores || {},
        pattern_violations: result.enhancedMetadata?.patternViolations || [],
        screen_type_detected: result.enhancedMetadata?.visionData?.screenType,
        processing_time_ms: result.totalProcessingTime
      });

    if (error) {
      throw new Error(`Failed to store direct results: ${error.message}`);
    }
  }

  private async handlePipelineFailure(error: any, request: EnhancedAnalysisRequest): Promise<void> {
    console.error('🚨 Pipeline failure - logging for analysis');
    
    // Log failure details for monitoring
    const failureLog = {
      error: error.message,
      stages: this.stages,
      request: { ...request, enhancedMetadata: undefined }, // Don't log sensitive data
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime
    };
    
    console.log('💾 Failure log:', JSON.stringify(failureLog, null, 2));
  }

  private async getUserFromAuth(authHeader: string): Promise<any> {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await this.supabase.auth.getUser(token);
    
    if (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    return user;
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const orchestrator = new EnhancedOrchestrator(supabaseUrl, supabaseKey);
    const result = await orchestrator.executeAnalysisPipeline(body, authHeader);
    
    return new Response(JSON.stringify({
      success: true,
      ...result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Request processing failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});