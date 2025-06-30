
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Annotation } from '@/types/analysis';

export interface SaveAnalysisResultsRequest {
  analysisId: string;
  annotations: Annotation[];
  images: string[];
  analysisContext: string;
  enhancedContext?: any;
  wellDoneData?: any;
  researchCitations?: string[];
  knowledgeSourcesUsed?: number;
  aiModelUsed?: string;
  processingTimeMs?: number;
}

export interface AnalysisResultsResponse {
  id: string;
  analysis_id: string;
  annotations: any; // Simplified to any for now to avoid type conflicts
  images: string[];
  analysis_context: string;
  enhanced_context?: any;
  well_done_data?: any;
  research_citations?: string[];
  knowledge_sources_used?: number;
  ai_model_used?: string;
  processing_time_ms?: number;
  total_annotations: number;
  created_at: string;
  updated_at: string;
}

export const saveAnalysisResults = async (request: SaveAnalysisResultsRequest): Promise<string | null> => {
  try {
    console.log('💾 Saving analysis results to database:', {
      analysisId: request.analysisId,
      annotationCount: request.annotations.length,
      imageCount: request.images.length,
      hasEnhancedContext: !!request.enhancedContext,
      hasWellDone: !!request.wellDoneData
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user found');
      return null;
    }

    const { data, error } = await supabase
      .from('analysis_results')
      .insert({
        analysis_id: request.analysisId,
        user_id: user.id,
        annotations: request.annotations as any, // Cast to any for now
        images: request.images,
        analysis_context: request.analysisContext,
        enhanced_context: request.enhancedContext,
        well_done_data: request.wellDoneData,
        research_citations: request.researchCitations || [],
        knowledge_sources_used: request.knowledgeSourcesUsed || 0,
        ai_model_used: request.aiModelUsed || 'claude-3-5-sonnet',
        processing_time_ms: request.processingTimeMs,
        total_annotations: request.annotations.length
      })
      .select('id')
      .single();

    if (error) {
      console.error('❌ Failed to save analysis results:', error);
      toast.error('Failed to save analysis results');
      return null;
    }

    console.log('✅ Analysis results saved successfully:', data.id);
    return data.id;
  } catch (error) {
    console.error('❌ Error saving analysis results:', error);
    toast.error('Failed to save analysis results');
    return null;
  }
};

export const getAnalysisResults = async (analysisId: string): Promise<AnalysisResultsResponse | null> => {
  try {
    console.log('📖 Loading analysis results from database:', analysisId);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user found');
      return null;
    }

    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('analysis_id', analysisId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('❌ Failed to load analysis results:', error);
      return null;
    }

    console.log('✅ Analysis results loaded successfully:', {
      id: data.id,
      annotationCount: Array.isArray(data.annotations) ? data.annotations.length : 0,
      imageCount: data.images?.length || 0
    });

    return data;
  } catch (error) {
    console.error('❌ Error loading analysis results:', error);
    return null;
  }
};

export const getUserAnalysisHistory = async (): Promise<AnalysisResultsResponse[]> => {
  try {
    console.log('📚 Loading user analysis history from database');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to load analysis history:', error);
      return [];
    }

    console.log('✅ Analysis history loaded successfully:', {
      count: data.length
    });

    return data;
  } catch (error) {
    console.error('❌ Error loading analysis history:', error);
    return [];
  }
};
