import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Service to manage analysis sessions and ensure proper UUID handling
class AnalysisSessionService {
  private currentSessionId: string | null = null;
  private sessionInitialized = false;

  /**
   * Get or create an analysis session
   * Returns a proper UUID that can be used for database operations
   */
  async getOrCreateSession(): Promise<string | null> {
    try {
      // If we already have a session, return it
      if (this.currentSessionId && this.sessionInitialized) {
        console.log('🔄 Reusing existing analysis session:', this.currentSessionId);
        return this.currentSessionId;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to start an analysis session');
        return null;
      }

      // Generate a proper UUID
      const sessionId = crypto.randomUUID();
      console.log('✨ Creating new analysis session:', sessionId);

      // Create the analysis record
      const { data: analysis, error: analysisError } = await supabase
        .from('analyses')
        .insert({
          id: sessionId,
          user_id: user.id,
          title: 'New Analysis Session',
          status: 'pending',
          design_type: 'other',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (analysisError) {
        console.error('❌ Failed to create analysis session:', analysisError);
        toast.error('Failed to create analysis session. Please try again.');
        return null;
      }

      console.log('✅ Analysis session created successfully:', analysis.id);
      
      // Store the session ID for reuse
      this.currentSessionId = sessionId;
      this.sessionInitialized = true;

      return sessionId;

    } catch (error) {
      console.error('💥 Error creating analysis session:', error);
      toast.error('Failed to initialize analysis session');
      return null;
    }
  }

  /**
   * Reset the current session (useful when starting a new analysis)
   */
  resetSession(): void {
    console.log('🔄 Resetting analysis session');
    this.currentSessionId = null;
    this.sessionInitialized = false;
  }

  /**
   * Get the current session ID without creating a new one
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Validate that a session exists and is accessible by the current user
   */
  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { data: analysis, error } = await supabase
        .from('analyses')
        .select('id, user_id, status')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error || !analysis) {
        console.error('❌ Session validation failed:', error);
        return false;
      }

      console.log('✅ Session validation passed:', sessionId);
      return true;

    } catch (error) {
      console.error('💥 Error validating session:', error);
      return false;
    }
  }

  /**
   * Update session metadata (title, description, etc.)
   */
  async updateSessionMetadata(sessionId: string, updates: {
    title?: string;
    description?: string;
    design_type?: string;
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from('analyses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Failed to update session metadata:', error);
        return false;
      }

      console.log('✅ Session metadata updated:', sessionId);
      return true;

    } catch (error) {
      console.error('💥 Error updating session metadata:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const analysisSessionService = new AnalysisSessionService();