import { Annotation } from '@/types/analysis';
import { ImprovedCoordinateValidator, CoordinateValidationResult, ValidationMetrics } from './improvedCoordinateValidator';
import { PerplexityEnhancedValidator, PerplexityValidationResult, PerplexityValidationMetrics } from './perplexityEnhancedValidator';

export interface ProcessingOptions {
  enableValidation: boolean;
  enableFiltering: boolean;
  minConfidenceThreshold: number;
  maxInvalidAnnotations: number;
  logValidationDetails: boolean;
}

export interface ProcessingResult {
  processedAnnotations: Annotation[];
  validationResults: PerplexityValidationResult[];
  metrics: PerplexityValidationMetrics;
  filteredAnnotations: Annotation[];
  processingLog: string[];
  researchPreserved: Annotation[];
}

/**
 * Enhanced annotation processor that focuses on validation and filtering
 * rather than automatic correction
 */
export class EnhancedAnnotationProcessor {
  private static readonly DEFAULT_OPTIONS: ProcessingOptions = {
    enableValidation: true,
    enableFiltering: true,
    minConfidenceThreshold: 0.6,
    maxInvalidAnnotations: 3,
    logValidationDetails: true
  };

  /**
   * Process annotations with improved validation and filtering
   */
  static processAnnotations(
    annotations: Annotation[],
    options: Partial<ProcessingOptions> = {}
  ): ProcessingResult {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const processingLog: string[] = [];
    
    console.log('🔧 Enhanced Annotation Processing:', {
      totalAnnotations: annotations.length,
      options: opts
    });

    processingLog.push(`Starting processing of ${annotations.length} annotations`);

    // Step 1: Validate all annotations with Perplexity enhancement
    let validationResults: PerplexityValidationResult[] = [];
    if (opts.enableValidation) {
      validationResults = this.validateAnnotationsWithPerplexity(annotations, processingLog);
    }

    // Step 2: Generate metrics
    const metrics = this.generateProcessingMetrics(annotations, validationResults, processingLog);

    // Step 3: Filter annotations if enabled with research priority
    let processedAnnotations = [...annotations];
    let filteredAnnotations: Annotation[] = [];
    let researchPreserved: Annotation[] = [];
    
    if (opts.enableFiltering) {
      const filterResult = this.filterAnnotationsWithResearchPriority(
        annotations,
        validationResults,
        opts,
        processingLog
      );
      processedAnnotations = filterResult.kept;
      filteredAnnotations = filterResult.filtered;
      researchPreserved = filterResult.researchPreserved;
    }

    // Step 4: Add validation metadata to processed annotations
    processedAnnotations = this.addValidationMetadata(
      processedAnnotations,
      validationResults,
      processingLog
    );

    // Step 5: Log final results
    this.logFinalResults(processedAnnotations, filteredAnnotations, metrics, opts, processingLog);

    return {
      processedAnnotations,
      validationResults,
      metrics,
      filteredAnnotations,
      processingLog,
      researchPreserved
    };
  }

  /**
   * Validate all annotations using Perplexity-enhanced validator
   */
  private static validateAnnotationsWithPerplexity(
    annotations: Annotation[],
    log: string[]
  ): PerplexityValidationResult[] {
    log.push('🔬 Validating annotations with Perplexity-enhanced approach');

    const results = annotations.map((annotation, index) => {
      const result = PerplexityEnhancedValidator.validateAnnotation(annotation);
      
      if (result.evidenceLevel === 'weak' || !result.isValid) {
        log.push(`⚠️ Annotation ${index + 1} (${annotation.id}): ${result.reasoning}`);
      }
      
      if (result.hasPerplexityResearch) {
        log.push(`🔬 Research annotation ${index + 1}: ${result.researchIndicators.length} indicators, quality: ${Math.round(result.researchQualityScore * 100)}%`);
      }
      
      return result;
    });

    const researchCount = results.filter(r => r.hasPerplexityResearch).length;
    log.push(`✅ Validation complete: ${results.filter(r => r.isValid).length}/${results.length} valid, ${researchCount} research-backed`);
    return results;
  }

  /**
   * Generate comprehensive processing metrics with Perplexity research tracking
   */
  private static generateProcessingMetrics(
    annotations: Annotation[],
    validationResults: PerplexityValidationResult[],
    log: string[]
  ): PerplexityValidationMetrics {
    const metrics = PerplexityEnhancedValidator.generateValidationMetrics(
      annotations,
      validationResults
    );

    log.push(`📊 Quality Metrics: ${metrics.validCount}/${metrics.totalAnnotations} valid (${Math.round((metrics.validCount / metrics.totalAnnotations) * 100)}%)`);
    log.push(`📊 Average Confidence: ${Math.round(metrics.averageConfidence * 100)}%`);
    log.push(`📊 Research Metrics: ${metrics.researchBackedCount} research-backed, ${metrics.preservedResearchAnnotations} preserved`);
    log.push(`📊 Evidence Distribution: ${JSON.stringify(metrics.evidenceLevels)}`);

    return metrics;
  }

