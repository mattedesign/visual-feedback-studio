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

// ENHANCED: Utility functions for handling title/description with improved extraction logic
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
    
    // Pattern 1: Look for action-oriented opening phrases (most common in AI feedback)
    const actionMatches = feedback.match(/^(Consider|Improve|Add|Remove|Update|Fix|Enhance|Optimize|Replace|Change|Make|Ensure|Use|Avoid|Include|Implement)\s+([^.!?]*)/i);
    if (actionMatches && actionMatches[0].length > 10 && actionMatches[0].length < 100) {
      return actionMatches[0].trim();
    }
    
    // Pattern 2: Look for "The [element] should/could/needs" patterns
    const shouldMatches = feedback.match(/^(The\s+\w+(?:\s+\w+){0,3})\s+(should|could|needs?|must|ought to|requires?)\s+([^.!?]*)/i);
    if (shouldMatches && shouldMatches[0].length > 15 && shouldMatches[0].length < 100) {
      return shouldMatches[0].trim();
    }
    
    // Pattern 3: Look for issue identification patterns
    const issueMatches = feedback.match(/^(This\s+\w+(?:\s+\w+){0,2})\s+(is|has|lacks|missing|appears|seems)\s+([^.!?]*)/i);
    if (issueMatches && issueMatches[0].length > 10 && issueMatches[0].length < 100) {
      return issueMatches[0].trim();
    }
    
    // Pattern 4: "Title: Description" format
    const titleColonMatch = feedback.match(/^([^:]+):\s*(.+)/s);
    if (titleColonMatch && titleColonMatch[1].length > 5 && titleColonMatch[1].length < 100) {
      return titleColonMatch[1].trim();
    }
    
    // Pattern 5: First sentence as title (if it's a reasonable length)
    const sentences = feedback.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim();
    if (firstSentence && firstSentence.length >= 15 && firstSentence.length <= 120 && sentences.length > 1) {
      return firstSentence;
    }
    
    // Pattern 6: First line as title (if multi-line and first line is short)
    const lines = feedback.split('\n');
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length >= 10 && firstLine.length <= 100 && lines.length > 1 && lines[1]?.trim()) {
      return firstLine;
    }
    
    // Pattern 7: Intelligent truncation of long single sentences
    if (feedback.length > 120) {
      // Try to find a natural break point
      const truncated = feedback.substring(0, 100);
      const lastSpace = truncated.lastIndexOf(' ');
      const lastComma = truncated.lastIndexOf(',');
      const breakPoint = Math.max(lastSpace, lastComma);
      
      if (breakPoint > 50) {
        return truncated.substring(0, breakPoint).trim() + '...';
      } else {
        return truncated.trim() + '...';
      }
    }
    
    // Pattern 8: Use full feedback if it's a reasonable title length
    if (feedback.length >= 10 && feedback.length <= 120) {
      return feedback;
    }
  }
  
  // Fallback: Create contextual title based on category and severity
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
    
    // Pattern 1: "Title: Description" format - return description part
    const titleColonMatch = feedback.match(/^([^:]+):\s*(.+)/s);
    if (titleColonMatch && titleColonMatch[1].length > 5 && titleColonMatch[1].length < 100 && titleColonMatch[2].trim()) {
      return titleColonMatch[2].trim();
    }
    
    // Pattern 2: Multi-line with first line as title - return remaining lines
    const lines = feedback.split('\n');
    const firstLine = lines[0]?.trim();
    if (firstLine && firstLine.length >= 10 && firstLine.length <= 100 && lines.length > 1) {
      const remainingLines = lines.slice(1).join('\n').trim();
      if (remainingLines && remainingLines.length > 20) {
        return remainingLines;
      }
    }
    
    // Pattern 3: Multi-sentence with first sentence as title - return remaining sentences
    const sentences = feedback.split(/[.!?]/);
    const firstSentence = sentences[0]?.trim();
    if (firstSentence && firstSentence.length >= 15 && firstSentence.length <= 120 && sentences.length > 1) {
      const remainingSentences = sentences.slice(1).join('.').replace(/^[.!?\s]+/, '').trim();
      if (remainingSentences && remainingSentences.length > 30) {
        return remainingSentences + '.';
      }
    }
    
    // Pattern 4: Action-oriented title extracted - return rest of feedback
    const actionMatches = feedback.match(/^(Consider|Improve|Add|Remove|Update|Fix|Enhance|Optimize|Replace|Change|Make|Ensure|Use|Avoid|Include|Implement)\s+([^.!?]*)/i);
    if (actionMatches && actionMatches[0].length > 10 && actionMatches[0].length < 100) {
      const remaining = feedback.substring(actionMatches[0].length).replace(/^[.!?\s]+/, '').trim();
      if (remaining && remaining.length > 20) {
        return remaining;
      }
    }
    
    // Pattern 5: If feedback is very long, return everything (title extraction would have truncated)
    if (feedback.length > 120) {
      return feedback;
    }
    
    // Pattern 6: If feedback is short, return it as description
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
