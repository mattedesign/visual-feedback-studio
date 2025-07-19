// Legacy analysis service - redirects to figmant service
// This is a compatibility layer for existing hooks that import from analysisService

import { createFigmantSession } from './figmantAnalysisService';
import { subscriptionService } from './subscriptionService';
import { toast } from 'sonner';
import { Annotation } from '@/types/analysis';

interface AnalyzeDesignRequest {
  imageUrls: string[];
  analysisId: string;
  analysisPrompt: string;
  designType?: string;
  isComparative: boolean;
  ragEnhanced?: boolean;
  researchSourceCount?: number;
  userComments?: Array<{
    imageUrl: string;
    x: number;
    y: number;
    comment: string;
  }>;
}

interface AnalyzeDesignResponse {
  success: boolean;
  annotations?: Annotation[];
  error?: string;
  researchEnhanced?: boolean;
  knowledgeSourcesUsed?: number;
  researchCitations?: string[];
  wellDone?: {
    insights: Array<{
      title: string;
      description: string;
      category: string;
    }>;
    overallStrengths: string[];
    categoryHighlights: Record<string, string>;
  };
}

export const createAnalysis = async () => {
  // Check subscription limits before creating analysis
  const canCreate = await subscriptionService.checkCanCreateAnalysis();
  if (!canCreate) {
    return null;
  }

  try {
    const session = await createFigmantSession({
      title: 'New Design Analysis'
    });
    return session.id;
  } catch (error) {
    console.error('Error creating analysis:', error);
    toast.error('Failed to create analysis');
    return null;
  }
};

// Legacy analysis function - returns an error response
const analyzeDesign = async (request: AnalyzeDesignRequest): Promise<AnalyzeDesignResponse> => {
  console.warn('analyzeDesign has been replaced with figmant analysis pipeline. Please use the Analysis Dashboard instead.');
  
  return {
    success: false,
    error: 'This analysis method has been replaced. Please use the Analysis Dashboard for new analyses.',
    annotations: [],
    researchEnhanced: false,
    knowledgeSourcesUsed: 0,
    researchCitations: []
  };
};

export const analysisService = {
  analyzeDesign,
  createAnalysis
};