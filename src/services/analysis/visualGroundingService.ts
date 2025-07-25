import { Annotation } from '@/types/analysis';

export interface VisualGroundingOptions {
  requireVisualEvidence: boolean;
  minimumConfidenceThreshold: number;
  enableCoordinateValidation: boolean;
  maxAnnotationsPerImage: number;
}

export interface VisualGroundingResult {
  enhancedPrompt: string;
  validationRules: string[];
  coordinateInstructions: string;
  evidenceRequirements: string;
}

export interface GroundingValidationResult {
  isValid: boolean;
  confidence: number;
  reasons: string[];
  suggestedCorrections: string[];
}

class VisualGroundingService {
  private readonly DEFAULT_OPTIONS: VisualGroundingOptions = {
    requireVisualEvidence: true,
    minimumConfidenceThreshold: 0.8,
    enableCoordinateValidation: true,
    maxAnnotationsPerImage: 15
  };

  /**
   * Enhanced visual grounding prompt builder
   */
  buildVisuallyGroundedPrompt(
    originalPrompt: string,
    imageUrls: string[],
    options: Partial<VisualGroundingOptions> = {}
  ): VisualGroundingResult {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log('🎯 Visual Grounding: Building enhanced prompt', {
      imageCount: imageUrls.length,
      options: opts
    });

    const visualGroundingInstructions = this.generateVisualGroundingInstructions(opts);
    const coordinateInstructions = this.generateCoordinateInstructions();
    const evidenceRequirements = this.generateEvidenceRequirements();
    const validationRules = this.generateValidationRules(opts);

    const enhancedPrompt = `${originalPrompt}

=== CRITICAL VISUAL GROUNDING INSTRUCTIONS ===
${visualGroundingInstructions}

=== COORDINATE ACCURACY REQUIREMENTS ===
${coordinateInstructions}

=== VISUAL EVIDENCE REQUIREMENTS ===
${evidenceRequirements}

=== VALIDATION RULES ===
${validationRules.join('\n')}

REMEMBER: Only provide feedback about elements that are CLEARLY VISIBLE in the provided images. If you cannot see an element, do not comment on it.`;

    return {
      enhancedPrompt,
      validationRules,
      coordinateInstructions,
      evidenceRequirements
    };
  }

  /**
   * Validate annotations against visual grounding requirements
   */
  validateAnnotations(
    annotations: Annotation[],
    imageUrls: string[],
    options: Partial<VisualGroundingOptions> = {}
  ): GroundingValidationResult[] {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log('🎯 Visual Grounding: Validating annotations with enhanced evidence checking', {
      annotationCount: annotations.length,
      imageCount: imageUrls.length,
      requireVisualEvidence: opts.requireVisualEvidence
    });
    
    const results = annotations.map(annotation => this.validateSingleAnnotation(annotation, opts));
    
    // Log validation summary
    const validCount = results.filter(r => r.isValid).length;
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    
    console.log('✅ Visual Grounding: Validation complete', {
      validAnnotations: validCount,
      totalAnnotations: annotations.length,
      averageConfidence: Math.round(averageConfidence * 100) + '%',
      qualityThreshold: opts.minimumConfidenceThreshold
    });
    
    return results;
  }

  /**
   * Generate visual grounding instructions
   */
  private generateVisualGroundingInstructions(options: VisualGroundingOptions): string {
    return `
1. VISUAL VERIFICATION REQUIRED: Before commenting on any UI element, you must first visually confirm it exists in the image.

2. COORDINATE ACCURACY: All x,y coordinates must point to actual visible elements. Do not guess coordinates.

3. NO HALLUCINATIONS: If you cannot clearly see an element (button, text, image, etc.), do not provide feedback about it.

4. CONFIDENCE THRESHOLD: Only provide feedback with confidence >= ${options.minimumConfidenceThreshold}.

5. MAXIMUM ANNOTATIONS: Limit to ${options.maxAnnotationsPerImage} annotations per image to ensure quality over quantity.

6. ELEMENT VERIFICATION: For each annotation, first describe what you see at that location, then provide the feedback.`;
  }

  /**
   * Generate coordinate accuracy instructions
   */
  private generateCoordinateInstructions(): string {
    return `
1. PRECISE POSITIONING: x,y coordinates must point exactly to the center of the element you're analyzing.

2. COORDINATE VALIDATION: Before setting coordinates, mentally verify the element exists at that location.

3. ELEMENT BOUNDARIES: Ensure coordinates fall within the actual element boundaries, not just near them.

4. VISUAL CONFIRMATION: If you cannot see exactly where an element is located, do not provide coordinates.`;
  }

