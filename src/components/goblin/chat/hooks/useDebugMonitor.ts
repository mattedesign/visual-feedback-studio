import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DebugMetrics {
  messagesSent: number;
  messagesReceived: number;
  persistenceAttempts: number;
  persistenceFailures: number;
  edgeFunctionCalls: number;
  edgeFunctionErrors: number;
  databaseQueries: number;
  databaseErrors: number;
}

export const useDebugMonitor = (sessionId: string) => {
  const { user } = useAuth();
  const metricsRef = useRef<DebugMetrics>({
    messagesSent: 0,
    messagesReceived: 0,
    persistenceAttempts: 0,
    persistenceFailures: 0,
    edgeFunctionCalls: 0,
    edgeFunctionErrors: 0,
    databaseQueries: 0,
    databaseErrors: 0
  });

  // Log debug events with detailed context
  const logDebugEvent = (category: string, action: string, details: any = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      sessionId,
      userId: user?.id,
      category,
      action,
      details,
      metrics: { ...metricsRef.current }
    };

    console.group(`🐛 DEBUG [${category}] ${action}`);
    console.log('Timestamp:', timestamp);
    console.log('Session ID:', sessionId);
    console.log('User ID:', user?.id?.substring(0, 8) + '...');
    console.log('Details:', details);
    console.log('Current Metrics:', metricsRef.current);
    console.groupEnd();

    // Store in localStorage for persistence across sessions
    const debugLog = JSON.parse(localStorage.getItem('goblin-debug-log') || '[]');
    debugLog.unshift(logEntry);
    
    // Keep only last 100 entries
    debugLog.splice(100);
    localStorage.setItem('goblin-debug-log', JSON.stringify(debugLog));
  };

  // Track message sending
  const trackMessageSent = (messageContent: string, messageType: 'user' | 'ai' = 'user') => {
    metricsRef.current.messagesSent++;
    logDebugEvent('MESSAGING', 'MESSAGE_SENT', {
      messageType,
      contentLength: messageContent.length,
      messagePreview: messageContent.substring(0, 50) + '...'
    });
  };

  // Track message receiving
  const trackMessageReceived = (messageContent: string, source: 'edge-function' | 'database' = 'edge-function') => {
    metricsRef.current.messagesReceived++;
    logDebugEvent('MESSAGING', 'MESSAGE_RECEIVED', {
      source,
      contentLength: messageContent.length,
      messagePreview: messageContent.substring(0, 50) + '...'
    });
  };

  // Track persistence attempts
  const trackPersistenceAttempt = (operation: 'save-user-message' | 'save-ai-message' | 'load-history') => {
    metricsRef.current.persistenceAttempts++;
    logDebugEvent('PERSISTENCE', 'ATTEMPT', { operation });
  };

  // Track persistence failures
  const trackPersistenceFailure = (operation: string, error: any) => {
    metricsRef.current.persistenceFailures++;
    logDebugEvent('PERSISTENCE', 'FAILURE', {
      operation,
      error: error.message,
      errorCode: error.code,
      errorDetails: error.details
    });
  };

  // Track edge function calls
  const trackEdgeFunctionCall = (functionName: string, payload: any) => {
    metricsRef.current.edgeFunctionCalls++;
    logDebugEvent('EDGE_FUNCTION', 'CALL', {
      functionName,
      payloadSize: JSON.stringify(payload).length,
      payloadKeys: Object.keys(payload)
    });
  };

  // Track edge function errors
  const trackEdgeFunctionError = (functionName: string, error: any) => {
    metricsRef.current.edgeFunctionErrors++;
    logDebugEvent('EDGE_FUNCTION', 'ERROR', {
      functionName,
      error: error.message,
      errorCode: error.code
    });
  };

  // Track database queries
  const trackDatabaseQuery = (table: string, operation: string, filters?: any) => {
    metricsRef.current.databaseQueries++;
    logDebugEvent('DATABASE', 'QUERY', {
      table,
      operation,
      filters
    });
  };

  // Track database errors
  const trackDatabaseError = (table: string, operation: string, error: any) => {
    metricsRef.current.databaseErrors++;
    logDebugEvent('DATABASE', 'ERROR', {
      table,
      operation,
      error: error.message,
      errorCode: error.code,
      errorHint: error.hint
    });
  };

  // Verify database connectivity
  const verifyDatabaseConnectivity = async () => {
    try {
      trackDatabaseQuery('goblin_refinement_history', 'connectivity-test');
      
      const { data, error } = await supabase
        .from('goblin_refinement_history')
        .select('count', { count: 'exact', head: true })
        .eq('session_id', sessionId);

      if (error) {
        trackDatabaseError('goblin_refinement_history', 'connectivity-test', error);
        return { connected: false, error };
      }

      logDebugEvent('DATABASE', 'CONNECTIVITY_SUCCESS', {
        recordCount: data,
        sessionId
      });
      
      return { connected: true, recordCount: data };
    } catch (err) {
      trackDatabaseError('goblin_refinement_history', 'connectivity-test', err);
      return { connected: false, error: err };
    }
  };

  // Verify authentication state
  const verifyAuthState = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        logDebugEvent('AUTH', 'VERIFICATION_ERROR', { error: error.message });
        return { authenticated: false, error };
      }

      if (!user) {
        logDebugEvent('AUTH', 'NOT_AUTHENTICATED', {});
        return { authenticated: false };
      }

      logDebugEvent('AUTH', 'VERIFICATION_SUCCESS', {
        userId: user.id,
        email: user.email,
        lastSignIn: user.last_sign_in_at
      });

      return { authenticated: true, user };
    } catch (err) {
      logDebugEvent('AUTH', 'VERIFICATION_ERROR', { error: (err as Error).message });
      return { authenticated: false, error: err };
    }
  };

  // Check message ordering consistency
  const verifyMessageOrdering = async () => {
    try {
      trackDatabaseQuery('goblin_refinement_history', 'order-verification');
      
      const { data, error } = await supabase
        .from('goblin_refinement_history')
        .select('id, message_order, role, created_at')
        .eq('session_id', sessionId)
        .order('message_order', { ascending: true });

      if (error) {
        trackDatabaseError('goblin_refinement_history', 'order-verification', error);
        return { valid: false, error };
      }

      // Check for gaps or duplicates in message ordering
      const issues: string[] = [];
      for (let i = 0; i < data.length; i++) {
        const expected = i + 1;
        if (data[i].message_order !== expected) {
          issues.push(`Message ${i}: expected order ${expected}, got ${data[i].message_order}`);
        }
      }

      logDebugEvent('DATABASE', 'ORDER_VERIFICATION', {
        totalMessages: data.length,
        issues,
        isValid: issues.length === 0
      });

      return {
        valid: issues.length === 0,
        totalMessages: data.length,
        issues,
        messages: data
      };
    } catch (err) {
      trackDatabaseError('goblin_refinement_history', 'order-verification', err);
      return { valid: false, error: err };
    }
  };

  // Export debug data
  const exportDebugData = () => {
    const debugLog = JSON.parse(localStorage.getItem('goblin-debug-log') || '[]');
    const exportData = {
      sessionId,
      userId: user?.id,
      exportTimestamp: new Date().toISOString(),
      metrics: metricsRef.current,
      debugLog: debugLog.filter(log => log.sessionId === sessionId)
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goblin-debug-${sessionId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logDebugEvent('DEBUG', 'DATA_EXPORTED', {
      exportSize: blob.size,
      logEntries: exportData.debugLog.length
    });
  };

  // Initialize debug monitoring
  useEffect(() => {
    if (sessionId && user) {
      logDebugEvent('DEBUG', 'MONITOR_INITIALIZED', {
        sessionId,
        userId: user.id
      });

      // Clear old debug data for this session
      const debugLog = JSON.parse(localStorage.getItem('goblin-debug-log') || '[]');
      const filtered = debugLog.filter((log: any) => 
        log.sessionId !== sessionId || 
        Date.now() - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000 // Keep last 24 hours
      );
      localStorage.setItem('goblin-debug-log', JSON.stringify(filtered));
    }
  }, [sessionId, user]);

  return {
    // Tracking functions
    trackMessageSent,
    trackMessageReceived,
    trackPersistenceAttempt,
    trackPersistenceFailure,
    trackEdgeFunctionCall,
    trackEdgeFunctionError,
    trackDatabaseQuery,
    trackDatabaseError,
    
    // Verification functions
    verifyDatabaseConnectivity,
    verifyAuthState,
    verifyMessageOrdering,
    
    // Utility functions
    logDebugEvent,
    exportDebugData,
    
    // Current metrics
    metrics: metricsRef.current
  };
};
