import { supabase } from '@/integrations/supabase/client';

export interface PipelineStage {
  name: string;
  enabled: boolean;
  timeout_ms: number;
  retry_count: number;
}

export interface PipelineConfiguration {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
  weights: Record<string, number>;
  thresholds: Record<string, number>;
  enabled: boolean;
  version: number;
}

export interface StageResult {
  stageName: string;
  status: 'success' | 'error' | 'timeout' | 'skipped';
  data?: any;
  error?: string;
  duration_ms: number;
  metadata?: Record<string, any>;
}

export interface GoogleVisionResult {
  textAnnotations: any[];
  labelAnnotations: any[];
  faceAnnotations: any[];
  objectAnnotations: any[];
  webDetection: any;
  imageProperties: any;
  dominantColors: any[];
  visualElements: {
    buttons: any[];
    forms: any[];
    navigation: any[];
    content: any[];
  };
}

export interface EnhancedAIResult {
  annotations: any[];
  rawContent: string;
  modelUsed: string;
  confidence: number;
  contextData: any;
}

export interface PerplexityValidationResult {
  validatedAnnotations: any[];
  industryContext: any[];
  trendInsights: any[];
  competitiveContext: any[];
  validationSources: any[];
}

export interface SynthesisResult {
  finalAnnotations: any[];
  priorityScores: Record<string, number>;
  qualityMetrics: Record<string, number>;
  consolidatedInsights: any[];
  confidenceWeights: Record<string, number>;
}

export interface PipelineResult {
  success: boolean;
  stages: StageResult[];
  finalResult: {
    annotations: any[];
    metadata: any;
    qualityScores: Record<string, number>;
    processing_time_ms: number;
  };
  error?: string;
}

class MultiStageAnalysisPipeline {
  private configuration: PipelineConfiguration | null = null;

  /**
   * Load pipeline configuration from database
   */
  async loadConfiguration(configName: string = 'comprehensive_analysis'): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('pipeline_configurations')
        .select('*')
        .eq('name', configName)
        .eq('enabled', true)
        .single();

      if (error || !data) {
        console.error('Failed to load pipeline configuration:', error);
        // Use default configuration
        this.configuration = this.getDefaultConfiguration();
        return;
      }

