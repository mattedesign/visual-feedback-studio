export interface Annotation {
  id: string;
  x: number;
  y: number;
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand';
  severity: 'critical' | 'suggested' | 'enhancement';
  feedback: string; // Keep existing field for backward compatibility
  
  // NEW: Separate title and description fields
  title?: string;
  description?: string;
  
  implementationEffort: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';
  imageIndex?: number; // For multi-image analysis
  
  // Enhanced business impact fields
  enhancedBusinessImpact?: {
    metrics: {
      conversionImpact: {
        estimatedIncrease: string;
        confidence: 'low' | 'medium' | 'high';
        methodology: string;
      };
      userExperienceMetrics: {
        timeReduction?: string;
        errorReduction?: string;
        satisfactionImprovement?: string;
      };
      accessibilityReach: {
        affectedUserPercentage: string;
        complianceLevel: string;
      };
      revenueProjection: {
        monthlyIncrease: string;
        annualProjection: string;
        assumptions: string[];
      };
    };
    score: {
      roiScore: number;
      priority: 'critical' | 'important' | 'enhancement';
      implementationEffort: {
        category: 'quick-win' | 'standard' | 'complex';
        timeEstimate: string;
        resourcesNeeded: string[];
      };
      businessValue: number;
      riskLevel: 'low' | 'medium' | 'high';
    };
    justification: string;
    competitiveBenchmark?: string;
    researchEvidence?: string;
  };
  researchCitations?: string[];
  competitiveBenchmarks?: string[];
  priorityScore?: number;
  quickWinPotential?: boolean;
}

// NEW: Utility functions for handling title/description
export const getAnnotationTitle = (annotation: Annotation): string => {
  if (annotation.title) {
    return annotation.title;
  }
  
  // Fallback: Extract title from feedback
  if (annotation.feedback) {
    // Try to extract title from common patterns
    const lines = annotation.feedback.split('\n');
    const firstLine = lines[0]?.trim();
    
    // If first line ends with colon, it's likely a title
    if (firstLine && firstLine.endsWith(':')) {
      return firstLine.slice(0, -1);
    }
    
    // If first line is short and second line exists, first line might be title
    if (firstLine && firstLine.length < 100 && lines.length > 1) {
      return firstLine;
    }
    
    // Extract title from "Title: Description" pattern
    const titleMatch = annotation.feedback.match(/^([^:]+):\s*(.+)/s);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    // Fallback: Use first sentence or truncated feedback
    const firstSentence = annotation.feedback.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length < 100) {
      return firstSentence.trim();
    }
    
    // Last resort: truncate feedback
    return annotation.feedback.length > 60 
      ? annotation.feedback.substring(0, 60).trim() + '...'
      : annotation.feedback;
  }
  
  return 'UX Issue';
};

export const getAnnotationDescription = (annotation: Annotation): string => {
  if (annotation.description) {
    return annotation.description;
  }
  
  // Fallback: Extract description from feedback
  if (annotation.feedback) {
    // Extract description from "Title: Description" pattern
    const titleMatch = annotation.feedback.match(/^([^:]+):\s*(.+)/s);
    if (titleMatch) {
      return titleMatch[2].trim();
    }
    
    // If we extracted a title from first line, use rest as description
    const lines = annotation.feedback.split('\n');
    if (lines.length > 1) {
      const firstLine = lines[0]?.trim();
      if (firstLine && (firstLine.endsWith(':') || firstLine.length < 100)) {
        return lines.slice(1).join('\n').trim();
      }
    }
    
    // Remove first sentence if it was used as title
    const firstSentence = annotation.feedback.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length < 100) {
      const remaining = annotation.feedback.substring(firstSentence.length).replace(/^[.!?]\s*/, '');
      if (remaining.trim()) {
        return remaining.trim();
      }
    }
    
    // Fallback: return full feedback
    return annotation.feedback;
  }
  
  return 'No description available';
};

export interface AnalysisRequest {
  imageUrl?: string;
  imageUrls?: string[];
  analysisId: string;
  analysisPrompt?: string;
  designType?: string;
  isComparative?: boolean;
  aiProvider?: 'openai' | 'claude';
  ragEnabled?: boolean;
  competitiveEnabled?: boolean;
  businessImpactEnabled?: boolean; // New field
}

export interface AnalysisResponse {
  success: boolean;
  annotations: Annotation[];
  totalAnnotations: number;
  
  // Enhanced business impact fields
  businessImpact?: {
    totalPotentialRevenue: string;
    quickWinsAvailable: number;
    criticalIssuesCount: number;
    averageROIScore: number;
    implementationRoadmap: {
      immediate: Annotation[];
      shortTerm: Annotation[];
      longTerm: Annotation[];
    };
  };
  
  // Existing fields
  modelUsed?: string;
  processingTime?: number;
  ragEnhanced?: boolean;
  knowledgeSourcesUsed?: number;
  researchCitations?: string[];
  competitiveEnhanced?: boolean;
  competitivePatternsUsed?: number;
  industryBenchmarks?: string[];
  
  // Insights fields
  insights?: {
    topRecommendation: string;
    quickestWin: string;
    highestImpact: string;
    competitiveAdvantage?: string;
    researchEvidence?: string;
  };
}

export interface ImageAnnotation {
  imageUrl: string;
  annotations: Annotation[];
}

export interface Analysis {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  userId: string;
  designType?: string;
  businessGoals?: string[];
  targetAudience?: string;
  analysisPrompt?: string;
  aiModelUsed?: string;
  analysisCompletedAt?: string;
}