  /**
   * Generate evidence requirements
   */
  private generateEvidenceRequirements(): string {
    return `
1. VISUAL EVIDENCE: Each annotation must reference something you can actually see in the image.

2. DESCRIPTIVE VALIDATION: Start each feedback with "I can see [element description] at this location..."

3. NO ASSUMPTIONS: Do not make feedback based on common UI patterns if you cannot see the specific element.

4. CITE VISUAL DETAILS: Reference specific visual characteristics (color, text, position) that you observe.`;
  }

  /**
   * Generate validation rules
   */
  private generateValidationRules(options: VisualGroundingOptions): string[] {
    const rules = [
      "✓ Element must be clearly visible in the image",
      "✓ Coordinates must point to the actual element location",
      "✓ Feedback must reference observable visual characteristics",
      "✓ No comments on elements that cannot be visually confirmed"
    ];

    if (options.requireVisualEvidence) {
      rules.push("✓ Each annotation must include visual evidence description");
    }

    if (options.enableCoordinateValidation) {
      rules.push("✓ Coordinates must pass visual validation checks");
    }

    return rules;
  }

  /**
   * Validate a single annotation with enhanced Perplexity research support
   */
  private validateSingleAnnotation(
    annotation: Annotation,
    options: VisualGroundingOptions
  ): GroundingValidationResult {
    const reasons: string[] = [];
    const suggestedCorrections: string[] = [];
    let confidence = 0.8; // Default confidence

    // ENHANCED: Check for Perplexity research indicators first
    const text = `${annotation.title} ${annotation.description || annotation.feedback || ''}`.toLowerCase();
    const hasResearchBacking = this.hasPerplexityResearchBacking(text);
    
    // Research-backed content gets boosted confidence and lower threshold
    if (hasResearchBacking) {
      confidence += 0.15; // Boost confidence for research-backed content
      console.log('🔬 Research-backed annotation detected, boosting confidence:', {
        annotationId: (annotation as any).id,
        originalConfidence: 0.8,
        boostedConfidence: confidence
      });
    }

    // Check for visual evidence indicators
    const hasVisualIndicators = this.checkForVisualIndicators(annotation);
    if (!hasVisualIndicators.found) {
      reasons.push("Missing visual evidence description");
      suggestedCorrections.push("Add description of what you can see at this location");
      // Reduced penalty for research-backed content
      confidence -= hasResearchBacking ? 0.1 : 0.2;
    }

    // Check coordinate validity
    const coordinateValidation = this.validateCoordinates(annotation);
    if (!coordinateValidation.valid) {
      reasons.push("Potentially invalid coordinates");
      suggestedCorrections.push("Verify coordinates point to actual element");
      // Reduced penalty for research-backed content
      confidence -= hasResearchBacking ? 0.15 : 0.3;
    }

    // Check feedback specificity (less strict for research content)
    const specificityCheck = this.checkFeedbackSpecificity(annotation);
    if (!specificityCheck.specific && !hasResearchBacking) {
      reasons.push("Feedback too generic, may indicate hallucination");
      suggestedCorrections.push("Provide more specific, observable details");
      confidence -= 0.1;
    }

    // Lower threshold for research-backed content
    const effectiveThreshold = hasResearchBacking ? 
      Math.max(0.6, options.minimumConfidenceThreshold - 0.2) : 
      options.minimumConfidenceThreshold;

    const isValid = confidence >= effectiveThreshold;

    console.log('🎯 Annotation Validation Result:', {
      annotationId: (annotation as any).id,
      hasResearchBacking,
      finalConfidence: Math.round(confidence * 100) + '%',
      threshold: Math.round(effectiveThreshold * 100) + '%',
      isValid,
      reasons: reasons.length > 0 ? reasons : ['Valid annotation']
    });

    return {
      isValid,
      confidence: Math.max(0, confidence),
      reasons,
      suggestedCorrections
    };
  }

  /**
   * Check if annotation has Perplexity research backing
   */
  private hasPerplexityResearchBacking(text: string): boolean {
    const researchIndicators = [
      "research shows", "studies indicate", "according to", "data suggests",
      "research-backed", "evidence-based", "peer-reviewed", "validated by",
      "industry standard", "best practice", "research foundation", "competitive analysis",
      "trend analysis", "market research", "ux research", "user research",
      "perplexity", "research validation", "industry trends"
    ];
    
    return researchIndicators.some(indicator => text.includes(indicator));
  }

