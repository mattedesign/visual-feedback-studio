import { Annotation } from '@/types/analysis';
import { ImprovedCoordinateValidator, CoordinateValidationResult, ValidationMetrics } from './improvedCoordinateValidator';

export interface PerplexityValidationResult extends CoordinateValidationResult {
  hasPerplexityResearch: boolean;
  researchConfidence: number;
  researchIndicators: string[];
  researchQualityScore: number;
  citationCount: number;
}

export interface PerplexityValidationMetrics extends ValidationMetrics {
  researchBackedCount: number;
  averageResearchConfidence: number;
  researchIndicatorDistribution: Record<string, number>;
  preservedResearchAnnotations: number;
}

/**
 * Enhanced validator that prioritizes Perplexity research-backed annotations
 * and applies dynamic confidence thresholds based on research quality
 */
export class PerplexityEnhancedValidator {
  private static readonly DEFAULT_CONFIDENCE_THRESHOLD = 0.7;
  private static readonly RESEARCH_CONFIDENCE_THRESHOLD = 0.45; // Much lower threshold for research content
  private static readonly RESEARCH_CONFIDENCE_BOOST = 0.3; // Significant boost for research content
  private static readonly MIN_RESEARCH_QUALITY_THRESHOLD = 0.6;

  // Expanded research indicator patterns for better detection
  private static readonly RESEARCH_INDICATORS = {
    // Strong research indicators (peer-reviewed, academic)
    strong: [
      'research shows', 'studies indicate', 'according to research', 'data suggests',
      'peer-reviewed', 'academic research', 'scientific study', 'empirical evidence',
      'meta-analysis', 'longitudinal study', 'controlled study', 'research foundation',
      'evidence-based', 'validated by research', 'research demonstrates', 'study findings',
      'research-backed recommendation', 'evidence supports', 'research validates'
    ],
    
    // Industry/expert research indicators
    industry: [
      'industry standard', 'best practice', 'nielsen research', 'baymard institute',
      'ux research', 'user research', 'usability study', 'user testing',
      'a/b testing', 'conversion research', 'behavioral research', 'design research',
      'industry benchmark', 'market research', 'competitive analysis', 'industry data',
      'expert analysis', 'professional recommendation', 'industry expert'
    ],
    
    // Trend and competitive analysis indicators
    competitive: [
      'trend analysis', 'market trends', 'industry trends', 'emerging patterns',
      'competitor analysis', 'competitive intelligence', 'market intelligence',
      'industry insights', 'market data', 'competitive benchmarking',
      'industry comparison', 'market leader', 'industry practice'
    ],
    
    // Perplexity-specific indicators
    perplexity: [
      'perplexity research', 'perplexity analysis', 'perplexity data',
      'real-time research', 'current research', 'latest research',
      'up-to-date research', 'recent studies', 'current data',
      'validated information', 'verified data', 'cross-referenced'
    ],
    
    // Authority and credibility indicators
    authority: [
      'according to experts', 'research consensus', 'established practice',
      'proven approach', 'tested methodology', 'verified approach',
      'authoritative source', 'credible research', 'reliable data',
      'trusted source', 'established research', 'documented evidence'
    ]
  };

  /**
   * Enhanced validation that detects and prioritizes Perplexity research content
   */
  static validateAnnotation(annotation: Annotation): PerplexityValidationResult {
    console.log('🔬 Perplexity-Enhanced Validation:', {
      id: annotation.id,
      coordinates: { x: annotation.x, y: annotation.y },
      title: annotation.title?.substring(0, 50)
    });

    // Get base validation from improved validator
    const baseValidation = ImprovedCoordinateValidator.validateAnnotation(annotation);
    
    // Detect Perplexity research content
    const researchAnalysis = this.analyzeResearchContent(annotation);
    
    // Apply research-based confidence adjustments
    const enhancedValidation = this.applyResearchEnhancements(baseValidation, researchAnalysis);
    
    return {
      ...enhancedValidation,
      ...researchAnalysis,
      isValid: this.determineValidityWithResearch(enhancedValidation, researchAnalysis),
      confidence: this.calculateEnhancedConfidence(baseValidation.confidence, researchAnalysis)
    };
  }

