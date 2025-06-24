
import { supabase } from '@/integrations/supabase/client';
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
}

interface AnalyzeDesignResponse {
  success: boolean;
  annotations?: Annotation[];
  error?: string;
}

export const createAnalysis = async () => {
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
    console.log('📡 Calling analyze-design function with request:', {
      analysisId: request.analysisId,
      imageCount: request.imageUrls.length,
      isComparative: request.isComparative,
      ragEnhanced: request.ragEnhanced
    });

    const { data, error } = await supabase.functions.invoke('analyze-design', {
      body: {
        imageUrls: request.imageUrls,
        analysisId: request.analysisId,
        analysisPrompt: request.analysisPrompt,
        designType: request.designType,
        isComparative: request.isComparative,
        ragEnhanced: request.ragEnhanced,
        researchSourceCount: request.researchSourceCount
      }
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      throw new Error(`Analysis function failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from analysis function');
    }

    console.log('✅ Analysis function completed:', {
      success: data.success,
      annotationCount: data.annotations?.length || 0
    });

    return {
      success: data.success,
      annotations: data.annotations || [],
      error: data.error
    };

  } catch (error) {
    console.error('❌ Analysis service error:', error);
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
