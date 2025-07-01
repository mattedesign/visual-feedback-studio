
import { Annotation } from '@/types/analysis';
import { CoordinateValidator } from './coordinateValidation';

interface ProcessingStats {
  totalAnnotations: number;
  correctedAnnotations: number;
  validationResults: Array<{
    id: string;
    isValid: boolean;
    correctionApplied: boolean;
    reasoning: string;
  }>;
}

export class AnnotationPostProcessor {
  static processAnnotations(annotations: Annotation[]): {
    processedAnnotations: Annotation[];
    stats: ProcessingStats;
  } {
    console.log('🔧 ANNOTATION POST-PROCESSING START:', {
      totalAnnotations: annotations.length,
      timestamp: new Date().toISOString()
    });

    const stats: ProcessingStats = {
      totalAnnotations: annotations.length,
      correctedAnnotations: 0,
      validationResults: []
    };

    const processedAnnotations = annotations.map(annotation => {
      // Validate the annotation
      const validation = CoordinateValidator.validateAnnotation(annotation);
      
      stats.validationResults.push({
        id: annotation.id,
        isValid: validation.isValid,
        correctionApplied: false,
        reasoning: validation.reasoning
      });

      // Apply correction if needed and confidence is low
      if (!validation.isValid && validation.suggestedCorrection && validation.confidence < 0.5) {
        stats.correctedAnnotations++;
        
        const correctedAnnotation = {
          ...annotation,
          x: validation.suggestedCorrection.x,
          y: validation.suggestedCorrection.y,
          originalCoordinates: { x: annotation.x, y: annotation.y },
          correctionApplied: true,
          correctionReasoning: validation.reasoning,
          validationScore: validation.confidence
        };

        // Update stats
        const statEntry = stats.validationResults.find(s => s.id === annotation.id);
        if (statEntry) {
          statEntry.correctionApplied = true;
        }

        console.log(`🔧 COORDINATE CORRECTION APPLIED for ${annotation.id}:`, {
          feedback: annotation.feedback?.substring(0, 50) + '...',
          originalCoordinates: { x: annotation.x, y: annotation.y },
          correctedCoordinates: validation.suggestedCorrection,
          reasoning: validation.reasoning,
          confidence: validation.confidence
        });

        return correctedAnnotation;
      }

      // Add validation info even if no correction applied
      return {
        ...annotation,
        validationScore: validation.confidence,
        validationPassed: validation.isValid
      };
    });

    console.log('🔧 ANNOTATION POST-PROCESSING COMPLETE:', {
      totalProcessed: processedAnnotations.length,
      correctionsMade: stats.correctedAnnotations,
      correctionRate: `${Math.round((stats.correctedAnnotations / annotations.length) * 100)}%`
    });

    return {
      processedAnnotations,
      stats
    };
  }

  static generateQualityReport(stats: ProcessingStats): string {
    const validCount = stats.validationResults.filter(r => r.isValid).length;
    const correctedCount = stats.validationResults.filter(r => r.correctionApplied).length;
    
    return `
📊 ANNOTATION QUALITY REPORT
─────────────────────────────
Total Annotations: ${stats.totalAnnotations}
Valid Coordinates: ${validCount} (${Math.round((validCount / stats.totalAnnotations) * 100)}%)
Auto-Corrections: ${correctedCount} (${Math.round((correctedCount / stats.totalAnnotations) * 100)}%)
Quality Score: ${Math.round(((validCount + correctedCount) / stats.totalAnnotations) * 100)}%

${correctedCount > 0 ? '⚠️ Coordinate corrections were applied to improve accuracy' : '✅ All coordinates passed validation'}
    `.trim();
  }
}
