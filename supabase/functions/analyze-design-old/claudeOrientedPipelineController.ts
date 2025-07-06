/**
 * 🎯 Claude-Oriented UX AI Analysis Pipeline Controller
 * 
 * Master controller that orchestrates the entire Claude-first analysis pipeline
 * with intelligent quality assurance and fallback mechanisms.
 * 
 * ARCHITECTURE:
 * - Claude Sonnet 4.0: 70% weight (primary strategic analysis)
 * - OpenAI GPT-4.1: 20% weight (fallback & synthesis support)  
 * - Perplexity: 10% weight (research validation & competitive intelligence)
 */

interface PipelineConfig {
  targetAnnotations: {
    minimum: number;
    professional: number;
    maximum: number;
  };
  qualityThresholds: {
    claudeConfidence: number;
    openaiConfidence: number;
    perplexityValidation: number;
  };
  weights: {
    claude: number;
    openai: number;
    perplexity: number;
  };
}

interface PipelineResult {
  success: boolean;
  annotations: any[];
  qualityMetrics: {
    overallScore: number;
    claudeQuality: number;
    synthesisQuality: number;
    researchValidation: number;
    professionalStandard: boolean;
  };
  pipelineMetadata: {
    primaryModel: string;
    fallbacksUsed: string[];
    processingStages: string[];
    confidence: number;
    researchEnhanced: boolean;
  };
  error?: string;
}

export class ClaudeOrientedPipelineController {
  private static readonly PIPELINE_CONFIG: PipelineConfig = {
    targetAnnotations: {
      minimum: 12,      // Absolute minimum for any UX analysis
      professional: 16, // Professional consulting standard
      maximum: 19       // Upper limit for focused analysis
    },
    qualityThresholds: {
      claudeConfidence: 0.85,     // High standard for Claude 4.0
      openaiConfidence: 0.75,     // Good standard for OpenAI fallback
      perplexityValidation: 0.70  // Research validation threshold
    },
    weights: {
      claude: 0.70,    // Primary model weight
      openai: 0.20,    // Fallback support weight
      perplexity: 0.10 // Research validation weight
    }
  };

