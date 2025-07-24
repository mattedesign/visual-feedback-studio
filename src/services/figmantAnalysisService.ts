import { supabase } from '@/integrations/supabase/client';

export interface FigmantSessionData {
  title: string;
  business_goals?: string[];
  analysis_prompt?: string;
  design_type?: string;
}

export interface FigmantImage {
  id: string;
  session_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  upload_order: number;
  google_vision_data?: any;
  created_at: string;
}

export interface FigmantSession {
  id: string;
  user_id: string;
  title: string;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
  business_goals?: string[];
  analysis_prompt?: string;
  design_type?: string;
  created_at: string;
  updated_at: string;
}

export interface FigmantAnalysisResult {
  id: string;
  session_id: string;
  claude_analysis: any;
  google_vision_summary?: any;
  processing_time_ms?: number;
  ai_model_used?: string;
  severity_breakdown?: any;
  implementation_timeline?: any;
  user_id?: string;
  created_at: string;
}

/**
 * Create a new figmant analysis session
 */
export async function createFigmantSession(data: FigmantSessionData): Promise<FigmantSession> {
  console.log('🎯 Creating figmant session:', data);
  
  const { data: { user } } = await supabase.auth.getUser();
  // Allow anonymous sessions for analysis
  const userId = user?.id || 'anonymous';

  const { data: session, error } = await supabase
    .from('figmant_analysis_sessions')
    .insert({
      ...data,
      user_id: userId,
      status: 'draft'
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create figmant session:', error);
    throw error;
  }

  console.log('✅ Figmant session created:', session.id);
  return session;
}

/**
 * Upload an image for figmant analysis
 */
export async function uploadFigmantImage(
  sessionId: string, 
  file: File, 
  order: number
): Promise<FigmantImage> {
  console.log(`📸 Uploading image ${order} for session ${sessionId}`);
  
  const { data: { user } } = await supabase.auth.getUser();
  // Allow anonymous image uploads for analysis
  const userId = user?.id || 'anonymous';

  // Create unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId}/${sessionId}/${fileName}`;
  
  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('analysis-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('❌ Failed to upload image:', uploadError);
    throw uploadError;
  }

  // Create database record
  const { data: imageRecord, error: dbError } = await supabase
    .from('figmant_session_images')
    .insert({
      session_id: sessionId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      upload_order: order
    })
    .select()
    .single();

  if (dbError) {
    console.error('❌ Failed to create image record:', dbError);
    // Try to clean up uploaded file
    await supabase.storage.from('analysis-images').remove([filePath]);
    throw dbError;
  }

  console.log('✅ Image uploaded successfully:', imageRecord.id);
  return imageRecord;
}

/**
 * Start figmant analysis for a session
 */
export async function startFigmantAnalysis(sessionId: string, contextId?: string): Promise<any> {
  console.log('🚀 Starting figmant analysis for session:', sessionId, contextId ? `with context: ${contextId}` : 'without context');
  
  try {
    // Update session status to pending
    await updateSessionStatus(sessionId, 'pending');

    // Check subscription limit for authenticated users only
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: canAnalyze, error: limitError } = await supabase.rpc('check_analysis_limit', {
        p_user_id: user.id
      });

      if (limitError) {
        console.error('❌ Failed to check analysis limit:', limitError);
        throw new Error('Failed to check analysis limit');
      }

      if (!canAnalyze) {
        throw new Error('Analysis limit reached. Please upgrade your subscription.');
      }
    }
    // Allow anonymous users to analyze without limits

    // Call the figmant analysis edge function
    console.log('📞 Calling figmant-analyze-design edge function...');
    const { data, error } = await supabase.functions.invoke('figmant-analyze-design', {
      body: { sessionId: sessionId, contextId: contextId }
    });

    if (error) {
      console.error('❌ Figmant analysis edge function failed:', {
        error,
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        sessionId
      });
      await updateSessionStatus(sessionId, 'failed');
      throw new Error(`Analysis failed: ${error.message || 'Unknown edge function error'}`);
    }

    if (!data || !data.success) {
      console.error('❌ Edge function returned unsuccessful response:', data);
      await updateSessionStatus(sessionId, 'failed');
      throw new Error(`Analysis failed: ${data?.error || 'Edge function returned unsuccessful response'}`);
    }

    console.log('✅ Figmant analysis started successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to start figmant analysis:', error);
    await updateSessionStatus(sessionId, 'failed');
    throw error;
  }
}

/**
 * Get figmant session with images
 */
export async function getFigmantSession(sessionId: string): Promise<FigmantSession & { images: FigmantImage[] }> {
  const { data: session, error: sessionError } = await supabase
    .from('figmant_analysis_sessions')
    .select(`
      *,
      images:figmant_session_images(*)
    `)
    .eq('id', sessionId)
    .single();

  if (sessionError) throw sessionError;
  return session;
}

/**
 * Get figmant analysis results
 */
export async function getFigmantResults(sessionId: string): Promise<FigmantAnalysisResult> {
  const { data: results, error } = await supabase
    .from('figmant_analysis_results')
    .select(`
      *,
      session:figmant_analysis_sessions(*)
    `)
    .eq('session_id', sessionId)
    .single();

  if (error) throw error;
  return results;
}

/**
 * Get user's figmant analysis history
 */
export async function getFigmantHistory(): Promise<FigmantSession[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return []; // Return empty array for anonymous users

  const { data: sessions, error } = await supabase
    .from('figmant_analysis_sessions')
    .select(`
      *,
      images:figmant_session_images(count),
      results:figmant_analysis_results(id)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return sessions;
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  sessionId: string, 
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed'
) {
  const { error } = await supabase
    .from('figmant_analysis_sessions')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (error) throw error;
}

/**
 * Delete a figmant session and all related data
 */
export async function deleteFigmantSession(sessionId: string) {
  const { error } = await supabase
    .from('figmant_analysis_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
}

// Export all functions as default for easier importing
export default {
  createFigmantSession,
  uploadFigmantImage,
  startFigmantAnalysis,
  getFigmantSession,
  getFigmantResults,
  getFigmantHistory,
  updateSessionStatus,
  deleteFigmantSession
};