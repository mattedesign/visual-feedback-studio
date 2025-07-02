import { Annotation } from '@/types/analysis';

export interface CoordinateValidationResult {
  isValid: boolean;
  confidence: number;
  evidenceLevel: 'none' | 'weak' | 'moderate' | 'strong';
  reasoning: string;
  validationMethod: 'visual_evidence' | 'content_analysis' | 'coordinate_range';
  shouldCorrect: boolean;
}

export interface ValidationMetrics {
  totalAnnotations: number;
  validCount: number;
  invalidCount: number;
  evidenceLevels: Record<string, number>;
  averageConfidence: number;
}

/**
 * Improved coordinate validator that focuses on evidence-based validation
 * instead of assumption-based corrections
 */
export class ImprovedCoordinateValidator {
  private static readonly COORDINATE_BOUNDS = { min: 0, max: 100 };
  private static readonly HIGH_CONFIDENCE_THRESHOLD = 0.8;
  private static readonly MEDIUM_CONFIDENCE_THRESHOLD = 0.6;

  /**
   * Validate annotation coordinates based on evidence rather than assumptions
   */
  static validateAnnotation(annotation: Annotation): CoordinateValidationResult {
    console.log('🔍 Evidence-Based Validation:', {
      id: annotation.id,
      coordinates: { x: annotation.x, y: annotation.y },
      title: annotation.title?.substring(0, 50)
    });

    // Step 1: Basic coordinate range validation
    const rangeValidation = this.validateCoordinateRange(annotation);
    if (!rangeValidation.isValid) {
      return rangeValidation;
    }

    // Step 2: Visual evidence analysis
    const evidenceValidation = this.analyzeVisualEvidence(annotation);
    if (evidenceValidation.evidenceLevel === 'strong') {
      return evidenceValidation;
    }

    // Step 3: Content specificity analysis
    const contentValidation = this.analyzeContentSpecificity(annotation);
    
    // Step 4: Combine validations for final result
    return this.combineValidationResults(evidenceValidation, contentValidation);
  }

  /**
   * Validate that coordinates are within acceptable range
   */
  private static validateCoordinateRange(annotation: Annotation): CoordinateValidationResult {
    const { x, y } = annotation;
    const { min, max } = this.COORDINATE_BOUNDS;

    if (x < min || x > max || y < min || y > max) {
      return {
        isValid: false,
        confidence: 0.0,
        evidenceLevel: 'none',
        reasoning: `Coordinates (${x}, ${y}) are outside valid range (${min}-${max})`,
        validationMethod: 'coordinate_range',
        shouldCorrect: false // Don't auto-correct out-of-bounds coordinates
      };
    }

    // Check for suspicious coordinate patterns
    if (this.isSuspiciousCoordinate(x, y)) {
      return {
        isValid: false,
        confidence: 0.3,
        evidenceLevel: 'weak',
        reasoning: `Coordinates (${x}, ${y}) match suspicious patterns (center clustering, exact corners)`,
        validationMethod: 'coordinate_range',
        shouldCorrect: false
      };
    }

    return {
      isValid: true,
      confidence: 0.7,
      evidenceLevel: 'moderate',
      reasoning: 'Coordinates within valid range',
      validationMethod: 'coordinate_range',
      shouldCorrect: false
    };
  }

