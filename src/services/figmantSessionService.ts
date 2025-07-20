
import { supabase } from '@/integrations/supabase/client';

export interface SessionDebugInfo {
  requestedSessionId: string;
  foundSessionId?: string;
  matchType: 'exact' | 'approximate' | 'none';
  searchAttempted: boolean;
  error?: string;
  availableSessions?: Array<{ id: string; title: string; created_at: string }>;
}

export class FigmantSessionService {
  
  /**
   * Find a session by ID with fallback to approximate matching
   */
  static async findSession(sessionId: string): Promise<{ session: any; debugInfo: SessionDebugInfo }> {
    const debugInfo: SessionDebugInfo = {
      requestedSessionId: sessionId,
      matchType: 'none',
      searchAttempted: true
    };

    try {
      // First, try exact match
      const { data: exactMatch, error: exactError } = await supabase
        .from('figmant_analysis_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();

      if (exactMatch && !exactError) {
        debugInfo.matchType = 'exact';
        debugInfo.foundSessionId = exactMatch.id;
        return { session: exactMatch, debugInfo };
      }

      console.log('🔍 No exact match found, searching for approximate matches...');

      // Get recent sessions for approximate matching
      const { data: recentSessions, error: recentError } = await supabase
        .from('figmant_analysis_sessions')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (recentError) {
        debugInfo.error = `Failed to fetch recent sessions: ${recentError.message}`;
        return { session: null, debugInfo };
      }

      debugInfo.availableSessions = recentSessions || [];

      // Try to find an approximate match
      const approximateMatch = this.findApproximateUuidMatch(sessionId, recentSessions || []);
      
      if (approximateMatch) {
        console.log('🎯 Found approximate match:', approximateMatch);
        
        // Get the full session data
        const { data: fullSession, error: fullError } = await supabase
          .from('figmant_analysis_sessions')
          .select('*')
          .eq('id', approximateMatch.id)
          .single();

        if (fullSession && !fullError) {
          debugInfo.matchType = 'approximate';
          debugInfo.foundSessionId = fullSession.id;
          return { session: fullSession, debugInfo };
        }
      }

      debugInfo.error = 'No matching session found';
      return { session: null, debugInfo };

    } catch (error) {
      debugInfo.error = `Search failed: ${error.message}`;
      return { session: null, debugInfo };
    }
  }

  /**
   * Find approximate UUID matches by comparing UUID segments
   */
  private static findApproximateUuidMatch(targetId: string, sessions: Array<{ id: string; title: string; created_at: string }>) {
    const targetParts = targetId.split('-');
    let bestMatch = null;
    let bestScore = 0;

    for (const session of sessions) {
      const sessionParts = session.id.split('-');
      let score = 0;
      
      // Compare each part of the UUID
      for (let i = 0; i < Math.min(targetParts.length, sessionParts.length); i++) {
        if (targetParts[i] === sessionParts[i]) {
          score += 1;
        } else {
          // Check character-by-character similarity for partial matches
          const targetPart = targetParts[i];
          const sessionPart = sessionParts[i];
          let charMatches = 0;
          
          for (let j = 0; j < Math.min(targetPart.length, sessionPart.length); j++) {
            if (targetPart[j] === sessionPart[j]) {
              charMatches++;
            }
          }
          
          // Add partial score for character matches
          score += (charMatches / Math.max(targetPart.length, sessionPart.length)) * 0.5;
        }
      }

      // Require at least 3.5 parts to match (out of 5 UUID parts)
      if (score > bestScore && score > 3.5) {
        bestScore = score;
        bestMatch = session;
      }
    }

    return bestMatch;
  }

  /**
   * Get debug information about available sessions
   */
  static async getSessionDebugInfo(limit = 10) {
    try {
      const { data: sessions, error } = await supabase
        .from('figmant_analysis_sessions')
        .select('id, title, status, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { error: error.message, sessions: [] };
      }

      return { sessions: sessions || [], error: null };
    } catch (error) {
      return { error: error.message, sessions: [] };
    }
  }

  /**
   * Validate that a session has analysis results
   */
  static async validateSessionResults(sessionId: string) {
    try {
      const { data: results, error } = await supabase
        .from('figmant_analysis_results')
        .select('id, claude_analysis, processing_time_ms, created_at')
        .eq('session_id', sessionId)
        .maybeSingle();

      return {
        hasResults: !!results && !error,
        results: results,
        error: error?.message
      };
    } catch (error) {
      return {
        hasResults: false,
        results: null,
        error: error.message
      };
    }
  }
}
