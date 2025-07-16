import { supabase } from '@/integrations/supabase/client';

export interface GoblinSessionData {
  title: string;
  persona_type: 'strategic' | 'mirror' | 'mad' | 'exec' | 'clarity';
  analysis_mode: 'single' | 'journey' | 'compare' | 'states';
  goal_description: string;
  confidence_level: number;
}

export interface GoblinImage {
  id: string;
  session_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  screen_type?: string;
  upload_order: number;
  vision_metadata?: any;
  created_at: string;
}

export interface GoblinSession {
  id: string;
  user_id: string;
  title: string;
  persona_type: string;
  analysis_mode: string;
  goal_description: string;
  confidence_level: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

/**
 * Create a new goblin analysis session
 */
export async function createGoblinSession(data: GoblinSessionData): Promise<GoblinSession> {
  console.log('🎯 Creating goblin session:', data);
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: session, error } = await supabase
    .from('goblin_analysis_sessions')
    .insert({
      ...data,
      user_id: user.id,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create goblin session:', error);
    throw error;
  }

  console.log('✅ Goblin session created:', session.id);
  return session;
}

/**
 * Upload an image for goblin analysis
 */
export async function uploadGoblinImage(
  sessionId: string, 
  file: File, 
  order: number
): Promise<GoblinImage> {
  console.log(`📸 Uploading image ${order} for session ${sessionId}`);
  
  // Create unique file path
  const fileExt = file.name.split('.').pop();
  const fileName = `${sessionId}/${order}-${Date.now()}.${fileExt}`;
  
  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('analysis-images')
    .upload(fileName, file);

  if (uploadError) {
    console.error('❌ Failed to upload image:', uploadError);
    throw uploadError;
  }

  // Get public URL for storage path reference
  const { data: { publicUrl } } = supabase.storage
    .from('analysis-images')
    .getPublicUrl(fileName);

  // Create signed URL for Claude access (expires in 24 hours)
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('analysis-images')
    .createSignedUrl(fileName, 86400); // 24 hours

  if (signedUrlError) {
    console.error('❌ Failed to create signed URL:', signedUrlError);
    // Continue with public URL as fallback
  }

  const finalUrl = signedUrlData?.signedUrl || publicUrl;

  // Create database record
  const { data: imageRecord, error: dbError } = await supabase
    .from('goblin_analysis_images')
    .insert({
      session_id: sessionId,
      file_name: file.name,
      file_path: finalUrl, // Use signed URL for Claude access
      file_size: file.size,
      upload_order: order
    })
    .select()
    .single();

  if (dbError) {
    console.error('❌ Failed to create image record:', dbError);
    // Try to clean up uploaded file
    await supabase.storage.from('analysis-images').remove([fileName]);
    throw dbError;
  }

  console.log('✅ Image uploaded successfully:', imageRecord.id);
  return imageRecord;
}

/**
 * Start goblin analysis for a session
 */
export async function startGoblinAnalysis(sessionId: string): Promise<any> {
  console.log('🚀 Starting goblin analysis for session:', sessionId);
  
  try {
    // First, increment usage counter before starting analysis
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: usageIncremented, error: usageError } = await supabase.rpc('increment_analysis_usage', {
        p_user_id: user.id
      });
      
      if (usageError) {
        console.error('❌ Failed to increment usage:', usageError);
        throw new Error('Failed to track analysis usage');
      }
      
      if (!usageIncremented) {
        throw new Error('Analysis limit reached. Please upgrade your subscription.');
      }
      
      console.log('✅ Usage incremented for goblin analysis');
    }

    // Call the orchestrator with ONLY the sessionId
    console.log('🔴 DEBUG_GOBLIN: Frontend calling orchestrator', { sessionId });
    const { data, error } = await supabase.functions.invoke('goblin-analysis-orchestrator', {
      body: { sessionId }
    });

    if (error) {
      console.error('🔴 DEBUG_GOBLIN: Frontend orchestrator error', error);
      console.error('❌ Goblin analysis failed:', error);
      throw error;
    }

    console.log('✅ Goblin analysis started successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to start goblin analysis:', error);
    throw error;
  }
}

/**
 * Get goblin session with images
 */
export async function getGoblinSession(sessionId: string) {
  const { data: session, error: sessionError } = await supabase
    .from('goblin_analysis_sessions')
    .select(`
      *,
      images:goblin_analysis_images(*)
    `)
    .eq('id', sessionId)
    .single();

  if (sessionError) throw sessionError;
  return session;
}

/**
 * Get goblin analysis results
 */
export async function getGoblinResults(sessionId: string) {
  const { data: results, error } = await supabase
    .from('goblin_analysis_results')
    .select(`
      *,
      session:goblin_analysis_sessions(*)
    `)
    .eq('session_id', sessionId)
    .single();

  if (error) throw error;
  return results;
}

/**
 * Get user's goblin analysis history
 */
export async function getGoblinHistory() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: sessions, error } = await supabase
    .from('goblin_analysis_sessions')
    .select(`
      *,
      images:goblin_analysis_images(count),
      results:goblin_analysis_results(id)
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
  status: 'pending' | 'processing' | 'completed' | 'failed'
) {
  const { error } = await supabase
    .from('goblin_analysis_sessions')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (error) throw error;
}

/**
 * Delete a goblin session and all related data
 */
export async function deleteGoblinSession(sessionId: string) {
  // Images and results will be cascade deleted due to foreign keys
  const { error } = await supabase
    .from('goblin_analysis_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
}

// Export all functions as default for easier importing
export default {
  createGoblinSession,
  uploadGoblinImage,
  startGoblinAnalysis,
  getGoblinSession,
  getGoblinResults,
  getGoblinHistory,
  updateSessionStatus,
  deleteGoblinSession
};