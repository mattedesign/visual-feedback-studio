import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type AnalysisResult = Tables<'analysis_results'>;
export type Analysis = Tables<'analyses'>;

export interface AnalysisWithResults extends Analysis {
  analysis_results?: AnalysisResult[];
}

// Legacy type for backward compatibility
export type AnalysisResultsResponse = AnalysisResult;

/**
 * Save analysis results to database
 */
export const saveAnalysisResults = async (analysisData: any): Promise<AnalysisResult | null> => {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .insert(analysisData)
      .select()
      .single();

    if (error) {
      console.error('Error saving analysis results:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in saveAnalysisResults:', error);
    return null;
  }
};

/**
 * Fetch analysis results by analysis ID
 */
export const getAnalysisResults = async (analysisId: string): Promise<AnalysisResult | null> => {
  try {
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('analysis_id', analysisId)
      .single();

    if (error) {
      console.error('Error fetching analysis results:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getAnalysisResults:', error);
    return null;
  }
};

/**
 * Fetch analysis with its results
 */
export const getAnalysisWithResults = async (analysisId: string): Promise<AnalysisWithResults | null> => {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select(`
        *,
        analysis_results (*)
      `)
      .eq('id', analysisId)
      .single();

    if (error) {
      console.error('Error fetching analysis with results:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getAnalysisWithResults:', error);
    return null;
  }
};

/**
 * Fetch user's analysis history - returns analysis results
 */
export const getUserAnalysisHistory = async (userId?: string): Promise<AnalysisResult[]> => {
  try {
    // If no userId provided, get from current user
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return [];
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user analysis history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserAnalysisHistory:', error);
    return [];
  }
};

/**
 * Update analysis results
 */
export const updateAnalysisResults = async (
  analysisId: string, 
  updates: Partial<AnalysisResult>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('analysis_results')
      .update(updates)
      .eq('analysis_id', analysisId);

    if (error) {
      console.error('Error updating analysis results:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateAnalysisResults:', error);
    return false;
  }
};

/**
 * Delete analysis and its results
 */
export const deleteAnalysis = async (analysisId: string): Promise<boolean> => {
  try {
    // Delete analysis results first (due to foreign key constraint)
    const { error: resultsError } = await supabase
      .from('analysis_results')
      .delete()
      .eq('analysis_id', analysisId);

    if (resultsError) {
      console.error('Error deleting analysis results:', resultsError);
      return false;
    }

    // Then delete the analysis
    const { error: analysisError } = await supabase
      .from('analyses')
      .delete()
      .eq('id', analysisId);

    if (analysisError) {
      console.error('Error deleting analysis:', analysisError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAnalysis:', error);
    return false;
  }
};