  /**
   * Analyze annotation for visual evidence indicators
   */
  private static analyzeVisualEvidence(annotation: Annotation): CoordinateValidationResult {
    const text = `${annotation.title || ''} ${annotation.description || annotation.feedback || ''}`.toLowerCase();
    
    // Strong visual evidence indicators
    const strongEvidence = [
      'i can see', 'visible at', 'located at', 'positioned at',
      'displays', 'shows the', 'contains text', 'has color',
      'image shows', 'screenshot shows', 'at coordinates'
    ];

    // Moderate visual evidence indicators
    const moderateEvidence = [
      'the button', 'the link', 'the text', 'the image',
      'top left', 'bottom right', 'center of', 'corner',
      'navigation', 'header', 'footer', 'sidebar'
    ];

    // Weak evidence (generic suggestions)
    const weakEvidence = [
      'consider adding', 'should include', 'would benefit',
      'might want to', 'could improve', 'recommend'
    ];

    const strongCount = strongEvidence.filter(phrase => text.includes(phrase)).length;
    const moderateCount = moderateEvidence.filter(phrase => text.includes(phrase)).length;
    const weakCount = weakEvidence.filter(phrase => text.includes(phrase)).length;

    let evidenceLevel: 'none' | 'weak' | 'moderate' | 'strong' = 'none';
    let confidence = 0.1;
    let reasoning = 'No visual evidence indicators found';

    if (strongCount > 0) {
      evidenceLevel = 'strong';
      confidence = 0.9;
      reasoning = `Strong visual evidence: ${strongCount} direct observation indicators`;
    } else if (moderateCount > 1) {
      evidenceLevel = 'moderate';
      confidence = 0.7;
      reasoning = `Moderate visual evidence: ${moderateCount} specific element references`;
    } else if (moderateCount > 0 && weakCount === 0) {
      evidenceLevel = 'moderate';
      confidence = 0.6;
      reasoning = `Some visual evidence: ${moderateCount} element references`;
    } else if (weakCount > 2) {
      evidenceLevel = 'weak';
      confidence = 0.3;
      reasoning = `Weak evidence: ${weakCount} generic suggestions (possible hallucination)`;
    }

    return {
      isValid: evidenceLevel !== 'weak' && evidenceLevel !== 'none',
      confidence,
      evidenceLevel,
      reasoning,
      validationMethod: 'visual_evidence',
      shouldCorrect: false // Never auto-correct based on evidence analysis
    };
  }

  /**
   * Analyze content specificity to detect potential hallucinations
   */
  private static analyzeContentSpecificity(annotation: Annotation): CoordinateValidationResult {
    const text = `${annotation.title || ''} ${annotation.description || annotation.feedback || ''}`;
    
    // Calculate specificity score
    const wordCount = text.split(/\s+/).length;
    const specificTerms = this.countSpecificTerms(text);
    const genericTerms = this.countGenericTerms(text);
    
    const specificityRatio = wordCount > 0 ? specificTerms / wordCount : 0;
    const genericityRatio = wordCount > 0 ? genericTerms / wordCount : 0;
    
    let confidence = 0.5;
    let evidenceLevel: 'none' | 'weak' | 'moderate' | 'strong' = 'moderate';
    let reasoning = 'Standard content specificity';

    if (wordCount < 3) {
      confidence = 0.2;
      evidenceLevel = 'weak';
      reasoning = `Very brief content (${wordCount} words) may lack detail`;
    } else if (genericityRatio > 0.3) {
      confidence = 0.3;
      evidenceLevel = 'weak';
      reasoning = `High generic content ratio (${Math.round(genericityRatio * 100)}%) suggests possible hallucination`;
    } else if (specificityRatio > 0.2) {
      confidence = 0.8;
      evidenceLevel = 'strong';
      reasoning = `High specificity ratio (${Math.round(specificityRatio * 100)}%) indicates detailed observation`;
    } else if (specificityRatio > 0.1) {
      confidence = 0.6;
      evidenceLevel = 'moderate';
      reasoning = `Moderate specificity ratio (${Math.round(specificityRatio * 100)}%)`;
    }

    return {
      isValid: confidence >= 0.4,
      confidence,
      evidenceLevel,
      reasoning,
      validationMethod: 'content_analysis',
      shouldCorrect: false
    };
  }