  /**
   * Filter annotations with research priority preservation
   */
  private static filterAnnotationsWithResearchPriority(
    annotations: Annotation[],
    validationResults: PerplexityValidationResult[],
    options: ProcessingOptions,
    log: string[]
  ): { kept: Annotation[]; filtered: Annotation[]; researchPreserved: Annotation[] } {
    log.push(`🔬 Filtering annotations with research priority (threshold: ${options.minConfidenceThreshold})`);

    // Use the Perplexity-enhanced validator's filtering method
    const filterResult = PerplexityEnhancedValidator.filterWithResearchPriority(
      annotations,
      validationResults,
      {
        standardThreshold: options.minConfidenceThreshold,
        researchThreshold: 0.45, // Lower threshold for research content
        preserveHighQualityResearch: true
      }
    );

    // Log research preservation details
    log.push(`🔬 Research preservation: ${filterResult.researchPreserved.length} research annotations preserved`);
    
    // Handle over-filtering protection
    if (filterResult.filteredAnnotations.length > options.maxInvalidAnnotations) {
      log.push(`⚠️ Warning: ${filterResult.filteredAnnotations.length} annotations filtered (max: ${options.maxInvalidAnnotations})`);
      
      // Keep the best filtered annotations to avoid over-filtering
      const sortedFiltered = filterResult.filteredAnnotations
        .map((ann, idx) => ({ 
          annotation: ann, 
          validation: validationResults[annotations.indexOf(ann)] 
        }))
        .sort((a, b) => (b.validation?.confidence || 0) - (a.validation?.confidence || 0));

      const toRestore = sortedFiltered.slice(0, filterResult.filteredAnnotations.length - options.maxInvalidAnnotations);
      toRestore.forEach(({ annotation }) => {
        filterResult.validAnnotations.push(annotation);
        const index = filterResult.filteredAnnotations.indexOf(annotation);
        if (index > -1) filterResult.filteredAnnotations.splice(index, 1);
      });

      log.push(`🔄 Restored ${toRestore.length} best annotations to avoid over-filtering`);
    }

    log.push(`✅ Enhanced filtering complete: ${filterResult.validAnnotations.length} kept, ${filterResult.filteredAnnotations.length} filtered, ${filterResult.researchPreserved.length} research preserved`);
    
    return { 
      kept: filterResult.validAnnotations, 
      filtered: filterResult.filteredAnnotations,
      researchPreserved: filterResult.researchPreserved
    };
  }

  /**
   * Add validation metadata to annotations
   */
  private static addValidationMetadata(
    annotations: Annotation[],
    validationResults: PerplexityValidationResult[],
    log: string[]
  ): Annotation[] {
    log.push('📝 Adding validation metadata to annotations');

    return annotations.map((annotation, index) => {
      const validation = validationResults[index];
      
      if (!validation) return annotation;

      return {
        ...annotation,
        validationScore: validation.confidence,
        validationPassed: validation.isValid,
        evidenceLevel: validation.evidenceLevel,
        validationMethod: validation.validationMethod,
        validationReasoning: validation.reasoning,
        // Remove any previous correction metadata
        correctionApplied: false,
        originalCoordinates: undefined
      };
    });
  }

  /**
   * Log final processing results
   */
  private static logFinalResults(
    processedAnnotations: Annotation[],
    filteredAnnotations: Annotation[],
    metrics: PerplexityValidationMetrics,
    options: ProcessingOptions,
    log: string[]
  ): void {
    const qualityScore = metrics.averageConfidence;
    const retentionRate = processedAnnotations.length / (processedAnnotations.length + filteredAnnotations.length);

    log.push('🎯 Final Processing Results:');
    log.push(`   📊 Quality Score: ${Math.round(qualityScore * 100)}%`);
    log.push(`   📈 Retention Rate: ${Math.round(retentionRate * 100)}%`);
    log.push(`   ✅ Valid Annotations: ${processedAnnotations.length}`);
    log.push(`   🗑️ Filtered Annotations: ${filteredAnnotations.length}`);
    log.push(`   🎯 Evidence Distribution: Strong(${metrics.evidenceLevels.strong || 0}), Moderate(${metrics.evidenceLevels.moderate || 0}), Weak(${metrics.evidenceLevels.weak || 0})`);

    if (options.logValidationDetails) {
      console.log('🔧 Enhanced Annotation Processing Complete:', {
        qualityScore: Math.round(qualityScore * 100),
        retentionRate: Math.round(retentionRate * 100),
        processed: processedAnnotations.length,
        filtered: filteredAnnotations.length,
        evidenceDistribution: metrics.evidenceLevels
      });
    }
  }

  /**
   * Generate quality report for debugging
   */
  static generateQualityReport(result: ProcessingResult): string {
    const { metrics, processedAnnotations, filteredAnnotations, processingLog } = result;
    
    return `
🔧 ENHANCED ANNOTATION PROCESSING REPORT
═══════════════════════════════════════════
📊 Quality Metrics:
   Overall Quality: ${Math.round(metrics.averageConfidence * 100)}%
   Valid Annotations: ${metrics.validCount}/${metrics.totalAnnotations}
   Retention Rate: ${Math.round((processedAnnotations.length / (processedAnnotations.length + filteredAnnotations.length)) * 100)}%

🎯 Evidence Analysis:
   Strong Evidence: ${metrics.evidenceLevels.strong || 0}
   Moderate Evidence: ${metrics.evidenceLevels.moderate || 0}
   Weak Evidence: ${metrics.evidenceLevels.weak || 0}
   No Evidence: ${metrics.evidenceLevels.none || 0}

📈 Processing Results:
   Final Annotations: ${processedAnnotations.length}
   Filtered Out: ${filteredAnnotations.length}
   Zero Corrections Applied: ✅

📝 Processing Log:
${processingLog.map(entry => `   ${entry}`).join('\n')}

${filteredAnnotations.length === 0 ? '✅ All annotations passed validation' : '⚠️ Some annotations were filtered for quality'}
    `.trim();
  }
}