  /**
   * 🚀 Execute the complete Claude-Oriented UX AI Analysis Pipeline
   */
  static async executePipeline(
    processedImages: any[],
    analysisPrompt: string,
    options: {
      ragEnabled?: boolean;
      perplexityEnabled?: boolean;
      strictQuality?: boolean;
    } = {}
  ): Promise<PipelineResult> {
    console.log('🎯 ClaudeOrientedPipelineController - Starting comprehensive UX analysis pipeline', {
      imageCount: processedImages.length,
      promptLength: analysisPrompt.length,
      primaryModel: 'Claude Sonnet 4.0',
      expectedAnnotations: `${this.PIPELINE_CONFIG.targetAnnotations.professional}-${this.PIPELINE_CONFIG.targetAnnotations.maximum}`,
      qualityMode: options.strictQuality ? 'strict' : 'balanced'
    });

    const startTime = Date.now();
    const processingStages: string[] = [];
    const fallbacksUsed: string[] = [];

    try {
      // 🎯 STAGE 1: Multi-Model Orchestration
      processingStages.push('multi_model_orchestration');
      console.log('🤖 Stage 1: Multi-Model Orchestration with Claude-first weighting');
      
      const { multiModelOrchestrator } = await import('./multiModelOrchestrator.ts');
      
      const orchestrationResult = await multiModelOrchestrator.orchestrateAnalysis(
        processedImages,
        analysisPrompt,
        {
          ragEnabled: options.ragEnabled,
          perplexityEnabled: options.perplexityEnabled,
          forceClaudeOnly: false
        }
      );

      // Track fallbacks from orchestration
      fallbacksUsed.push(...orchestrationResult.synthesisMetadata.fallbacksTriggered);

      // 🔍 STAGE 2: Quality Assessment
      processingStages.push('quality_assessment');
      console.log('📊 Stage 2: Quality Assessment and Validation');
      
      const qualityMetrics = await this.assessQuality(
        orchestrationResult.finalAnnotations,
        orchestrationResult.synthesisMetadata
      );

      // 🧠 STAGE 3: Perplexity Research Enhancement (if enabled)
      let researchEnhanced = false;
      if (options.perplexityEnabled && orchestrationResult.finalAnnotations.length > 0) {
        processingStages.push('perplexity_enhancement');
        console.log('🔍 Stage 3: Perplexity Research Enhancement');
        
        try {
          const enhancedAnnotations = await this.applyPerplexityEnhancements(
            orchestrationResult.finalAnnotations,
            analysisPrompt
          );
          
          if (enhancedAnnotations.length > 0) {
            orchestrationResult.finalAnnotations = enhancedAnnotations;
            researchEnhanced = true;
            console.log('✅ Perplexity research enhancement applied successfully');
          }
        } catch (perplexityError) {
          console.warn('⚠️ Perplexity enhancement failed:', perplexityError);
          fallbacksUsed.push('perplexity_enhancement_failed');
        }
      }

      // 🎯 STAGE 4: Final Quality Validation
      processingStages.push('final_validation');
      console.log('✅ Stage 4: Final Quality Validation');
      
      const finalQualityCheck = this.validateFinalResults(
        orchestrationResult.finalAnnotations,
        qualityMetrics,
        options.strictQuality
      );

      const processingTime = Date.now() - startTime;

      if (finalQualityCheck.meets_standards) {
        console.log('🎉 Claude-Oriented UX AI Analysis Pipeline completed successfully:', {
          annotationsCount: orchestrationResult.finalAnnotations.length,
          targetRange: `${this.PIPELINE_CONFIG.targetAnnotations.professional}-${this.PIPELINE_CONFIG.targetAnnotations.maximum}`,
          qualityScore: qualityMetrics.overallScore,
          primaryModel: orchestrationResult.synthesisMetadata.primaryModel,
          processingTimeMs: processingTime,
          stagesCompleted: processingStages.length,
          fallbacksUsed: fallbacksUsed.length,
          researchEnhanced
        });

        return {
          success: true,
          annotations: orchestrationResult.finalAnnotations,
          qualityMetrics,
          pipelineMetadata: {
            primaryModel: orchestrationResult.synthesisMetadata.primaryModel,
            fallbacksUsed,
            processingStages,
            confidence: orchestrationResult.synthesisMetadata.confidenceScore,
            researchEnhanced
          }
        };
      } else {
        console.warn('⚠️ Final quality check failed - attempting quality recovery');
        
        // 🔄 STAGE 5: Quality Recovery (if needed)
        const recoveryResult = await this.attemptQualityRecovery(
          orchestrationResult,
          processedImages,
          analysisPrompt,
          qualityMetrics
        );

        if (recoveryResult.success) {
          fallbacksUsed.push('quality_recovery_successful');
          
          return {
            success: true,
            annotations: recoveryResult.annotations,
            qualityMetrics: recoveryResult.qualityMetrics,
            pipelineMetadata: {
              primaryModel: orchestrationResult.synthesisMetadata.primaryModel + ' (quality recovered)',
              fallbacksUsed,
              processingStages: [...processingStages, 'quality_recovery'],
              confidence: recoveryResult.qualityMetrics.overallScore,
              researchEnhanced
            }
          };
        } else {
          fallbacksUsed.push('quality_recovery_failed');
          
          return {
            success: false,
            annotations: orchestrationResult.finalAnnotations,
            qualityMetrics,
            pipelineMetadata: {
              primaryModel: orchestrationResult.synthesisMetadata.primaryModel,
              fallbacksUsed,
              processingStages,
              confidence: orchestrationResult.synthesisMetadata.confidenceScore,
              researchEnhanced
            },
            error: `Quality standards not met: ${finalQualityCheck.issues.join(', ')}`
          };
        }
      }

    } catch (error) {
      console.error('❌ Claude-Oriented UX AI Analysis Pipeline failed:', error);
      
      return {
        success: false,
        annotations: [],
        qualityMetrics: {
          overallScore: 0,
          claudeQuality: 0,
          synthesisQuality: 0,
          researchValidation: 0,
          professionalStandard: false
        },
        pipelineMetadata: {
          primaryModel: 'none',
          fallbacksUsed: [...fallbacksUsed, 'pipeline_failure'],
          processingStages,
          confidence: 0,
          researchEnhanced: false
        },
        error: error.message
      };
    }
  }