      this.configuration = {
        ...data,
        stages: (data.stages as unknown) as PipelineStage[],
        weights: (data.weights as unknown) as Record<string, number>,
        thresholds: (data.thresholds as unknown) as Record<string, number>
      };
      console.log('✅ Pipeline configuration loaded:', configName);
    } catch (error) {
      console.error('Error loading pipeline configuration:', error);
      this.configuration = this.getDefaultConfiguration();
    }
  }

  /**
   * Execute the complete multi-stage analysis pipeline
   */
  async executeAnalysis(
    imageUrls: string[],
    analysisPrompt: string,
    analysisId: string,
    userId: string,
    options: {
      skipStages?: string[];
      forceStages?: string[];
      customWeights?: Record<string, number>;
    } = {}
  ): Promise<PipelineResult> {
    if (!this.configuration) {
      await this.loadConfiguration();
    }

    const startTime = Date.now();
    const stages: StageResult[] = [];
    let currentData: any = {
      imageUrls,
      analysisPrompt,
      analysisId,
      userId
    };

    console.log('🚀 Starting multi-stage analysis pipeline:', {
      analysisId,
      stages: this.configuration?.stages.map(s => s.name),
      imageCount: imageUrls.length
    });

    try {
      // Stage 1: Google Vision Analysis
      if (this.shouldExecuteStage('google_vision', options)) {
        const visionResult = await this.executeStageWithLogging(
          'google_vision',
          () => this.executeGoogleVisionStage(currentData),
          analysisId
        );
        stages.push(visionResult);
        if (visionResult.status === 'success') {
          currentData.googleVisionData = visionResult.data;
        }
      }

      // Stage 2: Enhanced AI Analysis
      if (this.shouldExecuteStage('enhanced_ai_analysis', options)) {
        const aiResult = await this.executeStageWithLogging(
          'enhanced_ai_analysis',
          () => this.executeEnhancedAIStage(currentData),
          analysisId
        );
        stages.push(aiResult);
        if (aiResult.status === 'success') {
          currentData.aiAnalysisData = aiResult.data;
        }
      }

      // Stage 3: Perplexity Validation
      if (this.shouldExecuteStage('perplexity_validation', options)) {
        const perplexityResult = await this.executeStageWithLogging(
          'perplexity_validation',
          () => this.executePerplexityValidationStage(currentData),
          analysisId
        );
        stages.push(perplexityResult);
        if (perplexityResult.status === 'success') {
          currentData.perplexityData = perplexityResult.data;
        }
      }

      // Stage 4: Intelligent Synthesis
      if (this.shouldExecuteStage('intelligent_synthesis', options)) {
        const synthesisResult = await this.executeStageWithLogging(
          'intelligent_synthesis',
          () => this.executeIntelligentSynthesisStage(currentData, options.customWeights),
          analysisId
        );
        stages.push(synthesisResult);
        if (synthesisResult.status === 'success') {
          currentData.finalResult = synthesisResult.data;
        }
      }

      const totalTime = Date.now() - startTime;
      
      // Calculate quality scores
      const qualityScores = this.calculateQualityScores(stages, currentData);
      
      console.log('✅ Multi-stage pipeline completed successfully:', {
        analysisId,
        totalTime,
        successfulStages: stages.filter(s => s.status === 'success').length,
        qualityScores
      });

      return {
        success: true,
        stages,
        finalResult: {
          annotations: currentData.finalResult?.finalAnnotations || currentData.aiAnalysisData?.annotations || [],
          metadata: {
            pipelineStages: stages.map(s => ({ name: s.stageName, status: s.status, duration: s.duration_ms })),
            googleVision: currentData.googleVisionData,
            perplexityValidation: currentData.perplexityData,
            synthesisMetadata: currentData.finalResult?.metadata
          },
          qualityScores,
          processing_time_ms: totalTime
        }
      };

    } catch (error) {
      console.error('❌ Multi-stage pipeline failed:', error);
      return {
        success: false,
        stages,
        finalResult: {
          annotations: [],
          metadata: { error: error.message },
          qualityScores: {},
          processing_time_ms: Date.now() - startTime
        },
        error: error.message
      };
    }
  }

  /**
   * Execute a single pipeline stage with logging
   */
  private async executeStageWithLogging(
    stageName: string,
    stageFunction: () => Promise<any>,
    analysisId: string
  ): Promise<StageResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Executing stage: ${stageName} for analysis: ${analysisId}`);
      
      // ✅ FIX: Validate UUID before database operations
      if (!this.isValidUUID(analysisId)) {
        console.error(`❌ Invalid UUID for analysis ID: ${analysisId}`);
        throw new Error(`Invalid analysis ID format: ${analysisId}`);
      }
      
      // Log stage start with error handling
      try {
        await this.logStageStart(analysisId, stageName);
      } catch (logError) {
        console.warn(`⚠️ Failed to log stage start (non-critical): ${logError.message}`);
      }
      
      const result = await stageFunction();
      const duration = Date.now() - startTime;
      
      // Log stage completion with error handling
      try {
        await this.logStageCompletion(analysisId, stageName, 'success', result, duration);
      } catch (logError) {
        console.warn(`⚠️ Failed to log stage completion (non-critical): ${logError.message}`);
      }
      
      console.log(`✅ Stage completed: ${stageName} (${duration}ms)`);
      
      return {
        stageName,
        status: 'success',
        data: result,
        duration_ms: duration
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log stage error with error handling
      try {
        await this.logStageCompletion(analysisId, stageName, 'error', null, duration, error.message);
      } catch (logError) {
        console.warn(`⚠️ Failed to log stage error (non-critical): ${logError.message}`);
      }
      
      console.error(`❌ Stage failed: ${stageName} (${duration}ms):`, error);
      
      return {
        stageName,
        status: 'error',
        error: error.message,
        duration_ms: duration
      };
    }
  }

  /**
   * ✅ NEW: Validate UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Execute Google Vision analysis stage
   */
  private async executeGoogleVisionStage(data: any): Promise<GoogleVisionResult> {
    // This would call the Google Vision edge function
    const { imageUrls } = data;
    
    // For now, return mock data - implement actual Google Vision integration
    return {
      textAnnotations: [],
      labelAnnotations: [],
      faceAnnotations: [],
      objectAnnotations: [],
      webDetection: {},
      imageProperties: {},
      dominantColors: [],
      visualElements: {
        buttons: [],
        forms: [],
        navigation: [],
        content: []
      }
    };
  }

  /**
   * Execute enhanced AI analysis stage
   */
  private async executeEnhancedAIStage(data: any): Promise<EnhancedAIResult> {
    // This would call the enhanced analyze-design function
    const { imageUrls, analysisPrompt, googleVisionData, analysisId } = data;
    
    console.log('🤖 Starting enhanced AI analysis stage with Claude 4.0:', { 
      imageCount: imageUrls.length, 
      hasVisionData: !!googleVisionData,
      analysisId 
    });
    
    // Build enhanced prompt with Google Vision context
    const enhancedPrompt = this.buildEnhancedPrompt(analysisPrompt, googleVisionData);
    
    try {
      // ✅ FIX: Call existing analyze-design function with proper error handling and logging
      const { data: result, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls,
          analysisId: analysisId, // Pass the real analysis ID
          analysisPrompt: enhancedPrompt,
          ragEnhanced: true,
          ragEnabled: true, // Ensure RAG is enabled
          designType: 'web',
          isComparative: imageUrls.length > 1
        }
      });

      if (error) {
        console.error('❌ analyze-design function error:', error);
        throw new Error(`AI analysis failed: ${error.message || 'Unknown analyze-design error'}`);
      }

      if (!result) {
        throw new Error('No result returned from analyze-design function');
      }

      if (!result.success) {
        throw new Error(`AI analysis unsuccessful: ${result.error || 'Unknown analysis error'}`);
      }

      console.log('✅ Enhanced AI analysis completed:', {
        annotationCount: result.annotations?.length || 0,
        modelUsed: result.modelUsed,
        ragEnhanced: result.ragEnhanced,
        wellDoneGenerated: !!result.wellDone
      });

      return {
        annotations: result.annotations || [],
        rawContent: result.rawContent || '',
        modelUsed: result.modelUsed || 'claude-opus-4-20250514',
        confidence: 0.85,
        contextData: {
          googleVision: googleVisionData,
          ragContext: result.ragEnhanced,
          wellDone: result.wellDone
        }
      };
      
    } catch (error) {
      console.error('❌ Enhanced AI stage failed:', error);
      throw new Error(`Enhanced AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Execute Perplexity validation stage with improved rate limiting and error handling
   */
  private async executePerplexityValidationStage(data: any): Promise<PerplexityValidationResult> {
    const { aiAnalysisData, analysisPrompt, imageUrls } = data;
    const annotations = aiAnalysisData?.annotations || [];
    
    console.log('🔍 Starting Perplexity validation stage:', {
      annotationCount: annotations.length,
      hasPrompt: !!analysisPrompt
    });

    if (annotations.length === 0) {
      console.warn('⚠️ No annotations to validate with Perplexity');
      return {
        validatedAnnotations: [],
        industryContext: [],
        trendInsights: [],
        competitiveContext: [],
        validationSources: []
      };
    }

    try {
      // Import perplexity service
      const { perplexityService } = await import('@/services/perplexityService');
      
      // ✅ FIX: Validate only top 5 annotations to reduce API load and 406 errors
      const topAnnotations = annotations.slice(0, 5);
      const validatedAnnotations: any[] = [];
      const allSources: any[] = [];
      const industryContext: any[] = [];
      const trendInsights: any[] = [];
      const competitiveContext: any[] = [];

      console.log('🔄 Processing annotations for validation:', {
        total: annotations.length,
        processing: topAnnotations.length,
        strategy: 'sequential-with-delays'
      });

      // ✅ FIX: Process annotations sequentially with delays to avoid rate limits
      for (let i = 0; i < topAnnotations.length; i++) {
        const annotation = topAnnotations[i];
        
        try {
          // ✅ FIX: Shorter, more focused validation queries to avoid 406 errors
          const validationQuery = `UX validation: "${annotation.title || annotation.feedback || 'Design recommendation'}". Industry best practices?`;

          console.log(`🔍 Validating annotation ${i + 1}/${topAnnotations.length}:`, {
            title: annotation.title?.substring(0, 50) || 'Untitled',
            queryLength: validationQuery.length
          });

          // Research the annotation with Perplexity
          const research = await perplexityService.researchTopic({
            query: validationQuery,
            domain: 'ux',
            recencyFilter: 'year',
            maxSources: 2 // ✅ FIX: Reduce sources to minimize response size
          });

          if (research.success && research.content) {
            // Analyze if the research supports the annotation
            const isSupported = this.analyzeResearchSupport(research.content, annotation);
            
            const validatedAnnotation = {
              ...annotation,
              perplexityValidated: true,
              perplexitySupport: isSupported,
              confidence: isSupported ? 
                Math.min((annotation.confidence || 0.8) * 1.1, 1.0) : 
                Math.max((annotation.confidence || 0.8) * 0.95, 0.6),
              researchContext: research.content.substring(0, 200), // ✅ FIX: Shorter context
              validationSources: research.sources?.slice(0, 1) || [] // ✅ FIX: Only 1 source per annotation
            };
            
            validatedAnnotations.push(validatedAnnotation);
            if (research.sources && research.sources.length > 0) {
              allSources.push(research.sources[0]); // ✅ FIX: Add only first source
            }
            
            console.log(`✅ Validated annotation ${i + 1}: ${annotation.title?.substring(0, 30) || 'Untitled'} - Supported: ${isSupported}`);
          } else {
            // Add annotation without validation if research failed
            validatedAnnotations.push({
              ...annotation,
              perplexityValidated: false,
              validationSources: []
            });
            console.warn(`⚠️ Failed to validate annotation ${i + 1}: ${annotation.title?.substring(0, 30) || 'Untitled'}`);
          }

          // ✅ FIX: Add delay between requests to respect rate limits (only if not last item)
          if (i < topAnnotations.length - 1) {
            console.log('⏱️ Rate limit delay: 2 seconds');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

        } catch (annotationError) {
          console.error(`❌ Error validating annotation ${i + 1}:`, annotationError);
          // Add annotation without validation if error occurred
          validatedAnnotations.push({
            ...annotation,
            perplexityValidated: false,
            validationSources: []
          });
        }
      }

      // ✅ FIX: Improved competitive analysis with better error handling
      if (validatedAnnotations.length > 0) {
        try {
          console.log('🏢 Getting competitive analysis context...');
          const competitiveAnalysis = await perplexityService.getCompetitiveAnalysis(
            'web design',
            'technology' // ✅ FIX: Use static industry to avoid method dependency
          );
          
          competitiveContext.push(...(competitiveAnalysis.competitors || []).slice(0, 3));
          trendInsights.push(...(competitiveAnalysis.industryTrends || []).slice(0, 3));
          industryContext.push(...(competitiveAnalysis.benchmarks || []).slice(0, 3));
          
          console.log('✅ Competitive analysis completed:', {
            competitors: competitiveContext.length,
            trends: trendInsights.length,
            benchmarks: industryContext.length
          });
        } catch (competitiveError) {
          console.warn('⚠️ Competitive analysis failed (non-critical):', competitiveError);
        }
      } else {
        console.log('⚠️ Skipping competitive analysis - no validated annotations');
      }

      console.log('✅ Perplexity validation completed:', {
        validatedCount: validatedAnnotations.length,
        supportedCount: validatedAnnotations.filter(a => a.perplexitySupport).length,
        sourcesCount: allSources.length,
        industryInsights: industryContext.length
      });

      return {
        validatedAnnotations,
        industryContext,
        trendInsights,
        competitiveContext,
        validationSources: allSources.slice(0, 10) // Limit sources
      };

    } catch (error) {
      console.error('❌ Perplexity validation stage failed:', error);
      
      // Return original annotations without validation if Perplexity fails
      const fallbackAnnotations = annotations.map(annotation => ({
        ...annotation,
        perplexityValidated: false,
        validationSources: []
      }));

      return {
        validatedAnnotations: fallbackAnnotations,
        industryContext: [],
        trendInsights: [],
        competitiveContext: [],
        validationSources: []
      };
    }
  }

  /**
   * Execute intelligent synthesis stage
   */
  private async executeIntelligentSynthesisStage(
    data: any, 
    customWeights?: Record<string, number>
  ): Promise<SynthesisResult> {
    const { aiAnalysisData, perplexityData, googleVisionData } = data;
    const weights = customWeights || this.configuration?.weights || {};
    
    // Merge and prioritize insights from all stages
    const finalAnnotations = this.synthesizeAnnotations(
      aiAnalysisData?.annotations || [],
      perplexityData?.validatedAnnotations || [],
      googleVisionData,
      weights
    );

    // Calculate priority scores and quality metrics
    const priorityScores = this.calculatePriorityScores(finalAnnotations, weights);
    const qualityMetrics = this.calculateQualityMetrics(finalAnnotations, data);
    const confidenceWeights = this.calculateConfidenceWeights(finalAnnotations);

    return {
      finalAnnotations,
      priorityScores,
      qualityMetrics,
      consolidatedInsights: [],
      confidenceWeights
    };
  }

  /**
   * Build enhanced prompt with Google Vision context
   */
  private buildEnhancedPrompt(originalPrompt: string, visionData?: GoogleVisionResult): string {
    let enhancedPrompt = originalPrompt;

    if (visionData) {
      enhancedPrompt += '\n\n=== VISUAL INTELLIGENCE CONTEXT ===\n';
      
      if (visionData.dominantColors?.length > 0) {
        enhancedPrompt += `Dominant Colors: ${visionData.dominantColors.map(c => c.color).join(', ')}\n`;
      }
      
      if (visionData.textAnnotations?.length > 0) {
        enhancedPrompt += `Text Elements Detected: ${visionData.textAnnotations.length} text elements\n`;
      }
      
      if (visionData.visualElements) {
        enhancedPrompt += `UI Elements: ${Object.entries(visionData.visualElements)
          .map(([type, elements]) => `${elements.length} ${type}`)
          .join(', ')}\n`;
      }
      
      enhancedPrompt += '\nPlease incorporate this visual intelligence into your analysis.\n';
    }

    return enhancedPrompt;
  }

  /**
   * Synthesize annotations from multiple stages
   */
  private synthesizeAnnotations(
    aiAnnotations: any[],
    perplexityAnnotations: any[],
    visionData?: GoogleVisionResult,
    weights: Record<string, number> = {}
  ): any[] {
    // Merge annotations with weighted scoring
    const synthesized = [...aiAnnotations];
    
    // Apply Perplexity validation scores
    if (perplexityAnnotations.length > 0) {
      synthesized.forEach(annotation => {
        const validated = perplexityAnnotations.find(p => p.id === annotation.id);
        if (validated) {
          annotation.perplexityValidated = true;
          annotation.confidence = (annotation.confidence || 0.8) * 1.2; // Boost validated annotations
        }
      });
    }

    // Sort by confidence and priority
    return synthesized
      .sort((a, b) => (b.confidence || 0.8) - (a.confidence || 0.8))
      .slice(0, 20); // Limit to top 20 insights
  }

  /**
   * Calculate priority scores for annotations
   */
  private calculatePriorityScores(annotations: any[], weights: Record<string, number>): Record<string, number> {
    const scores: Record<string, number> = {};
    
    annotations.forEach(annotation => {
      let score = annotation.confidence || 0.8;
      
      // Apply severity weights
      if (annotation.severity === 'critical') score *= 1.5;
      else if (annotation.severity === 'suggested') score *= 1.2;
      
      // Apply Perplexity validation bonus
      if (annotation.perplexityValidated) score *= 1.3;
      
      scores[annotation.id] = Math.min(score, 1.0);
    });
    
    return scores;
  }

  /**
   * Calculate quality metrics for the analysis
   */
  private calculateQualityMetrics(annotations: any[], data: any): Record<string, number> {
    return {
      annotationCount: annotations.length,
      averageConfidence: annotations.reduce((sum, a) => sum + (a.confidence || 0.8), 0) / annotations.length,
      perplexityValidationRate: annotations.filter(a => a.perplexityValidated).length / annotations.length,
      visionEnhanced: data.googleVisionData ? 1 : 0,
      diversityScore: this.calculateDiversityScore(annotations)
    };
  }

  /**
   * Calculate confidence weights for final scoring
   */
  private calculateConfidenceWeights(annotations: any[]): Record<string, number> {
    const weights: Record<string, number> = {};
    
    annotations.forEach(annotation => {
      let weight = 1.0;
      
      // Boost high-confidence annotations
      if ((annotation.confidence || 0.8) > 0.9) weight *= 1.2;
      
      // Boost validated annotations
      if (annotation.perplexityValidated) weight *= 1.1;
      
      weights[annotation.id] = weight;
    });
    
    return weights;
  }

  /**
   * Calculate diversity score for annotations
   */
  private calculateDiversityScore(annotations: any[]): number {
    const categories = new Set(annotations.map(a => a.category || 'general'));
    const severities = new Set(annotations.map(a => a.severity || 'suggested'));
    
    return (categories.size * 0.6 + severities.size * 0.4) / 4; // Normalize to 0-1
  }

  /**
   * Calculate overall quality scores for the pipeline
   */
  private calculateQualityScores(stages: StageResult[], data: any): Record<string, number> {
    const successfulStages = stages.filter(s => s.status === 'success').length;
    const totalStages = stages.length;
    
    return {
      pipelineCompletion: successfulStages / totalStages,
      averageStageTime: stages.reduce((sum, s) => sum + s.duration_ms, 0) / stages.length,
      dataRichness: this.calculateDataRichness(data),
      overallQuality: this.calculateOverallQuality(stages, data)
    };
  }

  /**
   * Calculate data richness score
   */
  private calculateDataRichness(data: any): number {
    let score = 0.5; // Base score
    
    if (data.googleVisionData) score += 0.2;
    if (data.perplexityData) score += 0.2;
    if (data.finalResult) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQuality(stages: StageResult[], data: any): number {
    const stageSuccess = stages.filter(s => s.status === 'success').length / stages.length;
    const dataRichness = this.calculateDataRichness(data);
    const annotationQuality = data.finalResult?.qualityMetrics?.averageConfidence || 0.8;
    
    return (stageSuccess * 0.4 + dataRichness * 0.3 + annotationQuality * 0.3);
  }

  /**
   * Check if a stage should be executed
   */
  private shouldExecuteStage(stageName: string, options: any): boolean {
    if (options.skipStages?.includes(stageName)) return false;
    if (options.forceStages?.includes(stageName)) return true;
    
    const stage = this.configuration?.stages.find(s => s.name === stageName);
    return stage?.enabled ?? true;
  }

  /**
   * Log stage start to database
   */
  private async logStageStart(analysisId: string, stageName: string): Promise<void> {
    try {
      // ✅ FIX: Use maybeSingle() to handle cases where analysis_results doesn't exist yet
      const { data: analysisResult, error } = await supabase
        .from('analysis_results')
        .select('id')
        .eq('analysis_id', analysisId)
        .maybeSingle();

      if (error) {
        console.warn(`⚠️ Could not find analysis_results for ${analysisId}, skipping stage logging:`, error.message);
        return;
      }

      if (analysisResult?.id) {
        const { error: insertError } = await supabase.from('analysis_stage_logs').insert({
          analysis_result_id: analysisResult.id,
          stage_name: stageName,
          stage_status: 'running'
        });

        if (insertError) {
          console.warn(`⚠️ Failed to insert stage log for ${stageName}:`, insertError.message);
        }
      } else {
        console.warn(`⚠️ No analysis_results record found for ${analysisId}, stage logging skipped`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to log stage start for ${stageName} (non-critical):`, error);
    }
  }

  /**
   * Log stage completion to database
   */
  private async logStageCompletion(
    analysisId: string,
    stageName: string,
    status: string,
    data: any,
    duration: number,
    error?: string
  ): Promise<void> {
    try {
      // ✅ FIX: Use maybeSingle() to handle cases where analysis_results doesn't exist yet
      const { data: analysisResult, error: queryError } = await supabase
        .from('analysis_results')
        .select('id')
        .eq('analysis_id', analysisId)
        .maybeSingle();

      if (queryError) {
        console.warn(`⚠️ Could not find analysis_results for ${analysisId}, skipping stage completion logging:`, queryError.message);
        return;
      }

      if (analysisResult?.id) {
        // Try to update existing log entry
        const { error: updateError, count } = await supabase
          .from('analysis_stage_logs')
          .update({
            stage_status: status,
            completed_at: new Date().toISOString(),
            duration_ms: duration,
            output_data: data ? JSON.stringify(data).substring(0, 10000) : null, // ✅ FIX: Limit output size
            error_data: error ? JSON.stringify({ error: error.substring(0, 1000) }) : null // ✅ FIX: Limit error size
          })
          .eq('analysis_result_id', analysisResult.id)
          .eq('stage_name', stageName)
          .eq('stage_status', 'running');

        if (updateError) {
          console.warn(`⚠️ Failed to update stage log for ${stageName}:`, updateError.message);
        } else if (count === 0) {
          // No running stage found, create a new log entry
          const { error: insertError } = await supabase.from('analysis_stage_logs').insert({
            analysis_result_id: analysisResult.id,
            stage_name: stageName,
            stage_status: status,
            completed_at: new Date().toISOString(),
            duration_ms: duration,
            output_data: data ? JSON.stringify(data).substring(0, 10000) : null,
            error_data: error ? JSON.stringify({ error: error.substring(0, 1000) }) : null
          });

          if (insertError) {
            console.warn(`⚠️ Failed to insert completion log for ${stageName}:`, insertError.message);
          }
        }
      } else {
        console.warn(`⚠️ No analysis_results record found for ${analysisId}, stage completion logging skipped`);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to log stage completion for ${stageName} (non-critical):`, error);
    }
  }

  /**
   * Analyze if research content supports an annotation
   */
  private analyzeResearchSupport(researchContent: string, annotation: any): boolean {
    const content = researchContent.toLowerCase();
    const annotationText = `${annotation.title || ''} ${annotation.description || annotation.feedback || ''}`.toLowerCase();
    
    // Look for positive validation indicators
    const positiveIndicators = [
      'confirm', 'support', 'validate', 'accurate', 'correct', 'proven', 
      'effective', 'recommend', 'best practice', 'improve', 'enhance'
    ];
    
    // Look for negative validation indicators
    const negativeIndicators = [
      'contradict', 'dispute', 'incorrect', 'outdated', 'ineffective', 
      'poor practice', 'avoid', 'problematic', 'harmful'
    ];
    
    const positiveScore = positiveIndicators.filter(indicator => 
      content.includes(indicator)
    ).length;
    
    const negativeScore = negativeIndicators.filter(indicator => 
      content.includes(indicator)
    ).length;
    
    // Check if annotation concepts are mentioned in research
    const annotationWords = annotationText.split(' ').filter(word => word.length > 3);
    const mentionScore = annotationWords.filter(word => 
      content.includes(word)
    ).length;
    
    // Calculate support score
    const supportScore = positiveScore + (mentionScore * 0.1) - (negativeScore * 2);
    
    return supportScore > 0.5;
  }

  /**
   * Extract industry context from analysis prompt
   */
  private extractIndustryFromPrompt(prompt: string): string | undefined {
    if (!prompt) return undefined;
    
    const industries = [
      'e-commerce', 'finance', 'healthcare', 'education', 'technology', 
      'retail', 'saas', 'entertainment', 'news', 'travel', 'real estate',
      'food', 'fashion', 'automotive', 'gaming'
    ];
    
    const promptLower = prompt.toLowerCase();
    
    for (const industry of industries) {
      if (promptLower.includes(industry)) {
        return industry;
      }
    }
    
    // Look for common industry keywords
    if (promptLower.includes('shop') || promptLower.includes('buy') || promptLower.includes('cart')) {
      return 'e-commerce';
    }
    if (promptLower.includes('bank') || promptLower.includes('payment') || promptLower.includes('financial')) {
      return 'finance';
    }
    if (promptLower.includes('learn') || promptLower.includes('course') || promptLower.includes('student')) {
      return 'education';
    }
    
    return undefined;
  }

  /**
   * Get default pipeline configuration
   */
  private getDefaultConfiguration(): PipelineConfiguration {
    return {
      id: 'default',
      name: 'comprehensive_analysis',
      description: 'Default multi-stage analysis pipeline',
      stages: [
        { name: 'google_vision', enabled: true, timeout_ms: 30000, retry_count: 2 },
        { name: 'enhanced_ai_analysis', enabled: true, timeout_ms: 60000, retry_count: 3 },
        { name: 'perplexity_validation', enabled: true, timeout_ms: 45000, retry_count: 2 },
        { name: 'intelligent_synthesis', enabled: true, timeout_ms: 30000, retry_count: 1 }
      ],
      weights: {
        google_vision: 0.15,
        ai_analysis: 0.50,
        perplexity_validation: 0.25,
        synthesis_quality: 0.10
      },
      thresholds: {
        min_confidence: 0.7,
        min_annotations: 12,
        max_annotations: 25,
        quality_threshold: 0.8
      },
      enabled: true,
      version: 1
    };
  }
}

export const multiStageAnalysisPipeline = new MultiStageAnalysisPipeline();