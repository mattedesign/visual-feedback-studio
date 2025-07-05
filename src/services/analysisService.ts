import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Annotation } from '@/types/analysis';
import { subscriptionService } from './subscriptionService';
// ✅ REMOVED: No longer need convertBlobToBase64 import
// import { convertBlobToBase64 } from '@/utils/imageUtils';

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
  // ✅ NEW: Add Well Done data to response interface
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error('Please sign in to upload files');
    return null;
  }

  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: user.id,
      title: 'New Design Analysis',
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating analysis:', error);
    toast.error('Failed to create analysis');
    return null;
  }

  return data.id;
};

const analyzeDesign = async (request: AnalyzeDesignRequest): Promise<AnalyzeDesignResponse> => {
  try {
    console.log('📡 Simplified Analysis: Starting streamlined pipeline');
    
    // Build simple payload - no vision analysis, no RAG, just direct Claude call
    const payload = {
      imageUrls: request.imageUrls,
      analysisId: request.analysisId,
      analysisPrompt: request.analysisPrompt, // Use original user prompt directly
      designType: request.designType || 'web'
    };

    console.log('📡 Calling simplified analyze-design:', {
      analysisId: request.analysisId,
      imageCount: request.imageUrls.length,
      promptLength: request.analysisPrompt.length
    });

    // Call simplified edge function
    const { data, error } = await supabase.functions.invoke('analyze-design', {
      body: payload
    });

    if (error) {
      console.error('❌ Analysis function error:', error);
      throw new Error(`Analysis function failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from analysis function');
    }

    console.log('✅ Simplified analysis completed:', {
      success: data.success,
      annotationCount: data.annotations?.length || 0,
      modelUsed: data.modelUsed || 'claude-3-5-sonnet-20241022'
    });

    // If analysis was successful, increment usage counter
    if (data.success && data.annotations?.length > 0) {
      const usageIncremented = await subscriptionService.incrementUsage();
      if (!usageIncremented) {
        console.warn('Failed to increment usage counter after successful analysis');
      }
    }

    return {
      success: data.success,
      annotations: data.annotations || [],
      error: data.error,
      researchEnhanced: false, // No RAG in simplified version
      knowledgeSourcesUsed: 0,
      researchCitations: [],
      wellDone: null // No well done data in simplified version
    };

  } catch (error) {
    console.error('❌ Simplified Analysis: Service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const analysisService = {
  analyzeDesign,
  createAnalysis
};