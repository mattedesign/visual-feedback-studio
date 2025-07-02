import { Annotation } from '@/types/analysis';
import { visualGroundingService, GroundingValidationResult } from './visualGroundingService';
import { ragContentValidator, RagValidationResult, RagImpactAnalysis } from './ragContentValidator';

export interface QualityControlOptions {
  enableVisualValidation: boolean;
  enableRagValidation: boolean;
  enableHallucinationDetection: boolean;
  minimumQualityThreshold: number;
  maxRetryAttempts: number;
}

export interface QualityControlResult {
  overallQuality: number;
  visualGroundingScore: number;
  ragQualityScore: number;
  hallucinationRisk: number;
  validatedAnnotations: Annotation[];
  qualityIssues: QualityIssue[];
  recommendations: string[];
  shouldRetry: boolean;
}

export interface QualityIssue {
  type: 'visual_grounding' | 'rag_content' | 'hallucination' | 'coordinate_accuracy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedAnnotations: string[];
  suggestedFix: string;
}

export interface AnalysisQualityMetrics {
  accuracyScore: number;
  relevanceScore: number;
  specificityScore: number;
  groundingScore: number;
  overallScore: number;
  issues: QualityIssue[];
}

class AnalysisQualityController {
  private readonly DEFAULT_OPTIONS: QualityControlOptions = {
    enableVisualValidation: true,
    enableRagValidation: true,
    enableHallucinationDetection: true,
    minimumQualityThreshold: 0.7,
    maxRetryAttempts: 2
  };

  /**
   * Comprehensive quality control for analysis results
   */
  async performQualityControl(
    annotations: Annotation[],
    imageUrls: string[],
    ragResult?: RagValidationResult,
    ragImpact?: RagImpactAnalysis,
    options: Partial<QualityControlOptions> = {}
  ): Promise<QualityControlResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log('🎯 Quality Controller: Starting comprehensive quality control', {
      annotationCount: annotations.length,
      imageCount: imageUrls.length,
      enabledValidations: {
        visual: opts.enableVisualValidation,
        rag: opts.enableRagValidation,
        hallucination: opts.enableHallucinationDetection
      }
    });

    const qualityIssues: QualityIssue[] = [];
    let validatedAnnotations = [...annotations];
    let visualGroundingScore = 1.0;
    let ragQualityScore = ragResult?.overallQuality || 1.0;
    let hallucinationRisk = ragImpact?.hallucinationRisk || 0;

    // 1. Visual Grounding Validation
    if (opts.enableVisualValidation) {
      const visualValidation = visualGroundingService.validateAnnotations(annotations, imageUrls);
      const visualIssues = this.processVisualValidation(visualValidation, annotations);
      qualityIssues.push(...visualIssues);
      
      visualGroundingScore = this.calculateVisualGroundingScore(visualValidation);
      validatedAnnotations = this.filterByVisualValidation(validatedAnnotations, visualValidation);
    }

    // 2. Hallucination Detection
    if (opts.enableHallucinationDetection) {
      const hallucinationIssues = this.detectHallucinations(validatedAnnotations, imageUrls);
      qualityIssues.push(...hallucinationIssues);
      
      if (ragImpact) {
        hallucinationRisk = ragImpact.hallucinationRisk;
        if (hallucinationRisk > 0.7) {
          qualityIssues.push({
            type: 'hallucination',
            severity: 'high',
            description: 'High hallucination risk detected from RAG content',
            affectedAnnotations: [],
            suggestedFix: 'Reduce RAG content volume or improve filtering'
          });
        }
      }
    }

    // 3. Coordinate Accuracy Validation
    const coordinateIssues = this.validateCoordinateAccuracy(validatedAnnotations);
    qualityIssues.push(...coordinateIssues);

    // 4. Content Specificity Check
    const specificityIssues = this.checkContentSpecificity(validatedAnnotations);
    qualityIssues.push(...specificityIssues);

    // Calculate overall quality
    const overallQuality = this.calculateOverallQuality(
      visualGroundingScore,
      ragQualityScore,
      hallucinationRisk,
      qualityIssues
    );

    // Generate recommendations
    const recommendations = this.generateQualityRecommendations(
      qualityIssues,
      overallQuality,
      opts
    );

    // Determine if retry is needed
    const shouldRetry = overallQuality < opts.minimumQualityThreshold && 
                       qualityIssues.some(issue => issue.severity === 'critical');

    console.log('✅ Quality Controller: Quality control complete', {
      overallQuality,
      visualGroundingScore,
      ragQualityScore,
      hallucinationRisk,
      issueCount: qualityIssues.length,
      shouldRetry
    });