  /**
   * 📊 Assess quality of orchestrated results
   */
  private static async assessQuality(
    annotations: any[],
    synthesisMetadata: any
  ): Promise<PipelineResult['qualityMetrics']> {
    const annotationCount = annotations.length;
    const config = this.PIPELINE_CONFIG;

    // Calculate Claude quality based on primary model performance
    const claudeQuality = synthesisMetadata.primaryModel.includes('Claude') 
      ? Math.min(1.0, synthesisMetadata.confidenceScore * 1.1) // Boost for Claude
      : synthesisMetadata.confidenceScore * 0.8; // Penalty for non-Claude primary

    // Calculate synthesis quality based on annotation distribution and content
    const synthesisQuality = this.calculateSynthesisQuality(annotations, synthesisMetadata);

    // Calculate research validation score
    const researchValidation = this.calculateResearchValidationScore(annotations);

    // Overall quality score (weighted average)
    const overallScore = (
      claudeQuality * 0.5 +           // 50% weight on Claude performance
      synthesisQuality * 0.3 +        // 30% weight on synthesis quality
      researchValidation * 0.2        // 20% weight on research validation
    );

    // Professional standard check
    const professionalStandard = (
      annotationCount >= config.targetAnnotations.professional &&
      annotationCount <= config.targetAnnotations.maximum &&
      overallScore >= 0.75
    );

    console.log('📊 Quality Assessment Results:', {
      annotationCount,
      targetRange: `${config.targetAnnotations.professional}-${config.targetAnnotations.maximum}`,
      claudeQuality: Math.round(claudeQuality * 100) + '%',
      synthesisQuality: Math.round(synthesisQuality * 100) + '%',
      researchValidation: Math.round(researchValidation * 100) + '%',
      overallScore: Math.round(overallScore * 100) + '%',
      professionalStandard
    });

    return {
      overallScore,
      claudeQuality,
      synthesisQuality,
      researchValidation,
      professionalStandard
    };
  }

  /**
   * 🧠 Calculate synthesis quality based on annotation characteristics
   */
  private static calculateSynthesisQuality(annotations: any[], synthesisMetadata: any): number {
    if (annotations.length === 0) return 0;

    // Check annotation diversity (categories, severities)
    const categories = [...new Set(annotations.map(a => a.category))];
    const severities = [...new Set(annotations.map(a => a.severity))];
    
    const diversityScore = Math.min(1.0, (categories.length * 0.15) + (severities.length * 0.1));
    
    // Check annotation quality (feedback length, specificity)
    const avgFeedbackLength = annotations.reduce((sum, a) => sum + (a.feedback?.length || 0), 0) / annotations.length;
    const feedbackQuality = Math.min(1.0, avgFeedbackLength / 200); // Target 200+ chars per annotation
    
    // Multi-model synthesis bonus
    const multiModelBonus = synthesisMetadata.totalModelsUsed > 1 ? 0.1 : 0;
    
    return Math.min(1.0, diversityScore * 0.4 + feedbackQuality * 0.5 + multiModelBonus);
  }

  /**
   * 🔍 Calculate research validation score
   */
  private static calculateResearchValidationScore(annotations: any[]): number {
    if (annotations.length === 0) return 0;

    const researchBackedCount = annotations.filter(a => 
      a.researchValidated || 
      a.researchSources?.length > 0 ||
      (a.feedback && (
        a.feedback.includes('research shows') ||
        a.feedback.includes('studies indicate') ||
        a.feedback.includes('industry standard')
      ))
    ).length;

    return Math.min(1.0, researchBackedCount / annotations.length);
  }

  /**
   * ✅ Validate final results against quality standards
   */
  private static validateFinalResults(
    annotations: any[],
    qualityMetrics: PipelineResult['qualityMetrics'],
    strictQuality = false
  ): { meets_standards: boolean; issues: string[] } {
    const issues: string[] = [];
    const config = this.PIPELINE_CONFIG;

    // Check annotation count
    if (annotations.length < config.targetAnnotations.minimum) {
      issues.push(`Insufficient annotations: ${annotations.length} < ${config.targetAnnotations.minimum}`);
    }

    if (annotations.length > config.targetAnnotations.maximum) {
      issues.push(`Too many annotations: ${annotations.length} > ${config.targetAnnotations.maximum}`);
    }

    // Check quality scores
    if (qualityMetrics.overallScore < (strictQuality ? 0.85 : 0.75)) {
      issues.push(`Overall quality below threshold: ${Math.round(qualityMetrics.overallScore * 100)}%`);
    }

    if (qualityMetrics.claudeQuality < config.qualityThresholds.claudeConfidence && strictQuality) {
      issues.push(`Claude quality below strict threshold: ${Math.round(qualityMetrics.claudeQuality * 100)}%`);
    }

    // Professional standard check
    if (!qualityMetrics.professionalStandard && strictQuality) {
      issues.push('Professional standard not met');
    }

    return {
      meets_standards: issues.length === 0,
      issues
    };
  }