  /**
   * Count specific terms that indicate detailed observation
   */
  private static countSpecificTerms(text: string): number {
    const specificTerms = [
      'px', 'pixel', 'color:', '#', 'rgb', 'font-size', 'margin', 'padding',
      'contrast', 'accessibility', 'wcag', 'alt text', 'aria-label',
      'placeholder', 'hover', 'focus', 'active', 'disabled',
      'left-aligned', 'right-aligned', 'centered', 'justified'
    ];
    
    const lowerText = text.toLowerCase();
    return specificTerms.filter(term => lowerText.includes(term)).length;
  }

  /**
   * Count generic terms that might indicate hallucination
   */
  private static countGenericTerms(text: string): number {
    const genericTerms = [
      'good practice', 'best practice', 'should consider', 'might want',
      'could improve', 'would help', 'it is important', 'users expect',
      'generally', 'usually', 'often', 'typically', 'commonly'
    ];
    
    const lowerText = text.toLowerCase();
    return genericTerms.filter(term => lowerText.includes(term)).length;
  }

  /**
   * Check for suspicious coordinate patterns
   */
  private static isSuspiciousCoordinate(x: number, y: number): boolean {
    // Common suspicious patterns
    const suspiciousPatterns = [
      { x: 50, y: 50, tolerance: 3 }, // Too many center points
      { x: 0, y: 0, tolerance: 1 },   // Origin clustering
      { x: 100, y: 100, tolerance: 1 }, // Corner clustering
      { x: 25, y: 25, tolerance: 2 }, // Quarter points
      { x: 75, y: 75, tolerance: 2 }  // Three-quarter points
    ];

    return suspiciousPatterns.some(pattern => 
      Math.abs(x - pattern.x) <= pattern.tolerance && 
      Math.abs(y - pattern.y) <= pattern.tolerance
    );
  }

  /**
   * Combine multiple validation results
   */
  private static combineValidationResults(
    evidenceResult: CoordinateValidationResult,
    contentResult: CoordinateValidationResult
  ): CoordinateValidationResult {
    // Use the highest confidence validation
    const bestResult = evidenceResult.confidence >= contentResult.confidence 
      ? evidenceResult 
      : contentResult;

    // Combine reasoning
    const combinedReasoning = `${bestResult.reasoning}. Evidence: ${evidenceResult.evidenceLevel}, Content: ${contentResult.evidenceLevel}`;

    return {
      ...bestResult,
      reasoning: combinedReasoning,
      shouldCorrect: false // Never auto-correct in improved validator
    };
  }

  /**
   * Generate validation metrics for a batch of annotations
   */
  static generateValidationMetrics(
    annotations: Annotation[],
    validationResults: CoordinateValidationResult[]
  ): ValidationMetrics {
    const validCount = validationResults.filter(r => r.isValid).length;
    const evidenceLevels = validationResults.reduce((acc, result) => {
      acc[result.evidenceLevel] = (acc[result.evidenceLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageConfidence = validationResults.length > 0
      ? validationResults.reduce((sum, r) => sum + r.confidence, 0) / validationResults.length
      : 0;

    return {
      totalAnnotations: annotations.length,
      validCount,
      invalidCount: annotations.length - validCount,
      evidenceLevels,
      averageConfidence
    };
  }

  /**
   * Filter annotations by validation confidence
   */
  static filterByConfidence(
    annotations: Annotation[],
    validationResults: CoordinateValidationResult[],
    minConfidence: number = 0.6
  ): {
    validAnnotations: Annotation[];
    filteredAnnotations: Annotation[];
    filterReason: Record<string, string>;
  } {
    const validAnnotations: Annotation[] = [];
    const filteredAnnotations: Annotation[] = [];
    const filterReason: Record<string, string> = {};

    annotations.forEach((annotation, index) => {
      const validation = validationResults[index];
      
      if (validation && validation.confidence >= minConfidence) {
        validAnnotations.push(annotation);
      } else {
        filteredAnnotations.push(annotation);
        filterReason[annotation.id] = validation?.reasoning || 'No validation result';
      }
    });

    return {
      validAnnotations,
      filteredAnnotations,
      filterReason
    };
  }
}