    return {
      overallQuality,
      visualGroundingScore,
      ragQualityScore,
      hallucinationRisk,
      validatedAnnotations,
      qualityIssues,
      recommendations,
      shouldRetry
    };
  }

  /**
   * Calculate comprehensive quality metrics
   */
  calculateAnalysisMetrics(
    annotations: Annotation[],
    imageUrls: string[],
    qualityResult: QualityControlResult
  ): AnalysisQualityMetrics {
    const accuracyScore = this.calculateAccuracyScore(annotations, qualityResult);
    const relevanceScore = this.calculateRelevanceScore(annotations);
    const specificityScore = this.calculateSpecificityScore(annotations);
    const groundingScore = qualityResult.visualGroundingScore;
    
    const overallScore = (
      accuracyScore * 0.3 +
      relevanceScore * 0.2 +
      specificityScore * 0.2 +
      groundingScore * 0.3
    );

    return {
      accuracyScore,
      relevanceScore,
      specificityScore,
      groundingScore,
      overallScore,
      issues: qualityResult.qualityIssues
    };
  }

  /**
   * Process visual validation results
   */
  private processVisualValidation(
    validationResults: GroundingValidationResult[],
    annotations: Annotation[]
  ): QualityIssue[] {
    const issues: QualityIssue[] = [];

    validationResults.forEach((result, index) => {
      if (!result.isValid) {
        const annotation = annotations[index];
        const severity = result.confidence < 0.3 ? 'critical' : 
                        result.confidence < 0.5 ? 'high' : 'medium';
        
        issues.push({
          type: 'visual_grounding',
          severity,
          description: `Visual grounding validation failed: ${result.reasons.join(', ')}`,
          affectedAnnotations: [annotation.id],
          suggestedFix: result.suggestedCorrections.join('; ')
        });
      }
    });

    return issues;
  }

  /**
   * Calculate visual grounding score
   */
  private calculateVisualGroundingScore(validationResults: GroundingValidationResult[]): number {
    if (validationResults.length === 0) return 1.0;
    
    const validCount = validationResults.filter(r => r.isValid).length;
    const avgConfidence = validationResults.reduce((sum, r) => sum + r.confidence, 0) / validationResults.length;
    
    return (validCount / validationResults.length) * 0.7 + avgConfidence * 0.3;
  }

  /**
   * Filter annotations by visual validation
   */
  private filterByVisualValidation(
    annotations: Annotation[],
    validationResults: GroundingValidationResult[]
  ): Annotation[] {
    return annotations.filter((_, index) => 
      validationResults[index]?.isValid !== false
    );
  }

  /**
   * Detect potential hallucinations
   */
  private detectHallucinations(annotations: Annotation[], imageUrls: string[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    // Check for suspicious patterns
    const suspiciousPatterns = this.detectSuspiciousPatterns(annotations);
    issues.push(...suspiciousPatterns);
    
    // Check for generic feedback
    const genericIssues = this.detectGenericFeedback(annotations);
    issues.push(...genericIssues);
    
    // Check for impossible coordinates
    const coordinateIssues = this.detectImpossibleCoordinates(annotations);
    issues.push(...coordinateIssues);
    
    return issues;
  }

  /**
   * Detect suspicious patterns
   */
  private detectSuspiciousPatterns(annotations: Annotation[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    // Too many annotations in center
    const centerAnnotations = annotations.filter(a => 
      Math.abs(a.x - 50) < 10 && Math.abs(a.y - 50) < 10
    );
    
    if (centerAnnotations.length > annotations.length * 0.4) {
      issues.push({
        type: 'hallucination',
        severity: 'high',
        description: 'Suspicious clustering of annotations in center area',
        affectedAnnotations: centerAnnotations.map(a => a.id),
        suggestedFix: 'Verify that elements actually exist at these center coordinates'
      });
    }
    
    // Check for identical coordinates
    const coordinateGroups = new Map<string, Annotation[]>();
    annotations.forEach(annotation => {
      const key = `${Math.round(annotation.x)},${Math.round(annotation.y)}`;
      if (!coordinateGroups.has(key)) {
        coordinateGroups.set(key, []);
      }
      coordinateGroups.get(key)!.push(annotation);
    });
    
    coordinateGroups.forEach((group, coordinates) => {
      if (group.length > 2) {
        issues.push({
          type: 'coordinate_accuracy',
          severity: 'medium',
          description: `Multiple annotations at same coordinates: ${coordinates}`,
          affectedAnnotations: group.map(a => a.id),
          suggestedFix: 'Verify that multiple elements actually exist at this location'
        });
      }
    });
    
    return issues;
  }

  /**
   * Detect generic feedback
   */
  private detectGenericFeedback(annotations: Annotation[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    const genericPhrases = [
      'consider adding', 'could be improved', 'might benefit', 'should include',
      'would help', 'may want to', 'could use', 'might consider'
    ];
    
    annotations.forEach(annotation => {
      const text = `${annotation.title} ${annotation.description || annotation.feedback || ''}`.toLowerCase();
      const genericCount = genericPhrases.filter(phrase => text.includes(phrase)).length;
      
      if (genericCount > 1) {
        issues.push({
          type: 'hallucination',
          severity: 'medium',
          description: 'Annotation contains too many generic suggestions',
          affectedAnnotations: [annotation.id],
          suggestedFix: 'Provide more specific, visually-grounded feedback'
        });
      }
    });
    
    return issues;
  }

  /**
   * Detect impossible coordinates
   */
  private detectImpossibleCoordinates(annotations: Annotation[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    annotations.forEach(annotation => {
      if (annotation.x < 0 || annotation.x > 100 || annotation.y < 0 || annotation.y > 100) {
        issues.push({
          type: 'coordinate_accuracy',
          severity: 'critical',
          description: `Coordinates outside valid range: (${annotation.x}, ${annotation.y})`,
          affectedAnnotations: [annotation.id],
          suggestedFix: 'Correct coordinates to be within 0-100 range'
        });
      }
    });
    
    return issues;
  }

  /**
   * Validate coordinate accuracy
   */
  private validateCoordinateAccuracy(annotations: Annotation[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    // Check for coordinate precision issues
    annotations.forEach(annotation => {
      const hasDecimalPrecision = annotation.x % 1 !== 0 || annotation.y % 1 !== 0;
      if (!hasDecimalPrecision && annotations.length > 5) {
        issues.push({
          type: 'coordinate_accuracy',
          severity: 'low',
          description: 'Coordinates lack decimal precision, may indicate approximation',
          affectedAnnotations: [annotation.id],
          suggestedFix: 'Ensure coordinates are precisely positioned on elements'
        });
      }
    });
    
    return issues;
  }

  /**
   * Check content specificity
   */
  private checkContentSpecificity(annotations: Annotation[]): QualityIssue[] {
    const issues: QualityIssue[] = [];
    
    annotations.forEach(annotation => {
      const text = `${annotation.title} ${annotation.description || annotation.feedback || ''}`;
      const wordCount = text.split(/\s+/).length;
      
      if (wordCount < 5) {
        issues.push({
          type: 'hallucination',
          severity: 'medium',
          description: 'Annotation content too brief, may lack visual grounding',
          affectedAnnotations: [annotation.id],
          suggestedFix: 'Provide more detailed description of observed elements'
        });
      }
    });
    
    return issues;
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQuality(
    visualGroundingScore: number,
    ragQualityScore: number,
    hallucinationRisk: number,
    issues: QualityIssue[]
  ): number {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    
    let qualityScore = (
      visualGroundingScore * 0.4 +
      ragQualityScore * 0.3 +
      (1 - hallucinationRisk) * 0.3
    );
    
    // Penalize for issues
    qualityScore -= criticalIssues * 0.2;
    qualityScore -= highIssues * 0.1;
    
    return Math.max(0, Math.min(1, qualityScore));
  }

  /**
   * Generate quality recommendations
   */
  private generateQualityRecommendations(
    issues: QualityIssue[],
    overallQuality: number,
    options: QualityControlOptions
  ): string[] {
    const recommendations: string[] = [];
    
    if (overallQuality < 0.5) {
      recommendations.push('Overall quality is low - consider regenerating analysis');
    }
    
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    if (criticalIssues > 0) {
      recommendations.push(`${criticalIssues} critical issues detected - immediate attention required`);
    }
    
    const visualIssues = issues.filter(i => i.type === 'visual_grounding').length;
    if (visualIssues > 3) {
      recommendations.push('Multiple visual grounding issues - improve image analysis prompts');
    }
    
    const hallucinationIssues = issues.filter(i => i.type === 'hallucination').length;
    if (hallucinationIssues > 2) {
      recommendations.push('Potential hallucinations detected - reduce RAG content or improve filtering');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Analysis quality meets standards');
    }
    
    return recommendations;
  }

  /**
   * Calculate accuracy score
   */
  private calculateAccuracyScore(annotations: Annotation[], qualityResult: QualityControlResult): number {
    const validAnnotations = qualityResult.validatedAnnotations.length;
    const totalAnnotations = annotations.length;
    
    if (totalAnnotations === 0) return 1.0;
    
    return validAnnotations / totalAnnotations;
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevanceScore(annotations: Annotation[]): number {
    // This is a simplified relevance calculation
    // In a real implementation, this would check against the analysis prompt
    const specificTerms = ['button', 'link', 'text', 'image', 'form', 'navigation'];
    
    let relevantCount = 0;
    annotations.forEach(annotation => {
      const text = `${annotation.title} ${annotation.description || annotation.feedback || ''}`.toLowerCase();
      if (specificTerms.some(term => text.includes(term))) {
        relevantCount++;
      }
    });
    
    return annotations.length > 0 ? relevantCount / annotations.length : 1.0;
  }

  /**
   * Calculate specificity score
   */
  private calculateSpecificityScore(annotations: Annotation[]): number {
    if (annotations.length === 0) return 1.0;
    
    let totalSpecificity = 0;
    
    annotations.forEach(annotation => {
      const text = `${annotation.title} ${annotation.description || annotation.feedback || ''}`;
      const words = text.split(/\s+/).length;
      const specificWords = text.toLowerCase().split(/\s+/).filter(word => 
        word.length > 4 && !['could', 'should', 'would', 'might', 'maybe'].includes(word)
      ).length;
      
      totalSpecificity += words > 0 ? specificWords / words : 0;
    });
    
    return totalSpecificity / annotations.length;
  }
}

export const analysisQualityController = new AnalysisQualityController();