  /**
   * 🔍 Apply Perplexity research enhancements
   */
  private static async applyPerplexityEnhancements(
    annotations: any[],
    originalPrompt: string
  ): Promise<any[]> {
    try {
      // Import Perplexity enhanced validator
      const { PerplexityEnhancedValidator } = await import('../../../src/utils/perplexityEnhancedValidator.ts');
      
      console.log('🔍 Applying Perplexity research enhancements to annotations');
      
      // Validate and enhance each annotation
      const enhancedAnnotations = annotations.map(annotation => {
        try {
          const validationResult = PerplexityEnhancedValidator.validateAnnotation(annotation);
          
          return {
            ...annotation,
            researchValidated: validationResult.hasPerplexityResearch,
            researchConfidence: validationResult.researchConfidence,
            researchIndicators: validationResult.researchIndicators,
            researchQualityScore: validationResult.researchQualityScore,
            enhancedConfidence: validationResult.confidence
          };
        } catch (error) {
          console.warn('⚠️ Failed to enhance annotation:', annotation.id, error);
          return annotation; // Return original if enhancement fails
        }
      });

      console.log('✅ Perplexity enhancements applied:', {
        originalCount: annotations.length,
        enhancedCount: enhancedAnnotations.length,
        researchBackedCount: enhancedAnnotations.filter(a => a.researchValidated).length
      });

      return enhancedAnnotations;
    } catch (error) {
      console.error('❌ Perplexity enhancement failed:', error);
      return annotations; // Return original annotations if enhancement fails
    }
  }

  /**
   * 🔄 Attempt quality recovery if standards not met
   */
  private static async attemptQualityRecovery(
    originalResult: any,
    processedImages: any[],
    analysisPrompt: string,
    qualityMetrics: PipelineResult['qualityMetrics']
  ): Promise<{ success: boolean; annotations: any[]; qualityMetrics: PipelineResult['qualityMetrics'] }> {
    console.log('🔄 Attempting quality recovery for substandard results');

    try {
      // Strategy 1: Re-run with Claude only if original used fallbacks
      if (!originalResult.synthesisMetadata.primaryModel.includes('Claude')) {
        console.log('🎯 Recovery Strategy 1: Force Claude-only analysis');
        
        const { multiModelOrchestrator } = await import('./multiModelOrchestrator.ts');
        
        const claudeOnlyResult = await multiModelOrchestrator.orchestrateAnalysis(
          processedImages,
          analysisPrompt,
          {
            ragEnabled: true,
            perplexityEnabled: false,
            forceClaudeOnly: true
          }
        );

        if (claudeOnlyResult.finalAnnotations.length >= this.PIPELINE_CONFIG.targetAnnotations.minimum) {
          const recoveredQuality = await this.assessQuality(
            claudeOnlyResult.finalAnnotations,
            claudeOnlyResult.synthesisMetadata
          );

          if (recoveredQuality.overallScore > qualityMetrics.overallScore) {
            console.log('✅ Quality recovery successful with Claude-only approach');
            return {
              success: true,
              annotations: claudeOnlyResult.finalAnnotations,
              qualityMetrics: recoveredQuality
            };
          }
        }
      }

      // Strategy 2: Enhance existing annotations with research
      console.log('🔄 Recovery Strategy 2: Research enhancement of existing annotations');
      
      const enhancedAnnotations = await this.applyPerplexityEnhancements(
        originalResult.finalAnnotations,
        analysisPrompt
      );

      const enhancedQuality = await this.assessQuality(
        enhancedAnnotations,
        originalResult.synthesisMetadata
      );

      if (enhancedQuality.overallScore > qualityMetrics.overallScore) {
        console.log('✅ Quality recovery successful with research enhancement');
        return {
          success: true,
          annotations: enhancedAnnotations,
          qualityMetrics: enhancedQuality
        };
      }

      console.log('❌ Quality recovery failed - all strategies exhausted');
      return {
        success: false,
        annotations: originalResult.finalAnnotations,
        qualityMetrics
      };

    } catch (error) {
      console.error('❌ Quality recovery attempt failed:', error);
      return {
        success: false,
        annotations: originalResult.finalAnnotations,
        qualityMetrics
      };
    }
  }
}

export const claudeOrientedPipelineController = ClaudeOrientedPipelineController;