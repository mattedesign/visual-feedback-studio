// Unified analysis service - uses Figmant pipeline exclusively
// This service redirects all analysis operations to the Figmant system

import figmantAnalysisService from './figmantAnalysisService';
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
    const session = await figmantAnalysisService.createFigmantSession({
      title: 'New Design Analysis'
    });
    return session.id;
  } catch (error) {
    console.error('Error creating analysis:', error);
    toast.error('Failed to create analysis');
    return null;
  }
};

// Redirect to figmant analysis pipeline
const analyzeDesign = async (request: AnalyzeDesignRequest): Promise<AnalyzeDesignResponse> => {
  console.log('🔄 Redirecting to figmant analysis pipeline for:', request.analysisId);
  
  try {
    // Use the figmant pipeline instead
    const result = await figmantAnalysisService.startFigmantAnalysis(request.analysisId);
    
    return {
      success: true,
      annotations: result?.claude_analysis?.annotations || [],
      researchEnhanced: true,
      knowledgeSourcesUsed: 1,
      researchCitations: []
    };
  } catch (error) {
    console.error('❌ Figmant analysis failed:', error);
    return {
      success: false,
      error: error.message || 'Analysis failed',
      annotations: [],
      researchEnhanced: false,
      knowledgeSourcesUsed: 0,
      researchCitations: []
    };
  }
};

export const analysisService = {
  analyzeDesign,
  createAnalysis
};