  /**
   * Analyze annotation content for research indicators and quality
   */
  private static analyzeResearchContent(annotation: Annotation): {
    hasPerplexityResearch: boolean;
    researchConfidence: number;
    researchIndicators: string[];
    researchQualityScore: number;
    citationCount: number;
  } {
    const text = `${annotation.title || ''} ${annotation.description || annotation.feedback || ''}`.toLowerCase();
    
    // Find all research indicators
    const foundIndicators: string[] = [];
    let categoryWeights = { strong: 0, industry: 0, competitive: 0, perplexity: 0, authority: 0 };
    
    Object.entries(this.RESEARCH_INDICATORS).forEach(([category, indicators]) => {
      indicators.forEach(indicator => {
        if (text.includes(indicator.toLowerCase())) {
          foundIndicators.push(indicator);
          categoryWeights[category as keyof typeof categoryWeights]++;
        }
      });
    });

    // Calculate research quality score based on indicator types and frequency
    const researchQualityScore = this.calculateResearchQualityScore(categoryWeights, foundIndicators.length);
    
    // Calculate research confidence
    const researchConfidence = this.calculateResearchConfidence(categoryWeights, foundIndicators.length, text.length);
    
    // Check for citation indicators
    const citationCount = this.estimateCitationCount(text);
    
    const hasPerplexityResearch = foundIndicators.length > 0 || researchConfidence > 0.3;

    if (hasPerplexityResearch) {
      console.log('🔬 Research Content Detected:', {
        annotationId: annotation.id,
        indicators: foundIndicators,
        categoryWeights,
        researchQualityScore: Math.round(researchQualityScore * 100) + '%',
        researchConfidence: Math.round(researchConfidence * 100) + '%',
        citationCount
      });
    }

    return {
      hasPerplexityResearch,
      researchConfidence,
      researchIndicators: foundIndicators,
      researchQualityScore,
      citationCount
    };
  }

  /**
   * Calculate research quality score based on indicator categories
   */
  private static calculateResearchQualityScore(
    categoryWeights: Record<string, number>,
    totalIndicators: number
  ): number {
    if (totalIndicators === 0) return 0;

    // Weight different categories by research credibility
    const weights = {
      strong: 1.0,      // Peer-reviewed, academic
      authority: 0.9,   // Expert sources
      industry: 0.8,    // Industry standards, UX research
      perplexity: 0.7,  // Perplexity-specific
      competitive: 0.6  // Market analysis
    };

    let weightedScore = 0;
    let maxPossibleScore = 0;

    Object.entries(categoryWeights).forEach(([category, count]) => {
      const weight = weights[category as keyof typeof weights] || 0.5;
      weightedScore += count * weight;
      maxPossibleScore += count * 1.0; // Maximum possible weight
    });

    // Normalize score and add bonus for multiple categories
    const normalizedScore = maxPossibleScore > 0 ? weightedScore / maxPossibleScore : 0;
    const categoryDiversityBonus = Object.keys(categoryWeights).filter(k => categoryWeights[k] > 0).length * 0.05;
    
    return Math.min(1.0, normalizedScore + categoryDiversityBonus);
  }

  /**
   * Calculate research confidence based on multiple factors
   */
  private static calculateResearchConfidence(
    categoryWeights: Record<string, number>,
    indicatorCount: number,
    textLength: number
  ): number {
    if (indicatorCount === 0) return 0;

    // Base confidence from indicator count (diminishing returns)
    const baseConfidence = Math.min(0.8, indicatorCount * 0.15);
    
    // Bonus for high-value research categories
    const strongResearchBonus = (categoryWeights.strong + categoryWeights.authority) * 0.1;
    
    // Length factor (longer, more detailed content gets slight boost)
    const lengthFactor = Math.min(0.1, textLength / 1000);
    
    // Multiple category bonus
    const categoryDiversity = Object.keys(categoryWeights).filter(k => categoryWeights[k] > 0).length;
    const diversityBonus = categoryDiversity > 1 ? 0.1 : 0;

    return Math.min(1.0, baseConfidence + strongResearchBonus + lengthFactor + diversityBonus);
  }

