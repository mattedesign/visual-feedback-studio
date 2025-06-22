import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getAnnotationsForAnalysis } from './annotationsService';

export interface AnalysisWithFiles {
  id: string;
  title: string;
  status: string;
  created_at: string;
  design_type?: string;
  business_goals?: string[];
  target_audience?: string;
  analysis_prompt?: string;
  ai_model_used?: string;
  analysis_completed_at?: string;
  files: {
    id: string;
    file_name: string;
    file_type: string;
    upload_type: string;
    public_url?: string;
    figma_url?: string;
    website_url?: string;
    original_url?: string;
  }[];
}

export const getUserAnalyses = async (): Promise<AnalysisWithFiles[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: analyses, error } = await supabase
      .from('analyses')
      .select(`
        id,
        title,
        status,
        created_at,
        design_type,
        business_goals,
        target_audience,
        analysis_prompt,
        ai_model_used,
        analysis_completed_at,
        uploaded_files (
          id,
          file_name,
          file_type,
          upload_type,
          public_url,
          figma_url,
          website_url,
          original_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analyses:', error);
      return [];
    }

    return analyses.map(analysis => ({
      ...analysis,
      files: analysis.uploaded_files || []
    }));
  } catch (error) {
    console.error('Unexpected error fetching analyses:', error);
    return [];
  }
};

export const getAnalysisById = async (analysisId: string): Promise<AnalysisWithFiles | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: analysis, error } = await supabase
      .from('analyses')
      .select(`
        id,
        title,
        status,
        created_at,
        design_type,
        business_goals,
        target_audience,
        analysis_prompt,
        ai_model_used,
        analysis_completed_at,
        uploaded_files (
          id,
          file_name,
          file_type,
          upload_type,
          public_url,
          figma_url,
          website_url,
          original_url
        )
      `)
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching analysis:', error);
      return null;
    }

    return {
      ...analysis,
      files: analysis.uploaded_files || []
    };
  } catch (error) {
    console.error('Unexpected error fetching analysis:', error);
    return null;
  }
};

export const updateAnalysisStatus = async (analysisId: string, status: string, completedAt?: string) => {
  const updateData: any = { status };
  if (completedAt) {
    updateData.analysis_completed_at = completedAt;
  }

  const { error } = await supabase
    .from('analyses')
    .update(updateData)
    .eq('id', analysisId);

  if (error) {
    console.error('Error updating analysis status:', error);
    return false;
  }

  return true;
};

export const updateAnalysisContext = async (
  analysisId: string, 
  context: {
    design_type?: string;
    business_goals?: string[];
    target_audience?: string;
    analysis_prompt?: string;
    ai_model_used?: string;
  }
) => {
  const { error } = await supabase
    .from('analyses')
    .update(context)
    .eq('id', analysisId);

  if (error) {
    console.error('Error updating analysis context:', error);
    return false;
  }

  return true;
};

export const getMostRecentAnalysis = async (): Promise<AnalysisWithFiles | null> => {
  const analyses = await getUserAnalyses();
  return analyses.length > 0 ? analyses[0] : null;
};

export const getFileUrl = (file: AnalysisWithFiles['files'][0]): string | null => {
  if (!file) return null;
  
  // Prioritize URLs based on upload type
  switch (file.upload_type) {
    case 'file':
      return file.public_url || null;
    case 'figma':
      return file.figma_url || file.original_url || null;
    case 'website':
    case 'url':
      return file.website_url || file.original_url || null;
    default:
      return file.public_url || file.original_url || null;
  }
};
