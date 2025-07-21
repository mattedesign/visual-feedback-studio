import { supabase } from '@/integrations/supabase/client';
import { getUserAnalysisHistory, AnalysisResult } from './analysisResultsService';
import { getFigmantHistory, FigmantSession } from './figmantAnalysisService';

export interface UnifiedAnalysisHistory {
  id: string;
  type: 'legacy' | 'figmant';
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  images: string[];
  analysis_id?: string; // For legacy analyses
  session_id?: string; // For figmant sessions
  insight_count?: number;
  hasResults: boolean;
  analysis_context?: string;
  ai_model_used?: string;
}

/**
 * Get unified analysis history combining legacy and figmant analyses
 */
export async function getUnifiedAnalysisHistory(): Promise<UnifiedAnalysisHistory[]> {
  try {
    console.log('🔍 Fetching unified analysis history...');

    // Fetch both legacy and figmant histories in parallel
    const [legacyResults, figmantSessions] = await Promise.all([
      getUserAnalysisHistory(),
      getFigmantHistory()
    ]);

    console.log(`📊 Found ${legacyResults.length} legacy analyses and ${figmantSessions.length} figmant sessions`);

    // Transform legacy analyses
    const legacyHistoryItems: UnifiedAnalysisHistory[] = legacyResults.map((result: AnalysisResult) => ({
      id: result.id,
      type: 'legacy',
      title: result.analysis_context || 'Legacy Analysis',
      status: 'completed', // Legacy analyses are always completed if they exist
      created_at: result.created_at,
      updated_at: result.updated_at,
      images: Array.isArray(result.images) ? result.images : [],
      analysis_id: result.analysis_id,
      insight_count: Array.isArray(result.annotations) ? result.annotations.length : 0,
      hasResults: true,
      analysis_context: result.analysis_context,
      ai_model_used: result.ai_model_used
    }));

    // Transform figmant sessions
    const figmantHistoryItems: UnifiedAnalysisHistory[] = await Promise.all(
      figmantSessions.map(async (session: any) => {
        // Get images for this session
        const { data: images, error: imagesError } = await supabase
          .from('figmant_session_images')
          .select('file_path')
          .eq('session_id', session.id)
          .order('upload_order');

        let imageUrls: string[] = [];
        if (!imagesError && images) {
          // Get public URLs for the images
          imageUrls = await Promise.all(
            images.map(async (img) => {
              const { data } = supabase.storage
                .from('analysis-images')
                .getPublicUrl(img.file_path);
              return data.publicUrl;
            })
          );
        }

        // Check if session has results
        const hasResults = session.results && session.results.length > 0;

        return {
          id: session.id,
          type: 'figmant',
          title: session.title || 'Figmant Analysis',
          status: session.status || 'draft',
          created_at: session.created_at,
          updated_at: session.updated_at,
          images: imageUrls,
          session_id: session.id,
          insight_count: hasResults ? 1 : 0, // Simplified for now
          hasResults,
          analysis_context: session.title,
          ai_model_used: 'claude-sonnet-4'
        };
      })
    );

    // Combine and sort by creation date (newest first)
    const combinedHistory = [...legacyHistoryItems, ...figmantHistoryItems]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`✅ Unified history: ${combinedHistory.length} total items`);
    return combinedHistory;

  } catch (error) {
    console.error('❌ Error fetching unified analysis history:', error);
    return [];
  }
}

/**
 * Get analysis by session ID (supports both legacy and figmant)
 */
export async function getAnalysisBySessionId(sessionId: string): Promise<UnifiedAnalysisHistory | null> {
  try {
    console.log(`🔍 Looking for analysis with session ID: ${sessionId}`);

    // First try to find as figmant session
    const { data: figmantSession, error: figmantError } = await supabase
      .from('figmant_analysis_sessions')
      .select(`
        *,
        images:figmant_session_images(*),
        results:figmant_analysis_results(*)
      `)
      .eq('id', sessionId)
      .maybeSingle();

    if (!figmantError && figmantSession) {
      console.log('✅ Found figmant session:', figmantSession.id);
      
      // Get image URLs
      let imageUrls: string[] = [];
      if (figmantSession.images) {
        imageUrls = await Promise.all(
          figmantSession.images.map(async (img: any) => {
            const { data } = supabase.storage
              .from('analysis-images')
              .getPublicUrl(img.file_path);
            return data.publicUrl;
          })
        );
      }

      return {
        id: figmantSession.id,
        type: 'figmant',
        title: figmantSession.title || 'Figmant Analysis',
        status: figmantSession.status || 'draft',
        created_at: figmantSession.created_at,
        updated_at: figmantSession.updated_at,
        images: imageUrls,
        session_id: figmantSession.id,
        insight_count: figmantSession.results?.length || 0,
        hasResults: !!(figmantSession.results && figmantSession.results.length > 0),
        analysis_context: figmantSession.title,
        ai_model_used: 'claude-sonnet-4'
      };
    }

    // If not found as figmant, try to find as legacy analysis
    const { data: legacyAnalysis, error: legacyError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('analysis_id', sessionId)
      .maybeSingle();

    if (!legacyError && legacyAnalysis) {
      console.log('✅ Found legacy analysis:', legacyAnalysis.id);
      
      return {
        id: legacyAnalysis.id,
        type: 'legacy',
        title: legacyAnalysis.analysis_context || 'Legacy Analysis',
        status: 'completed',
        created_at: legacyAnalysis.created_at,
        updated_at: legacyAnalysis.updated_at,
        images: Array.isArray(legacyAnalysis.images) ? legacyAnalysis.images : [],
        analysis_id: legacyAnalysis.analysis_id,
        insight_count: Array.isArray(legacyAnalysis.annotations) ? legacyAnalysis.annotations.length : 0,
        hasResults: true,
        analysis_context: legacyAnalysis.analysis_context,
        ai_model_used: legacyAnalysis.ai_model_used
      };
    }

    console.log('❌ No analysis found for session ID:', sessionId);
    return null;

  } catch (error) {
    console.error('❌ Error fetching analysis by session ID:', error);
    return null;
  }
}

/**
 * Navigate to the appropriate analysis view based on type
 */
export function getAnalysisViewUrl(analysis: UnifiedAnalysisHistory): string {
  if (analysis.type === 'figmant') {
    return `/analysis/${analysis.session_id}`; // Using the correct figmant route
  } else {
    return `/analysis/${analysis.analysis_id}`; // Legacy analyses also use /analysis/
  }
}

export default {
  getUnifiedAnalysisHistory,
  getAnalysisBySessionId,
  getAnalysisViewUrl
};