  /**
   * Estimate citation count from text patterns
   */
  private static estimateCitationCount(text: string): number {
    const citationPatterns = [
      /\([\d,\s]+\)/g,  // (2023), (Smith, 2023)
      /\[\d+\]/g,       // [1], [15]
      /source\s*[:]\s*/gi, // Source:
      /according\s+to\s+/gi, // According to
      /research\s+by\s+/gi,  // Research by
      /study\s+from\s+/gi    // Study from
    ];

    let estimatedCitations = 0;
    citationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        estimatedCitations += matches.length;
      }
    });

    return estimatedCitations;
  }

  /**
   * Apply research-based enhancements to validation result
   */
  private static applyResearchEnhancements(
    baseValidation: CoordinateValidationResult,
    researchAnalysis: any
  ): CoordinateValidationResult {
    if (!researchAnalysis.hasPerplexityResearch) {
      return baseValidation;
    }

    // Enhance evidence level for research-backed content
    let enhancedEvidenceLevel = baseValidation.evidenceLevel;
    if (researchAnalysis.researchQualityScore > 0.8) {
      enhancedEvidenceLevel = 'strong';
    } else if (researchAnalysis.researchQualityScore > 0.6) {
      enhancedEvidenceLevel = enhancedEvidenceLevel === 'weak' ? 'moderate' : enhancedEvidenceLevel;
    }

    // Enhance reasoning with research context
    const researchReasoning = `Research-backed content detected (${researchAnalysis.researchIndicators.length} indicators, quality: ${Math.round(researchAnalysis.researchQualityScore * 100)}%). ${baseValidation.reasoning}`;

    return {
      ...baseValidation,
      evidenceLevel: enhancedEvidenceLevel,
      reasoning: researchReasoning,
      validationMethod: 'visual_evidence' // Maintain original method
    };
  }

  /**
   * Determine validity using research-aware criteria
   */
  private static determineValidityWithResearch(
    validation: CoordinateValidationResult,
    researchAnalysis: any
  ): boolean {
    // Research-backed content gets special consideration
    if (researchAnalysis.hasPerplexityResearch) {
      // Lower threshold for high-quality research
      if (researchAnalysis.researchQualityScore > 0.7) {
        return validation.confidence > 0.3; // Very low threshold for high-quality research
      }
      // Moderate threshold for any research content
      if (researchAnalysis.researchConfidence > 0.4) {
        return validation.confidence > this.RESEARCH_CONFIDENCE_THRESHOLD;
      }
    }
    
    // Standard threshold for non-research content
    return validation.confidence >= this.DEFAULT_CONFIDENCE_THRESHOLD;
  }

  /**
   * Calculate enhanced confidence with research boost
   */
  private static calculateEnhancedConfidence(
    baseConfidence: number,
    researchAnalysis: any
  ): number {
    if (!researchAnalysis.hasPerplexityResearch) {
      return baseConfidence;
    }

    // Apply research boost based on quality
    const researchBoost = this.RESEARCH_CONFIDENCE_BOOST * researchAnalysis.researchQualityScore;
    const enhancedConfidence = baseConfidence + researchBoost;

    console.log('🔬 Research Confidence Boost Applied:', {
      baseConfidence: Math.round(baseConfidence * 100) + '%',
      researchBoost: Math.round(researchBoost * 100) + '%',
      enhancedConfidence: Math.round(enhancedConfidence * 100) + '%',
      researchQuality: Math.round(researchAnalysis.researchQualityScore * 100) + '%'
    });

    return Math.min(1.0, enhancedConfidence);
  }

  /**
   * Generate enhanced validation metrics with research tracking
   */
  static generateValidationMetrics(
    annotations: Annotation[],
    validationResults: PerplexityValidationResult[]
  ): PerplexityValidationMetrics {
    const baseMetrics = ImprovedCoordinateValidator.generateValidationMetrics(annotations, validationResults);
    
    const researchBackedCount = validationResults.filter(r => r.hasPerplexityResearch).length;
    const researchResults = validationResults.filter(r => r.hasPerplexityResearch);
    
    const averageResearchConfidence = researchResults.length > 0
      ? researchResults.reduce((sum, r) => sum + r.researchConfidence, 0) / researchResults.length
      : 0;

    // Track research indicator distribution
    const researchIndicatorDistribution: Record<string, number> = {};
    validationResults.forEach(result => {
      result.researchIndicators.forEach(indicator => {
        researchIndicatorDistribution[indicator] = (researchIndicatorDistribution[indicator] || 0) + 1;
      });
    });

    const preservedResearchAnnotations = validationResults.filter(r => 
      r.hasPerplexityResearch && r.isValid
    ).length;

    console.log('📊 Enhanced Validation Metrics:', {
      totalAnnotations: annotations.length,
      researchBackedCount,
      preservedResearchAnnotations,
      researchPreservationRate: researchBackedCount > 0 ? Math.round((preservedResearchAnnotations / researchBackedCount) * 100) + '%' : '0%',
      averageResearchConfidence: Math.round(averageResearchConfidence * 100) + '%'
    });

    return {
      ...baseMetrics,
      researchBackedCount,
      averageResearchConfidence,
      researchIndicatorDistribution,
      preservedResearchAnnotations
    };
  }

  /**
   * Filter annotations with research priority preservation
   */
  static filterWithResearchPriority(
    annotations: Annotation[],
    validationResults: PerplexityValidationResult[],
    options: {
      standardThreshold?: number;
      researchThreshold?: number;
      preserveHighQualityResearch?: boolean;
    } = {}
  ): {
    validAnnotations: Annotation[];
    filteredAnnotations: Annotation[];
    researchPreserved: Annotation[];
    filterReason: Record<string, string>;
  } {
    const {
      standardThreshold = this.DEFAULT_CONFIDENCE_THRESHOLD,
      researchThreshold = this.RESEARCH_CONFIDENCE_THRESHOLD,
      preserveHighQualityResearch = true
    } = options;

    const validAnnotations: Annotation[] = [];
    const filteredAnnotations: Annotation[] = [];
    const researchPreserved: Annotation[] = [];
    const filterReason: Record<string, string> = {};

    annotations.forEach((annotation, index) => {
      const validation = validationResults[index];
      
      if (!validation) {
        filteredAnnotations.push(annotation);
        filterReason[annotation.id] = 'No validation result';
        return;
      }

      // Research-backed content gets priority treatment
      if (validation.hasPerplexityResearch) {
        const effectiveThreshold = preserveHighQualityResearch && validation.researchQualityScore > 0.7
          ? 0.3 // Very low threshold for high-quality research
          : researchThreshold;

        if (validation.confidence >= effectiveThreshold) {
          validAnnotations.push(annotation);
          researchPreserved.push(annotation);
          console.log('🔬 Research Annotation Preserved:', {
            id: annotation.id,
            confidence: Math.round(validation.confidence * 100) + '%',
            threshold: Math.round(effectiveThreshold * 100) + '%',
            researchQuality: Math.round(validation.researchQualityScore * 100) + '%'
          });
        } else {
          filteredAnnotations.push(annotation);
          filterReason[annotation.id] = `Research content below threshold: ${Math.round(validation.confidence * 100)}% < ${Math.round(effectiveThreshold * 100)}%`;
        }
      } else {
        // Standard filtering for non-research content
        if (validation.confidence >= standardThreshold) {
          validAnnotations.push(annotation);
        } else {
          filteredAnnotations.push(annotation);
          filterReason[annotation.id] = `Below standard threshold: ${Math.round(validation.confidence * 100)}% < ${Math.round(standardThreshold * 100)}%`;
        }
      }
    });

    console.log('🎯 Research Priority Filtering Results:', {
      totalAnnotations: annotations.length,
      validAnnotations: validAnnotations.length,
      filteredAnnotations: filteredAnnotations.length,
      researchPreserved: researchPreserved.length,
      researchPreservationRate: validationResults.filter(r => r.hasPerplexityResearch).length > 0 
        ? Math.round((researchPreserved.length / validationResults.filter(r => r.hasPerplexityResearch).length) * 100) + '%'
        : '0%'
    });

    return {
      validAnnotations,
      filteredAnnotations,
      researchPreserved,
      filterReason
    };
  }
}