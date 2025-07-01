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
  
  // NEW: Coordinate validation properties
  originalCoordinates?: { x: number; y: number };
  correctionApplied?: boolean;
  correctionReasoning?: string;
  validationScore?: number;
  validationPassed?: boolean;
  
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

// ENHANCED: Utility functions for handling title/description with better logic
export const getAnnotationTitle = (annotation: Annotation, imageIndex?: number): string => {
  // First check if explicit title exists
  if (annotation.title && annotation.title.trim()) {
    return annotation.title.trim();
  }
  
  // Enhanced category-based title generation
  const categoryTitles = {
    'ux': 'User Experience Issue',
    'visual': 'Visual Design Issue',
    'accessibility': 'Accessibility Issue',
    'conversion': 'Conversion Optimization',
    'brand': 'Brand Consistency Issue'
  };
  
  const severityPrefixes = {
    'critical': 'Critical',
    'suggested': 'Suggested',
    'enhancement': 'Enhancement'
  };
  
  // If we have feedback, try to extract a meaningful title
  if (annotation.feedback && annotation.feedback.trim()) {
    const feedback = annotation.feedback.trim();
    
    // Pattern 1: "Title: Description" format
    const titleColonMatch = feedback.match(/^([^:]+):\s*(.+)/s);
    if (titleColonMatch && titleColonMatch[1].length < 80) {
      return titleColonMatch[1].trim();
    }
    
    // Pattern 2: First sentence as title (if short enough)
    const firstSentence = feedback.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 10 && firstSentence.length < 80) {
      return firstSentence.trim();
    }
    
    // Pattern 3: First line as title (if it's short)
    const firstLine = feedback.split('\n')[0];
    if (firstLine && firstLine.length < 80 && feedback.split('\n').length > 1) {
      return firstLine.trim();
    }
    
    // Pattern 4: Extract action-oriented phrases
    const actionMatches = feedback.match(/^(Consider|Improve|Add|Remove|Update|Fix|Enhance|Optimize|Replace)\s+[^.!?]*/);
    if (actionMatches && actionMatches[0].length < 80) {
      return actionMatches[0].trim();
    }
    
    // Pattern 5: Truncate feedback intelligently
    if (feedback.length > 60) {
      const truncated = feedback.substring(0, 60).trim();
      const lastSpace = truncated.lastIndexOf(' ');
      return (lastSpace > 30 ? truncated.substring(0, lastSpace) : truncated) + '...';
    }
    
    // Use full feedback if it's short
    return feedback;
  }
  
  // Fallback: Create title based on category and severity
  const categoryTitle = categoryTitles[annotation.category] || 'Design Issue';
  const severityPrefix = severityPrefixes[annotation.severity] || '';
  
  let title = severityPrefix ? `${severityPrefix} ${categoryTitle}` : categoryTitle;
  
  // Add image context if available
  if (typeof imageIndex === 'number' && imageIndex >= 0) {
    title += ` (Image ${imageIndex + 1})`;
  } else if (typeof annotation.imageIndex === 'number' && annotation.imageIndex >= 0) {
    title += ` (Image ${annotation.imageIndex + 1})`;
  }
  
  return title;
};

export const getAnnotationDescription = (annotation: Annotation): string => {
  // First check if explicit description exists
  if (annotation.description && annotation.description.trim()) {
    return annotation.description.trim();
  }
  
  // Extract description from feedback
  if (annotation.feedback && annotation.feedback.trim()) {
    const feedback = annotation.feedback.trim();
    
    // Pattern 1: "Title: Description" format
    const titleColonMatch = feedback.match(/^([^:]+):\s*(.+)/s);
    if (titleColonMatch && titleColonMatch[1].length < 80) {
      return titleColonMatch[2].trim();
    }
    
    // Pattern 2: If first line was used as title, use rest as description
    const lines = feedback.split('\n');
    if (lines.length > 1) {
      const firstLine = lines[0].trim();
      if (firstLine.length < 80) {
        const remainingLines = lines.slice(1).join('\n').trim();
        if (remainingLines) {
          return remainingLines;
        }
      }
    }
    
    // Pattern 3: If first sentence was used as title, use rest as description
    const sentences = feedback.split(/[.!?]/);
    if (sentences.length > 1) {
      const firstSentence = sentences[0];
      if (firstSentence && firstSentence.length > 10 && firstSentence.length < 80) {
        const remaining = sentences.slice(1).join('.').replace(/^[.!?\s]+/, '').trim();
        if (remaining && remaining.length > 20) {
          return remaining;
        }
      }
    }
    
    // Fallback: return full feedback
    return feedback;
  }
  
  return 'No detailed description available';
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