  /**
   * Enhanced visual indicators check with stronger evidence detection and Perplexity research support
   */
  private checkForVisualIndicators(annotation: Annotation): { found: boolean; indicators: string[] } {
    const text = `${annotation.title} ${annotation.description || annotation.feedback || ''}`.toLowerCase();
    
    // CRITICAL: Check for Perplexity research indicators first
    const perplexityIndicators = [
      "research shows", "studies indicate", "according to", "data suggests",
      "research-backed", "evidence-based", "peer-reviewed", "validated by",
      "industry standard", "best practice", "research foundation", "competitive analysis",
      "trend analysis", "market research", "ux research", "user research"
    ];

    // Strong visual evidence phrases
    const strongIndicators = [
      "i can see", "visible at", "located at", "positioned at", "displays", 
      "shows the", "contains text", "has color", "image shows", "screenshot shows",
      "at coordinates", "in the image", "on the screen"
    ];
    
    // Moderate visual evidence phrases
    const moderateIndicators = [
      "the button", "the link", "the text", "the image", "the menu",
      "top left", "bottom right", "center of", "corner", "navigation",
      "header", "footer", "sidebar", "form field"
    ];
    
    // Warning phrases that might indicate hallucination (reduced weight for research-backed content)
    const hallucinationWarnings = [
      "consider adding", "should include", "would benefit", "might want to",
      "could improve", "recommend", "suggest", "typical", "usually"
    ];

    const perplexityFound = perplexityIndicators.filter(phrase => text.includes(phrase));
    const strongFound = strongIndicators.filter(phrase => text.includes(phrase));
    const moderateFound = moderateIndicators.filter(phrase => text.includes(phrase));
    const warningFound = hallucinationWarnings.filter(phrase => text.includes(phrase));
    
    const allIndicators = [...perplexityFound, ...strongFound, ...moderateFound];
    
    // ENHANCED: Perplexity research content gets special treatment
    const hasPerplexityResearch = perplexityFound.length > 0;
    const hasStrongEvidence = strongFound.length > 0;
    const hasModerateEvidence = moderateFound.length > 0 && warningFound.length <= 1;
    const isHighRiskHallucination = warningFound.length > 2 && strongFound.length === 0 && !hasPerplexityResearch;

    // Research-backed content is considered valid even without traditional visual indicators
    const isValidContent = hasPerplexityResearch || hasStrongEvidence || hasModerateEvidence;
    
    console.log('🔬 Perplexity Content Validation:', {
      annotationId: (annotation as any).id,
      hasPerplexityResearch,
      perplexityIndicators: perplexityFound,
      hasStrongEvidence,
      hasModerateEvidence,
      isHighRiskHallucination,
      finalValidation: isValidContent && !isHighRiskHallucination
    });

    return {
      found: isValidContent && !isHighRiskHallucination,
      indicators: allIndicators
    };
  }

  /**
   * Validate coordinates
   */
  private validateCoordinates(annotation: Annotation): { valid: boolean; reason?: string } {
    // Basic coordinate validation
    if (annotation.x < 0 || annotation.x > 100 || annotation.y < 0 || annotation.y > 100) {
      return { valid: false, reason: "Coordinates outside valid range (0-100)" };
    }

    // Check for suspicious coordinate patterns that might indicate hallucination
    const suspiciousPatterns = [
      { x: 50, y: 50, tolerance: 5 }, // Too many center points
      { x: 0, y: 0, tolerance: 2 },   // Too many origin points
      { x: 100, y: 100, tolerance: 2 } // Too many corner points
    ];

    for (const pattern of suspiciousPatterns) {
      if (Math.abs(annotation.x - pattern.x) <= pattern.tolerance && 
          Math.abs(annotation.y - pattern.y) <= pattern.tolerance) {
        return { valid: false, reason: `Suspicious coordinate pattern detected: (${annotation.x}, ${annotation.y})` };
      }
    }

    return { valid: true };
  }

  /**
   * Check feedback specificity
   */
  private checkFeedbackSpecificity(annotation: Annotation): { specific: boolean; score: number } {
    const text = `${annotation.title} ${annotation.description || annotation.feedback || ''}`.toLowerCase();
    
    // Generic phrases that might indicate hallucination
    const genericPhrases = [
      "consider adding", "could be improved", "might benefit", "should include",
      "would help", "may want to", "could use", "might consider"
    ];

    // Specific phrases that indicate visual observation
    const specificPhrases = [
      "button text", "color contrast", "font size", "spacing between", "alignment of",
      "missing alt text", "broken link", "placeholder text"
    ];

    const genericCount = genericPhrases.filter(phrase => text.includes(phrase)).length;
    const specificCount = specificPhrases.filter(phrase => text.includes(phrase)).length;

    const score = Math.max(0, (specificCount - genericCount * 0.5) / 3);
    
    return {
      specific: score > 0.3,
      score
    };
  }
}

export const visualGroundingService = new VisualGroundingService();