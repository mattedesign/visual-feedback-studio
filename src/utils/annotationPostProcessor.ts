
import { Annotation } from '@/types/analysis';
import { EnhancedAnnotationProcessor, ProcessingOptions, ProcessingResult } from './enhancedAnnotationProcessor';

interface LegacyProcessingStats {
  totalAnnotations: number;
  correctedAnnotations: number;
  validationResults: Array<{
    id: string;
    isValid: boolean;
    correctionApplied: boolean;
    reasoning: string;
  }>;
}

/**
 * Annotation Post Processor - Updated to use enhanced validation
 * NO MORE AUTOMATIC CORRECTIONS - Focus on validation and filtering only
 */
export class AnnotationPostProcessor {
  static processAnnotations(
    annotations: Annotation[],
    options: Partial<ProcessingOptions> = {}
  ): {
    processedAnnotations: Annotation[];
    stats: LegacyProcessingStats;
  } {
    console.log('🔧 ANNOTATION POST-PROCESSING (Enhanced):', {
      totalAnnotations: annotations.length,
      timestamp: new Date().toISOString(),
      mode: 'validation_only'
    });

    // Use enhanced processor instead of old validation logic
    const enhancedResult = EnhancedAnnotationProcessor.processAnnotations(annotations, {
      enableValidation: true,
      enableFiltering: true,
      minConfidenceThreshold: options.minConfidenceThreshold || 0.6,
      maxInvalidAnnotations: 5, // Allow more annotations but filter poor quality ones
      logValidationDetails: true,
      ...options
    });

    // Convert to legacy stats format for backward compatibility
    const legacyStats: LegacyProcessingStats = {
      totalAnnotations: annotations.length,
      correctedAnnotations: 0, // No more corrections!
      validationResults: enhancedResult.validationResults.map((validation, index) => ({
        id: annotations[index]?.id || `annotation-${index}`,
        isValid: validation.isValid,
        correctionApplied: false, // Never apply corrections anymore
        reasoning: validation.reasoning
      }))
    };

    console.log('🔧 ENHANCED POST-PROCESSING COMPLETE:', {
      totalProcessed: enhancedResult.processedAnnotations.length,
      totalFiltered: enhancedResult.filteredAnnotations.length,
      averageQuality: Math.round(enhancedResult.metrics.averageConfidence * 100) + '%',
      correctionsMade: 0, // No more corrections!
      qualityImprovement: 'validation_and_filtering'
    });

    // Log the enhanced quality report
    console.log(EnhancedAnnotationProcessor.generateQualityReport(enhancedResult));

    return {
      processedAnnotations: enhancedResult.processedAnnotations,
      stats: legacyStats
    };
  }

  /**
   * Generate quality report using enhanced metrics
   */
  static generateQualityReport(stats: LegacyProcessingStats): string {
    const validCount = stats.validationResults.filter(r => r.isValid).length;
    const correctedCount = 0; // No more corrections
    
    return `
📊 ENHANCED ANNOTATION QUALITY REPORT
────────────────────────────────────────
Total Annotations: ${stats.totalAnnotations}
Valid Coordinates: ${validCount} (${Math.round((validCount / stats.totalAnnotations) * 100)}%)
Evidence-Based Validation: ✅ Enabled
Auto-Corrections: ${correctedCount} (DISABLED for quality)
Quality Score: ${Math.round((validCount / stats.totalAnnotations) * 100)}%

✅ Quality-focused processing: Validation without harmful corrections
🎯 Evidence-based approach: Only high-confidence annotations retained
    `.trim();
  }
}
