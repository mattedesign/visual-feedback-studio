
import { Annotation } from '@/types/analysis';

interface ImageElement {
  type: 'navigation' | 'header' | 'button' | 'card' | 'form' | 'text' | 'image' | 'unknown';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  keywords: string[];
}

interface ValidationResult {
  isValid: boolean;
  confidence: number;
  suggestedCorrection?: { x: number; y: number };
  reasoning: string;
  elementType?: string;
}

export class CoordinateValidator {
  private static commonUIElements = {
    navigation: {
      keywords: ['nav', 'menu', 'sidebar', 'navigation', 'links'],
      expectedRegions: [
        { x: 0, y: 0, width: 25, height: 100 }, // Left sidebar
        { x: 0, y: 0, width: 100, height: 15 }, // Top navigation
      ]
    },
    header: {
      keywords: ['header', 'title', 'logo', 'brand'],
      expectedRegions: [
        { x: 0, y: 0, width: 100, height: 20 }, // Top header
      ]
    },
    button: {
      keywords: ['button', 'cta', 'submit', 'click', 'action'],
      expectedRegions: [
        { x: 10, y: 10, width: 80, height: 80 }, // Anywhere but edges
      ]
    },
    card: {
      keywords: ['card', 'panel', 'dashboard', 'widget', 'tile'],
      expectedRegions: [
        { x: 20, y: 20, width: 60, height: 60 }, // Central areas
      ]
    }
  };

  static validateAnnotation(annotation: Annotation, imageAnalysis?: any): ValidationResult {
    // Step 1: Extract keywords from annotation feedback
    const feedbackKeywords = this.extractKeywords(annotation.feedback || '');
    
    // Step 2: Determine expected element type
    const expectedElementType = this.determineElementType(feedbackKeywords);
    
    // Step 3: Check if coordinates match expected element type
    const coordinateMatch = this.checkCoordinateMatch(
      annotation.x, 
      annotation.y, 
      expectedElementType
    );
    
    // Step 4: Generate validation result
    if (coordinateMatch.isValid) {
      return {
        isValid: true,
        confidence: coordinateMatch.confidence,
        reasoning: `Coordinates match expected location for ${expectedElementType}`,
        elementType: expectedElementType
      };
    } else {
      return {
        isValid: false,
        confidence: coordinateMatch.confidence,
        suggestedCorrection: coordinateMatch.suggestedCorrection,
        reasoning: `Coordinates (${annotation.x}%, ${annotation.y}%) don't match expected location for ${expectedElementType}. ${coordinateMatch.reasoning}`,
        elementType: expectedElementType
      };
    }
  }

  private static extractKeywords(feedback: string): string[] {
    const text = feedback.toLowerCase();
    const keywords: string[] = [];
    
    // Check for UI element keywords
    Object.entries(this.commonUIElements).forEach(([elementType, config]) => {
      config.keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          keywords.push(keyword);
        }
      });
    });
    
    return keywords;
  }

  private static determineElementType(keywords: string[]): string {
    const elementScores: Record<string, number> = {};
    
    Object.entries(this.commonUIElements).forEach(([elementType, config]) => {
      let score = 0;
      config.keywords.forEach(keyword => {
        if (keywords.includes(keyword)) {
          score += 1;
        }
      });
      if (score > 0) {
        elementScores[elementType] = score;
      }
    });
    
    // Return the element type with highest score
    const bestMatch = Object.entries(elementScores)
      .sort(([,a], [,b]) => b - a)[0];
    
    return bestMatch ? bestMatch[0] : 'unknown';
  }

  private static checkCoordinateMatch(
    x: number, 
    y: number, 
    elementType: string
  ): { isValid: boolean; confidence: number; suggestedCorrection?: { x: number; y: number }; reasoning: string } {
    const elementConfig = this.commonUIElements[elementType as keyof typeof this.commonUIElements];
    
    if (!elementConfig) {
      return {
        isValid: true,
        confidence: 0.3,
        reasoning: 'Unknown element type, cannot validate'
      };
    }
    
    // Check if coordinates fall within any expected region
    for (const region of elementConfig.expectedRegions) {
      const withinX = x >= region.x && x <= region.x + region.width;
      const withinY = y >= region.y && y <= region.y + region.height;
      
      if (withinX && withinY) {
        return {
          isValid: true,
          confidence: 0.9,
          reasoning: `Coordinates fall within expected ${elementType} region`
        };
      }
    }
    
    // Find the closest expected region and suggest correction
    let closestRegion = elementConfig.expectedRegions[0];
    let minDistance = Infinity;
    
    elementConfig.expectedRegions.forEach(region => {
      const centerX = region.x + region.width / 2;
      const centerY = region.y + region.height / 2;
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = region;
      }
    });
    
    const correctionX = closestRegion.x + closestRegion.width / 2;
    const correctionY = closestRegion.y + closestRegion.height / 2;
    
    return {
      isValid: false,
      confidence: 0.2,
      suggestedCorrection: { x: correctionX, y: correctionY },
      reasoning: `Expected ${elementType} in region (${closestRegion.x}%-${closestRegion.x + closestRegion.width}%, ${closestRegion.y}%-${closestRegion.y + closestRegion.height}%)`
    };
  }

  static correctAnnotationCoordinates(annotations: Annotation[]): Annotation[] {
    return annotations.map(annotation => {
      const validation = this.validateAnnotation(annotation);
      
      if (!validation.isValid && validation.suggestedCorrection) {
        console.log(`🔧 COORDINATE CORRECTION for annotation ${annotation.id}:`, {
          original: { x: annotation.x, y: annotation.y },
          corrected: validation.suggestedCorrection,
          reasoning: validation.reasoning
        });
        
        return {
          ...annotation,
          x: validation.suggestedCorrection.x,
          y: validation.suggestedCorrection.y,
          originalCoordinates: { x: annotation.x, y: annotation.y },
          correctionApplied: true,
          correctionReasoning: validation.reasoning
        };
      }
      
      return annotation;
    });
  }
}
