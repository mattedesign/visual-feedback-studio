import { Annotation } from '@/types/analysis';
import { ImprovedCoordinateValidator, CoordinateValidationResult, ValidationMetrics } from './improvedCoordinateValidator';

export interface ProcessingOptions {
  enableValidation: boolean;
  enableFiltering: boolean;
  minConfidenceThreshold: number;
  maxInvalidAnnotations: number;
  logValidationDetails: boolean;
}

export interface ProcessingResult {
  processedAnnotations: Annotation[];
  validationResults: CoordinateValidationResult[];
  metrics: ValidationMetrics;
  filteredAnnotations: Annotation[];
  processingLog: string[];
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

    // Step 1: Validate all annotations
    let validationResults: CoordinateValidationResult[] = [];
    if (opts.enableValidation) {
      validationResults = this.validateAnnotations(annotations, processingLog);
    }

    // Step 2: Generate metrics
    const metrics = this.generateProcessingMetrics(annotations, validationResults, processingLog);

    // Step 3: Filter annotations if enabled
    let processedAnnotations = [...annotations];
    let filteredAnnotations: Annotation[] = [];
    
    if (opts.enableFiltering) {
      const filterResult = this.filterAnnotations(
        annotations,
        validationResults,
        opts,
        processingLog
      );
      processedAnnotations = filterResult.kept;
      filteredAnnotations = filterResult.filtered;
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
      processingLog
    };
  }

  /**
   * Validate all annotations using improved validator
   */
  private static validateAnnotations(
    annotations: Annotation[],
    log: string[]
  ): CoordinateValidationResult[] {
    log.push('🔍 Validating annotations with evidence-based approach');

    const results = annotations.map((annotation, index) => {
      const result = ImprovedCoordinateValidator.validateAnnotation(annotation);
      
      if (result.evidenceLevel === 'weak' || !result.isValid) {
        log.push(`⚠️ Annotation ${index + 1} (${annotation.id}): ${result.reasoning}`);
      }
      
      return result;
    });

    log.push(`✅ Validation complete: ${results.filter(r => r.isValid).length}/${results.length} valid`);
    return results;
  }

  /**
   * Generate comprehensive processing metrics
   */
  private static generateProcessingMetrics(
    annotations: Annotation[],
    validationResults: CoordinateValidationResult[],
    log: string[]
  ): ValidationMetrics {
    const metrics = ImprovedCoordinateValidator.generateValidationMetrics(
      annotations,
      validationResults
    );

    log.push(`📊 Quality Metrics: ${metrics.validCount}/${metrics.totalAnnotations} valid (${Math.round((metrics.validCount / metrics.totalAnnotations) * 100)}%)`);
    log.push(`📊 Average Confidence: ${Math.round(metrics.averageConfidence * 100)}%`);
    log.push(`📊 Evidence Distribution: ${JSON.stringify(metrics.evidenceLevels)}`);

    return metrics;
  }

  /**
   * Filter annotations based on validation results and options
   */
  private static filterAnnotations(
    annotations: Annotation[],
    validationResults: CoordinateValidationResult[],
    options: ProcessingOptions,
    log: string[]
  ): { kept: Annotation[]; filtered: Annotation[] } {
    log.push(`🔍 Filtering annotations with confidence threshold: ${options.minConfidenceThreshold}`);

    const kept: Annotation[] = [];
    const filtered: Annotation[] = [];

    annotations.forEach((annotation, index) => {
      const validation = validationResults[index];
      
      if (!validation) {
        kept.push(annotation);
        return;
      }

      // Filter based on confidence and evidence
      if (validation.confidence >= options.minConfidenceThreshold && validation.isValid) {
        kept.push(annotation);
      } else {
        filtered.push(annotation);
        log.push(`🗑️ Filtered annotation ${index + 1}: ${validation.reasoning}`);
      }
    });

    // Check if too many annotations were filtered
    if (filtered.length > options.maxInvalidAnnotations) {
      log.push(`⚠️ Warning: ${filtered.length} annotations filtered (max: ${options.maxInvalidAnnotations})`);
      
      // Keep the best filtered annotations to avoid over-filtering
      const sortedFiltered = filtered
        .map((ann, idx) => ({ 
          annotation: ann, 
          validation: validationResults[annotations.indexOf(ann)] 
        }))
        .sort((a, b) => (b.validation?.confidence || 0) - (a.validation?.confidence || 0));

      const toRestore = sortedFiltered.slice(0, filtered.length - options.maxInvalidAnnotations);
      toRestore.forEach(({ annotation }) => {
        kept.push(annotation);
        const index = filtered.indexOf(annotation);
        if (index > -1) filtered.splice(index, 1);
      });

      log.push(`🔄 Restored ${toRestore.length} best annotations to avoid over-filtering`);
    }

    log.push(`✅ Filtering complete: ${kept.length} kept, ${filtered.length} filtered`);
    return { kept, filtered };
  }

  /**
   * Add validation metadata to annotations
   */
  private static addValidationMetadata(
    annotations: Annotation[],
    validationResults: CoordinateValidationResult[],
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
    metrics: ValidationMetrics,
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
